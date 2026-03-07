/**
 * Virtual Filesystem (VFS) for the agent
 *
 * Provides an in-memory filesystem using just-bash that allows:
 * - Users to upload files (images, CSVs, etc.)
 * - Agent to read files via read_file tool
 * - Agent to execute bash commands via bash tool
 */

import { Bash, type CustomCommand, InMemoryFs } from "just-bash/browser";

export { getSharedCustomCommands } from "./custom-commands";

let fs: InMemoryFs | null = null;
let bash: Bash | null = null;

let skillFilesCache: Record<string, Uint8Array | string> = {};
let staticFiles: Record<string, string> = {};

let customCommandsFactory: (() => CustomCommand[]) | null = null;

export function setSkillFiles(
  files: Record<string, Uint8Array | string>,
): void {
  skillFilesCache = files;
}

export function setStaticFiles(files: Record<string, string>): void {
  staticFiles = files;
}

export function setCustomCommands(factory: () => CustomCommand[]): void {
  customCommandsFactory = factory;
}

export function getVfs(): InMemoryFs {
  if (!fs) {
    fs = new InMemoryFs({
      "/home/user/uploads/.keep": "",
      ...staticFiles,
      ...skillFilesCache,
    });
  }
  return fs;
}

export function getBash(): Bash {
  if (!bash) {
    bash = new Bash({
      fs: getVfs(),
      cwd: "/home/user",
      customCommands: customCommandsFactory?.() ?? [],
    });
  }
  return bash;
}

export function resetVfs(): void {
  fs = null;
  bash = null;
}

export async function snapshotVfs(): Promise<
  { path: string; data: Uint8Array }[]
> {
  const vfs = getVfs();
  const allPaths = vfs.getAllPaths();
  const files: { path: string; data: Uint8Array }[] = [];

  for (const p of allPaths) {
    if (p.startsWith("/home/skills/")) continue;
    try {
      const stat = await vfs.stat(p);
      if (stat.isFile) {
        const data = await vfs.readFileBuffer(p);
        files.push({ path: p, data });
      }
    } catch {
      // skip unreadable entries
    }
  }

  return files;
}

export async function restoreVfs(
  files: { path: string; data: Uint8Array }[],
): Promise<void> {
  resetVfs();

  if (files.length === 0) {
    getVfs();
    return;
  }

  const initialFiles: Record<string, Uint8Array | string> = {
    "/home/user/uploads/.keep": "",
    ...staticFiles,
    ...skillFilesCache,
  };
  for (const f of files) {
    initialFiles[f.path] = f.data;
  }

  fs = new InMemoryFs(initialFiles);
  bash = null;
}

export async function writeFile(
  path: string,
  content: string | Uint8Array,
): Promise<void> {
  const vfs = getVfs();
  const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;

  const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));
  if (dir && dir !== "/") {
    try {
      await vfs.mkdir(dir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  await vfs.writeFile(fullPath, content);
}

export async function readFile(path: string): Promise<string> {
  const vfs = getVfs();
  const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
  return vfs.readFile(fullPath);
}

export async function readFileBuffer(path: string): Promise<Uint8Array> {
  const vfs = getVfs();
  const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
  return vfs.readFileBuffer(fullPath);
}

export async function fileExists(path: string): Promise<boolean> {
  const vfs = getVfs();
  const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
  return vfs.exists(fullPath);
}

export async function deleteFile(path: string): Promise<void> {
  const vfs = getVfs();
  const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
  await vfs.rm(fullPath);
}

export async function listUploads(): Promise<string[]> {
  const vfs = getVfs();
  try {
    const entries = await vfs.readdir("/home/user/uploads");
    return entries.filter((e) => e !== ".keep");
  } catch {
    return [];
  }
}

export function getFileType(filename: string): {
  isImage: boolean;
  mimeType: string;
} {
  const ext = filename.toLowerCase().split(".").pop() || "";
  const imageExts: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",
  };

  if (ext in imageExts) {
    return { isImage: true, mimeType: imageExts[ext] };
  }

  const mimeTypes: Record<string, string> = {
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    xml: "application/xml",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    ts: "application/typescript",
    md: "text/markdown",
    pdf: "application/pdf",
  };

  return {
    isImage: false,
    mimeType: mimeTypes[ext] || "application/octet-stream",
  };
}

export function toBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}
