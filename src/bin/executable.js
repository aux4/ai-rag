#!/usr/bin/env node
import { addDocumentExecutor } from "./commands/AddDocumentExecutor.js";
import { searchExecutor } from "./commands/SearchExecutor.js";
import { forgetExecutor } from "./commands/ForgetExecutor.js";

// Wrapped in an async IIFE (rather than top-level await) so this entry point can be bundled
// to a CommonJS output -- CJS modules can't use top-level await.
(async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  const usage = () => console.error("Usage: aux4-ai-rag <learn|search|forget> ...");

  try {
    if (command === "learn") {
      await addDocumentExecutor({ storage: args[1] || ".context", doc: args[2], type: args[3] || "", embeddings: JSON.parse(args[4] || "{}") });
    } else if (command === "search") {
      await searchExecutor({ storage: args[1] || ".context", format: args[2] || "text", source: args[3] || "", limit: Number(args[4] || 1), query: args[5], embeddings: JSON.parse(args[6] || "{}") });
    } else if (command === "forget") {
      await forgetExecutor({ storage: args[1] || ".context", doc: args[2] || "", embeddings: JSON.parse(args[3] || "{}") });
    } else {
      usage();
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
})();
