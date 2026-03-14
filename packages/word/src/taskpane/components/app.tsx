import { startOfficeBridge } from "@office-agents/bridge/client";
import { ChatInterface, ErrorBoundary } from "@office-agents/core";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import { createWordAdapter } from "../../lib/adapter";

const App: FC = () => {
  const adapter = useMemo(() => createWordAdapter(), []);

  useEffect(() => {
    const bridge = startOfficeBridge({
      app: "word",
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
