/**
 * Lambda da rota $default do API Gateway WebSocket (thyagochat).
 * Recebe a pergunta, consulta o Google Gemini e devolve a resposta ao
 * cliente via API de gerenciamento de conexões (PostToConnection).
 *
 * Config. recomendada: Timeout 60-90s, sem VPC (ou VPC com NAT).
 * Env: GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, GEMINI_TIMEOUT_MS
 */
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const MODELS = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  process.env.GEMINI_FALLBACK_MODEL,
].filter(Boolean);

const CALL_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 20000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(model, question) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "Você é o assistente do sistema Gestão de Moradia da UFERSA. Responda em português, de forma clara e objetiva." }],
        },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error?.message || "Erro no Gemini");
      err.status = res.status;
      throw err;
    }
    return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "(sem resposta)";
  } catch (err) {
    if (err.name === "AbortError") {
      const e = new Error(`Timeout de ${CALL_TIMEOUT_MS}ms`);
      e.status = 504;
      throw e;
    }
    if (!err.status) err.status = "rede";
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function askGemini(question) {
  let lastErr;
  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Gemini: modelo ${model}, tentativa ${attempt}`);
        return await callGemini(model, question);
      } catch (err) {
        lastErr = err;
        console.warn(`Falha (${err.status}): ${err.message}`);
        if (err.status === 404 || err.status === 504) break; // próximo modelo
        if (![429, 500, 503, "rede"].includes(err.status)) throw err;
        await sleep(1000 * attempt);
      }
    }
  }
  throw lastErr;
}

export const handler = async (event) => {
  try {
    const { connectionId, domainName, stage } = event.requestContext;
    const endpoint = domainName.includes("amazonaws.com")
      ? `https://${domainName}/${stage}`
      : `https://${domainName}`;
    const api = new ApiGatewayManagementApiClient({ endpoint });

    const send = async (payload) => {
      try {
        await api.send(new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(JSON.stringify(payload)),
        }));
      } catch (err) {
        console.error("Erro ao enviar ao cliente:", err.name, err.message);
      }
    };

    let question = "";
    try {
      question = (JSON.parse(event.body || "{}").message || "").trim();
    } catch {
      question = (event.body || "").trim();
    }

    console.log("Mensagem recebida:", connectionId, "->", question);

    if (!question) {
      await send({ type: "error", message: "Mensagem vazia." });
      return { statusCode: 200 };
    }

    await send({ type: "typing" });

    try {
      const answer = await askGemini(question);
      console.log("Resposta do Gemini:", answer);
      await send({ type: "answer", question, message: answer, timestamp: Date.now() });
    } catch (err) {
      console.error("Erro Gemini:", err.status, err.message);
      await send({
        type: "error",
        message: err.status === 503 || err.status === 429
          ? "O Gemini está sobrecarregado no momento. Tente novamente em instantes."
          : `Falha ao consultar o Gemini (${err.status ?? "rede"}).`,
      });
    }
  } catch (fatal) {
    console.error("ERRO FATAL:", fatal);
  }
  return { statusCode: 200 };
};
