import type { AgentTool } from "@mariozechner/pi-agent-core";
import type { SkillMeta, StorageNamespace } from "@office-agents/sdk";
import type { CustomCommand } from "just-bash/browser";
import type { Component } from "svelte";

export type MaybePromise<T> = T | Promise<T>;

export interface LinkClickContext {
  href: string;
  anchor: HTMLAnchorElement;
  event: MouseEvent;
}

export type LinkClickResult = "handled" | "default";

export interface ToolExtrasProps {
  toolName: string;
  result?: string;
  expanded: boolean;
}

export interface AppAdapter {
  tools: AgentTool[];
  buildSystemPrompt: (skills: SkillMeta[]) => string;
  getDocumentId: () => Promise<string>;
  getDocumentMetadata?: () => Promise<{
    metadata: object;
    nameMap?: Record<number, string>;
  } | null>;
  onToolResult?: (toolCallId: string, result: string, isError: boolean) => void;
  metadataTag?: string;
  storageNamespace?: StorageNamespace;
  appVersion?: string;
  appName?: string;
  emptyStateMessage?: string;
  staticFiles?: Record<string, string>;
  customCommands?: () => CustomCommand[];
  hasImageSearch?: boolean;
  showFollowModeToggle?: boolean;
  handleLinkClick?: (
    context: LinkClickContext,
  ) => MaybePromise<LinkClickResult>;
  ToolExtras?: Component<ToolExtrasProps>;
  HeaderExtras?: Component;
  SelectionIndicator?: Component;
}
