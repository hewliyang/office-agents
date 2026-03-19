import DOMPurify from "dompurify";
import { Marked, type Token, type Tokens } from "marked";
import { createJavaScriptRegexEngine, getSingletonHighlighter } from "shiki";

const MARKDOWN_OPTIONS = {
  breaks: true,
  gfm: true,
} as const;

const SHIKI_THEMES = {
  dark: "github-dark-default",
  light: "github-light-default",
} as const;
const MAX_HIGHLIGHT_CODE_LENGTH = 12_000;
const SINGLE_FENCED_CODE_BLOCK = /^```([^\n`]*)\n([\s\S]*?)\n```[ \t]*$/;

type SupportedLanguage = "javascript" | "json" | "shellscript";
type HighlightedCodeToken = Tokens.Code & {
  highlightedHtml?: string;
};
export interface RenderMarkdownOptions {
  preferPlainCodeBlocks?: boolean;
}

const supportedLanguages = ["javascript", "json", "shellscript"] as const;
const supportedLanguageAliases: Record<string, SupportedLanguage> = {
  bash: "shellscript",
  cjs: "javascript",
  ecmascript: "javascript",
  javascript: "javascript",
  js: "javascript",
  json: "json",
  mjs: "javascript",
  node: "javascript",
  nodejs: "javascript",
  sh: "shellscript",
  shell: "shellscript",
  zsh: "shellscript",
};

const highlighterPromise = getSingletonHighlighter({
  engine: createJavaScriptRegexEngine(),
  langs: [...supportedLanguages],
  themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
});

const plainMarkdown = new Marked(MARKDOWN_OPTIONS);
const highlightedMarkdown = new Marked({
  ...MARKDOWN_OPTIONS,
  renderer: {
    code(token) {
      return (token as HighlightedCodeToken).highlightedHtml ?? false;
    },
  },
  async walkTokens(token: Token) {
    if (token.type !== "code") return;

    const codeToken = token as HighlightedCodeToken;
    const language = normalizeLanguage(codeToken.lang);
    if (!language || codeToken.text.length > MAX_HIGHLIGHT_CODE_LENGTH) return;

    try {
      codeToken.highlightedHtml = await highlightCode(codeToken.text, language);
    } catch {
      // Fall back to the default markdown renderer if highlighting fails.
    }
  },
});

function normalizeLanguage(
  language: string | undefined,
): SupportedLanguage | undefined {
  const normalized = language?.trim().split(/\s+/, 1)[0]?.toLowerCase();
  if (!normalized) return undefined;

  return supportedLanguageAliases[normalized];
}

async function highlightCode(
  code: string,
  language: SupportedLanguage,
): Promise<string> {
  const highlighter = await highlighterPromise;
  return highlighter.codeToHtml(code, {
    lang: language,
    themes: SHIKI_THEMES,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseSingleFencedCodeBlock(text: string) {
  const match = text.match(SINGLE_FENCED_CODE_BLOCK);
  if (!match) return null;

  return {
    code: match[2],
    language: match[1].trim() || undefined,
  };
}

function renderPlainCodeBlock(code: string): string {
  return `<pre><code>${escapeHtml(code)}</code></pre>`;
}

function sanitizeRenderedHtml(raw: string): string {
  const sanitized = DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });

  const template = document.createElement("template");
  template.innerHTML = sanitized;

  for (const link of template.content.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href") ?? "";
    if (!href.startsWith("#")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  }

  return template.innerHTML;
}

export function renderMarkdownSync(
  text: string,
  options: RenderMarkdownOptions = {},
): string {
  const fencedCodeBlock = parseSingleFencedCodeBlock(text);
  if (
    fencedCodeBlock &&
    (options.preferPlainCodeBlocks ||
      fencedCodeBlock.code.length > MAX_HIGHLIGHT_CODE_LENGTH)
  ) {
    return renderPlainCodeBlock(fencedCodeBlock.code);
  }

  return sanitizeRenderedHtml(plainMarkdown.parse(text, { async: false }));
}

export async function renderMarkdown(
  text: string,
  options: RenderMarkdownOptions = {},
): Promise<string> {
  const fencedCodeBlock = parseSingleFencedCodeBlock(text);
  if (fencedCodeBlock) {
    const language = normalizeLanguage(fencedCodeBlock.language);
    if (
      options.preferPlainCodeBlocks ||
      !language ||
      fencedCodeBlock.code.length > MAX_HIGHLIGHT_CODE_LENGTH
    ) {
      return renderPlainCodeBlock(fencedCodeBlock.code);
    }

    try {
      return await highlightCode(fencedCodeBlock.code, language);
    } catch {
      return renderPlainCodeBlock(fencedCodeBlock.code);
    }
  }

  return sanitizeRenderedHtml(
    await highlightedMarkdown.parse(text, { async: true }),
  );
}
