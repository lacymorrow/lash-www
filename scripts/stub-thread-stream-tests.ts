/**
 * Replace the content of ThreadStream test helpers with no-op stubs so the Next.js bundler
 * never traverses optional dependency chains that rely on `tap`, `mysql2`, etc.
 */
import { existsSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, resolve } from "path";

const stubbedExtensions = [".js", ".mjs", ".ts"];
const stubContent = 'module.exports = {};';

const testDir = resolve(process.cwd(), "node_modules", "thread-stream", "test");

function stubDirectory(currentDir: string): void {
	for (const entry of readdirSync(currentDir)) {
		const entryPath = join(currentDir, entry);
		const stats = statSync(entryPath);

		if (stats.isDirectory()) {
			stubDirectory(entryPath);
			continue;
		}

		if (!stubbedExtensions.some((ext) => entry.endsWith(ext))) {
			continue;
		}

		writeFileSync(entryPath, stubContent, "utf8");
	}
}

if (existsSync(testDir)) {
	stubDirectory(testDir);
}

