import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.basename(path.dirname(moduleDir)) === "src"
  ? path.resolve(moduleDir, "../../package/lib")
  : moduleDir;
const require = createRequire(path.join(runtimeDir, "ensureRuntime.js"));
const waitCell = new Int32Array(new SharedArrayBuffer(4));

function canLoadFaiss() {
  try {
    require("faiss-node");
    return true;
  } catch {
    return false;
  }
}

// faiss-node contains a native binary for the current OS and architecture. A
// package archive may have been built on a different host, so reinstall its
// locked runtime dependencies on first use whenever the native module fails.
export function ensureRuntime() {
  if (canLoadFaiss()) return;

  // Several aux4 commands can start at once on first use. Serialize npm ci so
  // concurrent commands don't delete or partially replace each other's tree.
  const lockDir = path.join(runtimeDir, ".aux4-runtime-install-lock");
  const deadline = Date.now() + 30 * 60 * 1000;
  while (true) {
    try {
      fs.mkdirSync(lockDir);
      break;
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        if (Date.now() - fs.statSync(lockDir).mtimeMs > 30 * 60 * 1000) {
          fs.rmSync(lockDir, { recursive: true, force: true });
          continue;
        }
      } catch (statError) {
        if (statError.code !== "ENOENT") throw statError;
      }
      if (Date.now() > deadline) throw new Error("Timed out waiting for ai-rag runtime installation");
      Atomics.wait(waitCell, 0, 0, 100);
    }
  }

  try {
    if (canLoadFaiss()) return;
    // Missing modules and binaries built for another platform are both repaired
    // by installing from the package's lockfile on the target machine.
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const result = spawnSync(npm, ["ci", "--omit=dev", "--no-audit", "--no-fund"], {
      cwd: runtimeDir,
      encoding: "utf8",
      // Keep installer progress off stdout: callers may be producing machine
      // readable JSON from a command invoked with --format json.
      stdio: ["ignore", "ignore", "inherit"]
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Could not install ai-rag runtime dependencies (npm exited ${result.status})`);

    try {
      require("faiss-node");
    } catch (error) {
      throw new Error(`ai-rag runtime installation completed, but faiss-node could not load: ${error.message}`);
    }
  } finally {
    fs.rmSync(lockDir, { recursive: true, force: true });
  }
}
