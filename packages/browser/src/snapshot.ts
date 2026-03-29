import type { Protocol } from "devtools-protocol/types/protocol.js";
import type { CdpClient, CdpSession } from "./cdp.js";

export interface SnapshotRef {
  ref: string;
  xpath: string;
  legacyId?: string;
  role: string;
  name?: string;
  url?: string;
}

export interface SnapshotOptions {
  interactive?: boolean;
  compact?: boolean;
  depth?: number;
}

export interface Snapshot {
  tree: string;
  xpathMap: Record<string, string>;
  urlMap: Record<string, string>;
  refs: Record<string, SnapshotRef>;
  legacyXPathMap: Record<string, string>;
  legacyUrlMap: Record<string, string>;
}

interface TreeNode {
  role: string;
  originalRole: string;
  name?: string;
  description?: string;
  value?: string;
  nodeId: string;
  backendDOMNodeId?: number;
  parentId?: string;
  childIds?: string[];
  encodedId?: string;
  refId?: string;
  children?: TreeNode[];
}

type DomNode = Protocol.DOM.Node & { isScrollable?: boolean };

type CdpSender = CdpClient | CdpSession;

const INTERACTIVE_ROLES = new Set([
  "button",
  "link",
  "textbox",
  "checkbox",
  "radio",
  "combobox",
  "listbox",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "treeitem",
  "Iframe",
]);

const CONTENT_ROLES = new Set([
  "heading",
  "cell",
  "gridcell",
  "columnheader",
  "rowheader",
  "listitem",
  "article",
  "region",
  "main",
  "navigation",
]);

const HIDDEN_RENDER_ROLES = new Set([
  "RootWebArea",
  "WebArea",
  "document",
  "application",
  "presentation",
]);

function buildChildXPathSegments(kids: DomNode[]): string[] {
  const segs: string[] = [];
  const ctr: Record<string, number> = {};
  for (const child of kids) {
    const tag = String(child.nodeName).toLowerCase();
    const key = `${child.nodeType}:${tag}`;
    ctr[key] = (ctr[key] ?? 0) + 1;
    const idx = ctr[key];
    if (child.nodeType === 3) {
      segs.push(`text()[${idx}]`);
    } else if (child.nodeType === 8) {
      segs.push(`comment()[${idx}]`);
    } else {
      segs.push(
        tag.includes(":") ? `*[name()='${tag}'][${idx}]` : `${tag}[${idx}]`,
      );
    }
  }
  return segs;
}

function joinXPath(base: string, step: string): string {
  if (step === "//") {
    if (!base || base === "/") return "//";
    return base.endsWith("/") ? `${base}/` : `${base}//`;
  }
  if (!base || base === "/") return step ? `/${step}` : "/";
  if (base.endsWith("//")) return `${base}${step}`;
  if (!step) return base;
  return `${base}/${step}`;
}

const DOM_DEPTH_ATTEMPTS = [-1, 256, 128, 64, 32, 16, 8, 4, 2, 1];
const DESCRIBE_DEPTH_ATTEMPTS = [-1, 64, 32, 16, 8, 4, 2, 1];

function shouldExpandNode(node: DomNode): boolean {
  const declared = node.childNodeCount ?? 0;
  const realized = node.children?.length ?? 0;
  return declared > realized;
}

function collectTraversalTargets(node: DomNode): DomNode[] {
  const targets: DomNode[] = [];
  if (node.children) targets.push(...(node.children as DomNode[]));
  if (node.shadowRoots) targets.push(...(node.shadowRoots as DomNode[]));
  if (node.contentDocument) targets.push(node.contentDocument as DomNode);
  return targets;
}

async function hydrateDomTree(
  session: CdpSender,
  root: DomNode,
  pierce: boolean,
): Promise<void> {
  const stack: DomNode[] = [root];
  const expanded = new Set<number>();

  while (stack.length) {
    const node = stack.pop()!;
    const nodeId = node.nodeId > 0 ? node.nodeId : undefined;
    const backendId =
      node.backendNodeId && node.backendNodeId > 0
        ? node.backendNodeId
        : undefined;

    if (nodeId && expanded.has(nodeId)) continue;
    if (!nodeId && backendId && expanded.has(backendId)) continue;
    if (nodeId) expanded.add(nodeId);
    else if (backendId) expanded.add(backendId);

    if (shouldExpandNode(node) && (nodeId || backendId)) {
      const descParams: Protocol.DOM.DescribeNodeRequest = nodeId
        ? { nodeId }
        : { backendNodeId: backendId };
      for (const depth of DESCRIBE_DEPTH_ATTEMPTS) {
        try {
          const described = await session.send("DOM.describeNode", {
            ...descParams,
            depth,
            pierce,
          });
          Object.assign(node, {
            childNodeCount:
              described.node.childNodeCount ?? node.childNodeCount,
            children: described.node.children ?? node.children,
            shadowRoots: described.node.shadowRoots ?? node.shadowRoots,
            contentDocument:
              described.node.contentDocument ?? node.contentDocument,
          });
          if (!nodeId && described.node.nodeId > 0) {
            node.nodeId = described.node.nodeId;
            expanded.add(described.node.nodeId);
          }
          break;
        } catch (err: unknown) {
          if (err instanceof Error && err.message.includes("CBOR")) continue;
          throw err;
        }
      }
    }

    for (const child of collectTraversalTargets(node)) {
      stack.push(child);
    }
  }
}

