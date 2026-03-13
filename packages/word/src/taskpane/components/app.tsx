import { ChatInterface, ErrorBoundary } from "@office-agents/core";
import type { FC } from "react";
import { useMemo } from "react";
import { createWordAdapter } from "../../lib/adapter";

const App: FC = () => {
  const adapter = useMemo(() => createWordAdapter(), []);

  return (
    <ErrorBoundary>
      <div className="h-screen w-full overflow-hidden">
        <ChatInterface adapter={adapter} />
      </div>
    </ErrorBoundary>
  );
};

export default App;
