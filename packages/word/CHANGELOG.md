# Changelog

## [Unreleased]

### Features

- **Initial release** — Word Add-in with AI chat interface, multi-provider LLM support (BYOK), and document read/write tools.
- **Document tools** — `get_document_text` (with pagination), `get_document_structure` (headings/tables/lists outline), `get_paragraph_ooxml`, `get_ooxml` (body/section/range OOXML), `screenshot_document`, and `execute_office_js` escape hatch.
- **Dev bridge integration** — In development mode the taskpane auto-connects to the local Office bridge for CLI-driven inspection and tool execution.
- **Files panel** — "Files" tab for browsing, previewing, downloading, and deleting VFS files.
- **Track changes indicator** — Header component showing tracked-changes status with accept/reject actions.
- **Selection indicator** — Header component showing the current document selection context.
- **Word Office.js API docs** — Full `.d.ts` type references bundled into the VFS for agent use.
- **VFS custom commands** — `pdf-to-text`, `docx-to-text`, `xlsx-to-csv`, `web-search`, `web-fetch`.
