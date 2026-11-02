# RAG lifecycle

Exercise document indexing, retrieval, update, folder ingestion, and deletion
without network access by using a deterministic local embedding command.

```beforeAll
mkdir -p .context folder-a folder-b
```

```afterAll
rm -rf .context folder-a folder-b content.txt mock-embeddings.mjs
```

```file:mock-embeddings.mjs
let input = "";
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const items = JSON.parse(input);
  console.log(JSON.stringify(items.map(() => [1, 0, 0])));
});
```

## Learn and search a file

```file:content.txt
John Doe is a software engineer at Acme Corp.
```

```execute
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs learn .context content.txt '' '{"type":"local","config":{"dimension":3}}'
```

```execute
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs search .context text '' 1 'who is john doe?' '{"type":"local","config":{"dimension":3}}'
```

```output
John Doe is a software engineer at Acme Corp.
```

## First-use JSON search keeps stdout machine-readable

Clear the installed native runtime to simulate the first command after package
installation. The CLI must bootstrap the host's dependencies without writing
installer output into the JSON response.

```execute
node -e 'require("node:fs").rmSync("../lib/node_modules", { recursive: true, force: true })'
```

```execute
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs search .context json '' 1 'who is john doe?' '{"type":"local","config":{"dimension":3}}' | node -e 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>{const r=JSON.parse(s);if(!Array.isArray(r))process.exit(1);console.log("JSON valid")})'
```

```expect
JSON valid
```

## Update an indexed file

```execute
echo 'John Doe is a principal engineer at Acme Corp.' > content.txt
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs learn .context content.txt '' '{"type":"local","config":{"dimension":3}}'
```

```execute
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs search .context text '' 1 'who is john doe?' '{"type":"local","config":{"dimension":3}}'
```

```output
John Doe is a principal engineer at Acme Corp.
```

## Learn a folder and forget one source

```execute
echo 'Alice works at Alpha Inc.' > folder-a/alice.txt
echo 'Bob works at Beta Corp.' > folder-b/bob.txt
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs learn .context folder-a '' '{"type":"local","config":{"dimension":3}}'
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs learn .context folder-b '' '{"type":"local","config":{"dimension":3}}'
```

```execute
node ../lib/aux4-ai-rag.cjs forget .context folder-a '{"type":"local","config":{"dimension":3}}'
```

```execute
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs search .context text folder-b/bob.txt 1 'where does Bob work?' '{"type":"local","config":{"dimension":3}}'
```

```output
Bob works at Beta Corp.
```

```execute
node ../lib/aux4-ai-rag.cjs forget .context
```

```execute
AUX4_LOCAL_EMBEDDINGS_COMMAND='node mock-embeddings.mjs' node ../lib/aux4-ai-rag.cjs search .context text '' 1 'where does Alice work?' '{"type":"local","config":{"dimension":3}}'
```

```error
No documents have been indexed yet. Please use 'aux4 ai agent learn <document>' to add documents to the vector store first.
```
