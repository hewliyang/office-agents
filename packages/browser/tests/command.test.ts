import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Browser } from "../src/browser.js";
import { BrowseCli } from "../src/command.js";

type FakePage = {
  goto: ReturnType<typeof vi.fn>;
  getUrl: ReturnType<typeof vi.fn>;
  getTitle: ReturnType<typeof vi.fn>;
  reload: ReturnType<typeof vi.fn>;
  goBack: ReturnType<typeof vi.fn>;
  goForward: ReturnType<typeof vi.fn>;
  snapshot: ReturnType<typeof vi.fn>;
  screenshot: ReturnType<typeof vi.fn>;
  pdf: ReturnType<typeof vi.fn>;
  evaluate: ReturnType<typeof vi.fn>;
  getDownloadUrl: ReturnType<typeof vi.fn>;
  getText: ReturnType<typeof vi.fn>;
  getHtml: ReturnType<typeof vi.fn>;
  getMarkdown: ReturnType<typeof vi.fn>;
  getValue: ReturnType<typeof vi.fn>;
  getAttribute: ReturnType<typeof vi.fn>;
  getCount: ReturnType<typeof vi.fn>;
  getBox: ReturnType<typeof vi.fn>;
  getStyles: ReturnType<typeof vi.fn>;
  isVisible: ReturnType<typeof vi.fn>;
  isEnabled: ReturnType<typeof vi.fn>;
  isChecked: ReturnType<typeof vi.fn>;
  clickRef: ReturnType<typeof vi.fn>;
  clickSelector: ReturnType<typeof vi.fn>;
  dblclick: ReturnType<typeof vi.fn>;
  click: ReturnType<typeof vi.fn>;
  type: ReturnType<typeof vi.fn>;
  typeInto: ReturnType<typeof vi.fn>;
  pressKey: ReturnType<typeof vi.fn>;
  keyDown: ReturnType<typeof vi.fn>;
  keyUp: ReturnType<typeof vi.fn>;
  insertText: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  hover: ReturnType<typeof vi.fn>;
  hoverTarget: ReturnType<typeof vi.fn>;
  focus: ReturnType<typeof vi.fn>;
  check: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  dragAndDrop: ReturnType<typeof vi.fn>;
  uploadFiles: ReturnType<typeof vi.fn>;
  performFindAction: ReturnType<typeof vi.fn>;
  mouseDown: ReturnType<typeof vi.fn>;
  mouseUp: ReturnType<typeof vi.fn>;
  mouseWheel: ReturnType<typeof vi.fn>;
  scroll: ReturnType<typeof vi.fn>;
  scrollDirection: ReturnType<typeof vi.fn>;
  scrollIntoView: ReturnType<typeof vi.fn>;
  setViewport: ReturnType<typeof vi.fn>;
  setHeaders: ReturnType<typeof vi.fn>;
  setOffline: ReturnType<typeof vi.fn>;
  setMedia: ReturnType<typeof vi.fn>;
  setDevice: ReturnType<typeof vi.fn>;
  setCredentials: ReturnType<typeof vi.fn>;
  setGeolocation: ReturnType<typeof vi.fn>;
  waitForText: ReturnType<typeof vi.fn>;
  waitForUrl: ReturnType<typeof vi.fn>;
  waitForLoad: ReturnType<typeof vi.fn>;
  waitForFunction: ReturnType<typeof vi.fn>;
  waitForSelector: ReturnType<typeof vi.fn>;
  waitForTimeout: ReturnType<typeof vi.fn>;
  clearCookies: ReturnType<typeof vi.fn>;
  setCookie: ReturnType<typeof vi.fn>;
  getCookies: ReturnType<typeof vi.fn>;
  getStorage: ReturnType<typeof vi.fn>;
  setStorage: ReturnType<typeof vi.fn>;
  clearStorage: ReturnType<typeof vi.fn>;
};

