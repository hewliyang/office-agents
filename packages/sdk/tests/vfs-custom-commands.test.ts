import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineCommand } from "just-bash/browser";
import {
	getBash,
	resetVfs,
	setCustomCommands,
	writeFile,
	readFile,
} from "../src/vfs";

async function run(cmd: string) {
	const bash = getBash();
	const result = await bash.exec(cmd);
	return {
		...result,
		out: result.stdout.replace(/\n$/, ""),
	};
}

describe("VFS custom commands", () => {
	afterEach(() => {
		setCustomCommands(() => []);
		resetVfs();
	});

	it("registered custom command is callable from bash", async () => {
		setCustomCommands(() => [
			defineCommand("greet", async (args) => ({
				stdout: `hello ${args[0] ?? "world"}`,
				stderr: "",
				exitCode: 0,
			})),
		]);

		const result = await run("greet alice");
		expect(result.exitCode).toBe(0);
		expect(result.out).toBe("hello alice");
	});

	it("custom command can read files from VFS context", async () => {
		setCustomCommands(() => [
			defineCommand("wordcount", async (args, ctx) => {
				try {
					const content = await ctx.fs.readFile(
						args[0].startsWith("/") ? args[0] : `${ctx.cwd}/${args[0]}`,
					);
					const words = content.trim().split(/\s+/).length;
					return {
						stdout: `${words} words`,
						stderr: "",
						exitCode: 0,
					};
				} catch (e) {
					return {
						stdout: "",
						stderr: e instanceof Error ? e.message : String(e),
						exitCode: 1,
					};
				}
			}),
		]);

		await writeFile("doc.txt", "one two three four five");
		const result = await run("wordcount /home/user/uploads/doc.txt");
		expect(result.exitCode).toBe(0);
		expect(result.out).toBe("5 words");
	});

	it("custom command can write files to VFS context", async () => {
		setCustomCommands(() => [
			defineCommand("generate", async (args, ctx) => {
				const outPath = args[0].startsWith("/")
					? args[0]
					: `${ctx.cwd}/${args[0]}`;
				await ctx.fs.writeFile(outPath, "generated content");
				return { stdout: `wrote ${outPath}`, stderr: "", exitCode: 0 };
			}),
		]);

		const result = await run("generate /home/user/uploads/out.txt");
		expect(result.exitCode).toBe(0);
		const content = await readFile("out.txt");
		expect(content).toBe("generated content");
	});

	it("custom command returning non-zero exit code is treated as error", async () => {
		setCustomCommands(() => [
			defineCommand("fail", async () => ({
				stdout: "",
				stderr: "something went wrong",
				exitCode: 42,
			})),
		]);

		const result = await run("fail");
		expect(result.exitCode).toBe(42);
		expect(result.stderr).toContain("something went wrong");
	});

	it("custom command output can be piped to standard commands", async () => {
		setCustomCommands(() => [
			defineCommand("emit-lines", async () => ({
				stdout: "apple\nbanana\napricot\ncherry\n",
				stderr: "",
				exitCode: 0,
			})),
		]);

		const result = await run("emit-lines | grep ap");
		expect(result.exitCode).toBe(0);
		expect(result.out).toContain("apple");
		expect(result.out).toContain("apricot");
		expect(result.out).not.toContain("banana");
		expect(result.out).not.toContain("cherry");
	});

	it("multiple custom commands can coexist", async () => {
		setCustomCommands(() => [
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
		]);

		const a = await run("cmd-a");
		const b = await run("cmd-b");
		expect(a.out).toBe("from a");
		expect(b.out).toBe("from b");
	});

	it("custom commands are reset when VFS is reset", async () => {
		setCustomCommands(() => [
			defineCommand("ephemeral", async () => ({
				stdout: "hi",
				stderr: "",
				exitCode: 0,
			})),
		]);

		const before = await run("ephemeral");
		expect(before.exitCode).toBe(0);

		setCustomCommands(() => []);
		resetVfs();

		const after = await run("ephemeral");
		expect(after.exitCode).not.toBe(0);
	});

	it("writeFile makes files visible to custom commands via ctx.fs", async () => {
		setCustomCommands(() => [
			defineCommand("upper", async (args, ctx) => {
				const path = args[0].startsWith("/")
					? args[0]
					: `${ctx.cwd}/${args[0]}`;
				const content = await ctx.fs.readFile(path);
				const outPath = args[1].startsWith("/")
					? args[1]
					: `${ctx.cwd}/${args[1]}`;
				await ctx.fs.writeFile(outPath, content.toUpperCase());
				return { stdout: `uppercased → ${outPath}`, stderr: "", exitCode: 0 };
			}),
		]);

		await writeFile("input.txt", "hello world");
		const result = await run(
			"upper /home/user/uploads/input.txt /home/user/uploads/output.txt",
		);
		expect(result.exitCode).toBe(0);
		const output = await readFile("output.txt");
		expect(output).toBe("HELLO WORLD");
	});
});

describe("VFS writeFile → bash integration", () => {
	afterEach(() => {
		resetVfs();
	});

	it("files written via writeFile are readable from bash", async () => {
		await writeFile("report.csv", "a,b\n1,2");
		const result = await run("cat /home/user/uploads/report.csv");
		expect(result.exitCode).toBe(0);
		expect(result.out).toBe("a,b\n1,2");
	});
});
