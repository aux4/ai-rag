import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.basename(path.dirname(moduleDir)) === "src"
  ? path.resolve(moduleDir, "../../package/lib")
  : moduleDir;
const require = createRequire(path.join(runtimeDir, "ensureRuntime.js"));

// faiss-node contains a native binary for the current OS and architecture. A
// package archive may have been built on a different host, so reinstall its
// locked runtime dependencies on first use whenever the native module fails.
export function ensureRuntime() {
  try {
    require("faiss-node");
    return;
  } catch {
    // Missing modules and binaries built for another platform are both repaired
    // by installing from the package's lockfile on the target machine.
  }

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
}
