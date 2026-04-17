# Word Add-in Agent Scaffold — Design Document

## Executive Summary

This document outlines the agentic scaffold (tools, system prompt, adapter) for a Microsoft Word Office Add-in, following the patterns established by the Excel and PowerPoint plugins. The Word agent will support document editing, creation, formatting, tables, images, comments, tracked changes (redlining), annotations, content controls, and search — covering PE/law use cases.

## Key Findings from Word JavaScript API

### Platform Support
- **Word Online (Web)**: WordApi 1.1–1.9 — covers body, paragraphs, ranges, tables, content controls, comments, tracked changes, styles, fonts, search, OOXML, inline pictures, fields, annotations, lists, sections, footnotes/endnotes, custom XML, document properties, bookmarks
- **Word Desktop**: WordApiDesktop 1.1–1.4 — adds shapes, revisions (advanced), pages, windows, panes, page setup, bibliography, frames, canvas, selection object, and more

### Screenshotting via PDF Export (Desktop/Mac/iPad Only)
Unlike Excel (`range.getImage()`) and PowerPoint (`slide.getImageAsBase64()`), Word has no direct API to screenshot a page. However, a **PDF export → pdf-to-images → read PNGs** pipeline works on desktop:

1. `Office.context.document.getFileAsync(Office.FileType.Pdf)` → get document as PDF slices
2. Reassemble slices into a complete PDF, write to VFS
3. `pdf-to-images /home/user/doc-preview.pdf /home/user/doc-pages/ --pages=1-3` → render as PNGs
4. `read` tool → visually inspect the page images

**Platform support for `getFileAsync`:**
| | Web | Windows | Mac | iPad |
|--|-----|---------|-----|------|
| **Word** | ❌ Not supported | ✅ Compressed, Pdf, Text | ✅ Compressed, Pdf, Text | ✅ Compressed, Pdf |

**Implication**: Screenshot is a **desktop/Mac-only** tool. On Word Online, the agent relies on text-based inspection (`get_document_text`, `getOoxml`, `getHtml`). The tool should gracefully detect the platform and explain the limitation if called on web.

Other read-back options (all platforms):
- `getHtml()` on Body/Range/Paragraph — HTML representation (not pixel-perfect)
- `getOoxml()` on Body/Range/Paragraph — raw OOXML markup
- `InlinePicture.getBase64ImageSrc()` — extracts existing inline images

### OOXML Manipulation — Similar to PPT
Word supports `insertOoxml()` and `getOoxml()` on Body, Paragraph, Range, and ContentControl. This is the power tool for:
- Inserting richly formatted content (styled text, tables with formatting, images, SmartArt, charts)
- Inserting content controls for structured documents
- Complex formatting not exposed via Office.js properties

Unlike PPT where we export/import slides as ZIP (PPTX), Word OOXML is inserted as a flat XML package string (the `pkg:package` format). This is simpler than PPT's ZIP manipulation.

### Rich Comment and Change Tracking APIs
- **Comments** (WordApi 1.4): `Range.insertComment(text)`, `Comment.reply(text)`, `Comment.delete()`, `Comment.resolved`, replies collection
- **Tracked Changes** (WordApi 1.6): `TrackedChange.accept()`, `.reject()`, `.author`, `.date`, `.text`, `.type` (Added/Deleted/Formatted), collection with `acceptAll()`/`rejectAll()`
- **Change Tracking Mode** (WordApi 1.4): `Document.changeTrackingMode` = "Off" | "TrackAll" | "TrackMineOnly"
- **Annotations** (WordApi 1.7-1.8): `Paragraph.insertAnnotations()` — critique-style underlining with colored indicators and popup actions (suggestions). Great for AI writing assistance.
- **Revisions** (Desktop 1.4): More detailed revision tracking with `Revision.type` (Insert/Delete/Property/Style/MovedFrom/MovedTo etc.), `Revision.accept()`/`.reject()`

