import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

assert.match(
  app,
  /const containScale = Math\.min\(window\.innerWidth \/ 1920, window\.innerHeight \/ 1080, 1\);[\s\S]*?--h1-figma-scale', String\(containScale\)/,
  "data pages must retain their complete proportional contain scaling",
);
assert.match(
  app,
  /const coverScale = Math\.max\(window\.innerWidth \/ 1920, window\.innerHeight \/ 1080\);[\s\S]*?--h1-artboard-cover-scale', String\(coverScale\)/,
  "1920×1080 report artboards must receive a dedicated proportional cover scale",
);
assert.match(
  app,
  /const scale=cover\s*\? Math\.max\(page\.clientWidth\/1920,page\.clientHeight\/1080\)\s*:\s*Math\.min\(page\.clientWidth\/1920,page\.clientHeight\/1080,maxScale\);/,
  "native OKR canvases must switch between contain and cover without distortion",
);
assert.match(
  app,
  /const H1_OKR_COVER_PAGE_IDS=new Set\(\[\s*'okr-elite-client-identity',\s*'okr-client-experience-model',\s*'okr-client-experience-cases',\s*'okr-elite-client-no1-experience',\s*'okr-elite-endorsement-resources',\s*'okr-elite-ferrari-experience',\s*'okr-elite-black-label',\s*'okr-elite-business-enablement',\s*\]\);/,
  "only O1 pages 14–21 may opt into cover scaling",
);
assert.match(
  app,
  /function OkrEliteClientForegroundPage\(\{page,index,count,onPreview,onVideoPreview\}\)\{[\s\S]*?useOkrCanvasScale\(\{cover:H1_OKR_COVER_PAGE_IDS\.has\(page\.id\)\}\)/,
  "the elite-client renderer must only cover the eight allowlisted pages",
);
assert.match(
  theme,
  /\.h1-okr-exact-artboard\s*\{[\s\S]*?width:\s*min\(100%,\s*calc\(100vh \* 16 \/ 9\)\);[\s\S]*?aspect-ratio:\s*16\s*\/\s*9;/,
  "unrelated exact Figma artboards must retain contain behavior",
);
assert.match(
  theme,
  /\.h1-okr-exact-frame\s*\{[\s\S]*?object-fit:\s*contain;/,
  "artwork must retain its native proportions inside the 16:9 cover artboard",
);
assert.match(
  theme,
  /\.h1-o2-report\s*\{[\s\S]*?--h1-o2-scale:\s*var\(--h1-figma-scale,\s*1\);/,
  "unrelated O2 pages must retain data-page contain scaling",
);
assert.match(
  app,
  /const H1_O2_COVER_PAGE_IDS=new Set\(\["o2-aso-leadership","o2-aso-evidence"\]\);/,
  "only O2 pages 18–19 may opt into cover scaling",
);
assert.match(
  app,
  /H1_O2_COVER_PAGE_IDS\.has\(page\.id\)\?"is-full-bleed":""/,
  "only the two reported O2 ASO pages may receive the full-bleed class",
);
assert.match(
  theme,
  /\.h1-o2-page\.is-full-bleed\s*\{\s*--h1-o2-scale:\s*var\(--h1-artboard-cover-scale,\s*1\);\s*\}/,
  "the O2 full-bleed override must use the dedicated cover scale",
);

console.log("H1 fullscreen proportional cover contract passed.");
