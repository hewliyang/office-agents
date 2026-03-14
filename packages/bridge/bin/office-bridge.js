#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const binDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(binDir, "..");
const distCli = path.join(packageDir, "dist", "cli.js");

const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const result = spawnSync(command, ["build"], {
  cwd: packageDir,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

await import(pathToFileURL(distCli).href);
