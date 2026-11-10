# Release notes

## Published package is now a single bundled file, well under the hub's size limit

The published archive previously shipped source files alongside their full `node_modules` tree
(or, more recently, relied on installing dependencies on first use) — both pushed the archive
past the registry's 50MB compressed limit, so the package could not be installed from either
hub. The CLI and the programmatic API are now each bundled to a single file at build time
(`package/lib/aux4-ai-rag.cjs` and `package/lib/index.cjs`); only the native FAISS binding
(`faiss-node`) ships as a real dependency in `package/lib/node_modules`. The published archive
is now well under 10MB.

All document loaders (`txt`, `csv`, `json`, `pdf`, `docx`, `pptx`) and all embedding providers
(`local`, `openai`, `bedrock`, `cohere`, `databricks`, `mistral`, `ollama`, `vertex`) are kept.
