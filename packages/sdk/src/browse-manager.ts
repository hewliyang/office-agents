import type {
  BrowseCommandConfig,
  BrowseSessionEvent,
} from "@office-agents/browser";
import { BrowseCli, type BrowsePreviewEvent } from "@office-agents/browser";

interface CommandFs {
  mkdir(path: string, options: { recursive: boolean }): Promise<void>;
  readFileBuffer(path: string): Promise<Uint8Array>;
  writeFile(path: string, content: string | Uint8Array): Promise<void>;
}

interface CommandContext {
  cwd: string;
  fs: CommandFs;
}

const browseCliByContext = new WeakMap<CommandContext, BrowseCli>();
let globalBrowseCli: BrowseCli | null = null;

export function getGlobalBrowseCli(): BrowseCli {
  globalBrowseCli ??= new BrowseCli();
  return globalBrowseCli;
}

export function getOrCreateBrowseCli(ctx?: CommandContext): BrowseCli {
  if (!ctx) return getGlobalBrowseCli();
  const existing = browseCliByContext.get(ctx);
  if (existing) return existing;
  const cli = new BrowseCli();
  browseCliByContext.set(ctx, cli);
  return cli;
}

export function configureGlobalBrowseCli(
  config: BrowseCommandConfig,
): BrowseCli {
  const cli = getGlobalBrowseCli();
  cli.configure(config);
  return cli;
}

export async function closeActiveBrowser(): Promise<void> {
  await getGlobalBrowseCli().closeActiveBrowser();
}

export async function disposeBrowseCli(): Promise<void> {
  await getGlobalBrowseCli().dispose();
  globalBrowseCli = null;
}

export function getBrowsePreviewState(): BrowsePreviewEvent {
  return getGlobalBrowseCli().getPreviewState();
}

export function getBrowseSessionState(): BrowseSessionEvent {
  return getGlobalBrowseCli().getSessionState();
}

export function onBrowsePreviewChange(
  listener: (event: BrowsePreviewEvent) => void,
): () => void {
  return getGlobalBrowseCli().onPreviewChange(listener);
}

export function onBrowseSessionChange(
  listener: (event: BrowseSessionEvent) => void,
): () => void {
  return getGlobalBrowseCli().onSessionChange(listener);
}

export async function switchActiveBrowserTab(index: number): Promise<void> {
  await getGlobalBrowseCli().switchTab(index);
}
