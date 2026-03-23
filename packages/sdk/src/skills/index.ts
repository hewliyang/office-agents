import type { AgentContext, StorageNamespace } from "../context";
import {
  deleteSkillFiles,
  listSkillNames,
  loadAllSkillFiles,
  loadSkillFiles,
  saveSkillFiles,
} from "../storage";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface SkillMeta {
  name: string;
  description: string;
  platform?: string;
}

export interface SkillInput {
  path: string;
  data: string | Uint8Array;
}

export function parseSkillMeta(content: string): SkillMeta | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const name = yaml.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = yaml.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const platform = yaml.match(/^platform:\s*(.+)$/m)?.[1]?.trim();

  if (!name || !description) return null;
  return { name, description, ...(platform ? { platform } : {}) };
}

function toUint8Array(data: string | Uint8Array): Uint8Array {
  return typeof data === "string" ? encoder.encode(data) : data;
}

function findSkillMd(files: SkillInput[]): SkillInput | undefined {
  return files.find((f) => {
    const name = f.path.split("/").pop();
    return name === "SKILL.md";
  });
}

function normalizeFiles(
  files: SkillInput[],
): { path: string; data: Uint8Array }[] {
  return files.map((f) => ({
    path: f.path.replace(/^\.\//, ""),
    data: toUint8Array(f.data),
  }));
}

export async function addSkill(
  ns: StorageNamespace,
  ctx: AgentContext,
  files: SkillInput[],
): Promise<SkillMeta> {
  const skillMd = findSkillMd(files);
  if (!skillMd) {
    throw new Error("Skill must contain a SKILL.md file");
  }

  const content =
    typeof skillMd.data === "string"
      ? skillMd.data
      : decoder.decode(skillMd.data);
  const meta = parseSkillMeta(content);
  if (!meta) {
    throw new Error(
      "SKILL.md must have valid frontmatter with name and description",
    );
  }

  await saveSkillFiles(ns, meta.name, normalizeFiles(files));
  await syncSkillsToVfs(ns, ctx);
  return meta;
}

export async function removeSkill(
  ns: StorageNamespace,
  ctx: AgentContext,
  name: string,
): Promise<void> {
  await deleteSkillFiles(ns, name);
  await syncSkillsToVfs(ns, ctx);
}

export async function getInstalledSkills(
  ns: StorageNamespace,
): Promise<SkillMeta[]> {
  const names = await listSkillNames(ns);
  const skills: SkillMeta[] = [];

  for (const name of names) {
    const files = await loadSkillFiles(ns, name);
    const skillMd = files.find((f) => f.path === "SKILL.md");
    if (skillMd) {
      const content = decoder.decode(skillMd.data);
      const meta = parseSkillMeta(content);
      if (meta) {
        skills.push(meta);
        continue;
      }
    }
    skills.push({ name, description: "" });
  }

  return skills;
}

export async function syncSkillsToVfs(
  ns: StorageNamespace,
  ctx: AgentContext,
): Promise<void> {
  const allFiles = await loadAllSkillFiles(ns);
  const initialFiles: Record<string, Uint8Array> = {};
  for (const f of allFiles) {
    initialFiles[`/home/skills/${f.skillName}/${f.path}`] = f.data;
  }
  await ctx.setSkillFiles(initialFiles);
}

export function buildSkillsPromptSection(skills: SkillMeta[]): string {
  if (skills.length === 0) return "";

  const entries = skills.map(
    (s) => `  <skill>
    <name>${s.name}</name>
    <description>${s.description}</description>
    <location>/home/skills/${s.name}/SKILL.md</location>
  </skill>`,
  );

  return `

The following skills provide specialized instructions for specific tasks.
Use the read tool to load a skill's file when the task matches its description.
When a skill file references a relative path, resolve it against the skill directory and use that absolute path.

<available_skills>
${entries.join("\n")}
</available_skills>`;
}
