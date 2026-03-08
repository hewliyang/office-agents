import type { ChatMessage, MessagePart } from "@office-agents/sdk";
import { code } from "@streamdown/code";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  Wrench,
  XCircle,
} from "lucide-react";
import type { AnchorHTMLAttributes } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { useChat } from "./chat-context";

function ThinkingBlock({
  thinking,
  isStreaming,
}: {
  thinking: string;
  isStreaming?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2 border border-(--chat-border) bg-(--chat-bg) rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider text-(--chat-accent) hover:bg-(--chat-bg-secondary) transition-colors"
      >
        {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Brain size={10} />
        thinking
        {isStreaming && <span className="animate-pulse ml-1">...</span>}
      </button>
      {isExpanded && (
        <div className="px-2 py-1.5 text-xs text-(--chat-text-muted) whitespace-pre-wrap wrap-break-word border-t border-(--chat-border) max-h-20 overflow-y-auto">
          {thinking}
        </div>
      )}
    </div>
  );
}

type ToolCallPart = Extract<MessagePart, { type: "toolCall" }>;

const CODE_FIELD_LANGS: Record<string, string> = {
  code: "javascript",
  command: "text",
};

const HIDDEN_ARG_FIELDS = new Set(["explanation"]);
const HIDDEN_RESULT_FIELDS = new Set(["_dirtyRanges", "_modifiedSlide"]);

function splitArgs(args: Record<string, unknown>) {
  const codeBlocks: { field: string; lang: string; value: string }[] = [];
  const rest: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (HIDDEN_ARG_FIELDS.has(key)) continue;
    const lang = CODE_FIELD_LANGS[key];
    if (lang && typeof value === "string") {
      codeBlocks.push({ field: key, lang, value });
    } else {
      rest[key] = value;
    }
  }

  return { codeBlocks, rest };
}

function cleanResult(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      const cleaned = { ...parsed };
      for (const key of HIDDEN_RESULT_FIELDS) {
        if (key in cleaned) {
          delete cleaned[key];
        }
      }
      return JSON.stringify(cleaned, null, 2);
    }
    return JSON.stringify(parsed, null, 2);
  } catch {
    // not JSON, return as-is
  }
  return raw;
}

