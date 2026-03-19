import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
import { configureNamespace, getNamespace } from "../src/storage/namespace";

let namespaceCounter = 0;
let currentDbName = "";

function nextNamespace() {
  namespaceCounter += 1;
  currentDbName = `OfficeAgentsDB_test_${namespaceCounter}`;
  configureNamespace({
    dbName: currentDbName,
    dbVersion: 1,
    localStoragePrefix: `office-agents-test-${namespaceCounter}`,
    documentSettingsPrefix: `office-agents-test-${namespaceCounter}`,
    documentIdSettingsKey: `office-agents-test-${namespaceCounter}-document-id`,
  });
}

async function deleteCurrentDb() {
  if (!currentDbName) return;
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(currentDbName);
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
    const ns = getNamespace();
    configureNamespace({
      dbName: "OfficeAgentsDB",
      dbVersion: 1,
      localStoragePrefix: "office-agents",
      documentSettingsPrefix: "office-agents",
      documentIdSettingsKey: `${ns.documentSettingsPrefix}-document-id`,
    });
  });

  it("derives a session name from the first user message after stripping metadata and attachments", async () => {
    const session = await createSession("doc-1");
    const plainText =
      "Summarize the regional sales performance for Q4 and call out the anomalies.";

    await saveSession(session.id, [
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

    const saved = await getSession(session.id);
    expect(saved?.name).toBe(`${plainText.slice(0, 37)}...`);
    expect(saved?.name).not.toContain("<attachments>");
    expect(saved?.name).not.toContain("<doc_context>");
  });

  it("preserves an explicit rename on subsequent saves and sorts sessions by most recent update", async () => {
    const older = await createSession("doc-2");
    const newer = await createSession("doc-2");

    await renameSession(older.id, "Pinned analysis");
    await saveSession(older.id, [
      {
        role: "user",
        content: "First message",
        timestamp: 1,
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 5));

    await saveSession(newer.id, [
      {
        role: "user",
        content: "More recent message",
        timestamp: 2,
      },
    ]);

    const savedOlder = await getSession(older.id);
    const sessions = await listSessions("doc-2");

    expect(savedOlder?.name).toBe("Pinned analysis");
    expect(sessions.map((session) => session.id)).toEqual([newer.id, older.id]);
  });

  it("replaces the full VFS snapshot for one session without touching another session", async () => {
    const first = await createSession("doc-vfs");
    const second = await createSession("doc-vfs");

    await saveVfsFiles(first.id, [
      {
        path: "/home/user/uploads/budget.csv",
        data: new TextEncoder().encode("draft"),
      },
      {
        path: "/home/user/uploads/notes.txt",
        data: new TextEncoder().encode("old"),
      },
    ]);
    await saveVfsFiles(second.id, [
      {
        path: "/home/user/uploads/reference.txt",
        data: new TextEncoder().encode("keep me"),
      },
    ]);

    await saveVfsFiles(first.id, [
      {
        path: "/home/user/uploads/budget.csv",
        data: new TextEncoder().encode("final"),
      },
    ]);

    const firstFiles = await loadVfsFiles(first.id);
    const secondFiles = await loadVfsFiles(second.id);

    expect(firstFiles).toHaveLength(1);
    expect(firstFiles[0].path).toBe("/home/user/uploads/budget.csv");
    expect(new TextDecoder().decode(firstFiles[0].data)).toBe("final");
    expect(secondFiles).toHaveLength(1);
    expect(secondFiles[0].path).toBe("/home/user/uploads/reference.txt");
    expect(new TextDecoder().decode(secondFiles[0].data)).toBe("keep me");
  });

  it("replaces the full file set for a skill and keeps skill names unique and sorted", async () => {
    await saveSkillFiles("budget-writer", [
      {
        path: "SKILL.md",
        data: new TextEncoder().encode("# budget-writer"),
      },
      {
        path: "examples/example.txt",
        data: new TextEncoder().encode("draft"),
      },
    ]);
    await saveSkillFiles("alpha-reviewer", [
      {
        path: "SKILL.md",
        data: new TextEncoder().encode("# alpha-reviewer"),
      },
    ]);

    await saveSkillFiles("budget-writer", [
      {
        path: "SKILL.md",
        data: new TextEncoder().encode("# budget-writer v2"),
      },
    ]);

    const skillNames = await listSkillNames();
    const budgetFiles = await loadSkillFiles("budget-writer");

    expect(skillNames).toEqual(["alpha-reviewer", "budget-writer"]);
    expect(budgetFiles).toHaveLength(1);
    expect(budgetFiles[0].path).toBe("SKILL.md");
    expect(new TextDecoder().decode(budgetFiles[0].data)).toContain("v2");
  });
});
