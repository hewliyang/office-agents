# Changelog

## [Unreleased]

### Changed

- **Upgrade `pi-ai` / `pi-agent-core`** — Migrated from `@mariozechner/pi-ai` (deprecated) to `@earendil-works/pi-ai` `^0.74.0` for the latest model list (incl. `gpt-5.5`) and provider improvements.
- **Co-located command prompt snippets** — Custom VFS commands now carry their own `promptSnippet` via the new `DescribedCommand` type, instead of duplicating descriptions in system prompts. `getSharedCustomCommands()` returns `CustomCommandsResult { commands, promptSnippets }`, and `RuntimeAdapter.buildSystemPrompt` receives the filtered snippets as a second argument. Commands with `isAvailable` returning `false` are excluded from prompt snippets but still registered.

## [0.0.6] - 2026-03-19

### Fixes

- **Dirty range indicators lost on reload** — `nameMap` (sheet ID → name) was only populated during `send()`, so dirty range badges disappeared after an extension reload or session switch. Now `nameMap` is eagerly refreshed on `init()` and `switchSession()`.

## [0.0.5] - 2026-03-15

### Features

- **PDF eager-load helper** — New `loadPdfDocument()` export consolidates PDF.js initialization (worker import, eval-safe config) into a single reusable function. Custom commands now use this instead of inline dynamic imports.
- **Image MIME sniffing** — New `detectImageMimeType()` inspects file magic bytes (JPEG, PNG, GIF, WebP, BMP) so the `read` tool sends the correct MIME type even when the file extension is wrong or missing.
- **VFS invalidation signal** — `RuntimeState.vfsInvalidatedAt` timestamp is bumped on file upload, delete, and tool execution, allowing UI components (e.g. Files panel) to reactively refresh.

### Fixes

- **Sandbox `atob`/`btoa`** — Bound `atob` and `btoa` into the sandboxed eval scope so Office.js escape-hatch tools can do base64 encoding/decoding.
- **SVG no longer treated as image** — Moved `svg` (and removed `ico`) from the image extension list so SVG files are returned as text instead of being resized as raster images.

## [0.0.4] - 2026-03-08

### Fixes

- **PDF commands** — Fixed `pdf-to-text` and `pdf-to-images` consuming the PDF file data on first use, causing subsequent calls to fail with "The object can not be cloned". Now copies the buffer before passing to pdfjs.

## [0.0.3] - 2026-03-08
