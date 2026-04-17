import { CdpClient, type CdpClientOptions } from "./cdp.js";
import { Page } from "./page.js";
import type {
  BrowserProvider,
  BrowserSession,
  CreateSessionOptions,
} from "./providers/types.js";

export interface BrowserDependencies {
  connectCdp: (wsUrl: string, options?: CdpClientOptions) => Promise<CdpClient>;
  attachToFirstPage: (cdp: CdpClient) => Promise<Page>;
  attachToTarget: (cdp: CdpClient, targetId: string) => Promise<Page>;
}

export interface BrowserOptions {
  provider: BrowserProvider;
  sessionOptions?: CreateSessionOptions;
  cdpOptions?: CdpClientOptions;
  deps?: Partial<BrowserDependencies>;
}

export interface ConnectOptions {
  cdpUrl: string;
  cdpOptions?: CdpClientOptions;
  deps?: Partial<BrowserDependencies>;
}

export interface BrowserTab {
  index: number;
  targetId: string;
  url: string;
  title: string;
  active: boolean;
}

export interface BrowserPreviewState {
  connected: boolean;
  live: boolean;
  frameBase64: string | null;
  tabs: BrowserTab[];
  url: string;
  title: string;
}

interface TargetInfoLike {
  targetId: string;
  type: string;
  url: string;
  title: string;
}

type PreviewListener = (state: BrowserPreviewState) => void;

const defaultBrowserDependencies: BrowserDependencies = {
  connectCdp: (wsUrl, options) => CdpClient.connect(wsUrl, options),
  attachToFirstPage: (cdp) => Page.attachToFirstPage(cdp),
  attachToTarget: (cdp, targetId) => Page.attachToTarget(cdp, targetId),
};

function isTrackableTarget(target: { type?: string }): boolean {
  return target.type === "page";
}

export class Browser {
  private cdp: CdpClient | null = null;
  private provider: BrowserProvider | null = null;
  private session: BrowserSession | null = null;
  private directCdpUrl: string | null = null;
  private _page: Page | null = null;
  private currentTargetId: string | null = null;
  private deps: BrowserDependencies = defaultBrowserDependencies;
  private trackedTargets = new Map<string, { url: string; title: string }>();
  private trackedTargetOrder: string[] = [];
  private previewListeners = new Set<PreviewListener>();
  private previewState: BrowserPreviewState = {
    connected: false,
    live: false,
    frameBase64: null,
    tabs: [],
    url: "",
    title: "",
  };
  private previewCleanup: (() => Promise<void>) | null = null;
  private previewGeneration = 0;
  private attachQueue: Promise<void> = Promise.resolve();
  private readonly onTargetCreatedBound = (params: unknown) => {
    void this.handleTargetCreated(params);
  };
  private readonly onTargetInfoChangedBound = (params: unknown) => {
    void this.handleTargetInfoChanged(params);
  };
  private readonly onTargetDestroyedBound = (params: unknown) => {
    void this.handleTargetDestroyed(params);
  };

  private constructor() {}

  static async launch(options: BrowserOptions): Promise<Browser> {
    const browser = new Browser();
    browser.deps = { ...defaultBrowserDependencies, ...options.deps };
    browser.provider = options.provider;
    browser.session = await options.provider.createSession(
      options.sessionOptions,
    );
    try {
      browser.cdp = await browser.deps.connectCdp(
        browser.session.cdpUrl,
        options.cdpOptions,
      );
      browser._page = await browser.deps.attachToFirstPage(browser.cdp);
      browser.currentTargetId = browser._page.targetId ?? null;
      await browser.initialize();
    } catch (err) {
      await browser.close();
      throw err;
    }
    return browser;
  }

  static async connect(options: ConnectOptions): Promise<Browser> {
    const browser = new Browser();
    browser.deps = { ...defaultBrowserDependencies, ...options.deps };
    browser.directCdpUrl = options.cdpUrl;
    browser.cdp = await browser.deps.connectCdp(
      options.cdpUrl,
      options.cdpOptions,
    );
    browser._page = await browser.deps.attachToFirstPage(browser.cdp);
    browser.currentTargetId = browser._page.targetId ?? null;
    await browser.initialize();
    return browser;
  }

  get page(): Page {
    if (!this._page) throw new Error("Browser not connected");
    return this._page;
  }

  get sessionId(): string | undefined {
    return this.session?.sessionId;
  }

  get cdpUrl(): string | undefined {
    return this.session?.cdpUrl ?? this.directCdpUrl ?? undefined;
  }