### Content Controls — Key for PE/Law
Content controls are structured document elements that serve as placeholders, form fields, or bounded regions:
- Types: RichText, PlainText, CheckBox, DropDownList, ComboBox, DatePicker, Picture, BuildingBlockGallery, RepeatingSection, Group
- Can be inserted programmatically: `Paragraph.insertContentControl(type)`
- Named and identified by tag/title for binding
- Support for OOXML insertion of content controls
- Events: onDataChanged, onDeleted, onEntered, onExited, onSelectionChanged

### Search and Replace
- `body.search(text, options)` returns a `RangeCollection`
- Options: ignorePunct, ignoreSpace, matchCase, matchPrefix, matchSuffix, matchWholeWord, matchWildcards
- Wildcard support (like regex): `?`, `*`, `<`, `>`, `[]`, `{n}`, `@`
- Special characters: `^p` (paragraph), `^t` (tab), `^d` (field), etc.
- Each search result is a Range that can be modified

### Document Structure Navigation
- `Document.body` → paragraphs, tables, content controls, inline pictures, lists
- `Document.sections` → headers, footers per section
- `Paragraph.style` / `.styleBuiltIn` — get/set paragraph styles (Heading1, Normal, etc.)
- `Paragraph.font` — font properties
- `Paragraph.listItem` — list membership
- `Paragraph.alignment`, `.outlineLevel`, `.firstLineIndent`, etc.
- `Range` — contiguous text area with full text manipulation
- `Table` — rows, columns, cells, merging, borders, shading
- `Section` — headers/footers (HeaderPrimary, FooterPrimary, etc.)

---

## Tool Design

### Why fewer tools than PPT

PPT needs 11 tools because of the complex ZIP export/import dance (`withSlideZip`) — the LLM can't reasonably write that plumbing from scratch. Word's API is **much more straightforward**: `insertOoxml()` / `getOoxml()` are direct one-call methods on Body/Paragraph/Range. Comments, tracked changes, search, tables, images, formatting — all simple `Word.run()` code the LLM writes through `execute_office_js` with good system prompt guidance.

The dedicated tools exist only where there's real plumbing the LLM can't do inline, or where a convenience tool saves significant token waste on boilerplate.

### Tool List (5 tools + 2 shared)

#### FILES & SHELL (shared)
- `read` — Read uploaded files (images, CSV, text)
- `bash` — Sandboxed virtual filesystem with custom commands

#### WORD-SPECIFIC
| Tool | Why it's a tool |
|------|----------------|
| `execute_office_js` | The workhorse. Everything — comments, tracked changes, search, tables, images, formatting, OOXML, headers/footers, content controls — is done through this. System prompt provides recipes. |
| `screenshot_document` | Real plumbing: PDF slice reassembly + VFS write + `pdf-to-images` invocation + image return. Can't be done inline. Desktop only. |
| `get_document_text` | Called constantly. Saves the LLM from writing load/sync boilerplate every turn to read paragraph text+styles. |
| `get_document_structure` | Same rationale — structural overview (headings, tables, content controls, sections) is needed at the start of almost every task. |
| `get_paragraph_ooxml` | Reading OOXML is the prerequisite before any OOXML edit. Saves boilerplate and ensures the LLM always reads before writing. |

Everything else (comments CRUD, tracked changes accept/reject, search/replace, insert table, insert image, format range, headers/footers, content controls) is done via **`execute_office_js`** guided by system prompt examples.

### Tool Specifications

#### `screenshot_document`
```typescript
parameters: {
  pages?: string,  // e.g. "1-3" or "1,3,5". Default: "1"
  scale?: number,  // render scale, default 2
}
```
**Flow:** `getFileAsync(Pdf)` → reassemble slices → write VFS → `pdf-to-images` → return PNGs.

**Platform note:** `getFileAsync` is **not supported in Word on the web**. Returns a clear error suggesting `get_document_text` instead.

