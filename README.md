# aux4/ai-rag

Standalone document ingestion and semantic retrieval for aux4. It owns the FAISS
index and document lifecycle independently of the AI agent runtime, while using
`aux4/embedding` for the default local EmbeddingGemma vectors.

Commands remain backwards compatible under `aux4 ai agent`:

- `learn` indexes a document or folder.
- `search` retrieves indexed content.
- `forget` removes indexed content.

Existing FAISS stores remain compatible. `ids.json` retains document chunk IDs,
and embedding metadata prevents mixing incompatible vectors. Legacy stores
without metadata continue to use the OpenAI embedding default.

The JavaScript library exports `LlmStore`, embedding factories, compatibility
guards, and command executors from `src/index.js`.

The package archive includes the locked runtime manifest but omits native
`node_modules`. On first use, the CLI installs those dependencies on the target
machine so FAISS uses a binary built for that machine's OS and architecture.
Programmatic imports perform the same setup before exporting the API.
