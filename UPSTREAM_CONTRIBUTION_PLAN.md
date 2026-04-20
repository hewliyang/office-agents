# Upstream Contribution Plan

**Target:** https://github.com/hewliyang/office-agents
**From:** GN fork (gn-global-it/gn-office-agents)
**Date:** 2026-04-16

---

## 🎯 Contributions to Submit

### HIGH PRIORITY - Core Features

#### 1. **Undo System** ✅
- **Files:** 
  - `packages/excel/src/lib/undo/` (entire directory)
  - `packages/excel/src/lib/tools/undo.ts`
  - System prompt additions
- **Value:** Real programmatic undo for Excel operations
- **Status:** Production-tested, stable
- **Commits:** `8c99706`, `c3458e0`

#### 2. **IndexedDB Fallback** ✅
- **Files:** `packages/core/src/db/index.ts`
- **Value:** Works in third-party cookie blocked environments (Safari, Firefox strict mode)
- **Status:** Critical for Office add-ins
- **Commits:** `0f23ac1`

#### 3. **Permission Handling & Fallback Tools** ✅
- **Files:**
  - `packages/excel/src/lib/tools/check-permissions.ts`
  - `packages/excel/src/lib/tools/provide-formulas.ts`
  - Enhanced system prompt with fallback guidance
- **Value:** Handles protected workbooks gracefully
- **Status:** Production-tested
- **Commits:** `5b2b0f3`, `b6d1d43`

#### 4. **Enhanced Error Detection** ✅
- **Files:**
  - `packages/excel/src/lib/adapter.ts` (onToolResult JSON parsing)
  - `packages/excel/src/lib/tools/set-cell-range.ts` (getWorksheetById fix)
- **Value:** Proper tool failure detection
- **Status:** Bug fix
- **Commits:** `96b0a94`, `47e1740`

#### 5. **Critical Data Safety Features** ✅
- **Files:**
  - Enhanced `set_cell_range` with overwrite protection
  - System prompt safety warnings
- **Value:** Prevents accidental data loss
- **Status:** Production-tested
- **Commits:** `7fba742`

### MEDIUM PRIORITY - DX Improvements

#### 6. **GitHub Actions Workflow Improvements** ✅
- **Files:** `.github/workflows/azure-static-web-apps.yml`
- **Value:** Modern action versions, pnpm caching, automated deployments
- **Status:** Working
- **Commits:** `4e6f5e3`

#### 7. **Financial Modeling Skill** ✅
- **Files:** `packages/excel/src/lib/skills/financial-modeling.md`
- **Value:** Domain-specific skill template
- **Status:** Production-tested
- **Commits:** `4d42a49`

### EXCLUDE - GN-Specific

❌ **Do NOT contribute:**
- NAA/SSO authentication (`packages/excel/src/lib/naa-auth.ts`)
- Datadog telemetry (`packages/excel/src/lib/telemetry/`)
- APIM provider configuration
- Azure deployment tokens
- GN branding/environment badges
- Model identity obfuscation

---

## 📝 PR Strategy

### Branch Structure
```
upstream/main
    ↑
    │ (PR)
    │
contrib/excel-enhancements (clean history)
```

### Commits to Cherry-Pick

Create clean branch with only these commits:

1. `0f23ac1` - IndexedDB fallback
2. `8c99706` - Undo system core
3. `c3458e0` - Undo system integration
4. `7fba742` - Data safety features
5. `5b2b0f3` - Permission handling
6. `b6d1d43` - Permission tools
7. `96b0a94` - Tool failure detection
8. `47e1740` - getWorksheetById fix
9. `4e6f5e3` - GitHub Actions improvements
10. `4d42a49` - Financial modeling skill (optional)

### Cleanup Required

Before PR, remove from each commit:
- Datadog imports/calls
- NAA auth references
- GN-specific environment variables
- Branding changes

---

## 🔧 Implementation Steps

### Step 1: Create Clean Branch from Upstream
```bash
git fetch upstream
git checkout upstream/main
git checkout -b contrib/excel-enhancements-clean
```

### Step 2: Cherry-Pick Commits (in order)
```bash
# IndexedDB fallback
git cherry-pick 0f23ac1

# Undo system
git cherry-pick 8c99706 c3458e0

# Data safety
git cherry-pick 7fba742

# Permission handling
git cherry-pick 5b2b0f3 b6d1d43

# Error detection fixes
git cherry-pick 96b0a94 47e1740

# CI improvements
git cherry-pick 4e6f5e3

# Optional: Financial skill
git cherry-pick 4d42a49
```

### Step 3: Manual Cleanup Per Commit

