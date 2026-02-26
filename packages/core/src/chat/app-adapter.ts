import type { AgentTool } from "@mariozechner/pi-agent-core";
import type { ComponentType } from "react";
import type { SkillMeta } from "../skills";

export interface ToolExtrasProps {
  toolName: string;
  result?: string;
  expanded: boolean;
}

export interface LinkProps {
  href: string;
  children: React.ReactNode;
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
  storagePrefix?: string;
  appVersion?: string;
  appName?: string;
  emptyStateMessage?: string;
  ToolExtras?: ComponentType<ToolExtrasProps>;
  Link?: ComponentType<LinkProps>;
}
