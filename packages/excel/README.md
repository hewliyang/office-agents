# @office-agents/excel

Excel Add-in with an integrated AI chat panel. Connects to major LLM providers using your own credentials (BYOK) and can read/write spreadsheets through built-in tools, a sandboxed shell, and a virtual filesystem.

## Install

Download [`manifest.prod.xml`](./manifest.prod.xml), then follow the instructions for your platform:

### Windows
1. **Insert** → **Add-ins** → **My Add-ins**
2. **Upload My Add-in**
3. Select `manifest.prod.xml`
4. Open the add-in from the ribbon

### macOS
1. Copy `manifest.prod.xml` to:
   `~/Library/Containers/com.microsoft.Excel/Data/Documents/wef/`
2. Restart Excel
3. **Insert** → **Add-ins** → **My Add-ins**
4. Select the add-in

### Excel Web
1. Open [excel.office.com](https://excel.office.com)
2. **Insert** → **Add-ins** → **More Add-ins**
3. **Upload My Add-in**
4. Upload `manifest.prod.xml`

## Tools

| Tool | What it does |
|------|---------------|
| `get_cell_ranges` | Read cell values, formulas, and formats |
| `get_range_as_csv` | Export a range as CSV for analysis |
| `search_data` | Search worksheet data by text |
| `screenshot_range` | Capture a range as an image |
| `get_all_objects` | List tables, charts, pivots, and other objects |
| `set_cell_range` | Write values/formulas/formats to cells |
| `clear_cell_range` | Clear cell contents and/or formatting |
| `copy_to` | Copy ranges with formula translation |
| `modify_sheet_structure` | Insert/delete/hide rows/columns, freeze panes |
| `modify_workbook_structure` | Create/delete/rename/reorder sheets |
| `resize_range` | Resize row heights and column widths |
| `modify_object` | Create/update/delete charts/tables/pivots |
| `eval_officejs` | Run raw Office.js inside Excel.run (sandboxed) |
| `read` | Read text files and images from the virtual filesystem |
| `bash` | Run commands in the sandboxed shell |

## Bash custom commands

| Command | What it does |
|---------|---------------|
| `csv-to-sheet` | Import CSV from VFS to a worksheet |
| `sheet-to-csv` | Export worksheet data to CSV |
| `pdf-to-text` | Extract text from PDF files |
| `pdf-to-images` | Render PDF pages to PNG images |
| `docx-to-text` | Extract text from DOCX files |
| `xlsx-to-csv` | Convert uploaded spreadsheet files to CSV |
| `image-to-sheet` | Paint an image into Excel as pixel-art cells |
| `web-search` | Search the web using configured provider |
| `web-fetch` | Fetch web pages/files into VFS |

## Development

```bash
pnpm dev-server:excel    # Start dev server (https://localhost:3000)
pnpm start:excel         # Launch Excel with add-in sideloaded
```
