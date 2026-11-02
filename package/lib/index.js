// Public API for consumers installed from the aux4 package. Resolve the target
// platform's native runtime before importing modules that load FAISS.
import { ensureRuntime } from "./ensureRuntime.js";

await ensureRuntime();

const [store, embeddings, guards, add, search, forget] = await Promise.all([
  import("./LlmStore.js"),
  import("./Embeddings.js"),
  import("./EmbeddingsGuard.js"),
  import("./commands/AddDocumentExecutor.js"),
  import("./commands/SearchExecutor.js"),
  import("./commands/ForgetExecutor.js")
]);

export const LlmStore = store.default;
export const { getEmbeddings, DEFAULT_EMBEDDINGS_TYPE } = embeddings;
export const { ensureCompatibleEmbeddings, buildEmbeddingsMeta, writeEmbeddingsMeta, resolveEmbeddingsConfig } = guards;
export const { addDocumentExecutor } = add;
export const { searchExecutor } = search;
export const { forgetExecutor } = forget;
