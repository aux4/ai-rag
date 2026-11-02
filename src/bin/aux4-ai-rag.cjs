#!/usr/bin/env node

(async () => {
  const { ensureRuntime } = await import("../lib/ensureRuntime.js");
  ensureRuntime();
  const [{ addDocumentExecutor }, { searchExecutor }, { forgetExecutor }] = await Promise.all([
    import("./commands/AddDocumentExecutor.js"),
    import("./commands/SearchExecutor.js"),
    import("./commands/ForgetExecutor.js")
  ]);
  const args = process.argv.slice(2);
  const json = value => JSON.parse(value || "{}");
  try {
    if (args[0] === "learn") await addDocumentExecutor({ storage: args[1] || ".context", doc: args[2], type: args[3] || "", embeddings: json(args[4]) });
    else if (args[0] === "search") await searchExecutor({ storage: args[1] || ".context", format: args[2] || "text", source: args[3] || "", limit: Number(args[4] || 1), query: args[5], embeddings: json(args[6]) });
    else if (args[0] === "forget") await forgetExecutor({ storage: args[1] || ".context", doc: args[2] || "", embeddings: json(args[3]) });
    else { console.error("Usage: aux4-ai-rag <learn|search|forget> ..."); process.exitCode = 1; }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
