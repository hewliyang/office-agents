# TODO

## Storage key migration

Several localStorage and IndexedDB keys still use the legacy `openexcel-` prefix from before the monorepo conversion. These should be migrated to a generic prefix (e.g. `office-agents-`) with a one-time migration path so existing users don't lose their settings/sessions.

### Affected keys

| Key | Location | Notes |
| --- | -------- | ----- |
| `openexcel-provider-config` | `packages/core/src/provider-config.ts` | Provider, API key, model selection |
| `openexcel-oauth-credentials` | `packages/core/src/oauth/index.ts` | OAuth refresh/access tokens |
| `openexcel-web-config` | `packages/core/src/web/config.ts` | Search/fetch provider settings |
| `openexcel-workbook-id` | `packages/core/src/storage/db.ts` | Document ID stored in Office.context.document.settings |
| `openexcel-sheet-id-map` | `packages/excel/src/lib/excel/sheet-id-map.ts` | Excel-specific, can stay `openexcel-` |
| `openexcel-sheet-id-counter` | `packages/excel/src/lib/excel/sheet-id-map.ts` | Excel-specific, can stay `openexcel-` |
| `OpenExcelDB_v3` | `packages/core/src/storage/db.ts` | IndexedDB database name |

### Migration strategy

1. On startup, check if new keys exist; if not, read from old keys and copy over
2. Keep reading old keys as fallback for one release cycle
3. Remove old key reads in the following release
4. The Excel-specific sheet-id keys can remain as-is since they're app-scoped
5. Consider making the storage prefix configurable via `AppAdapter.storagePrefix`
