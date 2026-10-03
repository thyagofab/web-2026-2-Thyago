/**
 * Serviço de Autenticação com AWS Cognito
 * Suporta autenticação segura SRP (Secure Remote Password) e USER_PASSWORD_AUTH
 * com cálculo nativo de SECRET_HASH via Web Crypto API.
 */

import { AuthenticationHelper, DateHelper } from 'amazon-cognito-identity-js';
import BigInteger from 'amazon-cognito-identity-js/es/BigInteger.js';
import sha256Pkg from '@aws-crypto/sha256-js';

const Sha256 = sha256Pkg.Sha256 || sha256Pkg;

const REGION = import.meta.env?.VITE_COGNITO_REGION || 'us-east-1';
const USER_POOL_ID = import.meta.env?.VITE_COGNITO_USER_POOL_ID || 'us-east-1_02yJNx6xh';
const CLIENT_ID = import.meta.env?.VITE_COGNITO_CLIENT_ID || '75vuavgtpvl9akhscgvekbfv3l';
const CLIENT_SECRET = import.meta.env?.VITE_COGNITO_CLIENT_SECRET || '';

const POOL_NAME = USER_POOL_ID.includes('_') ? USER_POOL_ID.split('_')[1] : USER_POOL_ID;

/**
 * Utilitários para conversão de Base64 e Uint8Array sem dependência de Buffer (compatível com navegador)
 */
