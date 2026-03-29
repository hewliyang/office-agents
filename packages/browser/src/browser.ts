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

const defaultBrowserDependencies: BrowserDependencies = {
  connectCdp: (wsUrl, options) => CdpClient.connect(wsUrl, options),
  attachToFirstPage: (cdp) => Page.attachToFirstPage(cdp),
  attachToTarget: (cdp, targetId) => Page.attachToTarget(cdp, targetId),
};

export class Browser {
  private cdp: CdpClient | null = null;
  private provider: BrowserProvider | null = null;
  private session: BrowserSession | null = null;
  private _page: Page | null = null;
  private currentTargetId: string | null = null;
  private deps: BrowserDependencies = defaultBrowserDependencies;

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
    } catch (err) {
      await browser.close();
      throw err;
    }
    return browser;
  }

  static async connect(options: ConnectOptions): Promise<Browser> {
    const browser = new Browser();
    browser.deps = { ...defaultBrowserDependencies, ...options.deps };
    browser.cdp = await browser.deps.connectCdp(
      options.cdpUrl,
      options.cdpOptions,
    );
    browser._page = await browser.deps.attachToFirstPage(browser.cdp);
    browser.currentTargetId = browser._page.targetId ?? null;
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
    return this.session?.cdpUrl;
  }

  private get cdpClient(): CdpClient {
    if (!this.cdp) throw new Error("Browser not connected");
    return this.cdp;
  }

  private async attachToTarget(targetId: string): Promise<Page> {
    const previousSessionId = this._page?.sessionId;
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
    await this.cdpClient
      .send("Target.activateTarget", { targetId })
      .catch(() => {});
    return page;
  }

  async listTabs(): Promise<BrowserTab[]> {
    const { targetInfos } = await this.cdpClient.send("Target.getTargets");
    return targetInfos
      .filter((target) => target.type === "page")
      .map((target, index) => ({
        index,
        targetId: target.targetId,
        url: target.url,
        title: target.title,
        active: target.targetId === this.currentTargetId,
      }));
  }

  async newTab(url = "about:blank"): Promise<BrowserTab[]> {
    const { targetId } = await this.cdpClient.send("Target.createTarget", {
      url,
    });
    await this.attachToTarget(targetId);
    return this.listTabs();
  }

  async switchTab(index: number): Promise<BrowserTab[]> {
    const tabs = await this.listTabs();
    const tab = tabs[index];
    if (!tab) {
      throw new Error(`No tab at index ${index}`);
    }
    await this.attachToTarget(tab.targetId);
    return this.listTabs();
  }

  async closeTab(index?: number): Promise<BrowserTab[]> {
    const tabs = await this.listTabs();
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

    const remaining = await this.listTabs();
    if (!remaining.length) {
      const { targetId } = await this.cdpClient.send("Target.createTarget", {
        url: "about:blank",
      });
      await this.attachToTarget(targetId);
      return this.listTabs();
    }

    const next = remaining[Math.min(targetTab.index, remaining.length - 1)];
    await this.attachToTarget(next.targetId);
    return this.listTabs();
  }

  async close(): Promise<void> {
    if (this.cdp) {
      await this.cdp.close();
      this.cdp = null;
    }
    if (this.provider && this.session) {
      await this.provider.closeSession(this.session.sessionId).catch(() => {});
      this.session = null;
    }
    this.currentTargetId = null;
    this._page = null;
  }
}
