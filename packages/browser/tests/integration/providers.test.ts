import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Browser, BrowserUseProvider } from "../../src/index.js";
import {
  type FixtureServer,
  startFixtureServer,
  stopServer,
} from "./helpers.js";

const apiKey = process.env.BROWSER_USE_API_KEY;
const suite = apiKey ? describe : describe.skip;

suite("BrowserUseProvider", () => {
  let fixture: FixtureServer;

  beforeAll(async () => {
    fixture = await startFixtureServer();
  });

  afterAll(async () => {
    await stopServer(fixture.server);
  });

  it("creates a session and returns a valid CDP url", async () => {
    const provider = new BrowserUseProvider({
      apiKey: apiKey!,
      timeoutMinutes: 1,
    });

    const session = await provider.createSession();
    try {
      expect(session.sessionId).toBeTruthy();
      expect(session.cdpUrl).toMatch(/^wss?:\/\//);
    } finally {
      await provider.closeSession(session.sessionId);
    }
  }, 30000);

  it("connects, navigates, and reads page content", async () => {
    const provider = new BrowserUseProvider({
      apiKey: apiKey!,
      timeoutMinutes: 1,
    });

    const browser = await Browser.launch({ provider });
    try {
      await browser.page.goto("https://example.com");
      const title = await browser.page.getTitle();
      expect(title).toContain("Example Domain");

      const text = await browser.page.getText("h1");
      expect(text).toContain("Example Domain");
    } finally {
      await browser.close();
    }
  }, 60000);

  it("takes a screenshot", async () => {
    const provider = new BrowserUseProvider({
      apiKey: apiKey!,
      timeoutMinutes: 1,
    });

    const browser = await Browser.launch({ provider });
    try {
      await browser.page.goto("https://example.com");
      const screenshot = await browser.page.screenshot();
      expect(screenshot.format).toBe("png");
      expect(screenshot.base64.length).toBeGreaterThan(1000);
    } finally {
      await browser.close();
    }
  }, 60000);

  it("captures an accessibility snapshot", async () => {
    const provider = new BrowserUseProvider({
      apiKey: apiKey!,
      timeoutMinutes: 1,
    });

    const browser = await Browser.launch({ provider });
    try {
      await browser.page.goto("https://example.com");
      const snap = await browser.page.snapshot({ interactive: true });
      expect(snap.tree).toBeTruthy();
      expect(snap.tree).toContain("Example Domain");
    } finally {
      await browser.close();
    }
  }, 60000);

  it("rejects with auth error for invalid key", async () => {
    const provider = new BrowserUseProvider({
      apiKey: "bu__invalid_key_for_testing",
      timeoutMinutes: 1,
    });

    await expect(provider.createSession()).rejects.toThrow(
      /authentication failed|401|403/i,
    );
  }, 30000);
});
