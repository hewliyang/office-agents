import { bashTool, readTool } from "@office-agents/core";
import { duplicateSlideTool } from "./duplicate-slide";
import { editSlideChartTool } from "./edit-slide-chart";
import { editSlideMasterTool } from "./edit-slide-master";
import { editSlideTextTool } from "./edit-slide-text";
import { editSlideXmlTool } from "./edit-slide-xml";
import { executeOfficeJsTool } from "./execute-office-js";
import { listSlideShapesTool } from "./list-slide-shapes";
import { readSlideTextTool } from "./read-slide-text";
import { screenshotSlideTool } from "./screenshot-slide";
import { verifySlidesTool } from "./verify-slides";

export const PPT_TOOLS = [
  // fs tools
  readTool,
  bashTool,
  // PPT read tools
  screenshotSlideTool,
  listSlideShapesTool,
  readSlideTextTool,
  verifySlidesTool,
  // PPT write tools
  executeOfficeJsTool,
  editSlideTextTool,
  editSlideXmlTool,
  editSlideChartTool,
  editSlideMasterTool,
  duplicateSlideTool,
];

export {
  bashTool,
  readTool,
  duplicateSlideTool,
  editSlideChartTool,
  editSlideMasterTool,
  editSlideTextTool,
  editSlideXmlTool,
  executeOfficeJsTool,
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