#### `get_document_text`
```typescript
parameters: {
  startParagraph?: number,  // 0-based, default 0
  endParagraph?: number,    // exclusive, default all
  includeFormatting?: boolean // include style names, list info
}
```
Returns paragraphs with text, style, list level, and index.

#### `get_document_structure`
```typescript
parameters: {} // no params
```
Returns: heading outline, table locations, content control locations, section count, paragraph count.

#### `get_paragraph_ooxml`
```typescript
parameters: {
  paragraphIndex: number,  // 0-based
}
```
Returns raw OOXML of the paragraph.

#### `execute_office_js`
Same pattern as PPT/Excel — runs arbitrary code in `Word.run()` with `context`. The system prompt provides extensive recipes for all common operations.

---

## Custom VFS Commands

Same as PowerPoint:
- `pdf-to-text <file> <outfile>`
- `docx-to-text <file> <outfile>`
- `xlsx-to-csv <file> <outfile> [sheet]`
- `web-search <query> [--max=N]`
- `web-fetch <url> <outfile>`

---

## Document Metadata (injected per turn)

```typescript
interface WordDocumentMetadata {
  paragraphCount: number;
  sectionCount: number;
  tableCount: number;
  contentControlCount: number;
  commentCount: number;
  trackedChangeCount: number;
  changeTrackingMode: "Off" | "TrackAll" | "TrackMineOnly";
  headingOutline: Array<{ text: string; level: number; paragraphIndex: number }>;
  hasContent: boolean;
  savedState: boolean;
}
```

---

## System Prompt Design

The system prompt should cover:

1. **Office.js API Reference** — Point to the word-officejs-api.d.ts file in VFS
2. **Tool Descriptions** — List all available tools with usage patterns
3. **Code Pattern** — `Word.run(async (context) => { ... })` with load/sync pattern
4. **Key Rules**:
   - Always `load()` properties before reading them
   - Call `context.sync()` to execute operations
   - Return JSON-serializable results
   - Use paragraph indices (0-based) for targeting content
   - Use built-in style names for formatting (Heading1, Normal, ListBullet, etc.)
   - Escape XML in OOXML insertions
   - Read before writing — always inspect existing content/formatting before modifying
5. **OOXML Guidance**:
   - Minimal OOXML package structure (just `.rels` + `document.xml`)
   - How to insert formatted text, tables, images via OOXML
   - When to use OOXML vs Office.js API
6. **Comment and Tracked Changes Workflow**:
   - For PE/law review: reading, accepting/rejecting changes
   - Adding comments on specific ranges
   - Enabling/disabling track changes
7. **Search and Replace Patterns**:
   - Using wildcards for complex find/replace
   - Batch operations on search results
8. **Content Control Usage**:
   - For template/form filling in legal documents
   - Named content controls as placeholders
9. **Document Creation Best Practices**:
   - Use built-in styles (Heading1-4, Normal, ListBullet, etc.)
   - Consistent heading hierarchy
   - Proper paragraph spacing
   - Professional fonts

---

## Architecture — Comparison with PPT/Excel

| Aspect | Excel | PowerPoint | Word |
|--------|-------|------------|------|
| **Screenshot** | ✅ `range.getImage()` | ✅ `slide.getImageAsBase64()` | ⚠️ Desktop only: `getFileAsync(Pdf)` → `pdf-to-images` |
| **Content read** | Cell values, formulas | Shape text via OOXML | Paragraph text, OOXML |
| **Content write** | Cell ranges, objects | Shape OOXML, Office.js | Paragraphs, OOXML, HTML |
| **OOXML** | Not used | Slide ZIP export/import | Flat XML package insert |
| **Key domain** | Data analysis, charting | Visual design, diagrams | Document editing, legal review |
| **Comments** | N/A | N/A | ✅ Full CRUD |
| **Tracked Changes** | N/A | N/A | ✅ Full CRUD |
| **Annotations** | N/A | N/A | ✅ Critique/suggestions |
| **Content Controls** | N/A | N/A | ✅ Form fields |

