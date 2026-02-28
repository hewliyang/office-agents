import { ChatInterface, ErrorBoundary } from "@office-agents/core";
import type { FC } from "react";
import { useMemo } from "react";
import { createPowerPointAdapter } from "../../lib/adapter";

interface AppProps {
  title: string;
}

const App: FC<AppProps> = () => {
  const adapter = useMemo(() => createPowerPointAdapter(), []);

  return (
    <ErrorBoundary>
      <div className="h-screen w-full overflow-hidden">
        <ChatInterface adapter={adapter} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
