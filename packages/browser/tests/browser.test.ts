import { describe, expect, it } from "vitest";
import {
  Browser,
  type BrowserDependencies,
  type BrowserOptions,
} from "../src/browser.js";
import type { CdpClient, CdpClientOptions } from "../src/cdp.js";
import type { Page } from "../src/page.js";
import type {
  BrowserProvider,
  BrowserSession,
  CreateSessionOptions,
} from "../src/providers/types.js";

interface FakeProvider {
  provider: BrowserProvider;
  createdOptions: Array<CreateSessionOptions | undefined>;
  closedSessionIds: string[];
  session: BrowserSession;
}

interface TargetInfo {
  targetId: string;
  type: string;
  url: string;
  title: string;
}

interface FakeBrowserDeps {
  deps: BrowserOptions["deps"];
  connectCalls: Array<{ wsUrl: string; options?: CdpClientOptions }>;
  attachedTargetIds: string[];
  detachedSessionIds: string[];
  releasedSessions: Array<{ sessionId: string; reason: string }>;
  activatedTargetIds: string[];
  createdTargetUrls: string[];
  emit: (method: string, params: Record<string, unknown>) => void;
  isClosed: () => boolean;
}

function createProvider(session?: Partial<BrowserSession>): FakeProvider {
  const createdOptions: Array<CreateSessionOptions | undefined> = [];
  const closedSessionIds: string[] = [];
  const resolvedSession: BrowserSession = {
    cdpUrl: "wss://cdp.example/session",
    sessionId: "session-1",

    ...session,
  };

  return {
    provider: {
      name: "fake-provider",
      async createSession(options) {
        createdOptions.push(options);
        return resolvedSession;
      },
      async closeSession(sessionId) {
        closedSessionIds.push(sessionId);
      },
    },
    createdOptions,
    closedSessionIds,
    session: resolvedSession,
  };
}

function createFakePage(
  targetId: string,
  sessionId?: string,
  info?: { url?: string; title?: string },
): Page {
  return {
    targetId,
    sessionId,
    async getInfo() {
      return {
        url: info?.url ?? "",
        title: info?.title ?? "",
      };
    },
  } as Page;
}

function createDeps(options: {
  targets?: TargetInfo[];
  firstPage?: Page;
  pagesByTargetId?: Record<string, Page>;
  attachToFirstPageError?: Error;
}): FakeBrowserDeps {
  const targets = [...(options.targets ?? [])];
  const connectCalls: Array<{ wsUrl: string; options?: CdpClientOptions }> = [];
  const attachedTargetIds: string[] = [];
  const detachedSessionIds: string[] = [];
  const releasedSessions: Array<{ sessionId: string; reason: string }> = [];
  const activatedTargetIds: string[] = [];
  const createdTargetUrls: string[] = [];
  let closed = false;
  let nextTargetNumber =
    targets.reduce((max, target) => {
      const match = /^page-(\d+)$/.exec(target.targetId);
      return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
    }, 0) + 1;

  const eventHandlers = new Map<string, Set<(params: unknown) => void>>();

  const cdp = {
    async send(method: string, params?: Record<string, unknown>) {
      switch (method) {
        case "Target.setDiscoverTargets":
          return {};
        case "Target.getTargets":
          return { targetInfos: [...targets] };
        case "Target.createTarget": {
          const url = String(params?.url ?? "about:blank");
          const targetId = `page-${nextTargetNumber++}`;
          createdTargetUrls.push(url);
          targets.push({
            targetId,
            type: "page",
            url,
            title: url === "about:blank" ? "" : new URL(url).hostname,
          });
          return { targetId };
        }
        case "Target.closeTarget": {
          const targetId = String(params?.targetId ?? "");
          const index = targets.findIndex(
            (target) => target.targetId === targetId,
          );
          if (index >= 0) {
            targets.splice(index, 1);
          }
          return { success: index >= 0 };
        }
        case "Target.detachFromTarget": {
          detachedSessionIds.push(String(params?.sessionId ?? ""));
          return {};
        }
        case "Target.activateTarget": {
          activatedTargetIds.push(String(params?.targetId ?? ""));
          return {};
        }
        default:
          throw new Error(`Unexpected CDP method: ${method}`);
      }
    },
    on(method: string, handler: (params: unknown) => void) {
      const handlers = eventHandlers.get(method) ?? new Set();
      handlers.add(handler);
      eventHandlers.set(method, handlers);
    },
    off(method: string, handler: (params: unknown) => void) {
      eventHandlers.get(method)?.delete(handler);
    },
    releaseSession(sessionId: string, reason: string) {
      releasedSessions.push({ sessionId, reason });
    },
    async close() {
      closed = true;
    },
  } as unknown as CdpClient;

  const firstPage = options.firstPage ?? createFakePage("page-1");
  const pagesByTargetId = {
    ...(options.pagesByTargetId ?? {}),
    [firstPage.targetId ?? "page-1"]: firstPage,
  };

  const deps: Partial<BrowserDependencies> = {
    async connectCdp(wsUrl, connectOptions) {
      connectCalls.push({ wsUrl, options: connectOptions });
      return cdp;
    },
    async attachToFirstPage() {
      if (options.attachToFirstPageError) {
        throw options.attachToFirstPageError;
      }
      return firstPage;
    },
    async attachToTarget(_cdp, targetId) {
      attachedTargetIds.push(targetId);
      return (
        pagesByTargetId[targetId] ??
        createFakePage(targetId, `${targetId}-session`)
      );
    },
  };

  return {
    deps,
    connectCalls,
    attachedTargetIds,
    detachedSessionIds,
    releasedSessions,
    activatedTargetIds,
    createdTargetUrls,
    emit(method, params) {
      for (const handler of eventHandlers.get(method) ?? []) {
        handler(params);
      }
    },
    isClosed: () => closed,
  };
}

