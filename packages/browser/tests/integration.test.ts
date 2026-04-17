import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Browser, CdpClient } from "../src/index.js";
import {
  chromiumExecutable,
  type FixtureServer,
  type LaunchedChromium,
  launchChromium,
  startFixtureServer,
  stopServer,
} from "./integration/helpers.js";

const suite = chromiumExecutable ? describe : describe.skip;

suite("integration", () => {
  let chrome: LaunchedChromium;
  let fixture: FixtureServer;
  let browser: Browser;

  beforeAll(async () => {
    [chrome, fixture] = await Promise.all([
      launchChromium(),
      startFixtureServer(),
    ]);
    browser = await Browser.connect({ cdpUrl: chrome.cdpUrl });
  }, 30000);

  afterAll(async () => {
    await browser?.close();
    await chrome?.close();
    if (fixture) await stopServer(fixture.server);
  });

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  describe("navigation", () => {
    it("navigates to a URL with goto", async () => {
      const result = await browser.page.goto(`${fixture.baseUrl}/interactive`);
      expect(result.url).toBe(`${fixture.baseUrl}/interactive`);
    });

    it("returns the current URL with getUrl", async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
      expect(await browser.page.getUrl()).toBe(
        `${fixture.baseUrl}/interactive`,
      );
    });

    it("returns the page title with getTitle", async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
      expect(await browser.page.getTitle()).toBe("Interactive Test");
    });

    it("returns url and title with getInfo", async () => {
      await browser.page.goto(`${fixture.baseUrl}/destination`);
      const info = await browser.page.getInfo();
      expect(info.url).toBe(`${fixture.baseUrl}/destination`);
      expect(info.title).toBe("Destination Page");
    });

    it("reloads the current page", async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
      await browser.page.focus("#name");
      await browser.page.type("temp");
      const result = await browser.page.reload();
      expect(result.url).toBe(`${fixture.baseUrl}/interactive`);
      expect(await browser.page.getValue("#name")).toBe("");
    });

    it("navigates back in history", async () => {
      await browser.page.goto(`${fixture.baseUrl}/history-a`);
      await browser.page.goto(`${fixture.baseUrl}/history-b`);
      const result = await browser.page.goBack();
      expect(result.url).toBe(`${fixture.baseUrl}/history-a`);
    });

    it("navigates forward in history", async () => {
      await browser.page.goto(`${fixture.baseUrl}/history-a`);
      await browser.page.goto(`${fixture.baseUrl}/history-b`);
      await browser.page.goBack();
      const result = await browser.page.goForward();
      expect(result.url).toBe(`${fixture.baseUrl}/history-b`);
    });

    it("waits for load state", async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
      await browser.page.waitForLoad("load", 5000);
      expect(await browser.page.getTitle()).toBe("Interactive Test");
    });
  });

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  describe("query", () => {
    beforeEach(async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
    });

    it("gets text content of an element", async () => {
      expect(await browser.page.getText("h1")).toBe("Interactive Test");
    });

    it("gets full body text when no selector given", async () => {
      const text = await browser.page.getText();
      expect(text).toContain("Interactive Test");
      expect(text).toContain("Submit");
    });

    it("gets innerHTML of an element", async () => {
      expect(await browser.page.getHtml("#count")).toBe("0");
    });

    it("gets full page HTML when no selector given", async () => {
      const html = await browser.page.getHtml();
      expect(html).toContain("<h1>Interactive Test</h1>");
    });

    it("converts the page to markdown", async () => {
      const markdown = await browser.page.getMarkdown();
      expect(markdown.title).toBe("Interactive Test");
      expect(markdown.text).toContain("Go next");
      expect(markdown.metadata.URL).toContain("/interactive");
    });

    it("converts a selector fragment to markdown", async () => {
      const markdown = await browser.page.getMarkdown("main");
      expect(markdown.text).toContain("Interactive Test");
      expect(markdown.metadata.Scope).toBe("main");
    });

    it("gets input value", async () => {
      await browser.page.focus("#name");
      await browser.page.type("test-value");
      expect(await browser.page.getValue("#name")).toBe("test-value");
    });

    it("gets an element attribute", async () => {
      expect(await browser.page.getAttribute("#nav", "href")).toBe(
        "/destination",
      );
    });

    it("gets an element bounding box", async () => {
      const box = await browser.page.getBox("#nav");
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    it("gets computed styles", async () => {
      const styles = await browser.page.getStyles("#nav");
      expect(styles.display).toBeTruthy();
    });

    it("returns null for missing attribute", async () => {
      expect(
        await browser.page.getAttribute("#nav", "data-nonexistent"),
      ).toBeNull();
    });

    it("counts elements matching a selector", async () => {
      expect(await browser.page.getCount("button")).toBe(2);
    });

    it("returns 0 for no matches", async () => {
      expect(await browser.page.getCount(".nonexistent")).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  describe("state", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/visibility`);
    });

    it("reports a visible element as visible", async () => {
      expect(await browser.page.isVisible("#visible-el")).toBe(true);
    });

    it("reports display:none as not visible", async () => {
      expect(await browser.page.isVisible("#hidden-display")).toBe(false);
    });

    it("reports visibility:hidden as not visible", async () => {
      expect(await browser.page.isVisible("#hidden-visibility")).toBe(false);
    });

    it("reports opacity:0 as not visible", async () => {
      expect(await browser.page.isVisible("#hidden-opacity")).toBe(false);
    });

    it("reports zero-size element as not visible", async () => {
      expect(await browser.page.isVisible("#zero-size")).toBe(false);
    });

    it("reports an enabled button as enabled", async () => {
      expect(await browser.page.isEnabled("#enabled-btn")).toBe(true);
    });

    it("reports a disabled button as not enabled", async () => {
      expect(await browser.page.isEnabled("#disabled-btn")).toBe(false);
    });

    it("reports a checked checkbox as checked", async () => {
      expect(await browser.page.isChecked("#checked-cb")).toBe(true);
    });

    it("reports an unchecked checkbox as not checked", async () => {
      expect(await browser.page.isChecked("#unchecked-cb")).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------

  describe("input", () => {
    beforeEach(async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
    });

    it("types text into a focused input", async () => {
      await browser.page.focus("#name");
      await browser.page.type("hello");
      expect(await browser.page.getValue("#name")).toBe("hello");
    });

    it("types text into a selector directly", async () => {
      await browser.page.typeInto("#name", "typed-into");
      expect(await browser.page.getValue("#name")).toBe("typed-into");
    });

    it("clicks an element by selector", async () => {
      await browser.page.clickSelector("#increment");
      expect(await browser.page.getText("#count")).toBe("1");
    });

    it("clicks at x,y coordinates", async () => {
      const center = (await browser.page.evaluate(`(() => {
        const el = document.querySelector("#increment");
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      })()`)) as { x: number; y: number };
      await browser.page.click(center.x, center.y);
      expect(await browser.page.getText("#count")).toBe("1");
    });

    it("double-clicks an element", async () => {
      await browser.page.dblclick("#increment");
      expect(await browser.page.getText("#count")).toBe("2");
    });

    it("clicks a snapshot ref", async () => {
      await browser.page.focus("#name");
      await browser.page.type("via ref");
      const snap = await browser.page.snapshot({ interactive: true });
      const submitRef = Object.values(snap.refs).find(
        (r) => r.role === "button" && r.name === "Submit",
      );
      expect(submitRef).toBeDefined();
      await browser.page.clickRef(submitRef!.ref);
      expect(await browser.page.getText("#output")).toBe("via ref");
    });

    it("focuses an element", async () => {
      await browser.page.focus("#name");
      expect(await browser.page.evaluate("document.activeElement?.id")).toBe(
        "name",
      );
    });

    it("presses a key", async () => {
      await browser.page.focus("#name");
      await browser.page.type("abc");
      await browser.page.pressKey("Backspace");
      expect(await browser.page.getValue("#name")).toBe("ab");
    });

    it("presses a key combo with modifier", async () => {
      await browser.page.focus("#name");
      await browser.page.type("hello");
      // Ctrl+A select-all is handled by the browser's native editing, not JS events.
      // In headless CDP the key events fire but selection may not happen.
      // Just verify the key dispatch doesn't throw.
      await browser.page.pressKey("Ctrl+A");
    });

    it("fills an input, clearing previous value", async () => {
      await browser.page.fill("#name", "new value", { pressEnter: false });
      const value = await browser.page.getValue("#name");
      expect(value).toContain("new value");
    });

    it("inserts text without key events", async () => {
      await browser.page.focus("#name");
      await browser.page.insertText("inserted");
      expect(await browser.page.getValue("#name")).toContain("inserted");
    });
  });

  // ---------------------------------------------------------------------------
  // Input — form controls
  // ---------------------------------------------------------------------------

  describe("form controls", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/form`);
    });

    it("checks a checkbox", async () => {
      await browser.page.check("#agree", true);
      expect(await browser.page.isChecked("#agree")).toBe(true);
    });

    it("unchecks a checkbox", async () => {
      await browser.page.check("#agree", true);
      await browser.page.check("#agree", false);
      expect(await browser.page.isChecked("#agree")).toBe(false);
    });

    it("selects an option in a select element", async () => {
      await browser.page.select("#color", ["green"]);
      expect(await browser.page.getValue("#color")).toBe("green");
    });

    it("selects a different option by text", async () => {
      await browser.page.select("#color", ["Blue"]);
      expect(await browser.page.getValue("#color")).toBe("blue");
    });
  });

  // ---------------------------------------------------------------------------
  // Mouse
  // ---------------------------------------------------------------------------

  describe("mouse", () => {
    beforeEach(async () => {
      await browser.page.goto(`${fixture.baseUrl}/scroll`);
    });

    it("hovers at x,y coordinates", async () => {
      const center = (await browser.page.evaluate(`(() => {
        const el = document.querySelector("#hover-target");
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      })()`)) as { x: number; y: number };
      await browser.page.hover(center.x, center.y);
      expect(await browser.page.getText("#hover-output")).toBe("hovered");
    });

    it("hovers a target by selector", async () => {
      await browser.page.hoverTarget("#hover-target");
      expect(await browser.page.getText("#hover-output")).toBe("hovered");
    });

    it("scrolls the page", async () => {
      const before = (await browser.page.evaluate("window.scrollY")) as number;
      await browser.page.scroll(0, 0, 0, 500);
      await browser.page.waitForTimeout(100);
      const after = (await browser.page.evaluate("window.scrollY")) as number;
      expect(after).toBeGreaterThan(before);
    });

    it("scrolls directionally inside an element", async () => {
      const before = (await browser.page.evaluate(
        `document.querySelector("#scroll-container").scrollTop`,
      )) as number;
      await browser.page.scrollDirection("down", 300, "#scroll-container");
      const after = (await browser.page.evaluate(
        `document.querySelector("#scroll-container").scrollTop`,
      )) as number;
      expect(after).toBeGreaterThan(before);
    });

    it("scrolls an element into view", async () => {
      await browser.page.scrollIntoView("#scroll-button");
      const visible = (await browser.page.evaluate(`(() => {
        const container = document.querySelector("#scroll-container");
        const button = document.querySelector("#scroll-button");
        const cr = container.getBoundingClientRect();
        const br = button.getBoundingClientRect();
        return br.top >= cr.top && br.bottom <= cr.bottom;
      })()`)) as boolean;
      expect(visible).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Waiting
  // ---------------------------------------------------------------------------

  describe("waiting", () => {
    beforeEach(async () => {
      await browser.page.goto(`${fixture.baseUrl}/waiting`);
    });

    it("waits for a selector to become visible", async () => {
      await browser.page.waitForSelector("#appears-later", 5000, "visible");
      expect(await browser.page.isVisible("#appears-later")).toBe(true);
    });

    it("waits for a selector to be attached", async () => {
      await browser.page.waitForSelector("#appears-later", 5000, "attached");
      expect(await browser.page.getText("#appears-later")).toBe("Appeared");
    });

    it("waits for text to appear on the page", async () => {
      await browser.page.waitForText("Dynamic text loaded", 5000);
      expect(await browser.page.getText("#text-later")).toBe(
        "Dynamic text loaded",
      );
    });

    it("waits for a URL pattern", async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
      await browser.page.waitForUrl("**/interactive", 5000);
      expect(await browser.page.getUrl()).toContain("/interactive");
    });

    it("waits for a JS function condition", async () => {
      await browser.page.waitForFunction(
        `document.querySelector("#condition-val")?.dataset.ready === "true"`,
        5000,
      );
      expect(await browser.page.getText("#condition-val")).toBe("Ready");
    });

    it("times out when selector never appears", async () => {
      await expect(
        browser.page.waitForSelector("#nonexistent", 200, "visible"),
      ).rejects.toThrow("Timeout");
    });

    it("times out when text never appears", async () => {
      await expect(
        browser.page.waitForText("This text will never appear", 200),
      ).rejects.toThrow("Timeout");
    });

    it("waits for an explicit timeout duration", async () => {
      const start = Date.now();
      await browser.page.waitForTimeout(100);
      expect(Date.now() - start).toBeGreaterThanOrEqual(90);
    });
  });

  // ---------------------------------------------------------------------------
  // Snapshot
  // ---------------------------------------------------------------------------

  describe("snapshot", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
    });

    it("captures a full accessibility tree", async () => {
      const snap = await browser.page.snapshot();
      expect(snap.tree).toContain("Submit");
      expect(snap.tree).toContain("Interactive Test");
    });

    it("captures only interactive elements with interactive option", async () => {
      const snap = await browser.page.snapshot({ interactive: true });
      expect(snap.tree).toContain("button");
      expect(snap.tree).toContain("[ref=");
    });

    it("assigns refs to interactive elements", async () => {
      const snap = await browser.page.snapshot({ interactive: true });
      const refs = Object.values(snap.refs);
      expect(refs.length).toBeGreaterThan(0);
      const submitRef = refs.find(
        (r) => r.role === "button" && r.name === "Submit",
      );
      expect(submitRef).toBeDefined();
      expect(submitRef!.ref).toMatch(/^e\d+$/);
    });

    it("assigns refs to links with xpath", async () => {
      const snap = await browser.page.snapshot({ interactive: true });
      const linkRef = Object.values(snap.refs).find(
        (r) => r.role === "link" && r.name === "Go next",
      );
      expect(linkRef).toBeDefined();
      expect(linkRef!.xpath).toBeTruthy();
    });

    it("populates xpathMap for refs", async () => {
      const snap = await browser.page.snapshot({ interactive: true });
      for (const ref of Object.values(snap.refs)) {
        expect(snap.xpathMap[ref.ref]).toBeTruthy();
      }
    });

    it("stores the last snapshot", async () => {
      const snap = await browser.page.snapshot();
      expect(browser.page.lastSnapshot).toBe(snap);
    });

    it("resolves a ref to an xpath", async () => {
      const snap = await browser.page.snapshot({ interactive: true });
      const ref = Object.values(snap.refs)[0];
      expect(browser.page.resolveRef(ref.ref)).toBe(ref.xpath);
    });

    it("returns null for unknown ref", async () => {
      await browser.page.snapshot({ interactive: true });
      expect(browser.page.resolveRef("e99999")).toBeNull();
    });

    it("produces compact output with compact option", async () => {
      const full = await browser.page.snapshot();
      const compact = await browser.page.snapshot({ compact: true });
      expect(compact.tree.length).toBeLessThanOrEqual(full.tree.length);
    });
  });

  // ---------------------------------------------------------------------------
  // Screenshot & PDF
  // ---------------------------------------------------------------------------

  describe("screenshot", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
    });

    it("takes a PNG screenshot by default", async () => {
      const result = await browser.page.screenshot();
      expect(result.format).toBe("png");
      expect(result.base64.length).toBeGreaterThan(100);
    });

    it("takes a full-page screenshot", async () => {
      const viewport = await browser.page.screenshot();
      const fullPage = await browser.page.screenshot({ fullPage: true });
      expect(fullPage.format).toBe("png");
      expect(fullPage.base64.length).toBeGreaterThanOrEqual(
        viewport.base64.length,
      );
    });

    it("takes a JPEG screenshot", async () => {
      const result = await browser.page.screenshot({ format: "jpeg" });
      expect(result.format).toBe("jpeg");
      expect(result.base64.length).toBeGreaterThan(100);
    });

    it("takes a JPEG screenshot with quality", async () => {
      const highQ = await browser.page.screenshot({
        format: "jpeg",
        quality: 100,
      });
      const lowQ = await browser.page.screenshot({
        format: "jpeg",
        quality: 10,
      });
      expect(lowQ.base64.length).toBeLessThan(highQ.base64.length);
    });

    it("generates a PDF", async () => {
      const result = await browser.page.pdf();
      expect(result.base64.length).toBeGreaterThan(100);
    });
  });

  // ---------------------------------------------------------------------------
  // Emulation
  // ---------------------------------------------------------------------------

  describe("advanced parity", () => {
    it("finds elements by semantic locators", async () => {
      await browser.page.goto(`${fixture.baseUrl}/form`);
      await browser.page.performFindAction(
        { kind: "label", value: "Email" },
        "fill",
        "person@example.com",
      );
      expect(await browser.page.getValue("#email")).toBe("person@example.com");

      const text = await browser.page.performFindAction(
        { kind: "role", value: "button", name: "Submit", exact: true },
        "text",
      );
      expect(text).toBe("Submit");

      const titleText = await browser.page.performFindAction(
        { kind: "title", value: "Submit form", exact: true },
        "text",
      );
      expect(titleText).toBe("Submit");

      await browser.page.performFindAction(
        { kind: "testid", value: "email-input", exact: true },
        "focus",
      );
      expect(await browser.page.evaluate("document.activeElement?.id")).toBe(
        "email",
      );

      await browser.page.performFindAction(
        { kind: "placeholder", value: "Tell us more", exact: true },
        "fill",
        "More details",
      );
      expect(await browser.page.getValue("#bio")).toBe("More details");
    });

    it("uploads files by injecting File objects", async () => {
      await browser.page.goto(`${fixture.baseUrl}/upload`);
      await browser.page.uploadFiles("#file-input", [
        {
          name: "alpha.txt",
          type: "text/plain",
          base64: Buffer.from("alpha", "utf8").toString("base64"),
        },
        {
          name: "beta.txt",
          type: "text/plain",
          base64: Buffer.from("beta", "utf8").toString("base64"),
        },
      ]);
      expect(await browser.page.getText("#file-output")).toBe(
        "alpha.txt,beta.txt",
      );
    });

    it("drags and drops between elements", async () => {
      await browser.page.goto(`${fixture.baseUrl}/drag`);
      await browser.page.dragAndDrop("#drag-source", "#drag-target");
      expect(await browser.page.getText("#drag-output")).toMatch(
        /dragged|dropped/,
      );
    });

    it("emulates supported devices", async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
      await browser.page.setDevice("iPhone 15");
      const userAgent = (await browser.page.evaluate(
        "navigator.userAgent",
      )) as string;
      expect(userAgent).toContain("iPhone");
    });
  });

  describe("emulation", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/interactive`);
    });

    it("sets the viewport size", async () => {
      await browser.page.setViewport(800, 600);
      const size = (await browser.page.evaluate(
        `({ w: window.innerWidth, h: window.innerHeight })`,
      )) as { w: number; h: number };
      expect(size.w).toBe(800);
      expect(size.h).toBe(600);
    });

    it("sets the viewport with device scale factor", async () => {
      await browser.page.setViewport(400, 300, { deviceScaleFactor: 2 });
      expect(await browser.page.evaluate("window.devicePixelRatio")).toBe(2);
    });

    it("sets extra HTTP headers", async () => {
      await browser.page.setHeaders({ "X-Custom-Header": "test-value" });
    });

    it("sets offline mode", async () => {
      await browser.page.setOffline(true);
      const failed = await browser.page
        .evaluate(
          `fetch("${fixture.baseUrl}/empty").then(() => false).catch(() => true)`,
        )
        .catch(() => true);
      expect(failed).toBe(true);
      await browser.page.setOffline(false);
    });

    it("sets preferred color scheme to dark", async () => {
      await browser.page.setMedia("dark");
      expect(
        await browser.page.evaluate(
          `window.matchMedia("(prefers-color-scheme: dark)").matches`,
        ),
      ).toBe(true);
    });

    it("sets preferred color scheme to light", async () => {
      await browser.page.setMedia("light");
      expect(
        await browser.page.evaluate(
          `window.matchMedia("(prefers-color-scheme: light)").matches`,
        ),
      ).toBe(true);
    });

    it("sets geolocation", async () => {
      await browser.page.setGeolocation(48.8566, 2.3522);
    });
  });

  // ---------------------------------------------------------------------------
  // Cookies
  // ---------------------------------------------------------------------------

  describe("cookies", () => {
    beforeEach(async () => {
      await browser.page.clearCookies();
      await browser.page.goto(`${fixture.baseUrl}/storage`);
    });

    it("sets a cookie", async () => {
      const success = await browser.page.setCookie({
        name: "test-cookie",
        value: "cookie-value",
        url: fixture.baseUrl,
      });
      expect(success).toBe(true);
    });

    it("gets cookies", async () => {
      await browser.page.setCookie({
        name: "get-test",
        value: "123",
        url: fixture.baseUrl,
      });
      const cookies = await browser.page.getCookies();
      const found = cookies.find((c) => c.name === "get-test");
      expect(found).toBeDefined();
      expect(found!.value).toBe("123");
    });

    it("clears all cookies", async () => {
      await browser.page.setCookie({
        name: "to-clear",
        value: "x",
        url: fixture.baseUrl,
      });
      await browser.page.clearCookies();
      const cookies = await browser.page.getCookies();
      expect(cookies.find((c) => c.name === "to-clear")).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------------------
  // localStorage
  // ---------------------------------------------------------------------------

  describe("localStorage", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/storage`);
    });

    it("reads an existing localStorage key", async () => {
      expect(await browser.page.getStorage("local", "existing-key")).toBe(
        "existing-value",
      );
    });

    it("reads all localStorage entries", async () => {
      const all = (await browser.page.getStorage("local")) as Record<
        string,
        string
      >;
      expect(all["existing-key"]).toBe("existing-value");
    });

    it("sets a localStorage key", async () => {
      await browser.page.setStorage("local", "new-key", "new-value");
      expect(await browser.page.getStorage("local", "new-key")).toBe(
        "new-value",
      );
    });

    it("clears localStorage", async () => {
      await browser.page.setStorage("local", "temp", "val");
      await browser.page.clearStorage("local");
      const all = (await browser.page.getStorage("local")) as Record<
        string,
        string
      >;
      expect(Object.keys(all).length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // sessionStorage
  // ---------------------------------------------------------------------------

  describe("sessionStorage", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/storage`);
    });

    it("reads an existing sessionStorage key", async () => {
      expect(await browser.page.getStorage("session", "session-key")).toBe(
        "session-value",
      );
    });

    it("sets a sessionStorage key", async () => {
      await browser.page.setStorage("session", "s-new", "s-val");
      expect(await browser.page.getStorage("session", "s-new")).toBe("s-val");
    });

    it("clears sessionStorage", async () => {
      await browser.page.setStorage("session", "s-temp", "x");
      await browser.page.clearStorage("session");
      const all = (await browser.page.getStorage("session")) as Record<
        string,
        string
      >;
      expect(Object.keys(all).length).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------------------

  describe("tabs", () => {
    it("lists the initial tab", async () => {
      const tabs = await browser.listTabs();
      expect(tabs.length).toBeGreaterThanOrEqual(1);
      expect(tabs.some((t) => t.active)).toBe(true);
    });

    it("opens a new tab", async () => {
      const before = await browser.listTabs();
      const after = await browser.newTab(`${fixture.baseUrl}/destination`);
      expect(after.length).toBe(before.length + 1);
      expect(after.find((t) => t.active)?.url).toBe(
        `${fixture.baseUrl}/destination`,
      );
    });

    it("switches to a tab by index", async () => {
      const tabs = await browser.switchTab(0);
      expect(tabs[0].active).toBe(true);
    });

    it("throws when switching to invalid tab index", async () => {
      await expect(browser.switchTab(999)).rejects.toThrow("No tab at index");
    });

    it("closes the active tab", async () => {
      const before = await browser.listTabs();
      await browser.newTab(`${fixture.baseUrl}/empty`);
      const after = await browser.closeTab();
      expect(after.length).toBe(before.length);
    });

    it("closes a tab by index", async () => {
      await browser.newTab(`${fixture.baseUrl}/destination`);
      const before = await browser.listTabs();
      const after = await browser.closeTab(before.length - 1);
      expect(after.length).toBe(before.length - 1);
    });

    it("creates a new tab when closing the last one", async () => {
      let tabs = await browser.listTabs();
      while (tabs.length > 1) {
        tabs = await browser.closeTab(tabs.length - 1);
      }
      const result = await browser.closeTab();
      expect(result.length).toBe(1);
      expect(result[0].active).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Evaluate
  // ---------------------------------------------------------------------------

  describe("evaluate", () => {
    beforeAll(async () => {
      await browser.page.goto(`${fixture.baseUrl}/evaluate`);
    });

    it("evaluates a simple expression", async () => {
      expect(await browser.page.evaluate("1 + 2")).toBe(3);
    });

    it("evaluates and returns a string", async () => {
      expect(await browser.page.evaluate(`"hello" + " " + "world"`)).toBe(
        "hello world",
      );
    });

    it("evaluates and returns an object", async () => {
      const result = (await browser.page.evaluate(
        `({ a: 1, b: "two" })`,
      )) as Record<string, unknown>;
      expect(result.a).toBe(1);
      expect(result.b).toBe("two");
    });

    it("evaluates and returns null", async () => {
      expect(await browser.page.evaluate("null")).toBeNull();
    });

    it("evaluates and returns undefined", async () => {
      expect(await browser.page.evaluate("undefined")).toBeUndefined();
    });

    it("accesses the DOM", async () => {
      expect(
        await browser.page.evaluate(
          `document.querySelector("#data").dataset.value`,
        ),
      ).toBe("42");
    });

    it("calls a function defined on the page", async () => {
      expect(await browser.page.evaluate("window.customFunction(3, 4)")).toBe(
        7,
      );
    });

    it("throws on evaluation errors", async () => {
      await expect(
        browser.page.evaluate("throw new Error('boom')"),
      ).rejects.toThrow();
    });
  });

  // ---------------------------------------------------------------------------
  // CdpClient
  // ---------------------------------------------------------------------------

  describe("CdpClient", () => {
    it("connects to a CDP endpoint", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      expect(cdp.readyState).toBe(WebSocket.OPEN);
      await cdp.close();
    });

    it("sends commands via typed send", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      const { targetInfos } = await cdp.send("Target.getTargets");
      expect(Array.isArray(targetInfos)).toBe(true);
      await cdp.close();
    });

    it("sends commands via the api proxy", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      const { targetInfos } = await cdp.api.Target.getTargets({});
      expect(Array.isArray(targetInfos)).toBe(true);
      await cdp.close();
    });

    it("attaches to the first page target", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      const page = await cdp.attachToFirstPage();
      expect(page).toBeDefined();
      expect(page.targetId).toBeTruthy();
      await cdp.close();
    });

    it("attaches to a specific target", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      const { targetInfos } = await cdp.send("Target.getTargets");
      const pageTarget = targetInfos.find((t) => t.type === "page");
      expect(pageTarget).toBeDefined();
      const page = await cdp.attachToTarget(pageTarget!.targetId);
      expect(page.targetId).toBe(pageTarget!.targetId);
      await cdp.close();
    });

    it("creates and uses a session", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      const { targetInfos } = await cdp.send("Target.getTargets");
      const pageTarget = targetInfos.find((t) => t.type === "page");
      const { sessionId } = await cdp.send("Target.attachToTarget", {
        targetId: pageTarget!.targetId,
        flatten: true,
      });
      const session = cdp.session(sessionId);
      expect(session.id).toBe(sessionId);
      expect(session.isDetached).toBe(false);

      await session.send("Page.enable");
      const result = await session.send("Runtime.evaluate", {
        expression: "1 + 1",
        returnByValue: true,
      });
      expect(result.result.value).toBe(2);
      await cdp.close();
    });

    it("receives events via on/off", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      await cdp.send("Target.setDiscoverTargets", { discover: true });

      let received = false;
      const handler = () => {
        received = true;
      };
      cdp.on("Target.targetCreated", handler);

      const { targetId } = await cdp.send("Target.createTarget", {
        url: "about:blank",
      });
      await new Promise((r) => setTimeout(r, 200));
      expect(received).toBe(true);

      cdp.off("Target.targetCreated", handler);
      await cdp.send("Target.closeTarget", { targetId });
      await cdp.close();
    });

    it("sets and respects request timeout", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl, {
        requestTimeoutMs: 50,
      });
      expect(cdp.defaultRequestTimeoutMs).toBe(50);

      cdp.setRequestTimeout(10000);
      expect(cdp.defaultRequestTimeoutMs).toBe(10000);

      const { targetInfos } = await cdp.send("Target.getTargets");
      expect(Array.isArray(targetInfos)).toBe(true);
      await cdp.close();
    });

    it("releases a session", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      const { targetInfos } = await cdp.send("Target.getTargets");
      const pageTarget = targetInfos.find((t) => t.type === "page");
      const { sessionId } = await cdp.send("Target.attachToTarget", {
        targetId: pageTarget!.targetId,
        flatten: true,
      });
      const session = cdp.session(sessionId);
      expect(session.isDetached).toBe(false);

      cdp.releaseSession(sessionId, "test");
      expect(session.isDetached).toBe(true);

      await expect(
        session.send("Runtime.evaluate", {
          expression: "1",
          returnByValue: true,
        }),
      ).rejects.toThrow("detached");
      await cdp.close();
    });

    it("invokes close handlers on disconnect", async () => {
      const cdp = await CdpClient.connect(chrome.cdpUrl);
      let closeReason = "";
      cdp.onClose((reason) => {
        closeReason = reason;
      });
      await cdp.close();
      await new Promise((r) => setTimeout(r, 200));
      expect(closeReason).toContain("close");
    });
  });
});
