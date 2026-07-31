import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const css = fs.readFileSync(
  path.join(repoRoot, "previews/h1-figma-racing-theme.css"),
  "utf8",
);
const immersive = fs.readFileSync(
  path.join(repoRoot, "previews/vantage-h1-immersive.html"),
  "utf8",
);
const expectedThemeVersion = "20260731-social-sov-order-v1";

const regions = html.match(
  /function O2Regions\(\)\{([\s\S]*?)\n\}\n\nfunction O2Delivery\(\)/,
)?.[1];
const ibLoop = html.match(
  /function O2IbLoop\(\)\{([\s\S]*?)\n\}\n\nfunction O2ReportPage\(/,
)?.[1];
const regionStyles = css.match(
  /\/\* Regions \*\/([\s\S]*?)\/\* Global delivery \*\//,
)?.[1];

assert.ok(regions, "O2 regional-growth page source must be discoverable");
assert.ok(ibLoop, "O2 partnership-growth page source must be discoverable");
assert.ok(regionStyles, "O2 regional-growth styles must be discoverable");

assert.match(
  regions,
  /<div className="h1-o2-panel-title"><span>LTV \/ CAC 提升<\/span><strong>生命周期运营验证<\/strong><\/div>/,
  "page 21 must preserve the previous editor text slot before the LTV/CAC bars",
);
assert.match(
  regions,
  /<div><span>印度再营销<\/span><i style=\{\{height:"38%"\}\}\/><b>\+157%<\/b><small>Q1 vs Q2<\/small><\/div>/,
  "page 21 must keep India remarketing as the third LTV/CAC bar",
);
assert.doesNotMatch(
  regions,
  /h1-o2-lifecycle-proof/,
  "page 21 must not move the third bar into a separately ordered proof card",
);
assert.match(
  regionStyles,
  /\.h1-o2-ltv-bars\s*\{[\s\S]*?justify-content:\s*center;[\s\S]*?gap:\s*70px;/,
  "page 21 must use the previous three-bar spacing",
);
assert.match(
  regionStyles,
  /\.h1-o2-region-conclusion\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?gap:\s*18px;/,
  "page 21 conclusion must use the previous single-column layout",
);
assert.doesNotMatch(
  regionStyles,
  /\.h1-o2-lifecycle-proof/,
  "page 21 styles must not retain the removed proof-card layout",
);

assert.match(
  ibLoop,
  /<span className="h1-o2-card-label">荷兰市场验证<\/span>\s*<strong>21%<\/strong>/,
  "page 25 must preserve the previous editor text slot before the 21% proof",
);

assert.match(
  html,
  new RegExp(
    `h1-figma-racing-theme\\.css\\?v=${expectedThemeVersion}`,
  ),
  "the standalone report must cache-bust the restored O2 layout",
);
assert.match(
  immersive,
  new RegExp(
    `h1-figma-racing-theme\\.css\\?v=${expectedThemeVersion}`,
  ),
  "the immersive report shell must cache-bust the restored O2 layout",
);

console.log("O2 editor/layout regression contract passed.");
