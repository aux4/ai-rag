import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// This package's native dependency (faiss-node) is installed into package/lib/node_modules
// at build time (npm run build), on the publishing CI host, and shipped inside the archive --
// the same model aux4/ai-agent uses for its own native deps. This script verifies the built
// archive is self-contained: a clean unzip, with no further install step, can learn and
// search immediately, and the programmatic API entry point loads.
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
  assert.ok(fs.existsSync(path.join(packageDir, "lib", "node_modules", "faiss-node")),
    "package/lib/node_modules/faiss-node must be installed before building the archive (run `npm run build`)");

  const archiveDir = path.join(tempDir, "archives");
  fs.mkdirSync(archiveDir);
  run("aux4", ["aux4", "pkger", "build", ".", "--out", archiveDir], { cwd: packageDir });
  const archive = fs.readdirSync(archiveDir).find(file => file.endsWith(".zip"));
  assert.ok(archive, "package archive was not built");

  run("unzip", ["-q", path.join(archiveDir, archive), "-d", tempDir]);
  const installDir = path.join(tempDir, "aux4", "ai-rag");
  const libDir = path.join(installDir, "lib");
  assert.ok(fs.existsSync(path.join(libDir, "node_modules", "faiss-node")),
    "archive must ship its native runtime dependency (faiss-node)");

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

  const search = run(process.execPath, [cli, "search", storagePath, "json", "", "1", "who is John Doe?", embeddings], { cwd: installDir, env });
  const results = JSON.parse(search.stdout);
  assert.ok(results[0]?.pageContent?.includes("John Doe"), "clean-unzip search should return indexed content as clean JSON");

  const apiResult = run(process.execPath, [path.join(installDir, "test", "api-smoke.mjs")], { cwd: installDir });
  assert.equal(apiResult.stdout.trim(), "function,function,function,function");

  console.log("Clean package bootstrap, immediate learn/search, and programmatic API all passed");
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
