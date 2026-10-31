// Public programmatic API for consumers installed from the aux4 package.
// Keep this entrypoint alongside the CLI runtime; the implementation remains
// independent of the ai-agent runtime.
export { default as LlmStore } from "./LlmStore.js";
export { getEmbeddings, DEFAULT_EMBEDDINGS_TYPE } from "./Embeddings.js";
export { ensureCompatibleEmbeddings, buildEmbeddingsMeta, writeEmbeddingsMeta, resolveEmbeddingsConfig } from "./EmbeddingsGuard.js";
export { addDocumentExecutor } from "./commands/AddDocumentExecutor.js";
export { searchExecutor } from "./commands/SearchExecutor.js";
export { forgetExecutor } from "./commands/ForgetExecutor.js";
