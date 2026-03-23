import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { StorageNamespace } from "../src/context";
import {
  createSession,
  getSession,
  listSessions,
  listSkillNames,
  loadSkillFiles,
  loadVfsFiles,
  renameSession,
  saveSession,
  saveSkillFiles,
  saveVfsFiles,
} from "../src/storage/db";

let namespaceCounter = 0;
let currentNs: StorageNamespace;

function nextNamespace(): StorageNamespace {
  namespaceCounter += 1;
  currentNs = {
    dbName: `OfficeAgentsDB_test_${namespaceCounter}`,
    dbVersion: 1,
    localStoragePrefix: `office-agents-test-${namespaceCounter}`,
    documentSettingsPrefix: `office-agents-test-${namespaceCounter}`,
    documentIdSettingsKey: `office-agents-test-${namespaceCounter}-document-id`,
  };
  return currentNs;
}

async function deleteCurrentDb() {
  if (!currentNs) return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(currentNs.dbName);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

describe("storage/db", () => {
  beforeEach(() => {
    nextNamespace();
  });

  afterEach(async () => {
    await deleteCurrentDb();
  });

  it("derives a session name from the first user message after stripping metadata and attachments", async () => {
    const ns = currentNs;
    const session = await createSession(ns, "doc-1");
    const plainText =
      "Summarize the regional sales performance for Q4 and call out the anomalies.";

    await saveSession(ns, session.id, [
      {
        role: "user",
        content: `<attachments>\n/home/user/uploads/q4.csv\n</attachments>\n\n<doc_context>\n{"sheet":"Summary"}\n</doc_context>\n\n${plainText}`,
        timestamp: 1,
      },
      {
        role: "assistant",
        content: [{ type: "text", text: "Working on it." }],
        timestamp: 2,
        stopReason: "stop",
        api: "openai-responses",
        provider: "openai",
        model: "gpt-5-mini",
        usage: {
          input: 10,
          output: 5,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 15,
          cost: {
            input: 0,
            output: 0,
            cacheRead: 0,
            cacheWrite: 0,
            total: 0,
          },
        },
      },
    ]);

    const saved = await getSession(ns, session.id);
    expect(saved?.name).toBe(`${plainText.slice(0, 37)}...`);
    expect(saved?.name).not.toContain("<attachments>");
    expect(saved?.name).not.toContain("<doc_context>");
  });

  it("preserves an explicit rename on subsequent saves and sorts sessions by most recent update", async () => {
    const ns = currentNs;
    const older = await createSession(ns, "doc-2");
    const newer = await createSession(ns, "doc-2");

    await renameSession(ns, older.id, "Pinned analysis");
    await saveSession(ns, older.id, [
      {
        role: "user",
        content: "First message",
        timestamp: 1,
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 5));

    await saveSession(ns, newer.id, [
      {
        role: "user",
        content: "More recent message",
        timestamp: 2,
      },
    ]);

    const savedOlder = await getSession(ns, older.id);
    const sessions = await listSessions(ns, "doc-2");

    expect(savedOlder?.name).toBe("Pinned analysis");
    expect(sessions.map((session) => session.id)).toEqual([
      newer.id,
      older.id,
    ]);
  });

  it("replaces the full VFS snapshot for one session without touching another session", async () => {
    const ns = currentNs;
    const first = await createSession(ns, "doc-vfs");
    const second = await createSession(ns, "doc-vfs");

    await saveVfsFiles(ns, first.id, [
      {
        path: "/home/user/uploads/budget.csv",
        data: new TextEncoder().encode("draft"),
      },
      {
        path: "/home/user/uploads/notes.txt",
        data: new TextEncoder().encode("old"),
      },
    ]);
    await saveVfsFiles(ns, second.id, [
      {
        path: "/home/user/uploads/reference.txt",
        data: new TextEncoder().encode("keep me"),
      },
    ]);

    await saveVfsFiles(ns, first.id, [
      {
        path: "/home/user/uploads/budget.csv",
        data: new TextEncoder().encode("final"),
      },
    ]);

    const firstFiles = await loadVfsFiles(ns, first.id);
    const secondFiles = await loadVfsFiles(ns, second.id);

    expect(firstFiles).toHaveLength(1);
    expect(firstFiles[0].path).toBe("/home/user/uploads/budget.csv");
    expect(new TextDecoder().decode(firstFiles[0].data)).toBe("final");
    expect(secondFiles).toHaveLength(1);
    expect(secondFiles[0].path).toBe("/home/user/uploads/reference.txt");
    expect(new TextDecoder().decode(secondFiles[0].data)).toBe("keep me");
  });

  it("replaces the full file set for a skill and keeps skill names unique and sorted", async () => {
    const ns = currentNs;
    await saveSkillFiles(ns, "budget-writer", [
      {
        path: "SKILL.md",
        data: new TextEncoder().encode("# budget-writer"),
      },
      {
        path: "examples/example.txt",
        data: new TextEncoder().encode("draft"),
      },
    ]);
    await saveSkillFiles(ns, "alpha-reviewer", [
      {
        path: "SKILL.md",
        data: new TextEncoder().encode("# alpha-reviewer"),
      },
    ]);

    await saveSkillFiles(ns, "budget-writer", [
      {
        path: "SKILL.md",
        data: new TextEncoder().encode("# budget-writer v2"),
      },
    ]);

    const skillNames = await listSkillNames(ns);
    const budgetFiles = await loadSkillFiles(ns, "budget-writer");

    expect(skillNames).toEqual(["alpha-reviewer", "budget-writer"]);
    expect(budgetFiles).toHaveLength(1);
    expect(budgetFiles[0].path).toBe("SKILL.md");
    expect(new TextDecoder().decode(budgetFiles[0].data)).toContain("v2");
  });
});
