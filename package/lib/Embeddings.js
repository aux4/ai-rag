import { OpenAIEmbeddings } from "@langchain/openai";
import { DatabricksEmbeddings } from "./DatabricksEmbeddings.js";
import { LocalEmbeddings } from "./LocalEmbeddings.js";

// The single source of truth for which embeddings type is used when none is configured.
// "local" runs fully offline (aux4/embedding, EmbeddingGemma 2 on CPU) -- no API key, no network.
export const DEFAULT_EMBEDDINGS_TYPE = "local";

// Only providers with a real, non-trivial consumer are wired in. This keeps the
// published package's runtime dependency tree (and zip size) small -- each
// optional LangChain provider SDK (bedrock, cohere, mistral, ollama, vertex, ...)
// pulls tens of MB of its own transitive deps (AWS SDK, Smithy, Cohere client,
// etc.) that go unused unless a store was actually built with that provider.
// "openai" stays wired because legacy FAISS stores with no recorded embeddings
// metadata are treated as the old default "openai" (see EmbeddingsGuard.js).
// "databricks" stays wired because it's a lightweight fetch-based implementation
// with no extra SDK dependency. Add a provider back here only when there's a
// concrete need for it.
const EMBEDDINGS = {
  local: LocalEmbeddings,
  openai: OpenAIEmbeddings,
  databricks: DatabricksEmbeddings
};

export function getEmbeddings(type) {
  const embeddings = EMBEDDINGS[type];

  if (!embeddings) {
    throw new Error(`Unknown embeddings type: ${type}`);
  }

  return embeddings;
}
