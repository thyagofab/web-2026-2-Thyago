// Integração com o Google Identity Services (OAuth 2.0 / OpenID Connect)
// Docs: https://developers.google.com/identity/gsi/web
import { parseJwt } from './cognitoAuth';

// O Client ID é público (vai para o navegador de qualquer forma); o fallback garante
// funcionamento mesmo se a variável não estiver configurada no build do Amplify.
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ||
  '151802191366-l48msnqra6a4g3vqrjtmmuhuqgm29del.apps.googleusercontent.com';

// Domínios institucionais aceitos no login com Google
export const ALLOWED_DOMAINS = ['ufersa.edu.br', 'alunos.ufersa.edu.br'];

let scriptPromise = null;

/** Carrega o script oficial do Google Identity Services uma única vez */
export function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Falha ao carregar Google Identity Services.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Decodifica e valida (no cliente) o ID Token JWT retornado pelo Google.
 * Obs.: a verificação de assinatura deve ser feita no backend em produção.
 */
export function decodeGoogleCredential(credential) {
  const payload = parseJwt(credential);
  if (!payload) throw new Error('Token do Google inválido.');
  if (payload.aud !== GOOGLE_CLIENT_ID) throw new Error('Token emitido para outro Client ID.');
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
    throw new Error('Emissor do token inválido.');
  }
  if (payload.exp * 1000 < Date.now()) throw new Error('Token do Google expirado.');
  if (!payload.email_verified) throw new Error('E-mail Google não verificado.');

  const domain = payload.email.split('@')[1]?.toLowerCase();
  if (!ALLOWED_DOMAINS.includes(domain)) {
    throw new Error('Use sua conta Google institucional (@ufersa.edu.br ou @alunos.ufersa.edu.br).');
  }
  return payload;
}