describe("Browser", () => {
  it("launches through a provider and exposes session metadata", async () => {
    const provider = createProvider();
    const browserDeps = createDeps({ firstPage: createFakePage("page-1") });

    const browser = await Browser.launch({
      provider: provider.provider,
      sessionOptions: { viewport: { width: 1280, height: 720 } },
      cdpOptions: { requestTimeoutMs: 5000 },
      deps: browserDeps.deps,
    });

    expect(provider.createdOptions).toEqual([
      { viewport: { width: 1280, height: 720 } },
    ]);
    expect(browserDeps.connectCalls).toEqual([
      {
        wsUrl: "wss://cdp.example/session",
        options: { requestTimeoutMs: 5000 },
      },
    ]);
    expect(browser.sessionId).toBe("session-1");
    expect(browser.cdpUrl).toBe("wss://cdp.example/session");

    await browser.close();

    expect(provider.closedSessionIds).toEqual(["session-1"]);
    expect(browserDeps.isClosed()).toBe(true);
  });

  it("cleans up the CDP connection and provider session when initial attach fails", async () => {
    const provider = createProvider();
    const browserDeps = createDeps({
      attachToFirstPageError: new Error("attach failed"),
    });

    await expect(
      Browser.launch({ provider: provider.provider, deps: browserDeps.deps }),
    ).rejects.toThrow("attach failed");

    expect(browserDeps.isClosed()).toBe(true);
    expect(provider.closedSessionIds).toEqual(["session-1"]);
  });

  it("lists only page targets and marks the active tab", async () => {
    const browserDeps = createDeps({
      targets: [
        {
          targetId: "page-1",
          type: "page",
          url: "https://example.com/a",
          title: "A",
        },
        {
          targetId: "worker-1",
          type: "service_worker",
          url: "",
          title: "",
        },
        {
          targetId: "page-2",
          type: "page",
          url: "https://example.com/b",
          title: "B",
        },
      ],
      firstPage: createFakePage("page-2"),
    });

    const browser = await Browser.connect({
      cdpUrl: "wss://cdp.example/session",
      deps: browserDeps.deps,
    });

    await expect(browser.listTabs()).resolves.toEqual([
      {
        index: 0,
        targetId: "page-1",
        url: "https://example.com/a",
        title: "A",
        active: false,
      },
      {
        index: 1,
        targetId: "page-2",
        url: "https://example.com/b",
        title: "B",
        active: true,
      },
    ]);
  });

  it("opens a new tab and reports it as active", async () => {
    const browserDeps = createDeps({
      targets: [
        {
          targetId: "page-1",
          type: "page",
          url: "https://example.com/old",
          title: "Old",
        },
      ],
      firstPage: createFakePage("page-1", "old-session", {
        url: "https://example.com/old",
        title: "Old",
      }),
      pagesByTargetId: {
        "page-2": createFakePage("page-2", "new-session", {
          url: "https://example.com/new",
          title: "example.com",
        }),
      },
    });

    const browser = await Browser.connect({
      cdpUrl: "wss://cdp.example/session",
      deps: browserDeps.deps,
    });
    const tabs = await browser.newTab("https://example.com/new");

    expect(browserDeps.createdTargetUrls).toEqual(["https://example.com/new"]);
    expect(browserDeps.attachedTargetIds).toEqual(["page-2"]);
    expect(tabs).toEqual([
      {
        index: 0,
        targetId: "page-1",
        url: "https://example.com/old",
        title: "Old",
        active: false,
      },
      {
        index: 1,
        targetId: "page-2",
        url: "https://example.com/new",
        title: "example.com",
        active: true,
      },
    ]);
  });

  it("creates a replacement about:blank tab when the last tab is closed", async () => {
    const browserDeps = createDeps({
      targets: [
        {
          targetId: "page-1",
          type: "page",
          url: "https://example.com/only",
          title: "Only",
        },
      ],
      firstPage: createFakePage("page-1", "old-session", {
        url: "https://example.com/only",
        title: "Only",
      }),
      pagesByTargetId: {
        "page-2": createFakePage("page-2", "new-session", {
          url: "about:blank",
          title: "",
        }),
      },
    });

    const browser = await Browser.connect({
      cdpUrl: "wss://cdp.example/session",
      deps: browserDeps.deps,
    });
    const remainingTabs = await browser.closeTab();

    expect(browserDeps.createdTargetUrls).toEqual(["about:blank"]);
    expect(remainingTabs).toEqual([
      {
        index: 0,
        targetId: "page-2",
        url: "about:blank",
        title: "",
        active: true,
      },
    ]);
  });

  it("throws when switching to a missing tab index", async () => {
    const browserDeps = createDeps({
      targets: [
        {
          targetId: "page-1",
          type: "page",
          url: "https://example.com/a",
          title: "A",
        },
      ],
      firstPage: createFakePage("page-1"),
    });

    const browser = await Browser.connect({
      cdpUrl: "wss://cdp.example/session",
      deps: browserDeps.deps,
    });

    await expect(browser.switchTab(3)).rejects.toThrow("No tab at index 3");
  });

  it("auto-follows newly created page targets", async () => {
    const browserDeps = createDeps({
      targets: [
        {
          targetId: "page-1",
          type: "page",
          url: "https://example.com/a",
          title: "A",
        },
      ],
      firstPage: createFakePage("page-1", "page-1-session", {
        url: "https://example.com/a",
        title: "A",
      }),
      pagesByTargetId: {
        "page-2": createFakePage("page-2", "page-2-session", {
          url: "https://example.com/new",
          title: "New",
        }),
      },
    });

    const browser = await Browser.connect({
      cdpUrl: "wss://cdp.example/session",
      deps: browserDeps.deps,
    });

    browserDeps.emit("Target.targetCreated", {
      targetInfo: {
        targetId: "page-2",
        type: "page",
        url: "https://example.com/new",
        title: "New",
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    await expect(browser.listTabs()).resolves.toEqual([
      {
        index: 0,
        targetId: "page-1",
        url: "https://example.com/a",
        title: "A",
        active: false,
      },
      {
        index: 1,
        targetId: "page-2",
        url: "https://example.com/new",
        title: "New",
        active: true,
      },
    ]);
    expect(browserDeps.attachedTargetIds).toContain("page-2");
  });
});
