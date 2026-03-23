import {
  type CustomCommandsResult,
  getSharedCustomCommands,
  type StorageNamespace,
} from "@office-agents/core";

export function getCustomCommands(ns: StorageNamespace): CustomCommandsResult {
  const shared = getSharedCustomCommands({
    ns,
    includeImageSearch: true,
  });
  return {
    commands: [...shared.commands],
    promptSnippets: [...shared.promptSnippets],
  };
}
