import { startOfficeBridge } from "@office-agents/bridge/client";
import { ChatInterface, ErrorBoundary } from "@office-agents/core";
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
