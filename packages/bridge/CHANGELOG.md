# Changelog

## [Unreleased]

### Features

- **Initial release** — Local HTTPS/WebSocket RPC bridge for live Office add-in development.
- **Bridge server** — Self-signed HTTPS server on `localhost:4017` with WebSocket session registry. Reuses an already-running healthy server instead of failing with `EADDRINUSE`.
- **Bridge client** — Drop-in client that auto-connects from the Office taskpane to the local bridge, exposing adapter tools, metadata, and VFS operations.
- **CLI (`office-bridge`)** — Full command-line interface: `list`, `inspect`, `metadata`, `tool`, `exec`, `screenshot`, `events`, `vfs ls/pull/push` subcommands. Image base64 is stripped from printed JSON output.
- **HTTP client** — Lightweight typed HTTP client for programmatic bridge access outside the CLI.
