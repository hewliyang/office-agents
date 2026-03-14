import { getSharedCustomCommands } from "@office-agents/core";
import type { CustomCommand } from "just-bash/browser";

export function getCustomCommands(): CustomCommand[] {
  return [...getSharedCustomCommands({ includeImageSearch: true })];
}
