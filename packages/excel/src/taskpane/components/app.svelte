<script lang="ts">
  import {
    AgentContext,
    ChatInterface,
    ErrorBoundary,
  } from "@office-agents/core";
  import { onMount } from "svelte";
  import { createExcelAdapter } from "../../lib/adapter";

  const adapter = createExcelAdapter();
  const ctx = new AgentContext({
    namespace: adapter.storageNamespace,
    staticFiles: adapter.staticFiles,
    customCommands: adapter.customCommands,
  });

  onMount(() => {
    if (!import.meta.env.DEV) return undefined;

    let stopped = false;
    let stopBridge: (() => void) | undefined;

    void import("@office-agents/bridge/client").then(
      ({ startOfficeBridge }) => {
        if (stopped) return;

        const bridge = startOfficeBridge({
          app: "excel",
          adapter,
          vfs: ctx,
        });
        stopBridge = () => bridge.stop();
      },
    );

    return () => {
      stopped = true;
      stopBridge?.();
    };
  });
</script>

<ErrorBoundary>
  <div class="h-screen w-full overflow-hidden">
    <ChatInterface {adapter} context={ctx} />
  </div>
</ErrorBoundary>
