import { request as httpsRequest } from "node:https";
import {
  DEFAULT_BRIDGE_HTTP_URL,
  DEFAULT_REQUEST_TIMEOUT_MS,
  normalizeBridgeUrl,
} from "./protocol.js";

export interface BridgeRequestOptions {
  baseUrl?: string;
  timeoutMs?: number;
}

function resolveBaseUrl(baseUrl?: string): URL {
  return new URL(
    normalizeBridgeUrl(baseUrl || DEFAULT_BRIDGE_HTTP_URL, "http"),
  );
}

export function requestJson<T>(
  method: string,
  pathname: string,
  body?: unknown,
  options?: BridgeRequestOptions,
): Promise<T> {
  const baseUrl = resolveBaseUrl(options?.baseUrl);
  const timeoutMs = options?.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;

  return new Promise<T>((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const req = httpsRequest(
      {
        protocol: baseUrl.protocol,
        hostname: baseUrl.hostname,
        port: baseUrl.port,
        path: pathname,
        method,
        rejectUnauthorized: false,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : undefined,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          try {
            const parsed = text
              ? (JSON.parse(text) as T & {
                  ok?: boolean;
                  error?: { message?: string };
                })
              : ({} as T & { ok?: boolean; error?: { message?: string } });
            if ((parsed as { ok?: boolean }).ok === false) {
              reject(
                new Error(
                  (parsed as { error?: { message?: string } }).error?.message ||
                    "Bridge request failed",
                ),
              );
              return;
            }
            resolve(parsed as T);
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    });
    req.on("error", (error) => reject(error));
    if (payload) req.write(payload);
    req.end();
  });
}

export function probeBridge(baseUrl?: string): Promise<unknown> {
  const url = resolveBaseUrl(baseUrl);

  return new Promise((resolve, reject) => {
    const req = httpsRequest(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: "/health",
        method: "GET",
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.setTimeout(3_000, () => {
      req.destroy(new Error("Timed out probing bridge health"));
    });
    req.on("error", (error) => reject(error));
    req.end();
  });
}
