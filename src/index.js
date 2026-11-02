import { ensureRuntime } from "./lib/ensureRuntime.js";

await ensureRuntime();

const [store, embeddings, guards, add, search, forget] = await Promise.all([
  import("./lib/LlmStore.js"),
  import("./lib/Embeddings.js"),
  import("./lib/EmbeddingsGuard.js"),
  import("./bin/commands/AddDocumentExecutor.js"),
  import("./bin/commands/SearchExecutor.js"),
  import("./bin/commands/ForgetExecutor.js")
]);

export const LlmStore = store.default;
export const { getEmbeddings, DEFAULT_EMBEDDINGS_TYPE } = embeddings;
export const { ensureCompatibleEmbeddings, buildEmbeddingsMeta, writeEmbeddingsMeta, resolveEmbeddingsConfig } = guards;
export const { addDocumentExecutor } = add;
export const { searchExecutor } = search;
export const { forgetExecutor } = forget;
