const { resolveEmbeddingsConfig } = require("../lib/index.cjs");
console.log(JSON.stringify(resolveEmbeddingsConfig(process.argv[2], {})));
