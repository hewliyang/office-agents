# Word OOXML Reading: Known Gaps

## The core problem

`get_paragraph_ooxml` gives the agent a **paragraph-only** view of the document.
Word documents are not paragraph-only. The direct children of `<w:body>` are:

- `<w:p>` — paragraphs
- `<w:tbl>` — tables (containing rows → cells → paragraphs)
- `<w:sdt>` — structured document tags / content controls (wrapping paragraphs, tables, or other SDTs)
- `<w:sectPr>` — section properties

The current tool flattens everything to just `<w:p>` elements.
This means the agent can read paragraph text and formatting, but loses all structural context.

## What breaks in practice

### 1. Table context is lost

When a paragraph lives inside a table cell, the agent gets the `<w:p>` but not:

```xml
<w:tbl>
  <w:tblPr>...</w:tblPr>       <!-- table properties: borders, widths, style -->
  <w:tblGrid>...</w:tblGrid>   <!-- column definitions -->
  <w:tr>
    <w:trPr>...</w:trPr>       <!-- row properties: height, header row -->
    <w:tc>
      <w:tcPr>...</w:tcPr>     <!-- cell properties: width, merge, shading -->
      <w:p>...</w:p>            <!-- ← we return this, but without the above -->
    </w:tc>
  </w:tr>
</w:tbl>
```

So if the agent wants to edit a table cell paragraph and write it back via `insertOoxml()`,
it can't reconstruct valid OOXML for the cell context. It would need the `<w:tc>` wrapper
at minimum, and ideally the `<w:tblPr>` / `<w:tblGrid>` to understand column widths.

### 2. Content control wrappers are stripped

`<w:sdt>` blocks wrap content and carry:
- tag, title, alias
- lock settings
- data bindings
- type info (rich text, plain text, date picker, etc.)

The agent sees the inner paragraphs but not the SDT wrapper, so it can't:
- preserve content control boundaries when editing
- understand that certain content is a form field / placeholder

### 3. No way to read table OOXML directly

`get_paragraph_ooxml` is indexed by `body.paragraphs`, which is a flat list.
There's no equivalent for "give me the OOXML of table N" or "give me the OOXML of cell (R, C) in table N".

The agent can read table content via `execute_office_js` (load cell text, formatting, etc.),
but if it needs the raw OOXML for a table — e.g. to inspect complex formatting, merged cells,
or cell-level shading that Office.js doesn't fully expose — there's no tool for that.

### 4. Section properties are invisible

`<w:sectPr>` controls page size, margins, columns, headers/footers linkage.
The agent has no OOXML-level view of these.

## Possible solutions

### Option A: Replace `get_paragraph_ooxml` with `get_body_ooxml`

Return all direct children of `<w:body>` (preserving structure), with a range parameter.

Instead of paragraph indices, use body-child indices:
- body child 0 might be a `<w:p>`
- body child 1 might be a `<w:tbl>` (containing many paragraphs)
- body child 2 might be an `<w:sdt>`

This gives the agent the real document structure in OOXML form.

Problem: body-child indices don't map to `body.paragraphs` indices,
so the agent would need `get_document_structure` to map between them.

### Option B: Add a `get_table_ooxml` tool

Keep `get_paragraph_ooxml` for simple paragraph editing.
Add a separate tool for table OOXML by table index, optionally scoped to specific rows/cells.

```
get_table_ooxml(tableIndex, startRow?, endRow?)
```

Returns the `<w:tbl>` XML (or a subset of rows) with styles.

This is probably the most immediately useful addition, since tables are
the main structure type where paragraph-only extraction fails.

### Option C: `get_range_ooxml` — return raw body children for a range

A more general tool: given a paragraph range, return the OOXML as it actually
appears in `<w:body>` — preserving `<w:tbl>`, `<w:sdt>`, etc. as-is.

The extraction logic would walk `<w:body>` children and include any element
that contains or overlaps with the selected paragraph range.

So if paragraphs 5-8 live inside a table, you'd get back the full `<w:tbl>`
(or at least the relevant rows), not just the flattened `<w:p>` list.

This is the most correct approach but also the most complex to implement
(need to map paragraph indices back to body-level elements).

### Option D: Hybrid — keep current tool, add `includeContainer` flag

Add an optional flag to `get_paragraph_ooxml`:

```
get_paragraph_ooxml(paragraphIndex, endParagraphIndex?, includeContainer?)
```

When `includeContainer` is true:
- if the paragraph is a direct body child → return `<w:p>` as today
- if it's inside a `<w:tc>` → return the `<w:tc>` (with `<w:tcPr>`)
- if it's inside an `<w:sdt>` → return the `<w:sdt>` wrapper

This keeps the simple case simple but gives the agent structural context when needed.

## Recommendation

**Option B first, then Option C if needed.**

- `get_table_ooxml` covers the most common gap (table editing)
- it's simple to implement: `body.tables.items[i].getRange().getOoxml()`
- the agent already knows table indices from `get_document_structure`
- can scope to specific rows to keep output small

Option C is the "correct" general solution but may not be worth the complexity yet.
Option D is a reasonable middle ground but muddies the `get_paragraph_ooxml` API.

## Related: `get_document_structure` gaps

`get_document_structure` returns table indices, row counts, and styles,
but doesn't report column counts or cell merge info.
If we add `get_table_ooxml`, the structure tool should probably also report column counts
so the agent knows the table shape before requesting OOXML.
