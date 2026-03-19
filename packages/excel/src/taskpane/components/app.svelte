<script lang="ts">
  import {
    ChatInterface,
    deleteFile,
    ErrorBoundary,
    readFile,
    readFileBuffer,
    snapshotVfs,
    writeFile,
  } from "@office-agents/core";
  import { onMount } from "svelte";
  import { createExcelAdapter } from "../../lib/adapter";

  const adapter = createExcelAdapter();

  onMount(() => {
    if (!import.meta.env.DEV) return undefined;

    let stopped = false;
    let stopBridge: (() => void) | undefined;

    void import("@office-agents/bridge/client").then(({ startOfficeBridge }) => {
      if (stopped) return;

      const bridge = startOfficeBridge({
        app: "excel",
        adapter,
        vfs: {
          snapshot: snapshotVfs,
          readFile,
          readFileBuffer,
          writeFile,
          deleteFile,
        },
      });
      stopBridge = () => bridge.stop();
    });

    return () => {
      stopped = true;
      stopBridge?.();
    };
  });
</script>

<ErrorBoundary>
  <div class="h-screen w-full overflow-hidden">
    <ChatInterface {adapter} />
  </div>
</ErrorBoundary>
