import type { AgentContext } from "@office-agents/core";
import { createBashTool, createReadTool } from "@office-agents/core";
import { duplicateSlideTool } from "./duplicate-slide";
import { createEditSlideChartTool } from "./edit-slide-chart";
import { createEditSlideMasterTool } from "./edit-slide-master";
import { editSlideTextTool } from "./edit-slide-text";
import { createEditSlideXmlTool } from "./edit-slide-xml";
import { createExecuteOfficeJsTool } from "./execute-office-js";
import { listSlideShapesTool } from "./list-slide-shapes";
import { readSlideTextTool } from "./read-slide-text";
import { screenshotSlideTool } from "./screenshot-slide";
import { verifySlidesTool } from "./verify-slides";

export function createPptTools(ctx: AgentContext) {
  return [
    // fs tools
    createReadTool(ctx),
    createBashTool(ctx),
    // PPT read tools
    screenshotSlideTool,
    listSlideShapesTool,
    readSlideTextTool,
    verifySlidesTool,
    // PPT write tools
    createExecuteOfficeJsTool(ctx),
    editSlideTextTool,
    createEditSlideXmlTool(ctx),
    createEditSlideChartTool(ctx),
    createEditSlideMasterTool(ctx),
    duplicateSlideTool,
  ];
}

export {
  createBashTool,
  createReadTool,
  createEditSlideChartTool,
  createEditSlideMasterTool,
  createEditSlideXmlTool,
  createExecuteOfficeJsTool,
  duplicateSlideTool,
  editSlideTextTool,
  listSlideShapesTool,
  readSlideTextTool,
  screenshotSlideTool,
  verifySlidesTool,
};

export {
  defineTool,
  type ToolResult,
  toolError,
  toolImage,
  toolSuccess,
  toolText,
} from "./types";
