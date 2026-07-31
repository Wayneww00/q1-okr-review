import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

const report = fs.readFileSync("index.html", "utf8");
const theme = fs.readFileSync("previews/h1-figma-racing-theme.css", "utf8");
const formal = fs.readFileSync("previews/vantage-h1-immersive.html", "utf8");
const dataStagePath = "previews/assets/figma-racing/figma-vantage-wordmark-car-stage-140-36.png";

assert.ok(
  fs.existsSync(dataStagePath),
  "the exact Vantage-wordmark Figma stage from node 140:36 must exist locally",
);
const dataStage = fs.readFileSync(dataStagePath);
assert.equal(
  crypto.createHash("sha256").update(dataStage).digest("hex"),
  "5a07f4a47a98c7692bf48233f93fd9443e936b9d367dab5298e861ad01cde2c6",
  "the data pages must use the exact node 140:36 image bytes with the Vantage floor wordmark",
);
assert.equal(dataStage.readUInt32BE(16), 4096, "the exact Figma stage must preserve its source width");
assert.equal(dataStage.readUInt32BE(20), 2418, "the exact Figma stage must preserve its source height");
assert.equal(
  (theme.match(/assets\/figma-racing\/figma-vantage-wordmark-car-stage-140-36\.png/g) || []).length,
  1,
  "the Vantage-wordmark Figma data background must be declared exactly once",
);
assert.match(
  theme,
  /--h1-figma-data-stage:\s*url\("assets\/figma-racing\/figma-vantage-wordmark-car-stage-140-36\.png"\);/,
  "the exact Vantage-wordmark image must have a data-page-only background token",
);
assert.equal(
  (report.match(/data-h1-racing-stage/g) || []).length,
  1,
  "the ten data pages must share one fixed racing-stage element",
);
assert.match(
  theme,
  /\.h1-figma-racing-report \.h1-figma-fixed-stage\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?background-image:\s*var\(--h1-figma-data-stage\);[\s\S]*?background-size:\s*cover;/,
  "the ten pages must share the corrected fixed Figma data-stage image",
);

assert.match(
  report,
  /const isOperationalOverview = data\.id === 1;/,
  "only the first data page may carry the operational overview title",
);
assert.match(
  report,
  /const isPaidAdsChapter = data\.id === 4;/,
  "the first Paid Ads page must be treated as its own chapter opener",
);
assert.match(
  report,
  /\{isOperationalOverview\s*&&\s*\(\s*<header className="h1-figma-operational-title">/,
  "经营数据 must be rendered only by the first-page condition",
);
assert.match(
  report,
  /\{hasModuleTitle\s*&&\s*\(\s*<div className="h1-figma-module-title">/,
  "the module title must render on the Retail opener and Paid Ads opener",
);
assert.match(
  theme,
  /\.h1-figma-data-page\.has-module-title:not\(\.is-overview\) \.h1-figma-page-content\s*\{[\s\S]*?height:\s*818\.22363px;[\s\S]*?grid-template-rows:\s*33\.85742px\s+48px\s+182\.78873px\s+40px\s+513\.57745px;/,
  "the Paid Ads chapter title must fit above the same measured Figma cards without resizing them",
);
assert.match(
  theme,
  /\.h1-figma-data-page\.is-paid-ads-chapter \.h1-figma-module-title\s*\{[\s\S]*?width:\s*485\.06543px;/,
  "the Paid Ads chapter title must use the measured Figma title width",
);

assert.equal(
  (report.match(/periodLabel:"Half"/g) || []).length,
  10,
  "all ten current H1 data pages must remain present",
);
assert.ok(
  report.includes('label:"2025 H2"') && report.includes('label:"2026 H1"'),
  "the approved H1 comparison periods must remain unchanged",
);
assert.ok(
  formal.includes('src="../index.html?report=h1&embedded=1&v=20260731-tvc-four-videos-v1"'),
  "the local formal deck must keep the same embedded H1 report",
);
assert.ok(
  formal.includes('href="h1-figma-racing-theme.css?v=20260731-tvc-four-videos-v1"'),
  "the formal shell must load the high-contrast chart and region-table stylesheet",
);
assert.ok(
  formal.includes("figmaTheme.href = '/previews/h1-figma-racing-theme.css?v=20260731-tvc-four-videos-v1';"),
  "the embedded data report must load the high-contrast chart and region-table stylesheet",
);

console.log("H1 fixed red-car data-sequence contract passed.");
