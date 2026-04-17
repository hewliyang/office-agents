# browse ↔ agent-browser parity checklist

Scope: browser automation and agent-facing CLI ergonomics for `@office-agents/browser`'s `browse` command.

Out of scope for now: native install/upgrade flows, daemon/dashboard/session registry, iOS/device-management, local DevTools proxying, video/trace/profiler, auth vault, and other features that depend on the Rust daemon architecture from `agent-browser`.

## Target

Reach ~90% parity for the browser-automation subset by closing the biggest command-surface gaps and adding command-contract tests.

## Command parity

### Navigation / session
- [x] `open`
- [x] `back`
- [x] `forward`
- [x] `reload`
- [x] `status`
- [x] `stop`
- [x] `connect <port|url>`
- [x] `close | quit | exit`
- [x] `close --all` (local alias for single in-process session)

### Core actions
- [x] `click <ref|selector>`
- [x] `click <selector> --new-tab`
- [x] `dblclick <ref|selector>`
- [x] `type` (`type <selector> <text>` plus focused-element fallback)
- [x] `fill <ref|selector> <value>`
- [x] `press <key>`
- [x] `key` alias for `press`
- [x] `keydown <key>`
- [x] `keyup <key>`
- [x] `keyboard type <text>`
- [x] `keyboard inserttext <text>`
- [x] `hover`
- [x] `focus`
- [x] `check`
- [x] `uncheck`
- [x] `select`
- [x] `drag <src> <tgt>`
- [x] `upload <sel> <files...>`

### Scrolling / waiting
- [x] `scroll` (directional mode + low-level XY deltas)
- [x] `scrollintoview | scrollinto`
- [x] `wait <selector>`
- [x] `wait <ms>`
- [x] `wait --text`
- [x] `wait --url`
- [x] `wait --load`
- [x] `wait --fn`
- [x] wait state parity (`visible|hidden|attached|detached`)

### Artifacts
- [x] `snapshot`
- [ ] `snapshot --selector`
- [x] `screenshot` (selector/path parity)
- [x] `pdf` (base64 + file output parity)
- [x] `download` (URL or selector-driven path parity)

### Get / state
- [x] `get text`
- [x] `get html`
- [x] `get value`
- [x] `get attr`
- [x] `get title`
- [x] `get url`
- [x] `get count`
- [x] `get box`
- [x] `get styles`
- [x] `get cdp-url`
- [x] `is visible`
- [x] `is enabled`
- [x] `is checked`

### Semantic locators
- [x] `find role`
- [x] `find text`
- [x] `find label`
- [x] `find placeholder`
- [x] `find alt`
- [x] `find title`
- [x] `find testid`
- [x] `find first`
- [x] `find last`
- [x] `find nth`

### Mouse / keyboard namespaces
- [x] `mouse move`
- [x] `mouse down`
- [x] `mouse up`
- [x] `mouse wheel`

### Browser settings
- [x] `set viewport`
- [x] `set device`
- [x] `set geo`
- [x] `set offline`
- [x] `set headers`
- [x] `set credentials | set auth`
- [x] `set media` (color scheme + reduced-motion parity)

### Cookies / storage / tabs
- [x] `cookies`
- [x] `cookies set`
- [x] `cookies clear`
- [x] `storage local`
- [x] `storage session`
- [x] `tab`
- [x] `tab new`
- [x] `tab close`

### Possible later
- [ ] `clipboard`
- [ ] `batch`
- [ ] `network ...`
- [ ] `inspect`
- [ ] `console`
- [ ] `errors`
- [ ] `highlight`

## Test expansion plan

### Phase 1 — command contract tests
- [x] add `tests/command.test.ts`
- [x] cover existing commands with fake `Browser` / `Page`
- [x] add tests for new aliases and error cases

### Phase 2 — page/integration coverage
- [x] drag + upload fixtures
- [x] semantic locator integration tests
- [x] device / screenshot selector coverage
- [x] scroll direction + scroll-into-view coverage

### Phase 3 — docs
- [ ] update `packages/browser/README.md`
- [ ] update `browse --help` output
