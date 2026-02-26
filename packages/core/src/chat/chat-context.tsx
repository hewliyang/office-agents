import {
  Agent,
  type AgentEvent,
  type ThinkingLevel as AgentThinkingLevel,
} from "@mariozechner/pi-agent-core";
import {
  type Api,
  type AssistantMessage,
  getModel,
  getModels,
  getProviders,
  type Model,
  streamSimple,
} from "@mariozechner/pi-ai";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  agentMessagesToChatMessages,
  type ChatMessage,
  deriveStats,
  extractPartsFromAssistantMessage,
  generateId,
  type SessionStats,
} from "../message-utils";
import {
  loadOAuthCredentials,
  refreshOAuthToken,
  saveOAuthCredentials,
} from "../oauth";
import {
  applyProxyToModel,
  buildCustomModel,
  loadSavedConfig,
  type ProviderConfig,
  saveConfig,
  type ThinkingLevel,
} from "../provider-config";
import {
  addSkill,
  getInstalledSkills,
  removeSkill,
  type SkillMeta,
  syncSkillsToVfs,
} from "../skills";
import {
  type ChatSession,
  createSession,
  deleteSession,
  getOrCreateCurrentSession,
  getSession,
  listSessions,
  loadVfsFiles,
  saveSession,
  saveVfsFiles,
} from "../storage";
import {
  deleteFile,
  listUploads,
  resetVfs,
  restoreVfs,
  snapshotVfs,
  writeFile,
} from "../vfs";
import type { AppAdapter } from "./app-adapter";

export type {
  ChatMessage,
  MessagePart,
  SessionStats,
  ToolCallStatus,
} from "../message-utils";
export type { ProviderConfig, ThinkingLevel };

export interface UploadedFile {
  name: string;
  size: number;
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  providerConfig: ProviderConfig | null;
  sessionStats: SessionStats;
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  nameMap: Record<number, string>;
  uploads: UploadedFile[];
  isUploading: boolean;
  skills: SkillMeta[];
}

const INITIAL_STATS: SessionStats = { ...deriveStats([]), contextWindow: 0 };

