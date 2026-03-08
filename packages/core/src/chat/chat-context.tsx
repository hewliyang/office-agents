import type { Api, Model } from "@mariozechner/pi-ai";
import {
  AgentRuntime,
  type ChatMessage,
  configureNamespace,
  type MessagePart,
  type ProviderConfig,
  type RuntimeState,
  type SessionStats,
  type ThinkingLevel,
  type ToolCallStatus,
  type UploadedFile,
} from "@office-agents/sdk";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppAdapter } from "./app-adapter";

export type { ChatMessage, MessagePart, SessionStats, ToolCallStatus };
export type { ProviderConfig, ThinkingLevel };
export type { UploadedFile };

interface ChatContextValue {
  state: RuntimeState;
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
  toggleExpandToolCalls: () => void;
  processFiles: (files: File[]) => Promise<void>;
  removeUpload: (name: string) => Promise<void>;
  installSkill: (files: File[]) => Promise<void>;
  uninstallSkill: (name: string) => Promise<void>;
  adapter: AppAdapter;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({
  children,
  adapter,
}: {
  children: ReactNode;
  adapter: AppAdapter;
}) {
  if (adapter.storageNamespace) {
    configureNamespace(adapter.storageNamespace);
  }

  const runtimeRef = useRef<AgentRuntime | null>(null);
  if (!runtimeRef.current) {
    runtimeRef.current = new AgentRuntime(adapter);
  }
  const runtime = runtimeRef.current;

  const [state, setState] = useState<RuntimeState>(() => runtime.getState());

  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  useEffect(() => {
    runtime.setAdapter(adapterRef.current);
    const unsubscribe = runtime.subscribe(setState);
    runtime.init();
    return () => {
      unsubscribe();
      runtime.dispose();
    };
  }, [runtime]);

  useEffect(() => {
    runtime.setAdapter(adapter);
  }, [adapter, runtime]);

  const availableProviders = runtime.getAvailableProviders();

  const getModelsForProvider = useCallback(
    (provider: string) => runtime.getModelsForProvider(provider),
    [runtime],
  );

  const sendMessage = useCallback(
    (content: string, attachments?: string[]) =>
      runtime.sendMessage(content, attachments),
    [runtime],
  );

  const setProviderConfig = useCallback(
    (config: ProviderConfig) => runtime.setProviderConfig(config),
    [runtime],
  );

  const clearMessages = useCallback(() => runtime.clearMessages(), [runtime]);
  const abort = useCallback(() => runtime.abort(), [runtime]);

  const newSession = useCallback(() => runtime.newSession(), [runtime]);
  const switchSession = useCallback(
    (id: string) => runtime.switchSession(id),
    [runtime],
  );
  const deleteCurrentSession = useCallback(
    () => runtime.deleteCurrentSession(),
    [runtime],
  );

  const getName = useCallback((id: number) => runtime.getName(id), [runtime]);

  const toggleFollowMode = useCallback(
    () => runtime.toggleFollowMode(),
    [runtime],
  );

  const toggleExpandToolCalls = useCallback(
    () => runtime.toggleExpandToolCalls(),
    [runtime],
  );

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const inputs = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          size: f.size,
          data: new Uint8Array(await f.arrayBuffer()),
        })),
      );
      await runtime.uploadFiles(inputs);
    },
    [runtime],
  );

  const removeUpload = useCallback(
    (name: string) => runtime.removeUpload(name),
    [runtime],
  );

  const installSkill = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const inputs = await Promise.all(
        files.map(async (f) => {
          const fullPath = f.webkitRelativePath || f.name;
          const parts = fullPath.split("/");
          const path = parts.length > 1 ? parts.slice(1).join("/") : parts[0];
          return { path, data: new Uint8Array(await f.arrayBuffer()) };
        }),
      );
      await runtime.installSkill(inputs);
    },
    [runtime],
  );

  const uninstallSkill = useCallback(
    (name: string) => runtime.uninstallSkill(name),
    [runtime],
  );

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
        toggleExpandToolCalls,
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
