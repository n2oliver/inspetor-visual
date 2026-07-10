const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["scripts/content.js"],
    bundle: true,
    outfile: "dist/content.js",
    format: "iife",
    target: "chrome120",
    minify: false,
    sourcemap: true
}).catch(() => process.exit(1));