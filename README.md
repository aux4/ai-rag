# aux4/ai-rag

Standalone document ingestion and semantic retrieval for aux4. It owns the FAISS
index and document lifecycle independently of the AI agent runtime, while using
`aux4/embedding` for the default local EmbeddingGemma vectors.

Commands are exposed as the backwards-compatible `aux4 ai agent learn`,
`aux4 ai agent search`, and `aux4 ai agent forget`. Existing FAISS stores remain compatible; `ids.json` retains
document chunk IDs and records the embedding configuration to prevent mixing
incompatible vectors. Legacy stores without metadata are treated as OpenAI stores.

The JavaScript library exports `LlmStore`, embedding factories, compatibility
guards, and the three command executors from `src/index.js`.
