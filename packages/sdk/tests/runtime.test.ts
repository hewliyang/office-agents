import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AgentContext } from "../src/context";
import {
  AgentRuntime,
  type RuntimeAdapter,
  type RuntimeState,
} from "../src/runtime";

// Stub localStorage for Node
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
  };
}

let nsCounter = 0;

function freshNamespace() {
  nsCounter++;
  return {
    dbName: `RuntimeTestDB_${nsCounter}`,
    dbVersion: 1,
    localStoragePrefix: `runtime-test-${nsCounter}`,
    documentSettingsPrefix: `runtime-test-${nsCounter}`,
    documentIdSettingsKey: `runtime-test-${nsCounter}-document-id`,
  };
}

function createAdapter(
  overrides: Partial<RuntimeAdapter> = {},
): RuntimeAdapter {
  return {
    tools: [],
    buildSystemPrompt: () => "You are a test assistant.",
    getDocumentId: async () => "test-doc-1",
    storageNamespace: freshNamespace(),
    ...overrides,
  };
}

function createRuntime(overrides: Partial<RuntimeAdapter> = {}): AgentRuntime {
  const adapter = createAdapter(overrides);
  const ctx = new AgentContext({
    namespace: adapter.storageNamespace,
    staticFiles: adapter.staticFiles,
  });
  return new AgentRuntime(adapter, ctx);
}