interface ChatContextValue {
  state: ChatState;
  sendMessage: (content: string, attachments?: string[]) => Promise<void>;
  setProviderConfig: (config: ProviderConfig) => void;
  clearMessages: () => void;
  abort: () => void;
  availableProviders: string[];
  getModelsForProvider: (provider: string) => Model<Api>[];
  newSession: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteCurrentSession: () => Promise<void>;
  getName: (id: number) => string | undefined;
  toggleFollowMode: () => void;
  processFiles: (files: File[]) => Promise<void>;
  removeUpload: (name: string) => Promise<void>;
  installSkill: (files: File[]) => Promise<void>;
  uninstallSkill: (name: string) => Promise<void>;
  adapter: AppAdapter;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function thinkingLevelToAgent(level: ThinkingLevel): AgentThinkingLevel {
  return level === "none" ? "off" : level;
}

export function ChatProvider({
  children,
  adapter,
}: {
  children: ReactNode;
  adapter: AppAdapter;
}) {
  const [state, setState] = useState<ChatState>(() => {
    const saved = loadSavedConfig();
    const validConfig =
      saved?.provider && saved?.apiKey && saved?.model ? saved : null;
    return {
      messages: [],
      isStreaming: false,
      error: null,
      providerConfig: validConfig,
      sessionStats: INITIAL_STATS,
      currentSession: null,
      sessions: [],
      nameMap: {},
      uploads: [],
      isUploading: false,
      skills: [],
    };
  });

  const agentRef = useRef<Agent | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const isStreamingRef = useRef(false);
  const pendingConfigRef = useRef<ProviderConfig | null>(null);
  const documentIdRef = useRef<string | null>(null);
  const sessionLoadedRef = useRef(false);
  const currentSessionIdRef = useRef<string | null>(null);
  const followModeRef = useRef(state.providerConfig?.followMode ?? true);
  const skillsRef = useRef<SkillMeta[]>([]);
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  const availableProviders = getProviders();

  const getModelsForProvider = useCallback((provider: string): Model<Api>[] => {
    try {
      return (getModels as (p: string) => Model<Api>[])(provider);
    } catch {
      return [];
    }
  }, []);

  const handleAgentEvent = useCallback((event: AgentEvent) => {
    console.log("[Chat] Agent event:", event.type, event);
    switch (event.type) {
      case "message_start": {
        if (event.message.role === "assistant") {
          const id = generateId();
          streamingMessageIdRef.current = id;
          const parts = extractPartsFromAssistantMessage(event.message);
          const chatMessage: ChatMessage = {
            id,
            role: "assistant",
            parts,
            timestamp: event.message.timestamp,
          };
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, chatMessage],
          }));
        }
        break;
      }
      case "message_update": {
        if (
          event.message.role === "assistant" &&
          streamingMessageIdRef.current
        ) {
          setState((prev) => {
            const messages = [...prev.messages];
            const idx = messages.findIndex(
              (m) => m.id === streamingMessageIdRef.current,
            );
            if (idx !== -1) {
              const parts = extractPartsFromAssistantMessage(
                event.message,
                messages[idx].parts,
              );
              messages[idx] = { ...messages[idx], parts };
            }
            return { ...prev, messages };
          });
        }
        break;
      }
      case "message_end": {
        if (event.message.role === "assistant") {
          const assistantMsg = event.message as AssistantMessage;
          const isError =
            assistantMsg.stopReason === "error" ||
            assistantMsg.stopReason === "aborted";

          setState((prev) => {
            const messages = [...prev.messages];
            const idx = messages.findIndex(
              (m) => m.id === streamingMessageIdRef.current,
            );

            if (isError) {
              if (idx !== -1) {
                messages.splice(idx, 1);
              }
            } else if (idx !== -1) {
              const parts = extractPartsFromAssistantMessage(
                event.message,
                messages[idx].parts,
              );
              messages[idx] = { ...messages[idx], parts };
            }

            return {
              ...prev,
              messages,
              error: isError
                ? assistantMsg.errorMessage || "Request failed"
                : prev.error,
              sessionStats: isError
                ? prev.sessionStats
                : {
                    ...deriveStats(agentRef.current?.state.messages ?? []),
                    contextWindow: prev.sessionStats.contextWindow,
                  },
            };
          });
          streamingMessageIdRef.current = null;
        }
        break;
      }
      case "tool_execution_start": {
        setState((prev) => {
          const messages = [...prev.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            const partIdx = msg.parts.findIndex(
              (p) => p.type === "toolCall" && p.id === event.toolCallId,
            );
            if (partIdx !== -1) {
              const parts = [...msg.parts];
              const part = parts[partIdx];
              if (part.type === "toolCall") {
                parts[partIdx] = { ...part, status: "running" };
                messages[i] = { ...msg, parts };
              }
              break;
            }
          }
          return { ...prev, messages };
        });
        break;
      }
      case "tool_execution_update": {
        setState((prev) => {
          const messages = [...prev.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            const partIdx = msg.parts.findIndex(
              (p) => p.type === "toolCall" && p.id === event.toolCallId,
            );
            if (partIdx !== -1) {
              const parts = [...msg.parts];
              const part = parts[partIdx];
              if (part.type === "toolCall") {
                let partialText: string;
                if (typeof event.partialResult === "string") {
                  partialText = event.partialResult;
                } else if (
                  event.partialResult?.content &&
                  Array.isArray(event.partialResult.content)
                ) {
                  partialText = event.partialResult.content
                    .filter((c: { type: string }) => c.type === "text")
                    .map((c: { text: string }) => c.text)
                    .join("\n");
                } else {
                  partialText = JSON.stringify(event.partialResult, null, 2);
                }
                parts[partIdx] = { ...part, result: partialText };
                messages[i] = { ...msg, parts };
              }
              break;
            }
          }
          return { ...prev, messages };
        });
        break;
      }
      case "tool_execution_end": {
        let resultText: string;
        let resultImages: { data: string; mimeType: string }[] | undefined;
        if (typeof event.result === "string") {
          resultText = event.result;
        } else if (
          event.result?.content &&
          Array.isArray(event.result.content)
        ) {
          resultText = event.result.content
            .filter((c: { type: string }) => c.type === "text")
            .map((c: { text: string }) => c.text)
            .join("\n");
          const images = event.result.content
            .filter((c: { type: string }) => c.type === "image")
            .map((c: { data: string; mimeType: string }) => ({
              data: c.data,
              mimeType: c.mimeType,
            }));
          if (images.length > 0) resultImages = images;
        } else {
          resultText = JSON.stringify(event.result, null, 2);
        }

        if (!event.isError && followModeRef.current) {
          adapterRef.current.onToolResult?.(
            event.toolCallId,
            resultText,
            false,
          );
        }

        setState((prev) => {
          const messages = [...prev.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            const partIdx = msg.parts.findIndex(
              (p) => p.type === "toolCall" && p.id === event.toolCallId,
            );
            if (partIdx !== -1) {
              const parts = [...msg.parts];
              const part = parts[partIdx];
              if (part.type === "toolCall") {
                parts[partIdx] = {
                  ...part,
                  status: event.isError ? "error" : "complete",
                  result: resultText,
                  images: resultImages,
                };
                messages[i] = { ...msg, parts };
              }
              break;
            }
          }
          return { ...prev, messages };
        });
        break;
      }
      case "agent_end": {
        isStreamingRef.current = false;
        setState((prev) => ({ ...prev, isStreaming: false }));
        streamingMessageIdRef.current = null;
        break;
      }
    }
  }, []);

  const configRef = useRef<ProviderConfig | null>(null);

  const getActiveApiKey = useCallback(
    async (config: ProviderConfig): Promise<string> => {
      if (config.authMethod !== "oauth") {
        return config.apiKey;
      }
      const creds = loadOAuthCredentials(config.provider);
      if (!creds) return config.apiKey;
      if (Date.now() < creds.expires) {
        return creds.access;
      }
      const refreshed = await refreshOAuthToken(
        config.provider,
        creds.refresh,
        config.proxyUrl,
        config.useProxy,
      );
      saveOAuthCredentials(config.provider, refreshed);
      return refreshed.access;
    },
    [],
  );

  const applyConfig = useCallback(
    (config: ProviderConfig) => {
      let contextWindow = 0;
      let baseModel: Model<Api>;
      if (config.provider === "custom") {
        const custom = buildCustomModel(config);
        if (!custom) return;
        baseModel = custom;
      } else {
        try {
          // Provider and model ID are user-supplied strings; getModel requires narrow literal types
          baseModel = (getModel as (p: string, m: string) => Model<Api>)(
            config.provider,
            config.model,
          );
        } catch {
          return;
        }
      }
      contextWindow = baseModel.contextWindow;
      configRef.current = config;

      const proxiedModel = applyProxyToModel(baseModel, config);
      const existingMessages = agentRef.current?.state.messages ?? [];

      if (agentRef.current) {
        agentRef.current.abort();
      }

      const systemPrompt = adapterRef.current.buildSystemPrompt(
        skillsRef.current,
      );

      const agent = new Agent({
        initialState: {
          model: proxiedModel,
          systemPrompt,
          thinkingLevel: thinkingLevelToAgent(config.thinking),
          tools: adapterRef.current.tools,
          messages: existingMessages,
        },
        streamFn: async (model, context, options) => {
          const cfg = configRef.current ?? config;
          const apiKey = await getActiveApiKey(cfg);
          return streamSimple(model, context, {
            ...options,
            apiKey,
          });
        },
      });
      agentRef.current = agent;
      agent.subscribe(handleAgentEvent);
      pendingConfigRef.current = null;

      followModeRef.current = config.followMode ?? true;

      setState((prev) => ({
        ...prev,
        providerConfig: config,
        error: null,
        sessionStats: { ...prev.sessionStats, contextWindow },
      }));
    },
    [handleAgentEvent, getActiveApiKey],
  );

  const setProviderConfig = useCallback(
    (config: ProviderConfig) => {
      if (isStreamingRef.current) {
        pendingConfigRef.current = config;
        setState((prev) => ({ ...prev, providerConfig: config }));
        return;
      }
      applyConfig(config);
    },
    [applyConfig],
  );

  const abort = useCallback(() => {
    agentRef.current?.abort();
    isStreamingRef.current = false;
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments?: string[]) => {
      if (pendingConfigRef.current) {
        applyConfig(pendingConfigRef.current);
      }
      const agent = agentRef.current;
      if (!agent || !state.providerConfig) {
        setState((prev) => ({
          ...prev,
          error: "Please configure your API key first",
        }));
        return;
      }

      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        parts: [{ type: "text", text: content }],
        timestamp: Date.now(),
      };

      isStreamingRef.current = true;
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isStreaming: true,
        error: null,
      }));

      try {
        let promptContent = content;

        // Fetch document metadata if adapter supports it
        if (adapterRef.current.getDocumentMetadata) {
          try {
            const meta = await adapterRef.current.getDocumentMetadata();
            if (meta) {
              const tag = adapterRef.current.metadataTag || "doc_context";
              promptContent = `<${tag}>\n${JSON.stringify(meta.metadata, null, 2)}\n</${tag}>\n\n${content}`;
              if (meta.nameMap) {
                setState((prev) => ({ ...prev, nameMap: meta.nameMap! }));
              }
            }
          } catch (err) {
            console.error("[Chat] Failed to get document metadata:", err);
          }
        }

        // Add attachments section if files are uploaded
        if (attachments && attachments.length > 0) {
          const paths = attachments
            .map((name) => `/home/user/uploads/${name}`)
            .join("\n");
          promptContent = `<attachments>\n${paths}\n</attachments>\n\n${promptContent}`;
        }

        await agent.prompt(promptContent);
      } catch (err) {
        console.error("[Chat] sendMessage error:", err);
        isStreamingRef.current = false;
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: err instanceof Error ? err.message : "An error occurred",
        }));
      }
    },
    [state.providerConfig, applyConfig],
  );

  const clearMessages = useCallback(() => {
    abort();
    agentRef.current?.reset();
    resetVfs();
    if (currentSessionIdRef.current) {
      Promise.all([
        saveSession(currentSessionIdRef.current, []),
        saveVfsFiles(currentSessionIdRef.current, []),
      ]).catch(console.error);
    }
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
      sessionStats: INITIAL_STATS,
      uploads: [],
    }));
  }, [abort]);

  const refreshSessions = useCallback(async () => {
    if (!documentIdRef.current) return;
    const sessions = await listSessions(documentIdRef.current);
    setState((prev) => ({ ...prev, sessions }));
  }, []);

  const newSession = useCallback(async () => {
    if (!documentIdRef.current) return;
    if (isStreamingRef.current) return;
    try {
      agentRef.current?.reset();
      resetVfs();
      const session = await createSession(documentIdRef.current);
      currentSessionIdRef.current = session.id;
      await refreshSessions();
      setState((prev) => ({
        ...prev,
        messages: [],
        currentSession: session,
        error: null,
        sessionStats: INITIAL_STATS,
        uploads: [],
      }));
    } catch (err) {
      console.error("[Chat] Failed to create session:", err);
    }
  }, [refreshSessions]);

  const switchSession = useCallback(async (sessionId: string) => {
    if (currentSessionIdRef.current === sessionId) return;
    if (isStreamingRef.current) return;
    agentRef.current?.reset();
    try {
      const [session, vfsFiles] = await Promise.all([
        getSession(sessionId),
        loadVfsFiles(sessionId),
      ]);
      if (!session) return;
      await restoreVfs(vfsFiles);
      currentSessionIdRef.current = session.id;

      if (session.agentMessages.length > 0 && agentRef.current) {
        agentRef.current.replaceMessages(session.agentMessages);
      }

      const uploadNames = await listUploads();
      const stats = deriveStats(session.agentMessages);
      setState((prev) => ({
        ...prev,
        messages: agentMessagesToChatMessages(session.agentMessages),
        currentSession: session,
        error: null,
        sessionStats: {
          ...stats,
          contextWindow: prev.sessionStats.contextWindow,
        },
        uploads: uploadNames.map((name) => ({ name, size: 0 })),
      }));
    } catch (err) {
      console.error("[Chat] Failed to switch session:", err);
    }
  }, []);

  const deleteCurrentSession = useCallback(async () => {
    if (!currentSessionIdRef.current || !documentIdRef.current) return;
    if (isStreamingRef.current) return;
    agentRef.current?.reset();
    const deletedId = currentSessionIdRef.current;
    await Promise.all([deleteSession(deletedId), saveVfsFiles(deletedId, [])]);
    const session = await getOrCreateCurrentSession(documentIdRef.current);
    currentSessionIdRef.current = session.id;
    const vfsFiles = await loadVfsFiles(session.id);
    await restoreVfs(vfsFiles);

    if (session.agentMessages.length > 0 && agentRef.current) {
      agentRef.current.replaceMessages(session.agentMessages);
    }

    await refreshSessions();
    const uploadNames = await listUploads();
    const stats = deriveStats(session.agentMessages);
    setState((prev) => ({
      ...prev,
      messages: agentMessagesToChatMessages(session.agentMessages),
      currentSession: session,
      error: null,
      sessionStats: {
        ...stats,
        contextWindow: prev.sessionStats.contextWindow,
      },
      uploads: uploadNames.map((name) => ({ name, size: 0 })),
    }));
  }, [refreshSessions]);

  const prevStreamingRef = useRef(false);
  useEffect(() => {
    if (
      prevStreamingRef.current &&
      !state.isStreaming &&
      currentSessionIdRef.current
    ) {
      const sessionId = currentSessionIdRef.current;
      const agentMessages = agentRef.current?.state.messages ?? [];
      (async () => {
        try {
          const vfsFiles = await snapshotVfs();
          await Promise.all([
            saveSession(sessionId, agentMessages),
            saveVfsFiles(sessionId, vfsFiles),
          ]);
          await refreshSessions();
          const updated = await getSession(sessionId);
          if (updated) {
            setState((prev) => ({ ...prev, currentSession: updated }));
          }
        } catch (e) {
          console.error(e);
        }
      })();
    }
    prevStreamingRef.current = state.isStreaming;
  }, [state.isStreaming, refreshSessions]);

  useEffect(() => {
    return () => {
      agentRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (sessionLoadedRef.current) return;
    sessionLoadedRef.current = true;

    adapterRef.current
      .getDocumentId()
      .then(async (id) => {
        documentIdRef.current = id;

        const skills = await getInstalledSkills();
        skillsRef.current = skills;
        await syncSkillsToVfs();

        const saved = loadSavedConfig();
        if (saved?.provider && saved?.apiKey && saved?.model) {
          applyConfig(saved);
        }

        const session = await getOrCreateCurrentSession(id);
        currentSessionIdRef.current = session.id;
        const [sessions, vfsFiles] = await Promise.all([
          listSessions(id),
          loadVfsFiles(session.id),
        ]);
        if (vfsFiles.length > 0) {
          await restoreVfs(vfsFiles);
        }

        if (session.agentMessages.length > 0 && agentRef.current) {
          agentRef.current.replaceMessages(session.agentMessages);
        }

        const uploadNames = await listUploads();
        const stats = deriveStats(session.agentMessages);
        setState((prev) => ({
          ...prev,
          messages: agentMessagesToChatMessages(session.agentMessages),
          currentSession: session,
          sessions,
          skills,
          sessionStats: {
            ...stats,
            contextWindow: prev.sessionStats.contextWindow,
          },
          uploads: uploadNames.map((name) => ({ name, size: 0 })),
        }));
      })
      .catch((err) => {
        console.error("[Chat] Failed to load session:", err);
      });
  }, [applyConfig]);

  const getName = useCallback(
    (id: number): string | undefined => state.nameMap[id],
    [state.nameMap],
  );

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setState((prev) => ({ ...prev, isUploading: true }));
    try {
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const data = new Uint8Array(buffer);
        await writeFile(file.name, data);
        setState((prev) => {
          const exists = prev.uploads.some((u) => u.name === file.name);
          if (exists) {
            return {
              ...prev,
              uploads: prev.uploads.map((u) =>
                u.name === file.name ? { name: file.name, size: file.size } : u,
              ),
            };
          }
          return {
            ...prev,
            uploads: [...prev.uploads, { name: file.name, size: file.size }],
          };
        });
      }
      if (currentSessionIdRef.current) {
        const snapshot = await snapshotVfs();
        await saveVfsFiles(currentSessionIdRef.current, snapshot);
      }
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setState((prev) => ({ ...prev, isUploading: false }));
    }
  }, []);

  const removeUpload = useCallback(async (name: string) => {
    try {
      await deleteFile(name);
      setState((prev) => ({
        ...prev,
        uploads: prev.uploads.filter((u) => u.name !== name),
      }));
      if (currentSessionIdRef.current) {
        const snapshot = await snapshotVfs();
        await saveVfsFiles(currentSessionIdRef.current, snapshot);
      }
    } catch (err) {
      console.error("Failed to delete file:", err);
      setState((prev) => ({
        ...prev,
        uploads: prev.uploads.filter((u) => u.name !== name),
      }));
    }
  }, []);

  const refreshSkillsAndRebuildAgent = useCallback(async () => {
    skillsRef.current = await getInstalledSkills();
    setState((prev) => {
      if (prev.providerConfig) {
        applyConfig(prev.providerConfig);
      }
      return { ...prev, skills: skillsRef.current };
    });
  }, [applyConfig]);

  const installSkill = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      try {
        const inputs = await Promise.all(
          files.map(async (f) => {
            const fullPath = f.webkitRelativePath || f.name;
            const parts = fullPath.split("/");
            const path = parts.length > 1 ? parts.slice(1).join("/") : parts[0];
            return { path, data: new Uint8Array(await f.arrayBuffer()) };
          }),
        );
        await addSkill(inputs);
        await refreshSkillsAndRebuildAgent();
      } catch (err) {
        console.error("[Chat] Failed to install skill:", err);
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to install skill",
        }));
      }
    },
    [refreshSkillsAndRebuildAgent],
  );

  const uninstallSkill = useCallback(
    async (name: string) => {
      try {
        await removeSkill(name);
        await refreshSkillsAndRebuildAgent();
      } catch (err) {
        console.error("[Chat] Failed to uninstall skill:", err);
      }
    },
    [refreshSkillsAndRebuildAgent],
  );

  const toggleFollowMode = useCallback(() => {
    setState((prev) => {
      if (!prev.providerConfig) return prev;
      const newFollowMode = !prev.providerConfig.followMode;
      followModeRef.current = newFollowMode;
      const newConfig = { ...prev.providerConfig, followMode: newFollowMode };
      saveConfig(newConfig);
      return { ...prev, providerConfig: newConfig };
    });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        sendMessage,
        setProviderConfig,
        clearMessages,
        abort,
        availableProviders,
        getModelsForProvider,
        newSession,
        switchSession,
        deleteCurrentSession,
        getName,
        toggleFollowMode,
        processFiles,
        removeUpload,
        installSkill,
        uninstallSkill,
        adapter,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatProvider");
  return context;
}
