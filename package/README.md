# aux4/ai-rag

Standalone document ingestion and semantic retrieval for aux4. It owns the FAISS
index and document lifecycle independently of the AI agent runtime, while using
`aux4/embedding` for the default local EmbeddingGemma vectors.

## Installation

```bash
aux4 aux4 pkger install aux4/ai-rag
```

Commands remain backwards compatible under `aux4 ai agent`:

- `learn` indexes a document or folder.
- `search` retrieves indexed content.
- `forget` removes indexed content.

Existing FAISS stores remain compatible. `ids.json` retains document chunk IDs,
and embedding metadata prevents mixing incompatible vectors. Legacy stores
without metadata continue to use the OpenAI embedding default.

Embeddings support multiple providers: `local` (default, fully offline), `openai`,
`bedrock`, `cohere`, `databricks`, `mistral`, `ollama`, and `vertex`. Pass
`--embeddings '{"type":"<provider>","config":{...}}'` to `learn`/`search`/`forget`
to select one; a store remembers which provider/config it was built with and
rejects a mismatched one with a clear "forget and re-learn" error.
