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
  /id:'okr-brand-build-transition'[\s\S]*?id:'okr-brand-upgrade-transition'[\s\S]*?id:'okr-brand-refresh'/,
  "the brand-upgrade chapter cover must sit immediately before the existing upgrade page",
);
assert.match(
  app,
  /function OkrBrandUpgradeTransitionPage\(props\)\{[\s\S]*?<OkrChapterTransitionPage \{\.\.\.props\}/,
  "the brand-upgrade page must render through the shared transition master",
);
assert.match(
  app,
  /id:'okr-brand-upgrade-transition'[\s\S]*?watermark:'BRAND REFRESH'[\s\S]*?eyebrow:'BRAND REFRESH'/,
  "the reference-led chapter cover must use the approved outlined watermark",
);
assert.match(
  app,
  /title:'品牌升级'[\s\S]*?subtitle:'让 Vantage 被识别'[\s\S]*?emphasis:'Vantage'/,
  "the chapter cover must render the exact approved Chinese message and corrected brand spelling",
);
assert.match(
  app,
  /page\.id==='okr-brand-upgrade-transition'\s*\?\s*<OkrBrandUpgradeTransitionPage/,
  "the O1 registry must route the chapter cover to its dedicated component",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-veil\s*\{[\s\S]*?linear-gradient\(/,
  "the chapter cover must preserve legibility with a background-integrated veil",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-watermark\s*\{[\s\S]*?-webkit-text-stroke:/,
  "the large BRAND REFRESH line must remain an understated outline watermark",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-content h1\s*\{[\s\S]*?font-size:\s*min\(132px,[\s\S]*?font-weight:\s*900/,
  "the primary Chinese title must preserve the reference's projection-scale hierarchy",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-progress\s*\{/,
  "the chapter cover must retain the reference's restrained progress-bar accent",
);

console.log("H1 O1 brand-upgrade transition contract passed.");
