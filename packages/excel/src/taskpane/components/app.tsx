import { startOfficeBridge } from "@office-agents/bridge/client";
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
import { createExcelAdapter } from "../../lib/adapter";

interface AppProps {
  title: string;
}

const App: FC<AppProps> = () => {
  const adapter = useMemo(() => createExcelAdapter(), []);

  useEffect(() => {
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
    return () => bridge.stop();
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
