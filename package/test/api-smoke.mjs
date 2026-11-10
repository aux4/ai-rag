import { LlmStore, addDocumentExecutor, searchExecutor, forgetExecutor } from "../lib/index.cjs";
console.log([typeof LlmStore, typeof addDocumentExecutor, typeof searchExecutor, typeof forgetExecutor].join(","));
