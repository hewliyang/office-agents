# Changelog

## [Unreleased]

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