function base64ToUint8(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function concatUint8Arrays(...arrays) {
  const totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Calcula o SECRET_HASH caso o App Client esteja configurado com Client Secret.
 * SECRET_HASH = Base64(HMAC_SHA256(ClientSecret, Username + ClientId))
 */
export async function computeSecretHash(username, clientId = CLIENT_ID, clientSecret = CLIENT_SECRET) {
  if (!clientSecret) return null;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(clientSecret);
  const messageData = encoder.encode(username + clientId);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return uint8ToBase64(new Uint8Array(signature));
}

/**
 * Decodifica o payload de um token JWT sem dependência externa.
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar token JWT:', e);
    return null;
  }
}

/**
 * Mapeia os dados do Cognito (grupos, custom attributes, e-mail) para o perfil do SGM
 * Retorna: { role: 'gestor_proae' | 'gestor_coae' | 'morador', campus: string, nome: string, email: string }
 */
export function resolveUserProfile(idTokenPayload, username) {
  const groups = Array.isArray(idTokenPayload['cognito:groups'])
    ? idTokenPayload['cognito:groups']
    : [];
  const customRole = String(
    idTokenPayload['custom:role'] || idTokenPayload['custom:perfil'] || ''
  ).toLowerCase();
  const customCampus = String(idTokenPayload['custom:campus'] || 'mossoro').toLowerCase();
  const email = String(idTokenPayload.email || username || '').trim().toLowerCase();
  const name =
    idTokenPayload.name ||
    idTokenPayload['custom:nome'] ||
    idTokenPayload['cognito:username'] ||
    username;

  // 1. Verificação por Grupos do Cognito
  const groupsUpper = groups.map((g) => String(g).trim().toUpperCase());
  if (groupsUpper.includes('PROAE') || groupsUpper.includes('ADMIN') || groupsUpper.includes('GESTOR_PROAE')) {
    return {
      role: 'gestor_proae',
      campus: 'todos',
      nome: name,
      email,
      groups,
      matricula: idTokenPayload['custom:matricula'] || null,
    };
  }

  if (groupsUpper.includes('COAE') || groupsUpper.includes('GESTOR_COAE')) {
    return {
      role: 'gestor_coae',
      campus: customCampus,
      nome: name,
      email,
      groups,
      matricula: idTokenPayload['custom:matricula'] || null,
    };
  }

  if (groupsUpper.includes('MORADOR') || groupsUpper.includes('ALUNO') || groupsUpper.includes('DISCENTE')) {
    return {
      role: 'morador',
      campus: customCampus,
      nome: name,
      email,
      groups,
      matricula: idTokenPayload['custom:matricula'] || '2022014589',
    };
  }

  // 2. Verificação por Atributo Customizado (custom:role)
  if (customRole === 'gestor_proae' || customRole === 'proae') {
    return { role: 'gestor_proae', campus: 'todos', nome: name, email, groups };
  }
  if (customRole === 'gestor_coae' || customRole === 'coae') {
    return { role: 'gestor_coae', campus: customCampus, nome: name, email, groups };
  }
  if (customRole === 'morador' || customRole === 'discente') {
    return { role: 'morador', campus: customCampus, nome: name, email, groups };
  }

  // O domínio de e-mail identifica apenas moradores. Cargos administrativos
  // devem ser configurados explicitamente no Cognito.
  if (email.endsWith('@alunos.ufersa.edu.br')) {
    return { role: 'morador', campus: customCampus, nome: name, email, groups };
  }

  throw new Error(
    'ROLE_NOT_CONFIGURED: o usuário autenticou, mas não possui grupo ou atributo de cargo configurado no Cognito.'
  );
}

/**
 * Autentica o usuário com o AWS Cognito via fluxo seguro SRP (Secure Remote Password)
 */
export async function authenticateWithCognito(username, password) {
  const endpoint = `https://cognito-idp.${REGION}.amazonaws.com/`;
  const secretHash = await computeSecretHash(username, CLIENT_ID, CLIENT_SECRET);

  const helper = new AuthenticationHelper(POOL_NAME);
  const aVal = await new Promise((resolve, reject) => {
    helper.getLargeAValue((err, a) => {
      if (err) reject(err);
      else resolve(a);
    });
  });

  const initAuthParams = {
    USERNAME: username,
    SRP_A: aVal.toString(16),
  };
  if (secretHash) {
    initAuthParams.SECRET_HASH = secretHash;
  }

  // Passo 1: InitiateAuth (USER_SRP_AUTH)
  const initResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
    },
    body: JSON.stringify({
      AuthFlow: 'USER_SRP_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: initAuthParams,
    }),
  });

  const initData = await initResponse.json();

  if (!initResponse.ok) {
    const errorType = initData.__type || 'AuthError';
    const errorMessage = initData.message || 'Falha ao iniciar autenticação no Cognito.';
    throw new Error(`${errorType}: ${errorMessage}`);
  }

  // Passo 2: PASSWORD_VERIFIER Challenge
  if (initData.ChallengeName === 'PASSWORD_VERIFIER') {
    const challengeParams = initData.ChallengeParameters;
    const serverB = new BigInteger(challengeParams.SRP_B, 16);
    const salt = new BigInteger(challengeParams.SALT, 16);
    const srpUsername = challengeParams.USER_ID_FOR_SRP;

    const hkdf = await new Promise((resolve, reject) => {
      helper.getPasswordAuthenticationKey(srpUsername, password, serverB, salt, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    const dateHelper = new DateHelper();
    const dateNow = dateHelper.getNowString();
    const encoder = new TextEncoder();

    const concatBuffer = concatUint8Arrays(
      encoder.encode(POOL_NAME),
      encoder.encode(srpUsername),
      base64ToUint8(challengeParams.SECRET_BLOCK),
      encoder.encode(dateNow)
    );

    const hash = new Sha256(hkdf);
    hash.update(concatBuffer);
    const signature = uint8ToBase64(hash.digestSync());

    const verifierSecretHash = await computeSecretHash(srpUsername, CLIENT_ID, CLIENT_SECRET);

    const challengeResponses = {
      USERNAME: srpUsername,
      PASSWORD_CLAIM_SECRET_BLOCK: challengeParams.SECRET_BLOCK,
      TIMESTAMP: dateNow,
      PASSWORD_CLAIM_SIGNATURE: signature,
    };
    if (verifierSecretHash) {
      challengeResponses.SECRET_HASH = verifierSecretHash;
    }

    const verifierResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
      },
      body: JSON.stringify({
        ChallengeName: 'PASSWORD_VERIFIER',
        ClientId: CLIENT_ID,
        ChallengeResponses: challengeResponses,
      }),
    });

    const verifierData = await verifierResponse.json();

    if (!verifierResponse.ok) {
      const errorType = verifierData.__type || 'AuthError';
      const errorMessage = verifierData.message || 'Credenciais inválidas no Cognito.';
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    // Desafio de alteração de senha inicial (membros criados pelo admin)
    if (verifierData.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
      return {
        challenge: 'NEW_PASSWORD_REQUIRED',
        session: verifierData.Session,
        username: srpUsername,
      };
    }

    const authResult = verifierData.AuthenticationResult;
    const idTokenPayload = parseJwt(authResult.IdToken);
    const profile = resolveUserProfile(idTokenPayload, username);

    return {
      accessToken: authResult.AccessToken,
      idToken: authResult.IdToken,
      refreshToken: authResult.RefreshToken,
      expiresIn: authResult.ExpiresIn,
      profile,
    };
  }

  throw new Error('Fluxo de desafio não suportado pelo Cognito.');
}

/**
 * Responde ao desafio de nova senha inicial (primeiro login do membro cadastrado pela PROAE)
 */
export async function respondToNewPasswordChallenge(username, newPassword, session) {
  const secretHash = await computeSecretHash(username, CLIENT_ID, CLIENT_SECRET);
  const challengeResponses = {
    USERNAME: username,
    NEW_PASSWORD: newPassword,
  };
  if (secretHash) {
    challengeResponses.SECRET_HASH = secretHash;
  }

  const endpoint = `https://cognito-idp.${REGION}.amazonaws.com/`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': 'AWSCognitoIdentityProviderService.RespondToAuthChallenge',
    },
    body: JSON.stringify({
      ChallengeName: 'NEW_PASSWORD_REQUIRED',
      ClientId: CLIENT_ID,
      Session: session,
      ChallengeResponses: challengeResponses,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao redefinir senha.');
  }

  const authResult = data.AuthenticationResult;
  const idTokenPayload = parseJwt(authResult.IdToken);
  const profile = resolveUserProfile(idTokenPayload, username);

  return {
    accessToken: authResult.AccessToken,
    idToken: authResult.IdToken,
    refreshToken: authResult.RefreshToken,
    profile,
  };
}
