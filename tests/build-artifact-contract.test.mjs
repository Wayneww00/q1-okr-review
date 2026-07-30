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
const rootShellRedirect = (vercelConfig.redirects || []).find(
  (redirect) =>
    redirect.source === "/" &&
    redirect.destination === "/previews/vantage-h1-immersive.html",
);

assert.ok(
  rootShellRedirect,
  "the production root must redirect to the immersive shell so relative media paths keep the /previews/ base URL",
);
assert.equal(
  rootShellRedirect.permanent,
  false,
  "the root redirect should remain temporary while the immersive entry path can evolve",
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

console.log("Vantage production artifact contract passed.");
