import {
  type CustomCommandsResult,
  getSharedCustomCommands,
} from "@office-agents/core";

export function getCustomCommands(): CustomCommandsResult {
  const shared = getSharedCustomCommands({ includeImageSearch: true });
  return {
    commands: [...shared.commands],
    promptSnippets: [...shared.promptSnippets],
  };
}
