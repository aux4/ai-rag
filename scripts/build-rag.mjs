import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "package", "lib");
const libFiles = ["LlmStore.js", "DocLoaders.js", "DocSplitters.js", "Embeddings.js", "EmbeddingsGuard.js", "LocalEmbeddings.js", "DatabricksEmbeddings.js"];
const commandFiles = ["AddDocumentExecutor.js", "SearchExecutor.js", "ForgetExecutor.js"];

fs.mkdirSync(path.join(output, "commands"), { recursive: true });
for (const file of libFiles) fs.copyFileSync(path.join(root, "src", "lib", file), path.join(output, file));
for (const file of commandFiles) fs.copyFileSync(path.join(root, "src", "bin", "commands", file), path.join(output, "commands", file));
console.log(`Synced ${libFiles.length + commandFiles.length} ai-rag runtime modules into package/lib`);
