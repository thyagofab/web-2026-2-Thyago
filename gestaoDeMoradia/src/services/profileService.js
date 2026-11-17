/**
 * Serviço para gerenciamento de perfil via API Gateway, S3 e DynamoDB.
 * Utiliza o método fetch com operações PUT e GET, protegido com token JWT do Cognito.
 */

const API_BASE_URL =
  import.meta.env?.VITE_API_GATEWAY_URL ||
  import.meta.env?.VITE_PROFILE_API_URL ||
  'https://b8vjk5qdkj.execute-api.us-east-1.amazonaws.com/prod';

/**
 * Converte um arquivo do tipo File em string Base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Atualiza os dados cadastrais no DynamoDB e a foto de perfil no Bucket S3 usando PUT e fetch
 * @param {Object} params
 * @param {Object} params.userData - Dados cadastrais (nome, campus, matricula, curso, bio, role)
 * @param {File} [params.file] - Arquivo de imagem para atualizar foto de perfil no S3
 * @param {string} params.token - Token JWT (ID Token do Cognito)
 * @param {string} [params.customUrl] - URL opcional do API Gateway
 */
export async function updateProfile({ userData = {}, file, token, customUrl }) {
  const baseUrl = (customUrl || API_BASE_URL).replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('URL do API Gateway não configurada (VITE_API_GATEWAY_URL).');
  }

  const endpoint = `${baseUrl}/profile`;

  let base64Image = null;
  let contentType = null;
  if (file) {
    base64Image = await fileToBase64(file);
    contentType = file.type || 'image/jpeg';
  }

  const payload = {
    ...userData,
    ...(base64Image ? { image: base64Image, contentType } : {}),
  };

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? (token.startsWith('Bearer ') ? token : token) : '',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erro ${response.status} ao atualizar perfil`);
  }

  return data;
}

/**
 * Envia uma imagem para a rota /profile usando POST e fetch (mantido para compatibilidade)
 */
export async function uploadProfileImage({ file, token, customUrl }) {
  return updateProfile({ userData: {}, file, token, customUrl });
}

/**
 * Busca os dados cadastrais do DynamoDB e a foto do S3 via GET /profile
 * @param {Object} params
 * @param {string} params.token - Token JWT (ID Token do Cognito)
 * @param {string} [params.customUrl] - URL opcional do API Gateway
 */
export async function getProfileImage({ token, customUrl }) {
  const baseUrl = (customUrl || API_BASE_URL).replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('URL do API Gateway não configurada (VITE_API_GATEWAY_URL).');
  }

  const endpoint = `${baseUrl}/profile`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: token ? (token.startsWith('Bearer ') ? token : token) : '',
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(data.error || data.message || `Erro ${response.status} ao carregar dados do perfil`);
  }

  // Normaliza o retorno
  return {
    ...data,
    imageUrl: data.user?.profileImageUrl || data.imageUrl || '',
    user: data.user,
  };
}
