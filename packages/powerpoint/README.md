# @office-agents/powerpoint

PowerPoint Add-in with an integrated AI chat panel. Connects to major LLM providers using your own credentials (BYOK) and can read/write presentations through built-in tools, a sandboxed shell, and a virtual filesystem.

## Install

Download [`manifest.prod.xml`](./manifest.prod.xml), then follow the instructions for your platform:

### Windows
1. **Insert** → **Add-ins** → **My Add-ins**
2. **Upload My Add-in**
3. Select `manifest.prod.xml`
4. Open the add-in from the ribbon

### macOS
1. Copy `manifest.prod.xml` to:
   `~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef/`
2. Restart PowerPoint
3. **Insert** → **Add-ins** → **My Add-ins**
4. Select the add-in

### PowerPoint Web
1. Open [powerpoint.office.com](https://powerpoint.office.com)
2. **Insert** → **Add-ins** → **More Add-ins**
3. **Upload My Add-in**
4. Upload `manifest.prod.xml`

## Tools

| Tool | What it does |
|------|---------------|
| `screenshot_slide` | Take a screenshot of a slide for visual verification |
| `list_slide_shapes` | List all shapes on a slide with IDs, names, types, positions |
| `read_slide_text` | Read text content from slide shapes (by shape ID) |
| `verify_slides` | Verify slide layout and content |
| `execute_office_js` | Run raw Office.js inside PowerPoint.run (sandboxed) |
| `edit_slide_text` | Edit text in slide shapes via OOXML |
| `edit_slide_xml` | Edit raw slide XML for advanced layout changes |
| `edit_slide_chart` | Edit chart data and styling in slides |
| `edit_slide_master` | Edit slide master/layout themes |
| `duplicate_slide` | Duplicate an existing slide |
| `read` | Read text files and images from the virtual filesystem |
| `bash` | Run commands in the sandboxed shell |

## Bash custom commands

| Command | What it does |
|---------|---------------|
| `pdf-to-text` | Extract text from PDF files |
| `pdf-to-images` | Render PDF pages to PNG images |
| `docx-to-text` | Extract text from DOCX files |
| `xlsx-to-csv` | Convert uploaded spreadsheet files to CSV |
| `insert-image` | Insert an image into a slide |
| `web-search` | Search the web using configured provider |
| `web-fetch` | Fetch web pages/files into VFS |

## Development

```bash
pnpm dev-server:ppt    # Start dev server (https://localhost:3001)
pnpm start:ppt         # Launch PowerPoint with add-in sideloaded
```
