import { describe, expect, it } from "vitest";
import type { CustomCommand } from "just-bash/browser";
import { defineCommand } from "just-bash/browser";
import { AgentContext } from "../src/context";

function cmds(...commands: CustomCommand[]) {
  return () => ({ commands, promptSnippets: [] });
}

async function run(ctx: AgentContext, cmd: string) {
  const result = await ctx.bash.exec(cmd);
  return {
    ...result,
    out: result.stdout.replace(/\n$/, ""),
  };
}

describe("VFS custom commands", () => {
  it("registered custom command is callable from bash", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("greet", async (args) => ({
          stdout: `hello ${args[0] ?? "world"}`,
          stderr: "",
          exitCode: 0,
        })),
      ),
    });

    const result = await run(ctx, "greet alice");
    expect(result.exitCode).toBe(0);
    expect(result.out).toBe("hello alice");
  });

  it("custom command can read files from VFS context", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("wordcount", async (args, bashCtx) => {
          try {
            const content = await bashCtx.fs.readFile(
              args[0].startsWith("/")
                ? args[0]
                : `${bashCtx.cwd}/${args[0]}`,
            );
            const words = content.trim().split(/\s+/).length;
            return { stdout: `${words} words`, stderr: "", exitCode: 0 };
          } catch (e) {
            return {
              stdout: "",
              stderr: e instanceof Error ? e.message : String(e),
              exitCode: 1,
            };
          }
        }),
      ),
    });

    await ctx.writeFile("doc.txt", "one two three four five");
    const result = await run(ctx, "wordcount /home/user/uploads/doc.txt");
    expect(result.exitCode).toBe(0);
    expect(result.out).toBe("5 words");
  });

  it("custom command can write files to VFS context", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("generate", async (args, bashCtx) => {
          const outPath = args[0].startsWith("/")
            ? args[0]
            : `${bashCtx.cwd}/${args[0]}`;
          await bashCtx.fs.writeFile(outPath, "generated content");
          return { stdout: `wrote ${outPath}`, stderr: "", exitCode: 0 };
        }),
      ),
    });

    const result = await run(ctx, "generate /home/user/uploads/out.txt");
    expect(result.exitCode).toBe(0);
    const content = await ctx.readFile("out.txt");
    expect(content).toBe("generated content");
  });

  it("custom command returning non-zero exit code is treated as error", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("fail", async () => ({
          stdout: "",
          stderr: "something went wrong",
          exitCode: 42,
        })),
      ),
    });

    const result = await run(ctx, "fail");
    expect(result.exitCode).toBe(42);
    expect(result.stderr).toContain("something went wrong");
  });

  it("custom command output can be piped to standard commands", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("emit-lines", async () => ({
          stdout: "apple\nbanana\napricot\ncherry\n",
          stderr: "",
          exitCode: 0,
        })),
      ),
    });

    const result = await run(ctx, "emit-lines | grep ap");
    expect(result.exitCode).toBe(0);
    expect(result.out).toContain("apple");
    expect(result.out).toContain("apricot");
    expect(result.out).not.toContain("banana");
    expect(result.out).not.toContain("cherry");
  });

  it("multiple custom commands can coexist", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("cmd-a", async () => ({
          stdout: "from a",
          stderr: "",
          exitCode: 0,
        })),
        defineCommand("cmd-b", async () => ({
          stdout: "from b",
          stderr: "",
          exitCode: 0,
        })),
      ),
    });

    const a = await run(ctx, "cmd-a");
    const b = await run(ctx, "cmd-b");
    expect(a.out).toBe("from a");
    expect(b.out).toBe("from b");
  });

  it("custom commands are reset when VFS is reset", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("ephemeral", async () => ({
          stdout: "hi",
          stderr: "",
          exitCode: 0,
        })),
      ),
    });

    const before = await run(ctx, "ephemeral");
    expect(before.exitCode).toBe(0);

    ctx.setCustomCommands(() => ({ commands: [], promptSnippets: [] }));
    ctx.reset();

    const after = await run(ctx, "ephemeral");
    expect(after.exitCode).not.toBe(0);
  });

  it("writeFile makes files visible to custom commands via ctx.fs", async () => {
    const ctx = new AgentContext({
      customCommands: cmds(
        defineCommand("upper", async (args, bashCtx) => {
          const path = args[0].startsWith("/")
            ? args[0]
            : `${bashCtx.cwd}/${args[0]}`;
          const content = await bashCtx.fs.readFile(path);
          const outPath = args[1].startsWith("/")
            ? args[1]
            : `${bashCtx.cwd}/${args[1]}`;
          await bashCtx.fs.writeFile(outPath, content.toUpperCase());
          return {
            stdout: `uppercased → ${outPath}`,
            stderr: "",
            exitCode: 0,
          };
        }),
      ),
    });

    await ctx.writeFile("input.txt", "hello world");
    const result = await run(
      ctx,
      "upper /home/user/uploads/input.txt /home/user/uploads/output.txt",
    );
    expect(result.exitCode).toBe(0);
    const output = await ctx.readFile("output.txt");
    expect(output).toBe("HELLO WORLD");
  });
});

describe("VFS writeFile → bash integration", () => {
  it("files written via writeFile are readable from bash", async () => {
    const ctx = new AgentContext();
    await ctx.writeFile("report.csv", "a,b\n1,2");
    const result = await run(ctx, "cat /home/user/uploads/report.csv");
    expect(result.exitCode).toBe(0);
    expect(result.out).toBe("a,b\n1,2");
  });
});
