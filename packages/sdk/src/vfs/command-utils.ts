export function parsePageRanges(spec: string, maxPage: number): Set<number> {
  const pages = new Set<number>();
  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    const rangeParts = trimmed.split("-");
    if (rangeParts.length === 2) {
      const start = Math.max(1, Number.parseInt(rangeParts[0], 10));
      const end = Math.min(maxPage, Number.parseInt(rangeParts[1], 10));
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        for (let i = start; i <= end; i++) pages.add(i);
      }
    } else {
      const page = Number.parseInt(trimmed, 10);
      if (!Number.isNaN(page) && page >= 1 && page <= maxPage) {
        pages.add(page);
      }
    }
  }
  return pages;
}

export function parseFlags(args: string[]): {
  flags: Record<string, string>;
  positional: string[];
} {
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  for (const arg of args) {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      flags[match[1]] = match[2];
    } else if (arg === "--json") {
      flags.json = "true";
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}
