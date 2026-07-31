import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

assert.match(
  app,
  /id:'okr-merchandise'[\s\S]*?id:'vantage-objects'[\s\S]*?https:\/\/vantage-objects-452443727878\.asia-southeast1\.run\.app\//,
  "the merchandise CTA must target the supplied Vantage Objects URL",
);
assert.match(
  app,
  /function OkrExternalLinks\(\{page\}\)[\s\S]*?target="_blank"[\s\S]*?rel="noopener noreferrer"/,
  "the merchandise CTA must open as an external tab with safe opener isolation",
);
assert.match(
  app,
  /OkrDirectFigmaForegroundPage[\s\S]*?<OkrExternalLinks page=\{page\}\/>/,
  "the direct Figma page must render configured external CTA areas",
);
assert.match(css, /\.h1-okr-external-link/, "the CTA must be keyboard-focusable and interactive");
assert.match(
  app,
  /id:'vantage-objects'[\s\S]*?ctaText:'即刻触及'[\s\S]*?variant:'gold'/,
  "the merchandise link must render the visible gold CTA label",
);
assert.match(
  css,
  /\.h1-okr-external-link\.is-gold::before[\s\S]*?border-radius: 999px[\s\S]*?background: #c9963f/,
  "the merchandise CTA must use the simple solid-gold pill treatment",
);
assert.match(
  css,
  /\.h1-okr-external-link\.is-gold[\s\S]*?text-decoration: none !important[\s\S]*?\.h1-okr-external-link\.is-gold span[\s\S]*?text-decoration: none !important/,
  "the merchandise CTA and its label must not show link underlines",
);

console.log("H1 merchandise external-link contract passed");