describe("AgentRuntime", () => {
  it("getModelsForProvider returns empty array for unknown provider", () => {
    const runtime = createRuntime();
    const models = runtime.getModelsForProvider("nonexistent-provider");
    expect(models).toEqual([]);
    runtime.dispose();
  });

  it("applyConfig sets up agent and updates state", () => {
    const runtime = createRuntime();

    runtime.applyConfig({
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      useProxy: false,
      proxyUrl: "",
      thinking: "none",
      followMode: true,
      expandToolCalls: false,
    });

    const state = runtime.getState();
    expect(state.providerConfig).not.toBeNull();
    expect(state.providerConfig!.provider).toBe("openai");
    expect(state.providerConfig!.model).toBe("gpt-4o-mini");
    expect(state.sessionStats.contextWindow).toBeGreaterThan(0);
    expect(state.error).toBeNull();
    runtime.dispose();
  });

  it("applyConfig with custom provider builds custom model", () => {
    const runtime = createRuntime();

    runtime.applyConfig({
      provider: "custom",
      apiKey: "test-key",
      model: "llama3",
      useProxy: false,
      proxyUrl: "",
      thinking: "none",
      followMode: true,
      expandToolCalls: false,
      apiType: "openai-completions",
      customBaseUrl: "http://localhost:11434",
    });

    const state = runtime.getState();
    expect(state.providerConfig).not.toBeNull();
    expect(state.providerConfig!.provider).toBe("custom");
    expect(state.sessionStats.contextWindow).toBe(128000);
    runtime.dispose();
  });

  it("sendMessage errors when no config", async () => {
    const runtime = createRuntime();
    await runtime.sendMessage("hello");
    const state = runtime.getState();
    expect(state.error).toContain("API key");
    runtime.dispose();
  });

  it("clearMessages resets state", () => {
    const runtime = createRuntime();

    runtime.applyConfig({
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      useProxy: false,
      proxyUrl: "",
      thinking: "none",
      followMode: true,
      expandToolCalls: false,
    });

    runtime.clearMessages();
    const state = runtime.getState();
    expect(state.messages).toEqual([]);
    expect(state.error).toBeNull();
    expect(state.uploads).toEqual([]);
    runtime.dispose();
  });

  it("toggleFollowMode flips followMode", () => {
    const runtime = createRuntime();

    runtime.applyConfig({
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      useProxy: false,
      proxyUrl: "",
      thinking: "none",
      followMode: true,
      expandToolCalls: false,
    });

    expect(runtime.getState().providerConfig!.followMode).toBe(true);
    runtime.toggleFollowMode();
    expect(runtime.getState().providerConfig!.followMode).toBe(false);
    runtime.toggleFollowMode();
    expect(runtime.getState().providerConfig!.followMode).toBe(true);
    runtime.dispose();
  });

  it("toggleExpandToolCalls flips expandToolCalls", () => {
    const runtime = createRuntime();

    runtime.applyConfig({
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      useProxy: false,
      proxyUrl: "",
      thinking: "none",
      followMode: true,
      expandToolCalls: false,
    });

    expect(runtime.getState().providerConfig!.expandToolCalls).toBe(false);
    runtime.toggleExpandToolCalls();
    expect(runtime.getState().providerConfig!.expandToolCalls).toBe(true);
    runtime.dispose();
  });

  it("uploadFiles adds files and updates state", async () => {
    const runtime = createRuntime();
    await runtime.init();

    await runtime.uploadFiles([
      {
        name: "data.csv",
        size: 100,
        data: new TextEncoder().encode("a,b\n1,2"),
      },
    ]);

    const state = runtime.getState();
    expect(state.uploads).toHaveLength(1);
    expect(state.uploads[0].name).toBe("data.csv");
    expect(state.isUploading).toBe(false);
    runtime.dispose();
  });

  it("removeUpload removes a file from state", async () => {
    const runtime = createRuntime();
    await runtime.init();

    await runtime.uploadFiles([
      {
        name: "temp.txt",
        size: 10,
        data: new TextEncoder().encode("temp"),
      },
    ]);
    expect(runtime.getState().uploads).toHaveLength(1);

    await runtime.removeUpload("temp.txt");
    expect(runtime.getState().uploads).toHaveLength(0);
    runtime.dispose();
  });

  it("init loads session and skills", async () => {
    const runtime = createRuntime();
    await runtime.init();

    const state = runtime.getState();
    expect(state.currentSession).not.toBeNull();
    expect(state.currentSession!.workbookId).toBe("test-doc-1");
    expect(Array.isArray(state.skills)).toBe(true);
    runtime.dispose();
  });

  it("init is idempotent", async () => {
    const runtime = createRuntime();
    await runtime.init();
    const session1 = runtime.getState().currentSession;
    await runtime.init();
    const session2 = runtime.getState().currentSession;
    expect(session1!.id).toBe(session2!.id);
    runtime.dispose();
  });

  it("newSession creates a fresh session", async () => {
    const runtime = createRuntime();
    await runtime.init();

    const firstSession = runtime.getState().currentSession!.id;
    await runtime.newSession();
    const secondSession = runtime.getState().currentSession!.id;

    expect(firstSession).not.toBe(secondSession);
    expect(runtime.getState().messages).toEqual([]);
    runtime.dispose();
  });

  it("switchSession restores a previous session", async () => {
    const runtime = createRuntime();
    await runtime.init();

    const firstId = runtime.getState().currentSession!.id;
    await runtime.newSession();
    const secondId = runtime.getState().currentSession!.id;

    await runtime.switchSession(firstId);
    expect(runtime.getState().currentSession!.id).toBe(firstId);

    await runtime.switchSession(secondId);
    expect(runtime.getState().currentSession!.id).toBe(secondId);
    runtime.dispose();
  });

  it("deleteCurrentSession switches to another session", async () => {
    const runtime = createRuntime();
    await runtime.init();

    const firstId = runtime.getState().currentSession!.id;
    await runtime.newSession();

    await runtime.deleteCurrentSession();
    expect(runtime.getState().currentSession).not.toBeNull();
    runtime.dispose();
  });

  it("emits state to subscribers on update", async () => {
    const runtime = createRuntime();
    const states: RuntimeState[] = [];
    const unsub = runtime.subscribe((s) => states.push(s));

    runtime.applyConfig({
      provider: "openai",
      apiKey: "sk-test",
      model: "gpt-4o-mini",
      useProxy: false,
      proxyUrl: "",
      thinking: "none",
      followMode: true,
      expandToolCalls: false,
    });

    expect(states.length).toBeGreaterThan(0);
    expect(states[states.length - 1].providerConfig).not.toBeNull();

    unsub();
    runtime.dispose();
  });

  it("init applies adapter.staticFiles to context", async () => {
    const ns = freshNamespace();
    const ctx = new AgentContext({ namespace: ns });

    const adapter = createAdapter({
      storageNamespace: ns,
      staticFiles: {
        "/home/user/docs/word-api.d.ts": "declare const Word: any;",
      },
    });

    expect(await ctx.fileExists("/home/user/docs/word-api.d.ts")).toBe(false);

    const runtime = new AgentRuntime(adapter, ctx);
    await runtime.init();

    expect(await ctx.fileExists("/home/user/docs/word-api.d.ts")).toBe(true);
    expect(await ctx.readFile("/home/user/docs/word-api.d.ts")).toBe(
      "declare const Word: any;",
    );
    runtime.dispose();
  });

  it("init applies adapter.customCommands to context", async () => {
    const ns = freshNamespace();
    const ctx = new AgentContext({ namespace: ns });
    expect(ctx.commandSnippets).toEqual([]);

    const adapter = createAdapter({
      storageNamespace: ns,
      customCommands: () => ({
        commands: [],
        promptSnippets: ["Use `my-cmd` to do stuff"],
      }),
    });

    const runtime = new AgentRuntime(adapter, ctx);
    await runtime.init();

    expect(ctx.commandSnippets).toEqual(["Use `my-cmd` to do stuff"]);
    runtime.dispose();
  });

  it("uploadFiles replaces existing upload with same name", async () => {
    const runtime = createRuntime();
    await runtime.init();

    await runtime.uploadFiles([
      { name: "file.txt", size: 10, data: new TextEncoder().encode("v1") },
    ]);
    await runtime.uploadFiles([
      { name: "file.txt", size: 20, data: new TextEncoder().encode("v2") },
    ]);

    const state = runtime.getState();
    expect(state.uploads).toHaveLength(1);
    expect(state.uploads[0].size).toBe(20);
    runtime.dispose();
  });
});
