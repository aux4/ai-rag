import { BedrockEmbeddings } from "@langchain/aws";
import { CohereEmbeddings } from "@langchain/cohere";
import { VertexAIEmbeddings } from "@langchain/google-vertexai";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { OllamaEmbeddings } from "@langchain/ollama";
import { OpenAIEmbeddings } from "@langchain/openai";
import { DatabricksEmbeddings } from "./DatabricksEmbeddings.js";
import { LocalEmbeddings } from "./LocalEmbeddings.js";

// The single source of truth for which embeddings type is used when none is configured.
// "local" runs fully offline (aux4/embedding, EmbeddingGemma 2 on CPU) -- no API key, no network.
export const DEFAULT_EMBEDDINGS_TYPE = "local";

// "openai" stays wired because legacy FAISS stores with no recorded embeddings metadata are
// treated as the old default "openai" (see EmbeddingsGuard.js). Now that the CLI and the
// programmatic API are each bundled to a single file (rollup), the rest of the provider SDKs
// (bedrock/cohere/mistral/ollama/vertex) bundle cheaply enough to keep wired in too -- see
// RELEASE.md for the measured zip-size impact.
const EMBEDDINGS = {
  local: LocalEmbeddings,
  openai: OpenAIEmbeddings,
  bedrock: BedrockEmbeddings,
  cohere: CohereEmbeddings,
  databricks: DatabricksEmbeddings,
  mistral: MistralAIEmbeddings,
  ollama: OllamaEmbeddings,
  vertex: VertexAIEmbeddings
};

export function getEmbeddings(type) {
  const embeddings = EMBEDDINGS[type];

  if (!embeddings) {
    throw new Error(`Unknown embeddings type: ${type}`);
  }

  return embeddings;
}