async function getDomTree(
  session: CdpSender,
  pierce: boolean,
): Promise<DomNode> {
  for (const depth of DOM_DEPTH_ATTEMPTS) {
    try {
      const { root } = await session.send("DOM.getDocument", {
        depth,
        pierce,
      });
      if (depth !== -1) {
        await hydrateDomTree(session, root as DomNode, pierce);
      }
      return root as DomNode;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("CBOR")) continue;
      throw err;
    }
  }
  throw new Error("DOM.getDocument failed after all depth retries");
}

function buildDomMaps(
  root: DomNode,
  frameOrdinal: number,
): {
  tagNameMap: Record<string, string>;
  xpathMap: Record<string, string>;
  scrollableMap: Record<string, boolean>;
} {
  const tagNameMap: Record<string, string> = {};
  const xpathMap: Record<string, string> = {};
  const scrollableMap: Record<string, boolean> = {};

  const stack: Array<{ node: DomNode; xpath: string }> = [
    { node: root, xpath: "" },
  ];

  while (stack.length) {
    const { node, xpath } = stack.pop()!;
    if (node.backendNodeId) {
      const encId = `${frameOrdinal}-${node.backendNodeId}`;
      tagNameMap[encId] = String(node.nodeName).toLowerCase();
      xpathMap[encId] = xpath || "/";
      if (node.isScrollable) scrollableMap[encId] = true;
    }

    const kids = (node.children ?? []) as DomNode[];
    if (kids.length) {
      const segs = buildChildXPathSegments(kids);
      for (let i = kids.length - 1; i >= 0; i--) {
        stack.push({ node: kids[i], xpath: joinXPath(xpath, segs[i]) });
      }
    }

    for (const sr of (node.shadowRoots ?? []) as DomNode[]) {
      stack.push({ node: sr, xpath: joinXPath(xpath, "//") });
    }
  }

  return { tagNameMap, xpathMap, scrollableMap };
}

function extractUrlFromAXNode(
  ax: Protocol.Accessibility.AXNode,
): string | undefined {
  const props = ax.properties ?? [];
  const urlProp = props.find((p) => p.name === "url");
  const value = urlProp?.value?.value;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isStructural(role: string): boolean {
  const r = role?.toLowerCase();
  return r === "generic" || r === "none" || r === "inlinetextbox";
}

function cleanText(input: string): string {
  const PUA_START = 0xe000;
  const PUA_END = 0xf8ff;
  const NBSP = new Set([0xa0, 0x202f, 0x2007, 0xfeff]);
  let out = "";
  let prevSpace = false;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code >= PUA_START && code <= PUA_END) continue;
    if (NBSP.has(code)) {
      if (!prevSpace) {
        out += " ";
        prevSpace = true;
      }
      continue;
    }
    out += input[i];
    prevSpace = input[i] === " ";
  }
  return out.trim();
}

function normaliseSpaces(s: string): string {
  let out = "";
  let inWs = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const isWs = /\s/.test(ch);
    if (isWs) {
      if (!inWs) {
        out += " ";
        inWs = true;
      }
    } else {
      out += ch;
      inWs = false;
    }
  }
  return out;
}

function decorateRoles(
  nodes: Protocol.Accessibility.AXNode[],
  tagNameMap: Record<string, string>,
  scrollableMap: Record<string, boolean>,
  frameOrdinal: number,
): TreeNode[] {
  return nodes.map((n) => {
    let encodedId: string | undefined;
    if (typeof n.backendDOMNodeId === "number") {
      encodedId = `${frameOrdinal}-${n.backendDOMNodeId}`;
    }

    const originalRole = String(n.role?.value ?? "");
    let role = originalRole;
    const domIsScrollable = encodedId
      ? scrollableMap[encodedId] === true
      : false;
    const tag = encodedId ? tagNameMap[encodedId] : undefined;
    const isHtmlElement = tag === "html";

    if ((domIsScrollable || isHtmlElement) && tag !== "#document") {
      const tagLabel = tag?.startsWith("#") ? tag.slice(1) : tag;
      role = tagLabel
        ? `scrollable, ${tagLabel}`
        : `scrollable${role ? `, ${role}` : ""}`;
    }

    return {
      role,
      originalRole,
      name: n.name?.value as string | undefined,
      description: n.description?.value as string | undefined,
      value: n.value?.value as string | undefined,
      nodeId: n.nodeId,
      backendDOMNodeId: n.backendDOMNodeId,
      parentId: n.parentId,
      childIds: n.childIds,
      encodedId,
    };
  });
}

