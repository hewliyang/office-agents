import { bashTool, readTool } from "@office-agents/core";
import { executeOfficeJsTool } from "./execute-office-js";
import { getDocumentStructureTool } from "./get-document-structure";
import { getDocumentTextTool } from "./get-document-text";
import { getOoxmlTool } from "./get-ooxml";
import { screenshotDocumentTool } from "./screenshot-document";

export const WORD_TOOLS = [
  // fs tools
  readTool,
  bashTool,
  // Word read tools
  screenshotDocumentTool,
  getDocumentTextTool,
  getDocumentStructureTool,
  getOoxmlTool,
  // Word write tools
  executeOfficeJsTool,
];

export {
  bashTool,
  readTool,
  executeOfficeJsTool,
  getDocumentStructureTool,
  getDocumentTextTool,
  getOoxmlTool,
  screenshotDocumentTool,
};

export {
  defineTool,
  type ToolResult,
  toolError,
  toolImage,
  toolSuccess,
  toolText,
} from "./types";
