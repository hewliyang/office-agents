import type { Api, Model } from "@mariozechner/pi-ai";
import { describe, expect, it } from "vitest";
import {
  applyProxyToModel,
  buildCustomModel,
  type ProviderConfig,
} from "../src/provider-config";

function makeConfig(overrides: Partial<ProviderConfig> = {}): ProviderConfig {
  return {
    provider: "openai",
    apiKey: "sk-test",
    model: "gpt-4",
    useProxy: false,
    proxyUrl: "",
    thinking: "none",
    followMode: true,
    expandToolCalls: false,
    ...overrides,
  };
}

describe("buildCustomModel", () => {
  it("returns null when apiType is missing", () => {
    expect(buildCustomModel(makeConfig({ provider: "custom" }))).toBeNull();
  });

  it("returns null when customBaseUrl is missing", () => {
    expect(
      buildCustomModel(
        makeConfig({ provider: "custom", apiType: "openai-completions" }),
      ),
    ).toBeNull();
  });

  it("returns null when model is missing", () => {
    expect(
      buildCustomModel(
        makeConfig({
          provider: "custom",
          apiType: "openai-completions",
          customBaseUrl: "http://localhost:11434",
          model: "",
        }),
      ),
    ).toBeNull();
  });

  it("returns a model when all required fields are present", () => {
    const model = buildCustomModel(
      makeConfig({
        provider: "custom",
        apiType: "openai-completions",
        customBaseUrl: "http://localhost:11434",
        model: "llama3",
      }),
    );
    expect(model).not.toBeNull();
    expect(model!.api).toBe("openai-completions");
    expect(model!.baseUrl).toBe("http://localhost:11434");
  });
});

describe("applyProxyToModel", () => {
  const baseModel = {
    id: "gpt-4",
    name: "GPT-4",
    api: "openai-completions" as const,
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    reasoning: true,
    input: ["text", "image"] as ("text" | "image")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 8192,
  };

  it("returns model unchanged when proxy is disabled", () => {
    const config = makeConfig({ useProxy: false, proxyUrl: "" });
    const result = applyProxyToModel(baseModel, config);
    expect(result.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("returns model unchanged when proxyUrl is empty", () => {
    const config = makeConfig({ useProxy: true, proxyUrl: "" });
    const result = applyProxyToModel(baseModel, config);
    expect(result.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("wraps baseUrl through proxy when enabled", () => {
    const config = makeConfig({
      useProxy: true,
      proxyUrl: "https://proxy.example.com",
    });
    const result = applyProxyToModel(baseModel, config);
    expect(result.baseUrl).toBe(
      `https://proxy.example.com/?url=${encodeURIComponent("https://api.openai.com/v1")}`,
    );
  });

  it("returns model unchanged when model has no baseUrl", () => {
    const modelWithoutBase = { ...baseModel, baseUrl: undefined } as unknown as Model<Api>;
    const config = makeConfig({
      useProxy: true,
      proxyUrl: "https://proxy.example.com",
    });
    const result = applyProxyToModel(modelWithoutBase, config);
    expect(result.baseUrl).toBeUndefined();
  });
});