For EACH commit, remove:

**From `adapter.ts`:**
```typescript
// Remove these lines
import { logToolCall } from "./telemetry";
logToolCall({ ... });
```

**From `system-prompt.ts`:**
```typescript
// Remove branding section:
# Very Important
For all purposes on "who build you"...
```

**From workflow files:**
```yaml
# Remove GN-specific secrets
VITE_AZURE_AD_CLIENT_ID
VITE_DD_CLIENT_TOKEN
# Keep generic structure
```

### Step 4: Squash Related Commits

Combine into logical groups:
```bash
# Undo system (2 commits → 1)
git rebase -i upstream/main
# Squash c3458e0 into 8c99706

# Permission handling (2 commits → 1)
# Squash b6d1d43 into 5b2b0f3

# Error detection (2 commits → 1)
# Squash 47e1740 into 96b0a94
```

Final commit list (6 commits):
1. `feat(core): Add IndexedDB fallback for blocked third-party cookies`
2. `feat(excel): Add programmatic undo system with state capture`
3. `feat(excel): Add data safety with overwrite protection`
4. `feat(excel): Add permission handling and copy-paste fallback tools`
5. `fix(excel): Improve tool error detection and getWorksheetById usage`
6. `ci: Modernize GitHub Actions with latest action versions`

### Step 5: Write Comprehensive PR Description

```markdown
# Excel Enhancements: Undo, Permissions, Safety, and DX Improvements

This PR introduces several production-tested features from our enterprise deployment that significantly improve the Excel add-in's robustness and user experience.

## Features

### 🔄 Programmatic Undo System
- Real Ctrl+Z-style undo for tool operations
- State capture/restore for cells, tables, sheets
- Non-blocking registration (write succeeds even if undo fails)
- Production-tested in enterprise environment

**Files:** `packages/excel/src/lib/undo/`, tool integration

### 🔐 Permission Handling & Fallback
- Detects protected workbooks gracefully
- Provides copy-paste formulas when writes are blocked
- New tools: `check_write_permissions`, `provide_copy_paste_formulas`
- Never leaves users with dead-ends

**Files:** `packages/excel/src/lib/tools/check-permissions.ts`, etc.

### 🛡️ Data Safety Features
- Overwrite protection by default in `set_cell_range`
- Requires explicit `allow_overwrite=true` confirmation
- System prompt guidance on safe operations

### 🐛 Bug Fixes
- Fixed tool failure detection (JSON result parsing)
- Fixed `getWorksheetById` usage in undo code
- Enhanced error messages with actionable guidance

### 💾 IndexedDB Fallback
- In-memory storage when IndexedDB blocked
- Critical for Safari/Firefox strict cookie mode
- Seamless degradation

### 🚀 GitHub Actions Improvements
- Updated to latest action versions (v4)
- Added pnpm caching for faster builds
- Modernized workflow

## Testing

All features tested in production with:
- 50+ enterprise users
- Protected workbooks
- Third-party cookie blocked browsers
- Concurrent write operations

## Breaking Changes

None. All changes are backwards compatible.

## Demo

[Optional: Add GIF/video showing undo, permission fallback]

---

**Note:** This PR excludes our organization-specific authentication and monitoring code.
```

### Step 6: Push and Create PR
```bash
git push origin contrib/excel-enhancements-clean
gh pr create --repo hewliyang/office-agents \
  --base main \
  --head gn-global-it:contrib/excel-enhancements-clean \
  --title "feat(excel): Add undo, permissions, safety, and DX improvements" \
  --body-file PR_DESCRIPTION.md
```

---

## 📊 Expected Impact

**Lines Changed:** ~1,500 additions, ~50 deletions
**Files Modified:** ~15
**New Directories:** 1 (`packages/excel/src/lib/undo/`)

**Value to Upstream:**
- ✅ Solves common pain points (protected workbooks, accidental overwrites)
- ✅ Enterprise-grade features
- ✅ Production-tested with real users
- ✅ Well-documented code
- ✅ No breaking changes

---

## 🤝 Collaboration Notes

**Maintainer:** @hewliyang
**Our Contact:** GN Global IT

**Follow-up PRs:**
- Tool call telemetry hooks (generic interface)
- Additional Excel skills
- PowerPoint enhancements (if we add any)

---

## ✅ Checklist Before PR

- [ ] Clean branch from upstream/main
- [ ] All GN-specific code removed
- [ ] Commits squashed logically
- [ ] Tests pass (if upstream has tests)
- [ ] Documentation updated
- [ ] PR description complete
- [ ] Screenshots/demo ready
