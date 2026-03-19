import { describe, expect, it } from "vitest";
import {
  columnIndexToLetter,
  parseCsv,
  parseStartCell,
  buildRangeAddress,
  coerceValue,
  rgbToHex,
} from "../src/lib/vfs/command-utils";

describe("columnIndexToLetter", () => {
  it("converts 0-indexed columns to letters", () => {
    expect(columnIndexToLetter(0)).toBe("A");
    expect(columnIndexToLetter(1)).toBe("B");
    expect(columnIndexToLetter(25)).toBe("Z");
  });

  it("handles multi-letter columns", () => {
    expect(columnIndexToLetter(26)).toBe("AA");
    expect(columnIndexToLetter(27)).toBe("AB");
    expect(columnIndexToLetter(51)).toBe("AZ");
    expect(columnIndexToLetter(52)).toBe("BA");
  });

  it("handles triple-letter columns", () => {
    // Column 702 = AAA (26 + 26*26 = 702)
    expect(columnIndexToLetter(702)).toBe("AAA");
  });
});

describe("parseCsv", () => {
  it("parses simple CSV", () => {
    expect(parseCsv("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields", () => {
    expect(parseCsv('"hello, world",b')).toEqual([["hello, world", "b"]]);
  });

  it("handles escaped quotes inside quoted fields", () => {
    expect(parseCsv('"say ""hi""",b')).toEqual([['say "hi"', "b"]]);
  });

  it("handles CRLF line endings", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("handles empty fields", () => {
    expect(parseCsv("a,,c\n,2,")).toEqual([
      ["a", "", "c"],
      ["", "2", ""],
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });

  it("handles single field", () => {
    expect(parseCsv("hello")).toEqual([["hello"]]);
  });

  it("handles trailing newline", () => {
    expect(parseCsv("a,b\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("handles newlines inside quoted fields", () => {
    expect(parseCsv('"line1\nline2",b')).toEqual([["line1\nline2", "b"]]);
  });
});

describe("parseStartCell", () => {
  it("parses A1 to col 0, row 0", () => {
    expect(parseStartCell("A1")).toEqual({ col: 0, row: 0 });
  });

  it("parses B3 to col 1, row 2", () => {
    expect(parseStartCell("B3")).toEqual({ col: 1, row: 2 });
  });

  it("parses AA1 to col 26, row 0", () => {
    expect(parseStartCell("AA1")).toEqual({ col: 26, row: 0 });
  });

  it("handles lowercase input", () => {
    expect(parseStartCell("c5")).toEqual({ col: 2, row: 4 });
  });

  it("returns 0,0 for invalid input", () => {
    expect(parseStartCell("invalid")).toEqual({ col: 0, row: 0 });
  });
});

describe("buildRangeAddress", () => {
  it("builds range from A1 for 3 rows × 2 cols", () => {
    expect(buildRangeAddress("A1", 3, 2)).toBe("A1:B3");
  });

  it("builds range from C5 for 1 row × 1 col", () => {
    expect(buildRangeAddress("C5", 1, 1)).toBe("C5:C5");
  });

  it("builds range spanning multi-letter columns", () => {
    expect(buildRangeAddress("Z1", 2, 3)).toBe("Z1:AB2");
  });
});

describe("coerceValue", () => {
  it("returns empty string for empty input", () => {
    expect(coerceValue("")).toBe("");
  });

  it("coerces numeric strings to numbers", () => {
    expect(coerceValue("42")).toBe(42);
    expect(coerceValue("3.14")).toBe(3.14);
    expect(coerceValue("-7")).toBe(-7);
    expect(coerceValue("0")).toBe(0);
  });

  it("coerces boolean strings to booleans", () => {
    expect(coerceValue("true")).toBe(true);
    expect(coerceValue("false")).toBe(false);
    expect(coerceValue("TRUE")).toBe(true);
    expect(coerceValue("False")).toBe(false);
  });

  it("keeps non-numeric strings as strings", () => {
    expect(coerceValue("hello")).toBe("hello");
    expect(coerceValue("12abc")).toBe("12abc");
  });
});

describe("rgbToHex", () => {
  it("converts black", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("converts white", () => {
    expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
  });

  it("converts primary colors", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
    expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
  });

  it("pads single-digit hex values", () => {
    expect(rgbToHex(1, 2, 3)).toBe("#010203");
  });
});
