import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
const require = createRequire(import.meta.url);
const sharp = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp",
);

assert.doesNotMatch(
  app,
  /OKR_GLASS_PANELS|h1-okr-glass-underlays/,
  "OKR contrast must not be implemented with additional DOM underlay layers",
);
assert.doesNotMatch(
  theme,
  /\.h1-okr-glass-underlays/,
  "OKR contrast must not be implemented with an additional CSS underlay system",
);

const representativeCardRegions = [
  ["p25-overlay.png", [66.93, 11.85, 19.64, 21.7]],
  ["p27-overlay.png", [54.22, 21.57, 37.45, 8.7]],
  ["okr-p29-overlay.png", [7.2917, 18.1481, 83.3333, 11.1111]],
  ["okr-p30-overlay.png", [8.33, 11.85, 83.34, 7.69]],
  ["okr-p32-matrix-overlay.png", [8.33, 23.7, 83.34, 17.31]],
  ["okr-p32-tvc-overlay.png", [8.85, 3.61, 83.33, 39.17]],
  ["okr-p33-overlay.png", [7.55, 23.8, 83.3, 38.8]],
  ["okr-p34-overlay.png", [8.33, 24.5, 83.34, 15.7]],
  ["awards-overlay.png", [8.33, 16.2, 83.34, 8.8]],
  ["salon-overlay.png", [8.33, 15.65, 83.34, 8.9]],
  ["expo-overlay.png", [8.33, 15.65, 83.34, 8.9]],
];

for (const [fileName, [x, y, width, height]] of representativeCardRegions) {
  const asset = path.join(
    root,
    "previews",
    "assets",
    "figma-exact",
    fileName,
  );
  const { data, info } = await sharp(asset)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const left = Math.round((x / 100) * info.width);
  const top = Math.round((y / 100) * info.height);
  const right = Math.round(((x + width) / 100) * info.width);
  const bottom = Math.round(((y + height) / 100) * info.height);
  const alphas = [];
  for (let row = top; row < bottom; row += 1) {
    for (let column = left; column < right; column += 1) {
      const alpha = data[(row * info.width + column) * info.channels + 3];
      if (alpha > 0) alphas.push(alpha);
    }
  }
  alphas.sort((a, b) => a - b);
  const lowerQuartile = alphas[Math.floor(alphas.length * 0.25)];
  assert.ok(
    lowerQuartile >= 108,
    `${fileName} must increase opacity on its original card pixels; q25 alpha was ${lowerQuartile}`,
  );
}

console.log("H1 OKR native-card opacity contract passed.");
