import {
  ChatInterface,
  deleteFile,
  ErrorBoundary,
  readFile,
  readFileBuffer,
  snapshotVfs,
  writeFile,
} from "@office-agents/core";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import { createPowerPointAdapter } from "../../lib/adapter";

interface AppProps {
  title: string;
}

const App: FC<AppProps> = () => {
  const adapter = useMemo(() => createPowerPointAdapter(), []);

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;

    let stopped = false;
    let stopBridge: (() => void) | undefined;

    void import("@office-agents/bridge/client").then(
      ({ startOfficeBridge }) => {
        if (stopped) return;

        const bridge = startOfficeBridge({
          app: "powerpoint",
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
      },
    );

    return () => {
      stopped = true;
      stopBridge?.();
    };
  }, [adapter]);

  return (
    <ErrorBoundary>
      <div className="h-screen w-full overflow-hidden">
        <ChatInterface adapter={adapter} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
