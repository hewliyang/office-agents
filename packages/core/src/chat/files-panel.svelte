<script lang="ts">
  import { toBase64 } from "@office-agents/sdk";
  import {
    Download,
    File,
    FileText,
    FolderOpen,
    Image,
    RefreshCw,
    Trash2,
  } from "lucide-svelte";
  import { onMount } from "svelte";
  import { getChatContext } from "./chat-runtime-context";

  interface VfsFile {
    path: string;
    name: string;
    size: number;
  }

  const EXCLUDED_PREFIXES = ["/bin/", "/usr/", "/dev/", "/proc/"];

  const chat = getChatContext();
  const runtimeState = chat.state;

  let files = $state<VfsFile[]>([]);
  let loading = $state(false);
  let preview = $state<{ path: string; dataUrl: string } | null>(null);

  function isUserFile(path: string): boolean {
    return !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function guessMime(name: string): string {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      csv: "text/csv",
      json: "application/json",
      txt: "text/plain",
      md: "text/markdown",
      html: "text/html",
      xml: "application/xml",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };
    return map[ext] ?? "application/octet-stream";
  }

  function downloadBlob(data: Uint8Array, filename: string, mimeType: string) {
    const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function isImage(name: string) {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext);
  }

  async function refresh() {
    loading = true;
    try {
      const vfs = chat.context.vfs;
      const allPaths = vfs.getAllPaths();
      const result: VfsFile[] = [];

      for (const path of allPaths) {
        if (!isUserFile(path)) continue;
        try {
          const stat = await vfs.stat(path);
          if (stat.isFile) {
            result.push({
              path,
              name: path.split("/").pop() ?? path,
              size: stat.size,
            });
          }
        } catch {
          // skip invalid entries
        }
      }

      result.sort((a, b) => a.path.localeCompare(b.path));
      files = result;
    } finally {
      loading = false;
    }
  }

  async function handleDownload(file: VfsFile) {
    try {
      const data = await chat.context.readFileBuffer(file.path);
      downloadBlob(data, file.name, guessMime(file.name));
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  async function handlePreview(file: VfsFile) {
    try {
      const data = await chat.context.readFileBuffer(file.path);
      const mime = guessMime(file.name);
      if (mime.startsWith("image/")) {
        preview = {
          path: file.path,
          dataUrl: `data:${mime};base64,${toBase64(data)}`,
        };
      }
    } catch (error) {
      console.error("Preview failed:", error);
    }
  }

  async function handleDelete(file: VfsFile) {
    try {
      await chat.context.deleteFile(file.path);
      if (file.path.startsWith("/home/user/uploads/")) {
        await chat.removeUpload(file.path.replace("/home/user/uploads/", ""));
      }
      await refresh();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  const grouped = $derived.by(() => {
    const groups = new Map<string, VfsFile[]>();
    for (const file of files) {
      const dir = file.path.substring(0, file.path.lastIndexOf("/")) || "/";
      if (!groups.has(dir)) groups.set(dir, []);
      groups.get(dir)?.push(file);
    }
    return [...groups.entries()];
  });

  onMount(() => {
    void refresh();
  });

  $effect(() => {
    $runtimeState.vfsInvalidatedAt;
    void refresh();
  });
</script>

<div class="flex-1 overflow-y-auto" style="font-family: var(--chat-font-mono)">
  <div class="flex items-center justify-between px-3 py-2 border-b border-(--chat-border)">
    <span class="text-xs text-(--chat-text-muted)">
      {files.length} file{files.length !== 1 ? "s" : ""}
    </span>
    <button
      type="button"
      onclick={refresh}
      disabled={loading}
      class="p-1 text-(--chat-text-muted) hover:text-(--chat-text-primary) transition-colors disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw size={12} class={loading ? "animate-spin" : ""} />
    </button>
  </div>

  {#if files.length === 0}
    <div class="flex flex-col items-center justify-center gap-2 py-12 text-(--chat-text-muted)">
      <FolderOpen size={24} />
      <span class="text-xs">No files in virtual filesystem</span>
      <span class="text-[10px]">Upload files or let the agent create them</span>
    </div>
  {:else}
    <div class="divide-y divide-(--chat-border)">
      {#each grouped as [dir, dirFiles] (dir)}
        <div>
          <div class="px-3 py-1.5 text-[10px] text-(--chat-text-muted) bg-(--chat-bg-secondary) uppercase tracking-wider">
            {dir}
          </div>
          {#each dirFiles as file (file.path)}
            <div class="flex items-center gap-2 px-3 py-1.5 hover:bg-(--chat-bg-secondary) transition-colors group">
              {#if isImage(file.name)}
                <Image size={14} class="text-(--chat-accent) shrink-0" />
              {:else if ["txt", "md", "csv", "json", "xml", "html", "css", "js", "ts", "py", "sh", "d.ts"].includes(file.name.split(".").pop()?.toLowerCase() ?? "")}
                <FileText size={14} class="text-(--chat-text-muted) shrink-0" />
              {:else}
                <File size={14} class="text-(--chat-text-muted) shrink-0" />
              {/if}

              <div class="flex-1 min-w-0">
                <div class="text-xs text-(--chat-text-primary) truncate cursor-default" title={file.path}>
                  {file.name}
                </div>
                <div class="text-[10px] text-(--chat-text-muted)">
                  {formatSize(file.size)}
                </div>
              </div>

              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {#if isImage(file.name)}
                  <button
                    type="button"
                    onclick={() => handlePreview(file)}
                    class="p-1 text-(--chat-text-muted) hover:text-(--chat-accent) transition-colors"
                    title="Preview"
                  >
                    <Image size={12} />
                  </button>
                {/if}

                <button
                  type="button"
                  onclick={() => handleDownload(file)}
                  class="p-1 text-(--chat-text-muted) hover:text-(--chat-accent) transition-colors"
                  title="Download"
                >
                  <Download size={12} />
                </button>

                <button
                  type="button"
                  onclick={() => handleDelete(file)}
                  class="p-1 text-(--chat-text-muted) hover:text-(--chat-error) transition-colors"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}

  {#if preview}
    <button
      type="button"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm border-none cursor-default"
      onclick={() => (preview = null)}
      onkeydown={(event) => event.key === "Escape" && (preview = null)}
    >
      <div class="max-w-[90%] max-h-[80%] p-2 bg-(--chat-bg) border border-(--chat-border) rounded shadow-lg">
        <img
          src={preview.dataUrl}
          alt={preview.path}
          class="max-w-full max-h-[70vh] object-contain"
        />
        <div class="text-[10px] text-(--chat-text-muted) mt-1 text-center truncate">
          {preview.path}
        </div>
      </div>
    </button>
  {/if}
</div>
