# Changelog

## [Unreleased]

## [0.0.4] - 2026-04-17

### Changed

- **Co-located command prompt snippets** — System prompt assembles command docs dynamically from `DescribedCommand` snippets instead of hard-coding them.
- **Upgrade `pi-ai` / `pi-agent-core`** — Bumped to `^0.67.6` for the latest provider, streaming, and agent runtime improvements.

## [0.0.3] - 2026-03-19

### Changed

- **Svelte migration** — Ported `@office-agents/core` chat UI layer from React to Svelte 5.

## [0.0.2] - 2026-03-15

### Features

- **Initial release** — Word Add-in with AI chat interface, multi-provider LLM support (BYOK), and document read/write tools.
- **Document tools** — `get_document_text` (with pagination), `get_document_structure` (headings/tables/lists outline), `get_paragraph_ooxml`, `get_ooxml` (body/section/range OOXML), `screenshot_document`, and `execute_office_js` escape hatch.
- **Dev bridge integration** — In development mode the taskpane auto-connects to the local Office bridge for CLI-driven inspection and tool execution.
- **Files panel** — "Files" tab for browsing, previewing, downloading, and deleting VFS files.
- **Track changes indicator** — Header component showing tracked-changes status with accept/reject actions.
- **Selection indicator** — Header component showing the current document selection context.
- **Word Office.js API docs** — Full `.d.ts` type references bundled into the VFS for agent use.
- **VFS custom commands** — `pdf-to-text`, `docx-to-text`, `xlsx-to-csv`, `web-search`, `web-fetch`.