function createFakePage(): FakePage {
  return {
    goto: vi.fn(async () => ({ url: "https://example.com" })),
    getUrl: vi.fn(async () => "https://example.com"),
    getTitle: vi.fn(async () => "Example"),
    reload: vi.fn(async () => ({ url: "https://example.com/reload" })),
    goBack: vi.fn(async () => ({ url: "https://example.com/back" })),
    goForward: vi.fn(async () => ({ url: "https://example.com/forward" })),
    snapshot: vi.fn(async () => ({
      tree: "- button [ref=e1]",
      refs: { e1: {} },
    })),
    screenshot: vi.fn(async () => ({ base64: btoa("png"), format: "png" })),
    pdf: vi.fn(async () => ({ base64: btoa("pdf") })),
    evaluate: vi.fn(async () => btoa("downloaded")),
    getDownloadUrl: vi.fn(async () => "https://example.com/file.txt"),
    getText: vi.fn(async () => "text"),
    getHtml: vi.fn(async () => "<div>html</div>"),
    getMarkdown: vi.fn(async () => ({
      url: "https://example.com",
      title: "Example",
      text: "# Example\n\nHello",
      metadata: { URL: "https://example.com" },
    })),
    getValue: vi.fn(async () => "value"),
    getAttribute: vi.fn(async (_target: string, attr: string) =>
      attr === "href" ? "https://example.com/new-tab" : "attribute",
    ),
    getCount: vi.fn(async () => 3),
    getBox: vi.fn(async () => ({ x: 1, y: 2, width: 3, height: 4 })),
    getStyles: vi.fn(async () => ({ display: "block" })),
    isVisible: vi.fn(async () => true),
    isEnabled: vi.fn(async () => true),
    isChecked: vi.fn(async () => false),
    clickRef: vi.fn(async () => ({ clicked: true })),
    clickSelector: vi.fn(async () => ({ clicked: true })),
    dblclick: vi.fn(async () => ({ clicked: true })),
    click: vi.fn(async () => ({ clicked: true })),
    type: vi.fn(async () => ({ typed: true })),
    typeInto: vi.fn(async () => ({ typed: true })),
    pressKey: vi.fn(async () => undefined),
    keyDown: vi.fn(async () => undefined),
    keyUp: vi.fn(async () => undefined),
    insertText: vi.fn(async () => ({ typed: true })),
    fill: vi.fn(async () => undefined),
    hover: vi.fn(async () => undefined),
    hoverTarget: vi.fn(async () => undefined),
    focus: vi.fn(async () => undefined),
    check: vi.fn(async () => undefined),
    select: vi.fn(async () => undefined),
    dragAndDrop: vi.fn(async () => undefined),
    uploadFiles: vi.fn(async () => undefined),
    performFindAction: vi.fn(async () => ({ clicked: true })),
    mouseDown: vi.fn(async () => undefined),
    mouseUp: vi.fn(async () => undefined),
    mouseWheel: vi.fn(async () => undefined),
    scroll: vi.fn(async () => undefined),
    scrollDirection: vi.fn(async () => undefined),
    scrollIntoView: vi.fn(async () => undefined),
    setViewport: vi.fn(async () => undefined),
    setHeaders: vi.fn(async () => undefined),
    setOffline: vi.fn(async () => undefined),
    setMedia: vi.fn(async () => undefined),
    setDevice: vi.fn(async () => undefined),
    setCredentials: vi.fn(async () => undefined),
    setGeolocation: vi.fn(async () => undefined),
    waitForText: vi.fn(async () => undefined),
    waitForUrl: vi.fn(async () => undefined),
    waitForLoad: vi.fn(async () => undefined),
    waitForFunction: vi.fn(async () => undefined),
    waitForSelector: vi.fn(async () => undefined),
    waitForTimeout: vi.fn(async () => undefined),
    clearCookies: vi.fn(async () => undefined),
    setCookie: vi.fn(async () => true),
    getCookies: vi.fn(async () => [{ name: "cookie", value: "value" }]),
    getStorage: vi.fn(async () => ({ key: "value" })),
    setStorage: vi.fn(async () => undefined),
    clearStorage: vi.fn(async () => undefined),
  };
}

function createFakeBrowser(page: FakePage) {
  return {
    page,
    sessionId: "session-1",
    cdpUrl: "wss://cdp.example/session-1",
    close: vi.fn(async () => undefined),
    newTab: vi.fn(async () => [
      {
        index: 0,
        targetId: "page-1",
        url: "https://example.com/new-tab",
        title: "New Tab",
        active: true,
      },
    ]),
    switchTab: vi.fn(async () => undefined),
    closeTab: vi.fn(async () => []),
    subscribePreview: vi.fn(() => () => {}),
    getPreviewStateSnapshot: vi.fn(() => ({
      connected: true,
      live: false,
      frameBase64: null,
      tabs: [],
      url: "https://example.com",
      title: "Example",
    })),
  } as unknown as Browser;
}

