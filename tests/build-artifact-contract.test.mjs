import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [vercelConfig, buildScript] = await Promise.all([
  readFile("vercel.json", "utf8").then(JSON.parse),
  readFile("scripts/build-production.mjs", "utf8"),
]);

assert.equal(
  vercelConfig.outputDirectory,
  "dist",
  "Vercel must deploy a dedicated build artifact rather than the 3.8GB workspace",
);

const productionRoutes = vercelConfig.routes || [];
const rootShellRewriteIndex = productionRoutes.findIndex(
  (route) =>
    route.src === "^/$" &&
    route.dest === "/previews/vantage-h1-immersive.html",
);
const rootShellRedirectIndex = productionRoutes.findIndex(
  (route) =>
    route.src === "^/$" &&
    route.status === 307 &&
    route.headers?.Location === "/previews/vantage-h1-immersive.html",
);
const filesystemRouteIndex = productionRoutes.findIndex(
  (route) => route.handle === "filesystem",
);

assert.ok(
  rootShellRedirectIndex >= 0,
  "the production root must redirect to the immersive shell so relative media paths keep the /previews/ base URL",
);
assert.ok(
  filesystemRouteIndex < 0 || rootShellRedirectIndex < filesystemRouteIndex,
  "the root redirect must run before the filesystem serves index.html",
);
assert.equal(
  rootShellRewriteIndex,
  -1,
  "the production root must not rewrite the shell at / because that resolves preview-relative videos and iframes from the wrong directory",
);

assert.ok(
  buildScript.includes('extension === ".mp4"'),
  "the production artifact must exclude every local MP4",
);
assert.ok(
  buildScript.includes('"previews/assets"'),
  "the production artifact must still include report images and posters",
);
assert.match(
  buildScript,
  /cp\(\s*resolve\(root,\s*"previews\/ai-data-products"\),\s*resolve\(distDir,\s*"previews\/ai-data-products"\)/s,
  "the production artifact must include the complete AI Data Products iframe module",
);

console.log("Vantage production artifact contract passed.");
