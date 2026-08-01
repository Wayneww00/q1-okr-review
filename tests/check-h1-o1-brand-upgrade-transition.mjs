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
  /function OkrBrandUpgradeTransitionPage\(\{page,index,count\}\)/,
  "the brand-upgrade chapter cover must use a dedicated native component",
);
assert.match(
  app,
  /className="h1-okr-brand-upgrade-transition-watermark"[^>]*>BRAND REFRESH<\/div>/,
  "the reference-led chapter cover must use the approved outlined watermark",
);
assert.match(
  app,
  /id="h1-okr-brand-upgrade-transition-title"[^>]*>品牌升级<\/h1>[\s\S]*?<p>让 <strong>Vantage<\/strong> 被识别<\/p>/,
  "the chapter cover must render the exact approved Chinese message and corrected brand spelling",
);
assert.match(
  app,
  /page\.id==='okr-brand-upgrade-transition'\s*\?\s*<OkrBrandUpgradeTransitionPage/,
  "the O1 registry must route the chapter cover to its dedicated component",
);
assert.match(
  theme,
  /\.h1-okr-brand-upgrade-transition-veil\s*\{[\s\S]*?linear-gradient\(/,
  "the chapter cover must preserve legibility with a background-integrated veil",
);
assert.match(
  theme,
  /\.h1-okr-brand-upgrade-transition-watermark\s*\{[\s\S]*?-webkit-text-stroke:/,
  "the large BRAND REFRESH line must remain an understated outline watermark",
);
assert.match(
  theme,
  /\.h1-okr-brand-upgrade-transition-content h1\s*\{[\s\S]*?font-size:\s*132px[\s\S]*?font-weight:\s*900/,
  "the primary Chinese title must preserve the reference's projection-scale hierarchy",
);
assert.match(
  theme,
  /\.h1-okr-brand-upgrade-transition-progress\s*\{/,
  "the chapter cover must retain the reference's restrained progress-bar accent",
);

console.log("H1 O1 brand-upgrade transition contract passed.");
