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
  /id:'okr-brand-results'[\s\S]*?id:'okr-brand-build-transition'[\s\S]*?id:'okr-brand-upgrade-transition'[\s\S]*?id:'okr-brand-refresh'/,
  "the transition must render immediately after 什么是全球一线品牌",
);
assert.match(
  app,
  /function OkrBrandBuildTransitionPage\(props\)\{[\s\S]*?<OkrChapterTransitionPage \{\.\.\.props\}/,
  "the 1+6 page must render through the shared transition master",
);
assert.match(
  app,
  /id:'okr-brand-build-transition'[\s\S]*?watermark:'1\+6'[\s\S]*?eyebrow:'BRAND BUILDING SYSTEM'/,
  "the reference-led chapter cover must use an outlined 1+6 watermark",
);
assert.match(
  app,
  /title:'1 个升级 \+ 6 个核心抓手'[\s\S]*?subtitle:'ONE UPGRADE \+ SIX CORE LEVERS'/,
  "the approved Chinese and English lines must use the shared chapter hierarchy",
);
assert.match(
  app,
  /function OkrChapterTransitionPage\(\{page,index,count\}\)[\s\S]*?useOkrCanvasScale\(\{cover:true\}\)/,
  "all transition pages must use cover scaling instead of letterboxing",
);
assert.match(
  app,
  /page\.id==='okr-brand-build-transition'\s*\?\s*<OkrBrandBuildTransitionPage/,
  "the O1 registry must route the transition to its dedicated component",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-veil\s*\{[\s\S]*?linear-gradient\(/,
  "the transition must protect text contrast with a background-integrated veil",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-watermark\s*\{[\s\S]*?-webkit-text-stroke:/,
  "the background 1+6 must be rendered as a restrained outline watermark",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-content h1\s*\{[\s\S]*?font-size:\s*min\(132px,[\s\S]*?font-weight:\s*900/,
  "1+6 must inherit the exact brand-refresh title scale and weight",
);

console.log("H1 O1 brand-building transition contract passed.");
