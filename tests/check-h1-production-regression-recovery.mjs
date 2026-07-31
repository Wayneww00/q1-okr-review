import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const immersive = readFileSync(
  resolve(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);
const report = readFileSync(resolve(root, "index.html"), "utf8");
const runtime = readFileSync(
  resolve(root, "src/vantage-browser-runtime.mjs"),
  "utf8",
);
const aiModule = readFileSync(
  resolve(root, "previews/ai-data-products/index.html"),
  "utf8",
);

assert.ok(
  existsSync(resolve(root, "previews/assets/vantage-h1-login-figma.png")),
  "the refreshed desktop login artwork must be present",
);
assert.ok(
  existsSync(resolve(root, "previews/assets/vantage-h1-login-background.png")),
  "the responsive login background must be present",
);
assert.match(immersive, /--login-scale:/);
assert.match(immersive, /class="login-fields"/);
assert.match(immersive, /vantage-h1-login-figma\.png/);
assert.match(
  report,
  /className="production-login-gate"/,
  "the production entry point must render the refreshed login instead of the legacy glass card",
);
assert.match(
  report,
  /background-image:url\("previews\/assets\/vantage-h1-login-figma\.png"\)/,
  "the production login must use the approved desktop artwork",
);
assert.match(
  immersive,
  /<source src="assets\/vantage-h1-opening-final-4k\.mp4" type="video\/mp4"/,
);
assert.match(runtime, /export function setVideoSource/);
assert.match(report, /className="h1-o2-lifecycle-proof"/);
assert.match(report, /2025 H2 vs 2026 H1/);
assert.match(immersive, /moveDeckFromAiProducts\(direction\);/);
assert.match(immersive, /doc\.URL === 'about:blank'/);
assert.match(
  aiModule,
  /\.cockpit-card\.is-flipped \.cockpit-front \{ visibility:hidden; \}/,
);

console.log("H1 production regression recovery contract passed.");