function removeRedundantStaticText(
  parent: TreeNode,
  children: TreeNode[],
): TreeNode[] {
  if (!parent.name) return children;
  const parentNorm = normaliseSpaces(parent.name).trim();
  let combined = "";
  for (const c of children) {
    if (c.originalRole === "StaticText" && c.name) {
      combined += normaliseSpaces(c.name).trim();
    }
  }
  if (combined === parentNorm) {
    return children.filter((c) => c.originalRole !== "StaticText");
  }
  return children;
}

function buildHierarchicalTree(
  nodes: TreeNode[],
  tagNameMap: Record<string, string>,
): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();

  for (const n of nodes) {
    const keep =
      !!n.name?.trim() ||
      !!n.childIds?.length ||
      !isStructural(n.originalRole || n.role);
    if (!keep) continue;
    nodeMap.set(n.nodeId, { ...n });
  }

  for (const n of nodes) {
    if (!n.parentId) continue;
    const parent = nodeMap.get(n.parentId);
    const cur = nodeMap.get(n.nodeId);
    if (parent && cur) {
      parent.children = parent.children ?? [];
      parent.children.push(cur);
    }
  }

  const roots = nodes
    .filter((n) => !n.parentId && nodeMap.has(n.nodeId))
    .map((n) => nodeMap.get(n.nodeId)!);

  return roots
    .map((r) => pruneStructural(r, tagNameMap))
    .filter(Boolean) as TreeNode[];
}

function pruneStructural(
  node: TreeNode,
  tagNameMap: Record<string, string>,
): TreeNode | null {
  const children = node.children ?? [];
  if (!children.length) {
    return isStructural(node.originalRole || node.role) ? null : node;
  }

  const cleanedKids = children
    .map((c) => pruneStructural(c, tagNameMap))
    .filter(Boolean) as TreeNode[];

  const pruned = removeRedundantStaticText(node, cleanedKids);

  if (isStructural(node.originalRole || node.role)) {
    if (pruned.length === 1) return pruned[0];
    if (pruned.length === 0) return null;
  }

  let newRole = node.role;
  if (
    (node.originalRole === "generic" || node.originalRole === "none") &&
    node.encodedId
  ) {
    const tagName = tagNameMap[node.encodedId];
    if (tagName) newRole = tagName;
  }
  if (node.originalRole === "combobox" && node.encodedId) {
    const tagName = tagNameMap[node.encodedId];
    if (tagName === "select") newRole = "select";
  }

  return { ...node, role: newRole, children: pruned };
}

function walkTree(nodes: TreeNode[], visit: (node: TreeNode) => void): void {
  for (const node of nodes) {
    visit(node);
    if (node.children?.length) walkTree(node.children, visit);
  }
}

function shouldAssignRef(node: TreeNode): boolean {
  const role = node.originalRole || node.role;
  if (!node.encodedId) return false;
  if (INTERACTIVE_ROLES.has(role)) return true;
  if (CONTENT_ROLES.has(role)) return !!cleanText(node.name ?? "");
  return false;
}

function assignRefs(
  roots: TreeNode[],
  legacyXPathMap: Record<string, string>,
  legacyUrlMap: Record<string, string>,
): {
  refs: Record<string, SnapshotRef>;
  xpathMap: Record<string, string>;
  urlMap: Record<string, string>;
} {
  const refs: Record<string, SnapshotRef> = {};
  const xpathMap: Record<string, string> = { ...legacyXPathMap };
  const urlMap: Record<string, string> = { ...legacyUrlMap };
  let nextRef = 1;

  walkTree(roots, (node) => {
    if (!shouldAssignRef(node) || !node.encodedId) return;
    const xpath = legacyXPathMap[node.encodedId];
    if (!xpath) return;

    const ref = `e${nextRef++}`;
    node.refId = ref;

    const url = legacyUrlMap[node.encodedId];
    refs[ref] = {
      ref,
      xpath,
      legacyId: node.encodedId,
      role: node.originalRole || node.role,
      name: cleanText(node.name ?? "") || undefined,
      url,
    };
    xpathMap[ref] = xpath;
    if (url) urlMap[ref] = url;
  });

  return { refs, xpathMap, urlMap };
}

