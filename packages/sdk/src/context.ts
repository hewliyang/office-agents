import { Bash, InMemoryFs } from "just-bash/browser";
import type { CustomCommandsResult } from "./vfs/custom-commands";

export interface StorageNamespace {
  dbName: string;
  dbVersion: number;
  localStoragePrefix: string;
  documentSettingsPrefix: string;
  documentIdSettingsKey?: string;
}

const NAMESPACE_DEFAULTS: StorageNamespace = {
  dbName: "OfficeAgentsDB",
  dbVersion: 1,
  localStoragePrefix: "office-agents",
  documentSettingsPrefix: "office-agents",
};

export interface AgentContextOptions {
  namespace?: Partial<StorageNamespace>;
  staticFiles?: Record<string, string>;
  skillFiles?: Record<string, Uint8Array | string>;
  customCommands?: (ns: StorageNamespace) => CustomCommandsResult;
}

export class AgentContext {
  readonly namespace: StorageNamespace;

  private _fs: InMemoryFs | null = null;
  private _bash: Bash | null = null;
  private _staticFiles: Record<string, string>;
  private _skillFiles: Record<string, Uint8Array | string>;
  private _customCommandsFactory:
    | ((ns: StorageNamespace) => CustomCommandsResult)
    | null;

  constructor(opts: AgentContextOptions = {}) {
    this.namespace = { ...NAMESPACE_DEFAULTS, ...opts.namespace };
    this._staticFiles = opts.staticFiles ?? {};
    this._skillFiles = opts.skillFiles ?? {};
    this._customCommandsFactory = opts.customCommands ?? null;
  }

  get vfs(): InMemoryFs {
    if (!this._fs) {
      this._fs = new InMemoryFs({
        "/home/user/uploads/.keep": "",
        ...this._staticFiles,
        ...this._skillFiles,
      });
    }
    return this._fs;
  }

  get bash(): Bash {
    if (!this._bash) {
      this._bash = new Bash({
        fs: this.vfs,
        cwd: "/home/user",
        customCommands:
          this._customCommandsFactory?.(this.namespace).commands ?? [],
      });
    }
    return this._bash;
  }

  async setStaticFiles(files: Record<string, string>): Promise<void> {
    const old = this._staticFiles;
    this._staticFiles = files;
    if (this._fs) {
      await this.patchVfsFiles(old, files);
    }
  }

  async setSkillFiles(
    files: Record<string, Uint8Array | string>,
  ): Promise<void> {
    const old = this._skillFiles;
    this._skillFiles = files;
    if (this._fs) {
      await this.patchVfsFiles(old, files);
    }
  }

  get commandSnippets(): string[] {
    return this._customCommandsFactory?.(this.namespace).promptSnippets ?? [];
  }

  setCustomCommands(
    factory: (ns: StorageNamespace) => CustomCommandsResult,
  ): void {
    this._customCommandsFactory = factory;
    this._bash = null;
  }

  reset(): void {
    this._fs = null;
    this._bash = null;
  }

  private async patchVfsFiles(
    oldFiles: Record<string, Uint8Array | string>,
    newFiles: Record<string, Uint8Array | string>,
  ): Promise<void> {
    const fs = this._fs!;

    for (const p of Object.keys(oldFiles)) {
      if (!(p in newFiles)) {
        try {
          await fs.rm(p);
        } catch {
          // already gone
        }
      }
    }

    for (const [p, content] of Object.entries(newFiles)) {
      const dir = p.substring(0, p.lastIndexOf("/"));
      if (dir && dir !== "/") {
        try {
          await fs.mkdir(dir, { recursive: true });
        } catch {
          // exists
        }
      }
      await fs.writeFile(p, content);
    }

    this._bash = null;
  }

  async restoreVfs(files: { path: string; data: Uint8Array }[]): Promise<void> {
    this.reset();

    if (files.length === 0) {
      // Force VFS initialization
      this.vfs;
      return;
    }

    const initialFiles: Record<string, Uint8Array | string> = {
      "/home/user/uploads/.keep": "",
      ...this._staticFiles,
      ...this._skillFiles,
    };
    for (const f of files) {
      initialFiles[f.path] = f.data;
    }

    this._fs = new InMemoryFs(initialFiles);
    this._bash = null;
  }

  async snapshotVfs(): Promise<{ path: string; data: Uint8Array }[]> {
    const vfs = this.vfs;
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

  async writeFile(path: string, content: string | Uint8Array): Promise<void> {
    const vfs = this.vfs;
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

  async readFile(path: string): Promise<string> {
    const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
    return this.vfs.readFile(fullPath);
  }

  async readFileBuffer(path: string): Promise<Uint8Array> {
    const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
    return this.vfs.readFileBuffer(fullPath);
  }

  async fileExists(path: string): Promise<boolean> {
    const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
    return this.vfs.exists(fullPath);
  }

  async deleteFile(path: string): Promise<void> {
    const fullPath = path.startsWith("/") ? path : `/home/user/uploads/${path}`;
    await this.vfs.rm(fullPath);
  }

  async listUploads(): Promise<string[]> {
    try {
      const entries = await this.vfs.readdir("/home/user/uploads");
      return entries.filter((e) => e !== ".keep");
    } catch {
      return [];
    }
  }
}
