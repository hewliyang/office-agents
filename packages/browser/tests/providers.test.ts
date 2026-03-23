import { once } from "node:events";
import http from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { BrowserUseProvider } from "../src/providers/browser-use.js";

interface CapturedRequest {
  method: string;
  path: string;
  headers: http.IncomingHttpHeaders;
  body: string;
}

interface ApiServer {
  baseUrl: string;
  requests: CapturedRequest[];
  close: () => Promise<void>;
}

async function startApiServer(
  handler: (
    request: CapturedRequest,
    baseUrl: string,
  ) => {
    status?: number;
    headers?: Record<string, string>;
    body?: string;
  },
): Promise<ApiServer> {
  const requests: CapturedRequest[] = [];
  const server = http.createServer(async (req, res) => {
    const bodyChunks: Buffer[] = [];
    for await (const chunk of req) {
      bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const request: CapturedRequest = {
      method: req.method ?? "GET",
      path: req.url ?? "/",
      headers: req.headers,
      body: Buffer.concat(bodyChunks).toString("utf8"),
    };
    requests.push(request);

    const address = server.address();
    if (!address || typeof address === "string") {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("missing server address");
      return;
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    const response = handler(request, baseUrl);
    res.writeHead(response.status ?? 200, {
      "Content-Type": "text/plain; charset=utf-8",
      ...response.headers,
    });
    res.end(response.body ?? "");
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to determine test server address");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    requests,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

async function getUnusedBaseUrl(): Promise<string> {
  const server = http.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to allocate port");
  }
  server.close();
  await once(server, "close");
  return `http://127.0.0.1:${address.port}`;
}

describe("BrowserUseProvider", () => {
  let apiServer: ApiServer | null = null;

  afterEach(async () => {
    if (apiServer) {
      await apiServer.close();
      apiServer = null;
    }
  });

  it("creates a session and resolves the websocket debugger URL", async () => {
    apiServer = await startApiServer((request, baseUrl) => {
      if (request.path === "/api/v2/browsers") {
        expect(request.method).toBe("POST");
        return {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: "browser-1",
            cdpUrl: `${baseUrl}/devtools/browser-1`,
          }),
        };
      }

      if (request.path === "/devtools/browser-1/json/version") {
        expect(request.method).toBe("GET");
        return {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webSocketDebuggerUrl:
              "wss://browser-use.example/devtools/browser-1/ws",
          }),
        };
      }

      return { status: 404, body: "not found" };
    });

    const provider = new BrowserUseProvider({
      apiKey: "bu-key",
      baseUrl: apiServer.baseUrl,
      profileId: "profile-1",
      proxyCountryCode: "us",
      timeoutMinutes: 12,
    });

    const session = await provider.createSession();

    expect(apiServer.requests).toHaveLength(2);
    expect(apiServer.requests[0]).toMatchObject({
      method: "POST",
      path: "/api/v2/browsers",
      headers: {
        "content-type": "application/json",
        "x-browser-use-api-key": "bu-key",
      },
    });
    expect(JSON.parse(apiServer.requests[0]!.body)).toEqual({
      profile_id: "profile-1",
      proxy_country_code: "us",
      timeout: 12,
    });
    expect(apiServer.requests[1]).toMatchObject({
      method: "GET",
      path: "/devtools/browser-1/json/version",
    });

    expect(session).toEqual({
      cdpUrl: "wss://browser-use.example/devtools/browser-1/ws",
      sessionId: "browser-1",
      metadata: {
        id: "browser-1",
        cdpUrl: `${apiServer.baseUrl}/devtools/browser-1`,
      },
    });
  });

  it("throws a clear authentication error for 401 and 403 responses", async () => {
    apiServer = await startApiServer(() => ({
      status: 401,
      body: "unauthorized",
    }));

    const provider = new BrowserUseProvider({
      apiKey: "bad-key",
      baseUrl: apiServer.baseUrl,
    });

    await expect(provider.createSession()).rejects.toThrow(
      "Browser Use authentication failed (401). Check your BROWSER_USE_API_KEY.",
    );
  });

  it("swallows close errors", async () => {
    const baseUrl = await getUnusedBaseUrl();
    const provider = new BrowserUseProvider({
      apiKey: "bu-key",
      baseUrl,
    });

    await expect(provider.closeSession("browser-1")).resolves.toBeUndefined();
  });
});
