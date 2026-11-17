import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
const BUCKET_NAME = process.env.BUCKET_NAME || "profile";

// Headers CORS padrão para as respostas
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

/**
 * Helper para obter o ID ou email do usuário autenticado pelo Cognito JWT Authorizer
 */
function getUserId(event) {
  const claims = event.requestContext?.authorizer?.claims;
  if (claims) {
    // sub (ID único do usuário no Cognito) ou email ou cognito:username
    return claims.sub || claims["cognito:username"] || claims.email;
  }
  // Fallback para testes sem autorizador (passado em query string ou header)
  return (
    event.queryStringParameters?.userId ||
    event.headers?.["x-user-id"] ||
    "default-user"
  );
}

export const handler = async (event) => {
  console.log("Evento recebido:", JSON.stringify({
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    isBase64Encoded: event.isBase64Encoded,
  }));

  const method = event.httpMethod || event.requestContext?.http?.method;

  // Tratamento de preflight CORS (OPTIONS)
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "CORS OK" }),
    };
  }

  const userId = getUserId(event);

  try {
    // -------------------------------------------------------------
    // ROTA POST /profile -> Salva a imagem no S3
    // -------------------------------------------------------------
    if (method === "POST") {
      if (!event.body) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Corpo da requisição vazio. Envie uma imagem." }),
        };
      }

      let imageBuffer;
      let contentType = event.headers?.["content-type"] || event.headers?.["Content-Type"] || "image/jpeg";

      // Verifica se o corpo foi enviado como JSON contendo base64 { image: "data:image/png;base64,...", contentType: "image/png" }
      if (contentType.includes("application/json")) {
        const parsed = JSON.parse(event.body);
        const base64Data = parsed.image.replace(/^data:image\/\w+;base64,/, "");
        imageBuffer = Buffer.from(base64Data, "base64");
        if (parsed.contentType) {
          contentType = parsed.contentType;
        }
      } else if (event.isBase64Encoded) {
        // Envio direto binário via API Gateway com Binary Media Types ativo
        imageBuffer = Buffer.from(event.body, "base64");
      } else {
        // Envio binário puro ou base64 string
        imageBuffer = Buffer.from(event.body, "binary");
      }

      // Define extensão com base no Content-Type
      let ext = "jpg";
      if (contentType.includes("png")) ext = "png";
      else if (contentType.includes("webp")) ext = "webp";
      else if (contentType.includes("gif")) ext = "gif";

      const key = `profiles/${userId}.${ext}`;

      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: contentType,
        Metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(putCommand);

      // Gera também a URL pré-assinada para exibição imediata
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: "Imagem de perfil enviada com sucesso!",
          key,
          bucket: BUCKET_NAME,
          userId,
          imageUrl: presignedUrl,
        }),
      };
    }

    // -------------------------------------------------------------
    // ROTA GET /profile -> Retorna os dados / URL da imagem
    // -------------------------------------------------------------
    if (method === "GET") {
      // Tenta achar com extensões comuns se a extensão não for fixa
      const possibleExtensions = ["jpg", "png", "webp", "jpeg"];
      let foundKey = null;

      for (const ext of possibleExtensions) {
        const testKey = `profiles/${userId}.${ext}`;
        try {
          const headCmd = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: testKey,
          });
          // Se encontrar, obtemos a URL assinada
          await s3Client.send(headCmd);
          foundKey = testKey;
          break;
        } catch {
          // Arquivo com essa extensão não encontrado, tenta a próxima
        }
      }

      if (!foundKey) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            message: "Foto de perfil não encontrada para este usuário.",
            userId,
          }),
        };
      }

      // Gera uma URL pré-assinada válida por 1 hora (3600 segundos)
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: foundKey,
      });
      const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          userId,
          key: foundKey,
          imageUrl: presignedUrl,
        }),
      };
    }

    // Método não permitido
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Método ${method} não suportado.` }),
    };

  } catch (error) {
    console.error("Erro no processamento:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Erro interno ao processar a imagem.",
        details: error.message,
      }),
    };
  }
};