### Key Difference from PPT
- PPT uses ZIP-based slide export/import for OOXML manipulation
- Word uses flat `insertOoxml()` / `getOoxml()` directly on Range/Body/Paragraph — **much simpler**
- No need for a `slide-zip.ts` equivalent
- Word does NOT need a `withSlideZip` pattern

### Key Difference from Excel
- Excel is cell/range oriented with coordinate-based addressing
- Word is paragraph/range oriented with linear document flow
- Word has much richer text formatting (styles, heading hierarchy, lists)
- Word has comments and tracked changes which Excel doesn't expose

---

## PE/Law Use Cases Covered

1. **Document Review**: Read document, get comments, get tracked changes, accept/reject changes
2. **Redlining**: Enable tracking, make changes (inserts/deletes appear as tracked), manage change acceptance
3. **Comment Management**: Add comments on specific text ranges, reply to comments, resolve/reopen
4. **Document Drafting**: Create new documents with proper heading structure, numbered lists, tables
5. **Template Filling**: Use content controls to fill in forms, placeholders in legal templates
6. **Search and Replace**: Find/replace text with wildcards (e.g., replace all "Party A" with specific name)
7. **Formatting**: Apply consistent styling (fonts, headings, paragraph spacing) to legal documents
8. **Headers/Footers**: Add/edit document headers and footers (confidentiality notices, page numbers)
9. **Tables**: Insert and format tables (e.g., deal terms, comparison tables, schedules)
10. **OOXML Power**: Insert complex formatted content (styled tables, numbered clauses, etc.)
11. **Annotations/Suggestions**: AI-powered writing suggestions with accept/reject UI via annotations API
12. **Bookmarks**: Navigate to and manage bookmarks in contracts/agreements

---

## File Structure (Proposed)

```
packages/word/
├── src/
│   ├── lib/
│   │   ├── adapter.tsx            # WordAdapter implementing AppAdapter
│   │   ├── system-prompt.ts       # Word system prompt (heavy — recipes for execute_office_js)
│   │   ├── docs/
│   │   │   ├── word-officejs-api.d.ts         # Full API (76K lines, includes Desktop)
│   │   │   └── word-officejs-api-online.d.ts  # Online/release API (22K lines)
│   │   ├── tools/
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── execute-office-js.ts
│   │   │   ├── screenshot-document.ts
│   │   │   ├── get-document-text.ts
│   │   │   ├── get-document-structure.ts
│   │   │   └── get-paragraph-ooxml.ts
│   │   ├── vfs/
│   │   │   └── custom-commands.ts
│   │   └── components/
│   │       └── selection-indicator.tsx
│   ├── taskpane/
│   │   ├── index.html
│   │   └── taskpane.tsx
│   └── manifest.xml
├── vite.config.ts
├── tsconfig.json
├── package.json
└── CHANGELOG.md
```

---

## d.ts Reference Files — Routing Approach

Include **both** d.ts files and let the agent grep the right one based on context:

- `/home/user/docs/word-officejs-api.d.ts` — Full preview API (76K lines, includes WordApiDesktop)
- `/home/user/docs/word-officejs-api-online.d.ts` — Release/online API (22K lines, WordApi 1.1–1.9)

The system prompt should say:
> Two API reference files are available:
> - `/home/user/docs/word-officejs-api.d.ts` — Full API including desktop-only features (WordApiDesktop). Use for desktop Word (Windows/Mac).
> - `/home/user/docs/word-officejs-api-online.d.ts` — Web-compatible API (WordApi 1.1–1.9). Use for Word Online.
>
> When unsure which platform, default to the online API. For desktop-only features (shapes, pages, revisions, PDF export, window management), grep the full API.

This avoids the need to trim/merge and gives the agent full access to both API surfaces. Assume latest versions for both platforms.
