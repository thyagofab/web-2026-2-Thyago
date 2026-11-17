import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET_NAME = process.env.BUCKET_NAME || "thyago-profile-2026.2";
const TABLE_NAME = process.env.TABLE_NAME || "Thyago-message-2026.2";

const s3Client = new S3Client({ region: REGION });
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Headers CORS para as respostas
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,PUT,POST,OPTIONS",
};

/**
 * Helper para extrair o ID único do usuário autenticado pelo Cognito JWT
 */
function getUserId(event) {
  const claims = event.requestContext?.authorizer?.claims;
  if (claims) {
    return claims.sub || claims["cognito:username"] || claims.email;
  }
  return (
    event.queryStringParameters?.userId ||
    event.headers?.["x-user-id"] ||
    "thyago-default-user"
  );
}

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method;

  console.log(`Recebida requisição ${method} em ${event.path}`);

  // Preflight CORS
  if (method === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "CORS OK" }),
    };
  }

  const userId = getUserId(event);

  try {
    // -----------------------------------------------------------------
    // OPERAÇÃO PUT /profile: Atualiza informações cadastrais no DynamoDB
    // e salva/atualiza a foto de perfil no Bucket S3
    // -----------------------------------------------------------------
    if (method === "PUT" || method === "POST") {
      let body = {};
      if (event.body) {
        try {
          body = JSON.parse(event.body);
        } catch {
          body = {};
        }
      }

      let imageUrl = body.profileImageUrl || null;

      // 1. Processar a imagem e salvar no S3 (caso enviada no payload)
      if (body.image) {
        let contentType = body.contentType || "image/jpeg";
        const base64Data = body.image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        let ext = "jpg";
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("gif")) ext = "gif";

        const key = `profiles/${userId}.${ext}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: imageBuffer,
            ContentType: contentType,
            Metadata: {
              uploadedBy: userId,
              updatedAt: new Date().toISOString(),
            },
          })
        );

        // Gerar URL pré-assinada para exibição
        const getCmd = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });
        imageUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 604800 }); // 7 dias
      }

      // 2. Salvar / Atualizar os dados cadastrais do usuário no DynamoDB
      const now = new Date().toISOString();
      const userItem = {
        userId,
        email: body.email || event.requestContext?.authorizer?.claims?.email || userId,
        nome: body.nome || "Thyago Fabricio",
        campus: body.campus || "mossoro",
        matricula: body.matricula || "2026.2-RU",
        curso: body.curso || "Engenharia de Software",
        role: body.role || "morador",
        bio: body.bio || "Residente na Moradia Estudantil UFERSA",
        profileImageUrl: imageUrl || "",
        updatedAt: now,
      };

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: userItem,
        })
      );

      console.log(`Usuário ${userId} salvo com sucesso no DynamoDB (${TABLE_NAME}) e S3 (${BUCKET_NAME})`);

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          message: "Perfil e foto atualizados com sucesso no S3 e DynamoDB!",
          bucket: BUCKET_NAME,
          table: TABLE_NAME,
          user: userItem,
        }),
      };
    }

    // -----------------------------------------------------------------
    // OPERAÇÃO GET /profile: Busca dados no DynamoDB e URL no S3
    // -----------------------------------------------------------------
    if (method === "GET") {
      const getRes = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { userId },
        })
      );

      let user = getRes.Item;

      // Se não encontrar no DynamoDB, gera um registro inicial com os claims do JWT
      if (!user) {
        user = {
          userId,
          email: event.requestContext?.authorizer?.claims?.email || `${userId}@alunos.ufersa.edu.br`,
          nome: event.requestContext?.authorizer?.claims?.name || "Thyago Fabricio",
          campus: "mossoro",
          matricula: "2026.2-RU",
          curso: "Engenharia de Software",
          role: "morador",
          bio: "Residente na Moradia Estudantil UFERSA",
          profileImageUrl: "",
          updatedAt: new Date().toISOString(),
        };
      }

      // Se já houver imagem no S3, tenta gerar uma URL assinada atualizada
      const possibleExtensions = ["jpg", "png", "webp", "jpeg"];
      for (const ext of possibleExtensions) {
        const key = `profiles/${userId}.${ext}`;
        try {
          const getCmd = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          });
          user.profileImageUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 604800 });
          break;
        } catch {
          // Próxima extensão
        }
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          user,
          table: TABLE_NAME,
          bucket: BUCKET_NAME,
        }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Método ${method} não suportado.` }),
    };

  } catch (error) {
    console.error("Erro na execução da Lambda:", error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "Erro interno no servidor ao processar o perfil.",
        details: error.message,
      }),
    };
  }
};
