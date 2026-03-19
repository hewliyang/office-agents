export function columnIndexToLetter(index: number): string {
  let letter = "";
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n") {
        row.push(current);
        current = "";
        if (row.length > 0) rows.push(row);
        row = [];
      } else if (ch === "\r") {
        // skip, \n will handle the row break
      } else {
        current += ch;
      }
    }
  }

  // Final field/row
  row.push(current);
  if (row.some((cell) => cell !== "")) rows.push(row);

  return rows;
}

export function parseStartCell(startCell: string): {
  col: number;
  row: number;
} {
  const match = startCell.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return { col: 0, row: 0 };
  const col =
    match[1]
      .toUpperCase()
      .split("")
      .reduce((acc, c) => acc * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const row = Number.parseInt(match[2], 10) - 1;
  return { col, row };
}

export function buildRangeAddress(
  startCell: string,
  rows: number,
  cols: number,
): string {
  const { col, row } = parseStartCell(startCell);
  const endCol = columnIndexToLetter(col + cols - 1);
  const endRow = row + rows;
  return `${startCell}:${endCol}${endRow}`;
}

export function coerceValue(raw: string): string | number | boolean {
  if (raw === "") return "";
  if (raw.toLowerCase() === "true") return true;
  if (raw.toLowerCase() === "false") return false;
  const num = Number(raw);
  if (!Number.isNaN(num) && raw.trim() !== "") return num;
  return raw;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
