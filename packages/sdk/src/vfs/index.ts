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
    bmp: "image/bmp",
  };

  if (ext in imageExts) {
    return { isImage: true, mimeType: imageExts[ext] };
  }

  const mimeTypes: Record<string, string> = {
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    svg: "image/svg+xml",
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

export function detectImageMimeType(
  data: Uint8Array,
  fallback: string,
): string {
  if (data.length < 4) return fallback;

  // JPEG: FF D8 FF
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    return "image/png";
  }
  // GIF: 47 49 46 38
  if (
    data[0] === 0x47 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x38
  ) {
    return "image/gif";
  }
  // WebP: RIFF....WEBP
  if (
    data.length >= 12 &&
    data[0] === 0x52 &&
    data[1] === 0x49 &&
    data[2] === 0x46 &&
    data[3] === 0x46 &&
    data[8] === 0x57 &&
    data[9] === 0x45 &&
    data[10] === 0x42 &&
    data[11] === 0x50
  ) {
    return "image/webp";
  }
  // BMP: 42 4D
  if (data[0] === 0x42 && data[1] === 0x4d) {
    return "image/bmp";
  }

  return fallback;
}

export function toBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}
