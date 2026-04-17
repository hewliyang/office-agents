import { Readability } from "@mozilla/readability";
import { DOMParser as LinkeDomParser } from "linkedom";
import TurndownService from "turndown";

export interface MarkdownContentResult {
  title: string;
  text: string;
  metadata: Record<string, string>;
}

function createTurndownService(): TurndownService {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  td.remove(["script", "style", "footer"]);
  return td;
}

function getDomParser(): {
  new (): { parseFromString(input: string, mimeType: string): Document };
} {
  return (globalThis.DOMParser ?? LinkeDomParser) as {
    new (): { parseFromString(input: string, mimeType: string): Document };
  };
}

function createHtmlDocument(url: string, html: string): Document {
  const Parser = getDomParser();
  const doc = new Parser().parseFromString(html, "text/html");
  const base = doc.createElement("base");
  base.href = url;
  if (doc.head) {
    doc.head.prepend(base);
  }
  return doc;
}

export function htmlToMarkdown(
  url: string,
  html: string,
): MarkdownContentResult {
  const doc = createHtmlDocument(url, html);
  const reader = new Readability(doc);
  const article = reader.parse();
  const td = createTurndownService();

  let title: string;
  let text: string;
  const metadata: Record<string, string> = { URL: url };

  if (article) {
    title = article.title || doc.querySelector("title")?.textContent || url;
    if (article.byline) metadata.Author = article.byline;
    if (article.siteName) metadata.Site = article.siteName;
    text = td.turndown(article.content ?? "").trim();
  } else {
    title = doc.querySelector("title")?.textContent ?? url;
    text = td.turndown(doc.body?.innerHTML ?? "").trim();
  }

  return { title, text, metadata };
}

export function htmlFragmentToMarkdown(html: string): string {
  const Parser = getDomParser();
  const doc = new Parser().parseFromString(
    `<!doctype html><html><body>${html}</body></html>`,
    "text/html",
  );
  return createTurndownService()
    .turndown(doc.body?.innerHTML ?? "")
    .trim();
}