  private get cdpClient(): CdpClient {
    if (!this.cdp) throw new Error("Browser not connected");
    return this.cdp;
  }

  private async initialize(): Promise<void> {
    await this.enableTargetDiscovery();
    await this.refreshTargets();
    this.installTargetListeners();
    await this.syncCurrentPageInfo();
    this.previewState.connected = true;
    this.emitPreview();
  }

  private async enableTargetDiscovery(): Promise<void> {
    await this.cdpClient
      .send("Target.setDiscoverTargets", { discover: true })
      .catch(() => {});
  }

  private installTargetListeners(): void {
    this.cdpClient.on("Target.targetCreated", this.onTargetCreatedBound);
    this.cdpClient.on(
      "Target.targetInfoChanged",
      this.onTargetInfoChangedBound,
    );
    this.cdpClient.on("Target.targetDestroyed", this.onTargetDestroyedBound);
  }

  private removeTargetListeners(): void {
    if (!this.cdp) return;
    this.cdp.off("Target.targetCreated", this.onTargetCreatedBound);
    this.cdp.off("Target.targetInfoChanged", this.onTargetInfoChangedBound);
    this.cdp.off("Target.targetDestroyed", this.onTargetDestroyedBound);
  }

  private async refreshTargets(): Promise<void> {
    const currentTargetId = this.currentTargetId;
    try {
      const { targetInfos } = await this.cdpClient.send("Target.getTargets");
      const nextOrder: string[] = [];
      const nextTargets = new Map<string, { url: string; title: string }>();

      for (const target of targetInfos) {
        if (!isTrackableTarget(target)) continue;
        nextOrder.push(target.targetId);
        nextTargets.set(target.targetId, {
          url: target.url,
          title: target.title,
        });
      }

      if (currentTargetId && !nextTargets.has(currentTargetId)) {
        nextOrder.push(currentTargetId);
        nextTargets.set(currentTargetId, {
          url: this.previewState.url,
          title: this.previewState.title,
        });
      }

      this.trackedTargetOrder = nextOrder;
      this.trackedTargets = nextTargets;
    } catch {
      if (currentTargetId) {
        this.upsertTrackedTarget(currentTargetId, {
          url: this.previewState.url,
          title: this.previewState.title,
        });
      }
    }
    this.emitPreview();
  }

  private upsertTrackedTarget(
    targetId: string,
    data: { url: string; title: string },
  ): void {
    this.trackedTargets.set(targetId, data);
    if (!this.trackedTargetOrder.includes(targetId)) {
      this.trackedTargetOrder.push(targetId);
    }
    this.emitPreview();
  }

  private removeTrackedTarget(targetId: string): void {
    this.trackedTargets.delete(targetId);
    this.trackedTargetOrder = this.trackedTargetOrder.filter(
      (id) => id !== targetId,
    );
    this.emitPreview();
  }

  getTabsSnapshot(): BrowserTab[] {
    return this.trackedTargetOrder
      .filter((targetId) => this.trackedTargets.has(targetId))
      .map((targetId, index) => {
        const target = this.trackedTargets.get(targetId)!;
        return {
          index,
          targetId,
          url: target.url,
          title: target.title,
          active: targetId === this.currentTargetId,
        };
      });
  }

  getPreviewStateSnapshot(): BrowserPreviewState {
    return {
      ...this.previewState,
      connected: this.previewState.connected && !!this.cdp,
      tabs: this.getTabsSnapshot(),
      url:
        this.currentTargetId && this.trackedTargets.has(this.currentTargetId)
          ? (this.trackedTargets.get(this.currentTargetId)?.url ?? "")
          : this.previewState.url,
      title:
        this.currentTargetId && this.trackedTargets.has(this.currentTargetId)
          ? (this.trackedTargets.get(this.currentTargetId)?.title ?? "")
          : this.previewState.title,
    };
  }

  subscribePreview(listener: PreviewListener): () => void {
    this.previewListeners.add(listener);
    listener(this.getPreviewStateSnapshot());
    if (this.previewListeners.size === 1) {
      void this.restartPreview();
    }
    return () => {
      this.previewListeners.delete(listener);
      if (this.previewListeners.size === 0) {
        void this.stopPreview();
      }
    };
  }

  private emitPreview(): void {
    const snapshot = this.getPreviewStateSnapshot();
    for (const listener of this.previewListeners) {
      try {
        listener(snapshot);
      } catch {}
    }
  }