describe("BrowseCli", () => {
  let page: FakePage;
  let browser: Browser;
  let writeFile: ReturnType<typeof vi.fn>;
  let readFile: ReturnType<typeof vi.fn>;
  let launchBrowser: ReturnType<typeof vi.fn>;
  let connectBrowser: ReturnType<typeof vi.fn>;
  let cli: BrowseCli;

  beforeEach(() => {
    page = createFakePage();
    browser = createFakeBrowser(page);
    writeFile = vi.fn(async () => undefined);
    readFile = vi.fn(async (path: string) =>
      new TextEncoder().encode(`file:${path}`),
    );
    launchBrowser = vi.fn(async () => browser);
    connectBrowser = vi.fn(async () => browser);

    cli = new BrowseCli({
      getProvider: () => ({
        name: "fake",
        createSession: vi.fn(),
        closeSession: vi.fn(),
      }),
      readFile,
      writeFile,
      launchBrowser,
      connectBrowser,
    });
  });

  afterEach(async () => {
    await cli.dispose();
  });

  async function run(args: string[]) {
    return cli.executeCommand(args);
  }

  async function openSession() {
    const result = await run(["open", "https://example.com"]);
    expect(result.exitCode).toBe(0);
  }

  it("opens a page with aliases", async () => {
    const result = await run(["goto", "https://example.com"]);
    expect(result.exitCode).toBe(0);
    expect(launchBrowser).toHaveBeenCalledTimes(1);
    expect(page.goto).toHaveBeenCalledWith("https://example.com", {
      waitUntil: "load",
      timeoutMs: undefined,
    });
  });

  it("reuses the active browser for subsequent open commands", async () => {
    await run(["open", "https://example.com"]);
    await run(["open", "https://hewliyang.com"]);

    expect(launchBrowser).toHaveBeenCalledTimes(1);
    expect(browser.close).not.toHaveBeenCalled();
    expect(page.goto).toHaveBeenNthCalledWith(1, "https://example.com", {
      waitUntil: "load",
      timeoutMs: undefined,
    });
    expect(page.goto).toHaveBeenNthCalledWith(2, "https://hewliyang.com", {
      waitUntil: "load",
      timeoutMs: undefined,
    });
  });

  it("connects directly to a cdp url", async () => {
    const result = await run(["connect", "wss://cdp.example/session-1"]);
    expect(result.exitCode).toBe(0);
    expect(connectBrowser).toHaveBeenCalledWith({
      cdpUrl: "wss://cdp.example/session-1",
    });
  });

  it("supports selector screenshots and file output", async () => {
    await openSession();
    const result = await run(["screenshot", "#hero", "hero.png", "--full"]);
    expect(result.exitCode).toBe(0);
    expect(page.screenshot).toHaveBeenCalledWith({
      format: "png",
      quality: undefined,
      fullPage: true,
      selectorOrRef: "#hero",
    });
    expect(writeFile).toHaveBeenCalled();
  });

  it("writes pdf output when a path is provided", async () => {
    await openSession();
    const result = await run(["pdf", "page.pdf"]);
    expect(result.exitCode).toBe(0);
    expect(writeFile).toHaveBeenCalled();
  });

  it("downloads from a selector by resolving its url", async () => {
    await openSession();
    const result = await run(["download", "#export-link", "report.txt"]);
    expect(result.exitCode).toBe(0);
    expect(page.getDownloadUrl).toHaveBeenCalledWith("#export-link");
    expect(writeFile).toHaveBeenCalled();
  });

  it("renders page markdown and can write it to a file", async () => {
    await openSession();
    const inline = await run(["markdown"]);
    expect(inline.exitCode).toBe(0);
    expect(inline.stdout).toContain("# Example");

    const file = await run(["markdown", "page.md", "--selector=#main"]);
    expect(file.exitCode).toBe(0);
    expect(page.getMarkdown).toHaveBeenCalledWith("#main");
    expect(writeFile).toHaveBeenCalled();
  });

  it("supports get box and get styles", async () => {
    await openSession();
    const boxResult = await run(["get", "box", "#hero"]);
    expect(boxResult.exitCode).toBe(0);
    expect(JSON.parse(boxResult.stdout)).toEqual({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });

    const stylesResult = await run(["get", "styles", "#hero"]);
    expect(stylesResult.exitCode).toBe(0);
    expect(JSON.parse(stylesResult.stdout)).toEqual({ display: "block" });
  });

  it("opens href targets in a new tab", async () => {
    await openSession();
    const result = await run(["click", "#nav", "--new-tab"]);
    expect(result.exitCode).toBe(0);
    const fakeBrowser = browser as unknown as {
      newTab: ReturnType<typeof vi.fn>;
    };
    expect(fakeBrowser.newTab).toHaveBeenCalledWith(
      "https://example.com/new-tab",
    );
  });

  it("supports selector-aware type plus keyboard commands", async () => {
    await openSession();
    await run(["type", "#email", "hello@example.com"]);
    expect(page.typeInto).toHaveBeenCalledWith("#email", "hello@example.com", {
      delay: undefined,
    });

    await run(["keyboard", "inserttext", "hello"]);
    expect(page.insertText).toHaveBeenCalledWith("hello");

    await run(["keydown", "Shift"]);
    expect(page.keyDown).toHaveBeenCalledWith("Shift");

    await run(["keyup", "Shift"]);
    expect(page.keyUp).toHaveBeenCalledWith("Shift");

    await run(["key", "Enter"]);
    expect(page.pressKey).toHaveBeenCalledWith("Enter");
  });

  it("supports drag and upload", async () => {
    await openSession();
    await run(["drag", "#a", "#b"]);
    expect(page.dragAndDrop).toHaveBeenCalledWith("#a", "#b");

    const result = await run(["upload", "#file", "/tmp/a.txt", "/tmp/b.txt"]);
    expect(result.exitCode).toBe(0);
    expect(readFile).toHaveBeenCalledTimes(2);
    expect(page.uploadFiles).toHaveBeenCalledTimes(1);
    const uploadArg = page.uploadFiles.mock.calls[0]?.[1];
    expect(uploadArg).toHaveLength(2);
    expect(uploadArg[0].name).toBe("a.txt");
  });

  it("supports semantic find locators", async () => {
    await openSession();
    const result = await run([
      "find",
      "role",
      "button",
      "click",
      "--name",
      "Submit",
      "--exact",
    ]);
    expect(result.exitCode).toBe(0);
    expect(page.performFindAction).toHaveBeenCalledWith(
      {
        kind: "role",
        value: "button",
        exact: true,
        name: "Submit",
      },
      "click",
      undefined,
    );
  });

  it("supports mouse and scroll parity commands", async () => {
    await openSession();
    await run(["mouse", "move", "10", "20"]);
    expect(page.hover).toHaveBeenCalledWith(10, 20);

    await run(["mouse", "down", "right"]);
    expect(page.mouseDown).toHaveBeenCalledWith("right");

    await run(["mouse", "wheel", "250", "10"]);
    expect(page.mouseWheel).toHaveBeenCalledWith(250, 10);

    await run(["scroll", "down", "500", "--selector", "#list"]);
    expect(page.scrollDirection).toHaveBeenCalledWith("down", 500, "#list");

    await run(["scrollinto", "#footer"]);
    expect(page.scrollIntoView).toHaveBeenCalledWith("#footer");
  });

  it("supports extra browser settings", async () => {
    await openSession();
    await run(["set", "device", "iPhone", "15"]);
    expect(page.setDevice).toHaveBeenCalledWith("iPhone 15");

    await run(["set", "credentials", "user", "pass"]);
    expect(page.setCredentials).toHaveBeenCalledWith("user", "pass");

    await run(["set", "media", "dark", "reduced-motion"]);
    expect(page.setMedia).toHaveBeenCalledWith("dark", "reduce");

    await run(["wait", "selector", "#spinner", "--state=detached"]);
    expect(page.waitForSelector).toHaveBeenCalledWith(
      "#spinner",
      30000,
      "detached",
    );
  });

  it("supports close aliases", async () => {
    const fakeBrowser = browser as unknown as {
      close: ReturnType<typeof vi.fn>;
    };
    await run(["open", "https://example.com"]);
    const result = await run(["close", "--all"]);
    expect(result.exitCode).toBe(0);
    expect(fakeBrowser.close).toHaveBeenCalled();
  });
});
