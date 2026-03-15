import { getVfs, readFileBuffer, toBase64 } from "@office-agents/sdk";
import {
  Download,
  File,
  FileText,
  FolderOpen,
  Image,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useChat } from "./chat-context";

interface VfsFile {
  path: string;
  name: string;
  size: number;
}

const EXCLUDED_PREFIXES = ["/bin/", "/usr/", "/dev/", "/proc/"];

function isUserFile(path: string): boolean {
  return !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
  if (imageExts.includes(ext))
    return <Image size={14} className="text-(--chat-accent) shrink-0" />;
  const textExts = [
    "txt",
    "md",
    "csv",
    "json",
    "xml",
    "html",
    "css",
    "js",
    "ts",
    "py",
    "sh",
    "d.ts",
  ];
  if (textExts.includes(ext))
    return <FileText size={14} className="text-(--chat-text-muted) shrink-0" />;
  return <File size={14} className="text-(--chat-text-muted) shrink-0" />;
}

function downloadBlob(data: Uint8Array, filename: string, mimeType: string) {
  const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

export function FilesPanel() {
  const { state, removeUpload } = useChat();
  const [files, setFiles] = useState<VfsFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    path: string;
    dataUrl: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const vfs = getVfs();
      const allPaths = vfs.getAllPaths();
      const result: VfsFile[] = [];

      for (const p of allPaths) {
        if (!isUserFile(p)) continue;
        try {
          const stat = await vfs.stat(p);
          if (stat.isFile) {
            result.push({
              path: p,
              name: p.split("/").pop() ?? p,
              size: stat.size,
            });
          }
        } catch {
          // skip
        }
      }

      result.sort((a, b) => a.path.localeCompare(b.path));
      setFiles(result);
    } finally {
      setLoading(false);
    }
  }, []);

  const { vfsInvalidatedAt } = state;
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-scan VFS when files change
  useEffect(() => {
    refresh();
  }, [refresh, vfsInvalidatedAt]);

  const handleDownload = useCallback(async (file: VfsFile) => {
    try {
      const data = await readFileBuffer(file.path);
      downloadBlob(data, file.name, guessMime(file.name));
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  const handlePreview = useCallback(async (file: VfsFile) => {
    try {
      const data = await readFileBuffer(file.path);
      const mime = guessMime(file.name);
      if (mime.startsWith("image/")) {
        const dataUrl = `data:${mime};base64,${toBase64(data)}`;
        setPreview({ path: file.path, dataUrl });
      }
    } catch (err) {
      console.error("Preview failed:", err);
    }
  }, []);

  const handleDelete = useCallback(
    async (file: VfsFile) => {
      try {
        const vfs = getVfs();
        await vfs.rm(file.path);
        // Also remove from uploads state if it's an upload
        const uploadName = file.path.replace("/home/user/uploads/", "");
        if (file.path.startsWith("/home/user/uploads/")) {
          await removeUpload(uploadName);
        }
        await refresh();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [removeUpload, refresh],
  );

  const isImage = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    return ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext);
  };

  // Group files by directory
  const grouped = new Map<string, VfsFile[]>();
  for (const file of files) {
    const dir = file.path.substring(0, file.path.lastIndexOf("/")) || "/";
    if (!grouped.has(dir)) grouped.set(dir, []);
    grouped.get(dir)!.push(file);
  }

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ fontFamily: "var(--chat-font-mono)" }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-(--chat-border)">
        <span className="text-xs text-(--chat-text-muted)">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="p-1 text-(--chat-text-muted) hover:text-(--chat-text-primary) transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-(--chat-text-muted)">
          <FolderOpen size={24} />
          <span className="text-xs">No files in virtual filesystem</span>
          <span className="text-[10px]">
            Upload files or let the agent create them
          </span>
        </div>
      ) : (
        <div className="divide-y divide-(--chat-border)">
          {[...grouped.entries()].map(([dir, dirFiles]) => (
            <div key={dir}>
              <div className="px-3 py-1.5 text-[10px] text-(--chat-text-muted) bg-(--chat-bg-secondary) uppercase tracking-wider">
                {dir}
              </div>
              {dirFiles.map((file) => (
                <div
                  key={file.path}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-(--chat-bg-secondary) transition-colors group"
                >
                  {fileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs text-(--chat-text-primary) truncate cursor-default"
                      title={file.path}
                    >
                      {file.name}
                    </div>
                    <div className="text-[10px] text-(--chat-text-muted)">
                      {formatSize(file.size)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isImage(file.name) && (
                      <button
                        type="button"
                        onClick={() => handlePreview(file)}
                        className="p-1 text-(--chat-text-muted) hover:text-(--chat-accent) transition-colors"
                        title="Preview"
                      >
                        <Image size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      className="p-1 text-(--chat-text-muted) hover:text-(--chat-accent) transition-colors"
                      title="Download"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(file)}
                      className="p-1 text-(--chat-text-muted) hover:text-(--chat-error) transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Image preview modal */}
      {preview && (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm border-none cursor-default"
          onClick={() => setPreview(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreview(null)}
        >
          <div className="max-w-[90%] max-h-[80%] p-2 bg-(--chat-bg) border border-(--chat-border) rounded shadow-lg">
            <img
              src={preview.dataUrl}
              alt={preview.path}
              className="max-w-full max-h-[70vh] object-contain"
            />
            <div className="text-[10px] text-(--chat-text-muted) mt-1 text-center truncate">
              {preview.path}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
