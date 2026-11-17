/**
 * Serviço para upload e leitura de imagem de perfil via API Gateway e S3.
 * Utiliza o método fetch com método POST e GET, protegido com token JWT do Cognito.
 */

const API_BASE_URL =
  import.meta.env?.VITE_API_GATEWAY_URL ||
  import.meta.env?.VITE_PROFILE_API_URL ||
  '';

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
 * Envia uma imagem para a rota /profile usando POST e fetch
 * @param {Object} params
 * @param {File} params.file - Arquivo de imagem selecionado pelo usuário
 * @param {string} params.token - Token JWT (ID Token do Cognito)
 * @param {string} [params.customUrl] - URL opcional do API Gateway
 */
export async function uploadProfileImage({ file, token, customUrl }) {
  const baseUrl = (customUrl || API_BASE_URL).replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('URL do API Gateway não configurada (VITE_API_GATEWAY_URL).');
  }

  const endpoint = `${baseUrl}/profile`;
  const base64Image = await fileToBase64(file);

  const payload = {
    image: base64Image,
    contentType: file.type || 'image/jpeg',
    fileName: file.name,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? (token.startsWith('Bearer ') ? token : token) : '',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Erro ${response.status} ao enviar imagem`);
  }

  return data;
}

/**
 * Busca a imagem de perfil enviada usando GET e fetch
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
      return null; // Nenhuma foto cadastrada ainda
    }
    throw new Error(data.error || data.message || `Erro ${response.status} ao carregar imagem`);
  }

  return data;
}
