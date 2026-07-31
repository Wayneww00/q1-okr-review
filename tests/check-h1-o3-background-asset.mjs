import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(resolve(root, "previews/h1-o3-theme.css"), "utf8");
const dateFreeBackground =
  "./assets/o1-complete/figma-untitled/p68-trophy-background.png";

assert.ok(
  existsSync(resolve(root, "previews", dateFreeBackground)),
  "the date-free 1920×1080 trophy background must exist",
);
assert.match(
  theme,
  new RegExp(
    `--h1-o3-trophy-stage:url\\("${dateFreeBackground.replaceAll(".", "\\.")}"\\)`,
  ),
  "O3 must use the date-free trophy background",
);
assert.doesNotMatch(
  theme,
  /--h1-o3-trophy-stage:url\("\.\/assets\/o3\/figma-vantage-trophy-bg\.png"\)/,
  "O3 must not reference the dated trophy background",
);
assert.match(
  app,
  /previews\/h1-o3-theme\.css\?v=20260731-aso-proof-rank-v1/,
  "the O3 stylesheet URL must use the latest ASO-density cache key",
);

console.log("H1 O3 date-free background asset contract passed.");
