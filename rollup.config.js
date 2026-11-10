import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import preserveShebang from "rollup-plugin-preserve-shebang";
import { builtinModules } from "module";

// faiss-node is the only truly native dependency (ships a prebuilt .node binary for the host
// OS/arch via prebuild-install). Everything else -- @langchain/*, pdf-parse, mammoth,
// officeparser, d3-dsv -- is pure JS and gets inlined into the bundle below, so the published
// package only needs to carry faiss-node's own small runtime tree (see package/lib/package.json).
const external = [...builtinModules, "faiss-node"];

const resolve = () => nodeResolve({
  preferBuiltins: true,
  resolveOnly: module => !module.includes("faiss-node") && !module.includes(".node"),
  browser: false,
  exportConditions: ["node"]
});

const commonJs = () => commonjs({
  requireReturnsDefault: "auto",
  defaultIsModuleExports: true,
  transformMixedEsModules: true,
  ignoreDynamicRequires: true
});

export default [
  // CLI entry point used by package/.aux4 (aux4 ai:agent learn|search|forget).
  {
    input: "src/bin/executable.js",
    external,
    plugins: [preserveShebang(), resolve(), json(), commonJs()],
    output: {
      file: "package/lib/aux4-ai-rag.cjs",
      format: "cjs",
      inlineDynamicImports: true
    }
  },
  // Programmatic API entry point (LlmStore, addDocumentExecutor, searchExecutor, forgetExecutor).
  // CJS (not ESM) output: some document loaders (e.g. the PPTX loader's bundled, webpack-UMD
  // pdf.js) reference the `require` global directly at module-init time -- that global only
  // exists in CommonJS, so an ESM bundle throws merely on import. CJS keeps that global real.
  {
    input: "src/index.js",
    external,
    plugins: [resolve(), json(), commonJs()],
    output: {
      file: "package/lib/index.cjs",
      format: "cjs",
      inlineDynamicImports: true
    }
  }
];
