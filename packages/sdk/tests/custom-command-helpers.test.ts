import { describe, expect, it } from "vitest";
import { parseFlags, parsePageRanges } from "../src/vfs/command-utils";

describe("parsePageRanges", () => {
  it("parses single pages", () => {
    expect(parsePageRanges("1,3,5", 10)).toEqual(new Set([1, 3, 5]));
  });

  it("parses ranges", () => {
    expect(parsePageRanges("2-5", 10)).toEqual(new Set([2, 3, 4, 5]));
  });

  it("parses mixed single pages and ranges", () => {
    expect(parsePageRanges("1,3-5,8", 10)).toEqual(new Set([1, 3, 4, 5, 8]));
  });

  it("clamps ranges to maxPage", () => {
    expect(parsePageRanges("8-15", 10)).toEqual(new Set([8, 9, 10]));
  });

  it("ignores pages below 1", () => {
    expect(parsePageRanges("0,-1,1", 10)).toEqual(new Set([1]));
  });

  it("ignores pages above maxPage", () => {
    expect(parsePageRanges("10,11,12", 10)).toEqual(new Set([10]));
  });

  it("returns empty set for empty string", () => {
    expect(parsePageRanges("", 10)).toEqual(new Set());
  });

  it("handles whitespace in spec", () => {
    expect(parsePageRanges(" 1 , 3 - 5 ", 10)).toEqual(
      new Set([1, 3, 4, 5]),
    );
  });

  it("deduplicates overlapping ranges", () => {
    expect(parsePageRanges("1-3,2-4", 10)).toEqual(new Set([1, 2, 3, 4]));
  });
});

describe("parseFlags", () => {
  it("separates flags from positional args", () => {
    const result = parseFlags(["hello", "--max=5", "world"]);
    expect(result.positional).toEqual(["hello", "world"]);
    expect(result.flags).toEqual({ max: "5" });
  });

  it("handles --json as a boolean flag", () => {
    const result = parseFlags(["query", "--json"]);
    expect(result.flags).toEqual({ json: "true" });
    expect(result.positional).toEqual(["query"]);
  });

  it("handles multiple flags", () => {
    const result = parseFlags(["q", "--max=10", "--region=us-en", "--time=w"]);
    expect(result.flags).toEqual({ max: "10", region: "us-en", time: "w" });
    expect(result.positional).toEqual(["q"]);
  });

  it("returns empty flags for no flag args", () => {
    const result = parseFlags(["just", "positional"]);
    expect(result.flags).toEqual({});
    expect(result.positional).toEqual(["just", "positional"]);
  });

  it("returns empty arrays for no args", () => {
    const result = parseFlags([]);
    expect(result.flags).toEqual({});
    expect(result.positional).toEqual([]);
  });
});
