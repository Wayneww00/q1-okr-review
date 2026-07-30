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
const rootShellRouteIndex = productionRoutes.findIndex(
  (route) =>
    route.src === "^/$" &&
    route.dest === "/previews/vantage-h1-immersive.html",
);
const filesystemRouteIndex = productionRoutes.findIndex(
  (route) => route.handle === "filesystem",
);

assert.ok(
  rootShellRouteIndex >= 0,
  "the production root must route to the immersive shell",
);
assert.ok(
  filesystemRouteIndex < 0 || rootShellRouteIndex < filesystemRouteIndex,
  "the immersive root route must run before Vercel serves the static index.html",
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
