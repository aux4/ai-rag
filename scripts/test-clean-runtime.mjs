import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = path.join(root, "package");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aux4-ai-rag-clean-runtime-"));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited ${result.status}\n${result.stdout || ""}\n${result.stderr || ""}`);
  }
  return result;
}

try {
  const archiveDir = path.join(tempDir, "archives");
  fs.mkdirSync(archiveDir);
  run("aux4", ["aux4", "pkger", "build", ".", "--out", archiveDir], { cwd: packageDir });
  const archive = fs.readdirSync(archiveDir).find(file => file.endsWith(".zip"));
  assert.ok(archive, "package archive was not built");

  run("unzip", ["-q", path.join(archiveDir, archive), "-d", tempDir]);
  const installDir = path.join(tempDir, "aux4", "ai-rag");
  const libDir = path.join(installDir, "lib");
  assert.equal(fs.existsSync(path.join(libDir, "node_modules")), false, "archive must not contain host-specific dependencies");

  const contentPath = path.join(installDir, "content.txt");
  const mockPath = path.join(installDir, "mock-embeddings.mjs");
  const storagePath = path.join(installDir, ".context");
  fs.writeFileSync(contentPath, "John Doe works at Acme Corp.\n");
  fs.writeFileSync(mockPath, [
    "let input = \"\";",
    "process.stdin.on(\"data\", chunk => input += chunk);",
    "process.stdin.on(\"end\", () => console.log(JSON.stringify(JSON.parse(input).map(() => [1, 0, 0]))));"
  ].join("\n"));

  const cli = path.join(libDir, "aux4-ai-rag.cjs");
  const embeddings = JSON.stringify({ type: "local", config: { dimension: 3 } });
  const env = { ...process.env, AUX4_LOCAL_EMBEDDINGS_COMMAND: "node mock-embeddings.mjs" };
  run(process.execPath, [cli, "learn", storagePath, contentPath, "", embeddings], { cwd: installDir, env });
  const apiResult = run(process.execPath, [path.join(installDir, "test", "api-smoke.mjs")], { cwd: installDir });
  assert.equal(apiResult.stdout.trim(), "function,function,function,function");

  fs.rmSync(path.join(libDir, "node_modules"), { recursive: true, force: true });
  const search = run(process.execPath, [cli, "search", storagePath, "json", "", "1", "who is John Doe?", embeddings], { cwd: installDir, env });
  const results = JSON.parse(search.stdout);
  assert.ok(results[0]?.pageContent?.includes("John Doe"), "first-use search should return indexed content as clean JSON");
  console.log("Clean package bootstrap and first-use JSON search passed");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