  private async syncCurrentPageInfo(): Promise<void> {
    if (!this._page || !this.currentTargetId) return;
    try {
      const info = await this._page.getInfo();
      this.previewState.url = info.url;
      this.previewState.title = info.title;
      this.upsertTrackedTarget(this.currentTargetId, info);
      return;
    } catch {}

    if (!this.trackedTargets.has(this.currentTargetId)) {
      this.upsertTrackedTarget(this.currentTargetId, {
        url: this.previewState.url,
        title: this.previewState.title,
      });
    }
  }

  private async activateTarget(targetId: string): Promise<void> {
    await this.cdpClient
      .send("Target.activateTarget", { targetId })
      .catch(() => {});
  }

  private async runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const previous = this.attachQueue;
    let release!: () => void;
    this.attachQueue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await task();
    } finally {
      release();
    }
  }

  private async attachToTarget(targetId: string): Promise<Page> {
    return this.runExclusive(async () => {
      const currentPage = this._page;
      if (
        currentPage &&
        this.currentTargetId === targetId &&
        currentPage.cdpSession &&
        !currentPage.cdpSession.isDetached
      ) {
        await this.activateTarget(targetId);
        await this.syncCurrentPageInfo();
        await this.restartPreview();
        return currentPage;
      }

      const previousSessionId = currentPage?.sessionId;
      if (previousSessionId) {
        await this.cdpClient
          .send("Target.detachFromTarget", {
            sessionId: previousSessionId,
          })
          .catch(() => {});
        this.cdpClient.releaseSession(previousSessionId, "detached by client");
      }

      const page = await this.deps.attachToTarget(this.cdpClient, targetId);
      this._page = page;
      this.currentTargetId = targetId;
      await this.activateTarget(targetId);
      await this.syncCurrentPageInfo();
      await this.restartPreview();
      this.emitPreview();
      return page;
    });
  }

  private async followTarget(targetId: string): Promise<void> {
    if (!this.cdp || targetId === this.currentTargetId) return;
    await this.attachToTarget(targetId).catch(() => {});
  }

  private async handleTargetCreated(params: unknown): Promise<void> {
    const target =
      params && typeof params === "object" && "targetInfo" in params
        ? (params.targetInfo as TargetInfoLike)
        : null;
    if (!target || !isTrackableTarget(target)) return;

    const alreadyTracked = this.trackedTargets.has(target.targetId);
    this.upsertTrackedTarget(target.targetId, {
      url: target.url,
      title: target.title,
    });

    if (!alreadyTracked && target.targetId !== this.currentTargetId) {
      await this.followTarget(target.targetId);
    }
  }

  private async handleTargetInfoChanged(params: unknown): Promise<void> {
    const target =
      params && typeof params === "object" && "targetInfo" in params
        ? (params.targetInfo as TargetInfoLike)
        : null;
    if (!target || !isTrackableTarget(target)) return;

    const alreadyTracked = this.trackedTargets.has(target.targetId);
    this.upsertTrackedTarget(target.targetId, {
      url: target.url,
      title: target.title,
    });

    if (!alreadyTracked && target.targetId !== this.currentTargetId) {
      await this.followTarget(target.targetId);
    }
  }

  private async handleTargetDestroyed(params: unknown): Promise<void> {
    const targetId =
      params && typeof params === "object" && "targetId" in params
        ? String(params.targetId)
        : "";
    if (!targetId) return;

    const wasActive = targetId === this.currentTargetId;
    this.removeTrackedTarget(targetId);

    if (!wasActive) return;

    const nextTargetId = this.trackedTargetOrder[0] ?? null;
    if (!nextTargetId) {
      this.currentTargetId = null;
      this.previewState.url = "";
      this.previewState.title = "";
      this.previewState.frameBase64 = null;
      this.previewState.live = false;
      await this.stopPreview();
      this.emitPreview();
      return;
    }

    await this.followTarget(nextTargetId);
  }

  private async stopPreview(): Promise<void> {
    this.previewGeneration += 1;
    const cleanup = this.previewCleanup;
    this.previewCleanup = null;
    if (cleanup) {
      await cleanup().catch(() => {});
    }
    this.previewState.live = false;
    this.emitPreview();
  }

  private async restartPreview(): Promise<void> {
    if (this.previewListeners.size === 0) return;

    const generation = this.previewGeneration + 1;
    this.previewGeneration = generation;

    const cleanup = this.previewCleanup;
    this.previewCleanup = null;
    if (cleanup) {
      await cleanup().catch(() => {});
    }

    const session = this._page?.cdpSession;
    if (!session || session.isDetached) {
      this.previewState.live = false;
      this.previewState.frameBase64 = null;
      this.emitPreview();
      return;
    }

    const onFrameNavigated = (params: unknown) => {
      if (generation !== this.previewGeneration) return;
      const frame =
        params && typeof params === "object" && "frame" in params
          ? (params.frame as { url?: string; parentId?: string })
          : null;
      if (!frame || frame.parentId) return;
      const url = frame.url ?? "";
      this.previewState.url = url;
      if (this.currentTargetId) {
        const current = this.trackedTargets.get(this.currentTargetId);
        this.upsertTrackedTarget(this.currentTargetId, {
          url,
          title: current?.title ?? this.previewState.title,
        });
      }
      this.emitPreview();
    };

    const onScreencastFrame = (params: unknown) => {
      if (generation !== this.previewGeneration) return;
      const payload = params as { data?: string; sessionId?: number } | null;
      if (!payload?.data) return;
      this.previewState.frameBase64 = payload.data;
      this.previewState.live = true;
      this.emitPreview();
      if (typeof payload.sessionId === "number") {
        void session
          .send("Page.screencastFrameAck", { sessionId: payload.sessionId })
          .catch(() => {});
      }
    };

    session.on("Page.frameNavigated", onFrameNavigated);
    session.on("Page.screencastFrame", onScreencastFrame);

    this.previewCleanup = async () => {
      session.off("Page.frameNavigated", onFrameNavigated);
      session.off("Page.screencastFrame", onScreencastFrame);
      if (!session.isDetached) {
        await session.send("Page.stopScreencast").catch(() => {});
      }
    };

    try {
      await session.send("Page.startScreencast", {
        format: "jpeg",
        quality: 80,
        maxWidth: 1280,
        maxHeight: 720,
        everyNthFrame: 1,
      });
      this.previewState.live = true;
    } catch {
      this.previewState.live = false;
    }
    this.emitPreview();
  }

  async listTabs(): Promise<BrowserTab[]> {
    await this.refreshTargets();
    return this.getTabsSnapshot();
  }

  async newTab(url = "about:blank"): Promise<BrowserTab[]> {
    const { targetId } = await this.cdpClient.send("Target.createTarget", {
      url,
    });
    this.upsertTrackedTarget(targetId, { url, title: "" });
    await this.attachToTarget(targetId);
    return this.getTabsSnapshot();
  }

  async switchTab(index: number): Promise<BrowserTab[]> {
    await this.refreshTargets();
    const tabs = this.getTabsSnapshot();
    const tab = tabs[index];
    if (!tab) {
      throw new Error(`No tab at index ${index}`);
    }
    await this.attachToTarget(tab.targetId);
    return this.getTabsSnapshot();
  }

  async closeTab(index?: number): Promise<BrowserTab[]> {
    await this.refreshTargets();
    const tabs = this.getTabsSnapshot();
    if (!tabs.length) return tabs;
    const targetTab =
      index === undefined ? tabs.find((tab) => tab.active) : tabs[index];
    if (!targetTab) {
      throw new Error(
        index === undefined ? "No active tab" : `No tab at index ${index}`,
      );
    }

    await this.cdpClient.send("Target.closeTarget", {
      targetId: targetTab.targetId,
    });

    this.removeTrackedTarget(targetTab.targetId);
    if (targetTab.targetId === this.currentTargetId) {
      this.currentTargetId = null;
    }

    await this.refreshTargets();
    let remaining = this.getTabsSnapshot();
    if (!remaining.length) {
      const { targetId } = await this.cdpClient.send("Target.createTarget", {
        url: "about:blank",
      });
      this.upsertTrackedTarget(targetId, { url: "about:blank", title: "" });
      await this.attachToTarget(targetId);
      return this.getTabsSnapshot();
    }

    if (!remaining.some((tab) => tab.active)) {
      const next = remaining[Math.min(targetTab.index, remaining.length - 1)];
      await this.attachToTarget(next.targetId);
      remaining = this.getTabsSnapshot();
    }

    return remaining;
  }

  async close(): Promise<void> {
    await this.stopPreview();
    this.removeTargetListeners();
    if (this.cdp) {
      await this.cdp.close();
      this.cdp = null;
    }
    if (this.provider && this.session) {
      await this.provider.closeSession(this.session.sessionId).catch(() => {});
      this.session = null;
    }
    this.directCdpUrl = null;
    this.currentTargetId = null;
    this._page = null;
    this.trackedTargets.clear();
    this.trackedTargetOrder = [];
    this.previewState = {
      connected: false,
      live: false,
      frameBase64: null,
      tabs: [],
      url: "",
      title: "",
    };
    this.emitPreview();
  }
}
