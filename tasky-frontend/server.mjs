import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyHttpProxy from "@fastify/http-proxy";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "dist");
const port = Number(process.env.PORT) || 8088;
let apiInternalUrl =
  process.env.API_INTERNAL_URL || "http://tasky-backend:9000";

if (
  !apiInternalUrl.startsWith("http://") &&
  !apiInternalUrl.startsWith("https://")
) {
  apiInternalUrl = `http://${apiInternalUrl}`;
}

try {
  new URL(apiInternalUrl);
} catch (error) {
  console.error(`URL inválida: ${apiInternalUrl}`, error);
  process.exit(1);
}

const app = Fastify({ logger: true });

console.log(`Proxy configurado: /api -> ${apiInternalUrl}`);

app.addHook("onRequest", async (request, reply) => {
  if (request.url.startsWith("/api")) {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        headers: {
          "content-type": request.headers["content-type"],
          authorization: request.headers["authorization"] ? "***" : undefined,
        },
      },
      "Incoming API request"
    );
  }
});

app.addHook("onResponse", async (request, reply) => {
  if (request.url.startsWith("/api")) {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
      },
      "API response"
    );
  }
});

app.addHook("onError", async (request, reply, error) => {
  if (request.url.startsWith("/api")) {
    request.log.error(
      {
        url: request.url,
        error: error.message,
        statusCode: reply.statusCode,
      },
      "Proxy error"
    );
  }
});

await app.register(fastifyHttpProxy, {
  upstream: apiInternalUrl,
  prefix: "/api",
  rewritePrefix: "/api",
  http2: false,
  disableCache: true,
  websocket: false,
  replyOptions: {
    rewriteRequestHeaders: (originalReq, headers) => {
      try {
        const url = new URL(apiInternalUrl);
        return {
          ...headers,
          host: url.host,
        };
      } catch (error) {
        app.log.error(
          { error, apiInternalUrl },
          "Error parsing API_INTERNAL_URL"
        );
        return headers;
      }
    },
    onError: (reply, error) => {
      app.log.error(
        {
          error: error.message,
          code: error.code,
        },
        "Proxy upstream error"
      );
      reply.code(502).send({
        error: "Bad Gateway",
        message: "Error connecting to API server",
        details: error.message,
      });
    },
  },
});

await app.register(fastifyStatic, { root, wildcard: false });
app.setNotFoundHandler((_, reply) => reply.sendFile("index.html"));

await app.listen({ port, host: "0.0.0.0" });