function formatTreeLine(
  node: TreeNode,
  level: number,
  options: SnapshotOptions,
): string {
  const indent = "  ".repeat(level);
  const role = node.role || node.originalRole;
  let line = `${indent}- ${role}`;

  const name = cleanText(node.name ?? "");
  if (name) {
    line += ` ${JSON.stringify(name)}`;
  }

  const attrs: string[] = [];
  if (node.refId) attrs.push(`ref=${node.refId}`);
  if (attrs.length) line += ` [${attrs.join(", ")}]`;

  const value = cleanText(node.value ?? "");
  if (value && value !== name) {
    line += `: ${value}`;
  }

  const children =
    node.children
      ?.map((child) => renderTreeNode(child, level + 1, options))
      .filter(Boolean)
      .join("\n") ?? "";

  return children ? `${line}\n${children}` : line;
}

function renderTreeNode(
  node: TreeNode,
  level: number,
  options: SnapshotOptions,
): string {
  const role = node.originalRole || node.role;

  if (HIDDEN_RENDER_ROLES.has(role)) {
    return (
      node.children
        ?.map((child) => renderTreeNode(child, level, options))
        .filter(Boolean)
        .join("\n") ?? ""
    );
  }

  if (options.depth !== undefined && level > options.depth) {
    return "";
  }

  if (options.interactive && !node.refId) {
    return (
      node.children
        ?.map((child) => renderTreeNode(child, level, options))
        .filter(Boolean)
        .join("\n") ?? ""
    );
  }

  return formatTreeLine(node, level, options);
}

function countIndent(line: string): number {
  let count = 0;
  while (line.startsWith("  ", count * 2)) count += 1;
  return count;
}

function compactTree(tree: string): string {
  const lines = tree.split("\n");
  if (!lines.length) return "";

  const keep = new Array<boolean>(lines.length).fill(false);

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("[ref=") || lines[i].includes(": ")) {
      keep[i] = true;
      const myIndent = countIndent(lines[i]);
      for (let j = i - 1; j >= 0; j--) {
        const ancestorIndent = countIndent(lines[j]);
        if (ancestorIndent < myIndent) {
          keep[j] = true;
          if (ancestorIndent === 0) break;
        }
      }
    }
  }

  return lines.filter((_, i) => keep[i]).join("\n");
}

export async function captureSnapshot(
  session: CdpSender,
  frameOrdinal = 0,
  frameId?: string,
  options: SnapshotOptions = {},
): Promise<Snapshot> {
  await session.send("Accessibility.enable").catch(() => {});
  await session.send("Runtime.enable").catch(() => {});
  await session.send("DOM.enable").catch(() => {});

  let nodes: Protocol.Accessibility.AXNode[] = [];
  try {
    const params: Protocol.Accessibility.GetFullAXTreeRequest = frameId
      ? { frameId }
      : {};
    ({ nodes } = await session.send("Accessibility.getFullAXTree", params));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const isFrameError =
      msg.includes("Frame with the given") ||
      msg.includes("does not belong to the target") ||
      msg.includes("is not found");
    if (!isFrameError || !frameId) throw e;
    ({ nodes } = await session.send("Accessibility.getFullAXTree"));
  }

  const legacyUrlMap: Record<string, string> = {};
  for (const n of nodes) {
    const be = n.backendDOMNodeId;
    if (typeof be !== "number") continue;
    const url = extractUrlFromAXNode(n);
    if (!url) continue;
    legacyUrlMap[`${frameOrdinal}-${be}`] = url;
  }

  const domRoot = await getDomTree(session, true);
  const {
    tagNameMap,
    xpathMap: legacyXPathMap,
    scrollableMap,
  } = buildDomMaps(domRoot, frameOrdinal);

  const decorated = decorateRoles(
    nodes,
    tagNameMap,
    scrollableMap,
    frameOrdinal,
  );
  const tree = buildHierarchicalTree(decorated, tagNameMap);
  const { refs, xpathMap, urlMap } = assignRefs(
    tree,
    legacyXPathMap,
    legacyUrlMap,
  );

  let treeText = tree
    .map((node) => renderTreeNode(node, 0, options))
    .filter(Boolean)
    .join("\n")
    .trimEnd();

  if (options.compact) {
    treeText = compactTree(treeText).trimEnd();
  }

  if (!treeText) {
    treeText = options.interactive
      ? "(no interactive elements)"
      : "(empty page)";
  }

  return {
    tree: treeText,
    xpathMap,
    urlMap,
    refs,
    legacyXPathMap,
    legacyUrlMap,
  };
}
