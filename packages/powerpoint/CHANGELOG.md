# Changelog

## [Unreleased]

## [0.0.5] - 2026-04-17

### Changed

- **Co-located command prompt snippets** — PowerPoint-specific VFS commands (`insert-image`, `search-icons`, `insert-icon`) now use `DescribedCommand` with co-located `promptSnippet`. System prompt assembles command docs dynamically from snippets instead of hard-coding them.
- **Upgrade `pi-ai` / `pi-agent-core`** — Bumped to `^0.67.6` for the latest provider, streaming, and agent runtime improvements.

## [0.0.4] - 2026-03-19

### Changed

- **Svelte migration** — Ported `@office-agents/core` chat UI layer from React to Svelte 5.

## [0.0.3] - 2026-03-15

### Features

- **Dev bridge integration** — In development mode the taskpane auto-connects to the local Office bridge, enabling CLI-driven tool calls, screenshots, VFS access, and live inspection.
- **Files panel** — New "Files" tab in the chat header lets you browse, preview, download, and delete VFS files.

### Fixes

- **`btoa`/`atob` in `execute_office_js`** — Base64 helpers are now available inside the Office.js sandbox.
- **CSS source path** — Fixed `streamdown` Tailwind `@source` path after monorepo restructure.

## [0.0.2] - 2026-03-08

### Fixes

- **PDF commands** — Fixed `pdf-to-text` and `pdf-to-images` consuming the PDF file data on first use, causing subsequent calls to fail with "The object can not be cloned".

## [0.0.1] - 2026-03-08

Initial release with AI chat interface, multi-provider LLM support (BYOK), PowerPoint slide read/write tools, OOXML/PPTX editing, and CORS proxy configuration.
