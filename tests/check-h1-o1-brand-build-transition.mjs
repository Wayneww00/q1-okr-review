import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o1-complete-theme.css"),
  "utf8",
);

assert.match(
  app,
  /id:'okr-brand-results'[\s\S]*?id:'okr-brand-build-transition'[\s\S]*?id:'okr-brand-refresh'/,
  "the transition must render immediately after 什么是全球一线品牌",
);
assert.match(
  app,
  /function OkrBrandBuildTransitionPage\(\{page,index,count\}\)/,
  "the transition must have a dedicated native O1 page component",
);
assert.match(
  app,
  /className="h1-okr-build-transition-watermark"[^>]*>1\+6<\/div>/,
  "the reference-led chapter cover must use an outlined 1+6 watermark",
);
assert.match(
  app,
  /O1 · BRAND BUILDING SYSTEM/,
  "the chapter cover must include the approved O1 eyebrow",
);
assert.match(
  app,
  /className="h1-okr-build-transition-code"[^>]*>1\+6<\/span>[\s\S]*?<span className="h1-okr-build-transition-title">1 个升级 \+ 6 个核心抓手<\/span>/,
  "the approved Chinese message must follow the reference chapter hierarchy",
);
assert.match(
  app,
  /ONE UPGRADE[\s\S]*?SIX CORE LEVERS/,
  "the approved English design line must support the Chinese message",
);
assert.match(
  app,
  /page\.id==='okr-brand-build-transition'\s*\?\s*<OkrBrandBuildTransitionPage/,
  "the O1 registry must route the transition to its dedicated component",
);
assert.match(
  theme,
  /\.h1-okr-build-transition-veil\s*\{[\s\S]*?linear-gradient\(/,
  "the transition must protect text contrast with a background-integrated veil",
);
assert.match(
  theme,
  /\.h1-okr-build-transition-heading\s*\{/,
  "the transition must use a dedicated projection-scale chapter heading",
);
assert.match(
  theme,
  /\.h1-okr-build-transition-watermark\s*\{[\s\S]*?-webkit-text-stroke:/,
  "the background 1+6 must be rendered as a restrained outline watermark",
);
assert.match(
  theme,
  /\.h1-okr-build-transition-title\s*\{[\s\S]*?font-family:\s*"Noto Serif SC"[\s\S]*?font-weight:\s*900/,
  "the approved A direction must use a high-weight modern serif display face",
);

console.log("H1 O1 brand-building transition contract passed.");