function ToolCallBlock({ part }: { part: ToolCallPart }) {
  const { adapter, state } = useChat();
  const expandByDefault = state.providerConfig?.expandToolCalls ?? false;
  const [isExpanded, setIsExpanded] = useState(expandByDefault);
  const explanation = (part.args as { explanation?: string })?.explanation;

  const ToolExtras = adapter.ToolExtras;

  const { codeBlocks, rest } = splitArgs(part.args);
  const hasRestArgs = Object.keys(rest).length > 0;

  const statusIcon = {
    pending: (
      <Loader2 size={10} className="animate-spin text-(--chat-text-muted)" />
    ),
    running: (
      <Loader2 size={10} className="animate-spin text-(--chat-accent)" />
    ),
    complete: <CheckCircle2 size={10} className="text-green-500" />,
    error: <XCircle size={10} className="text-red-500" />,
  }[part.status];

  const resultText = part.result ? cleanResult(part.result) : undefined;

  return (
    <div className="mt-3 mb-2 border border-(--chat-border) bg-(--chat-bg) rounded-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full min-w-0 flex items-center gap-1.5 px-2 py-1 text-[10px] tracking-wider text-(--chat-text-secondary) hover:bg-(--chat-bg-secondary) transition-colors ${explanation ? "normal-case" : "uppercase"}`}
      >
        {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        <Wrench size={10} />
        <span className="min-w-0 flex-1 text-left font-medium truncate">
          {explanation || part.name}
        </span>
        {!isExpanded && ToolExtras && (
          <ToolExtras
            toolName={part.name}
            result={part.result}
            expanded={false}
          />
        )}
        <span className="shrink-0">{statusIcon}</span>
      </button>
      {isExpanded && (
        <div className="border-t border-(--chat-border)">
          {ToolExtras && (
            <div className="px-2 py-1 text-[10px] bg-(--chat-warning-bg) text-(--chat-warning) flex items-center gap-1 flex-wrap">
              <ToolExtras
                toolName={part.name}
                result={part.result}
                expanded={true}
              />
            </div>
          )}
          {hasRestArgs && (
            <div className="px-2 py-1.5 text-xs">
              <div className="text-(--chat-text-muted) text-[10px] uppercase mb-1">
                args
              </div>
              <div className="markdown-content max-h-32 overflow-y-auto **:data-[streamdown=code-block]:my-0 **:data-[streamdown=code-block]:border-0">
                <Streamdown
                  plugins={{ code }}
                >{`\`\`\`json\n${JSON.stringify(rest, null, 2)}\n\`\`\``}</Streamdown>
              </div>
            </div>
          )}
          {codeBlocks.map((block) => (
            <div
              key={block.field}
              className={`px-2 py-1.5 text-xs ${hasRestArgs || codeBlocks.indexOf(block) > 0 ? "border-t border-(--chat-border)" : ""}`}
            >
              <div className="text-(--chat-text-muted) text-[10px] uppercase mb-1">
                {block.field}
              </div>
              <div className="markdown-content max-h-64 overflow-y-auto **:data-[streamdown=code-block]:my-0 **:data-[streamdown=code-block]:border-0">
                <Streamdown
                  plugins={{ code }}
                >{`\`\`\`${block.lang}\n${block.value}\n\`\`\``}</Streamdown>
              </div>
            </div>
          ))}
          {part.images && part.images.length > 0 && (
            <div className="px-2 py-1.5 border-t border-(--chat-border)">
              {part.images.map((img, imgIdx) => (
                <img
                  key={`${part.id}-img-${imgIdx}`}
                  src={`data:${img.mimeType};base64,${img.data}`}
                  alt={`Tool result ${imgIdx + 1}`}
                  className="max-w-full rounded-sm border border-(--chat-border)"
                />
              ))}
            </div>
          )}
          {resultText && (
            <div className="px-2 py-1.5 text-xs border-t border-(--chat-border)">
              <div className="text-(--chat-text-muted) text-[10px] uppercase mb-1">
                {part.status === "error" ? "error" : "result"}
              </div>
              <div
                className={`markdown-content max-h-40 overflow-y-auto **:data-[streamdown=code-block]:my-0 **:data-[streamdown=code-block]:border-0 ${part.status === "error" ? "[&_code]:text-red-400!" : ""}`}
              >
                <Streamdown
                  plugins={{ code }}
                >{`\`\`\`json\n${resultText}\n\`\`\``}</Streamdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      className="flex items-center gap-2 text-(--chat-text-muted) text-sm"
      style={{ fontFamily: "var(--chat-font-mono)" }}
    >
      <Loader2 size={14} className="animate-spin" />
      <span>thinking...</span>
    </div>
  );
}

function AdapterLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { adapter } = useChat();
  const AppLink = adapter.Link;

  if (AppLink && href) {
    return <AppLink href={href}>{children}</AppLink>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

const markdownComponents = { a: AdapterLink };

function MarkdownContent({
  text,
  isAnimating,
}: {
  text: string;
  isAnimating?: boolean;
}) {
  return (
    <div className="markdown-content">
      <Streamdown
        plugins={{ code }}
        components={markdownComponents}
        isAnimating={isAnimating}
      >
        {text}
      </Streamdown>
    </div>
  );
}

function renderParts(
  parts: MessagePart[],
  isStreaming: boolean,
  messageId: string,
) {
  const lastPart = parts[parts.length - 1];
  const isStreamingThinking = isStreaming && lastPart?.type === "thinking";
  const isStreamingText = isStreaming && lastPart?.type === "text";

  return parts.map((part, idx) => {
    const key =
      part.type === "toolCall" ? part.id : `${messageId}-${part.type}-${idx}`;
    const isLastPart = idx === parts.length - 1;
    if (part.type === "thinking") {
      return (
        <ThinkingBlock
          key={key}
          thinking={part.thinking}
          isStreaming={isStreamingThinking && isLastPart}
        />
      );
    }
    if (part.type === "toolCall") {
      return <ToolCallBlock key={key} part={part} />;
    }
    return (
      <MarkdownContent
        key={key}
        text={part.text}
        isAnimating={isStreamingText && isLastPart}
      />
    );
  });
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className="ml-8 px-3 py-2 text-sm leading-relaxed bg-(--chat-user-bg) border border-(--chat-border)"
      style={{
        borderRadius: "var(--chat-radius)",
        fontFamily: "var(--chat-font-mono)",
      }}
    >
      {renderParts(message.parts, false, message.id)}
    </div>
  );
}

function AssistantBubble({
  messages,
  isStreaming,
}: {
  messages: ChatMessage[];
  isStreaming: boolean;
}) {
  const allParts: { part: MessagePart; messageId: string; isLast: boolean }[] =
    [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isLastMessage = i === messages.length - 1;
    for (let j = 0; j < msg.parts.length; j++) {
      allParts.push({
        part: msg.parts[j],
        messageId: msg.id,
        isLast: isLastMessage && j === msg.parts.length - 1,
      });
    }
  }

  return (
    <div
      className="text-sm leading-relaxed"
      style={{ fontFamily: "var(--chat-font-mono)" }}
    >
      {allParts.map(({ part, messageId, isLast }, idx) => {
        const key =
          part.type === "toolCall"
            ? part.id
            : `${messageId}-${part.type}-${idx}`;
        if (part.type === "thinking") {
          return (
            <ThinkingBlock
              key={key}
              thinking={part.thinking}
              isStreaming={isStreaming && isLast}
            />
          );
        }
        if (part.type === "toolCall") {
          return <ToolCallBlock key={key} part={part} />;
        }
        return (
          <MarkdownContent
            key={key}
            text={part.text}
            isAnimating={isStreaming && isLast && part.type === "text"}
          />
        );
      })}
      {isStreaming && allParts.length === 0 && (
        <span className="animate-pulse">▊</span>
      )}
    </div>
  );
}

type MessageGroup =
  | { type: "user"; message: ChatMessage }
  | { type: "assistant"; messages: ChatMessage[] };

function groupMessages(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentAssistantGroup: ChatMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "user") {
      if (currentAssistantGroup.length > 0) {
        groups.push({ type: "assistant", messages: currentAssistantGroup });
        currentAssistantGroup = [];
      }
      groups.push({ type: "user", message: msg });
    } else {
      currentAssistantGroup.push(msg);
    }
  }

  if (currentAssistantGroup.length > 0) {
    groups.push({ type: "assistant", messages: currentAssistantGroup });
  }

  return groups;
}

export function MessageList() {
  const { state, adapter } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    shouldAutoScroll.current = distanceFromBottom < 100;
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (containerRef.current && shouldAutoScroll.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [state.messages, state.isStreaming]);

  if (state.messages.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 text-center"
        style={{ fontFamily: "var(--chat-font-mono)" }}
      >
        <div className="text-(--chat-text-muted) text-xs uppercase tracking-widest mb-2">
          no messages
        </div>
        <div className="text-(--chat-text-secondary) text-sm max-w-[200px]">
          {adapter.emptyStateMessage || "Start a conversation to get started"}
        </div>
      </div>
    );
  }

  const groups = groupMessages(state.messages);
  const lastMessage = state.messages[state.messages.length - 1];
  const showLoading = state.isStreaming && lastMessage?.role === "user";
  const lastGroup = groups[groups.length - 1];
  const isStreamingAssistant =
    state.isStreaming && lastGroup?.type === "assistant";

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-3 space-y-3"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--chat-scrollbar) transparent",
      }}
    >
      {groups.map((group, i) => {
        if (group.type === "user") {
          return <UserBubble key={group.message.id} message={group.message} />;
        }
        const groupKey = group.messages[0].id;
        return (
          <AssistantBubble
            key={groupKey}
            messages={group.messages}
            isStreaming={isStreamingAssistant && i === groups.length - 1}
          />
        );
      })}
      {showLoading && <LoadingIndicator />}
    </div>
  );
}
