#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const APPS = {
	excel: { dir: "packages/excel", tagPrefix: "excel-v" },
	ppt: { dir: "packages/powerpoint", tagPrefix: "ppt-v" },
	sdk: { dir: "packages/sdk", tagPrefix: "sdk-v" },
};

const appName = process.argv[2];
const bumpType = process.argv[3];

if (!APPS[appName] || !["major", "minor", "patch"].includes(bumpType)) {
	console.error("Usage: node scripts/release.mjs <excel|ppt|sdk> <major|minor|patch>");
	process.exit(1);
}

const app = APPS[appName];

function run(cmd, options = {}) {
	console.log(`$ ${cmd}`);
	try {
		return execSync(cmd, {
			encoding: "utf-8",
			stdio: options.silent ? "pipe" : "inherit",
			...options,
		});
	} catch (e) {
		if (!options.ignoreError) {
			console.error(`Command failed: ${cmd}`);
			process.exit(1);
		}
		return null;
	}
}

function getVersion() {
	const pkg = JSON.parse(readFileSync(join(app.dir, "package.json"), "utf-8"));
	return pkg.version;
}

function updateChangelogForRelease(version) {
	const changelogPath = join(app.dir, "CHANGELOG.md");
	if (!existsSync(changelogPath)) {
		console.error(`  No CHANGELOG.md found at ${changelogPath}`);
		process.exit(1);
	}

	const content = readFileSync(changelogPath, "utf-8");
	if (!content.includes("## [Unreleased]")) {
		console.error(`  No [Unreleased] section in ${changelogPath}`);
		process.exit(1);
	}

	const date = new Date().toISOString().split("T")[0];
	const updated = content.replace(
		"## [Unreleased]",
		`## [Unreleased]\n\n## [${version}] - ${date}`,
	);
	writeFileSync(changelogPath, updated);
	console.log(`  Updated ${changelogPath}`);
}

// Main flow
console.log(`\n=== Release ${appName} (${bumpType}) ===\n`);

// 1. Check for uncommitted changes
console.log("Checking for uncommitted changes...");
const status = run("git status --porcelain", { silent: true });
if (status && status.trim()) {
	console.error("Error: Uncommitted changes detected. Commit or stash first.");
	console.error(status);
	process.exit(1);
}
console.log("  Working directory clean\n");

// 2. Bump version (no git tag, we'll tag ourselves with the prefix)
console.log(`Bumping version (${bumpType}) in ${app.dir}...`);
run(`pnpm --filter ./${app.dir} exec npm version ${bumpType} --no-git-tag-version`);
const version = getVersion();
console.log(`  New version: ${version}\n`);

// 3. Update changelog
console.log("Updating CHANGELOG.md...");
updateChangelogForRelease(version);
console.log();

// 4. Commit and tag
const tag = `${app.tagPrefix}${version}`;
console.log(`Committing and tagging as ${tag}...`);
run("git add .");
run(`git commit -m "${appName}: release ${tag}"`);
run(`git tag ${tag}`);
console.log();

// 5. Push
console.log("Pushing to remote...");
run("git push");
run(`git push origin ${tag}`);
console.log();

console.log(`=== Released ${tag} ===`);
