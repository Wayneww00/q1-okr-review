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
const expectedThemeVersion = "20260731-h1-growth-release-v1";

const regions = html.match(
  /function O2Regions\(\)\{([\s\S]*?)\n\}\n\nfunction O2Delivery\(\)/,
)?.[1];
const reportPage = html.match(
  /function O2ReportPage\(\{page,index,count\}\)\{([\s\S]*?)\n\}\n\nfunction O2ReportDeck\(\)/,
)?.[1];
const ibLoop = html.match(
  /function O2IbLoop\([^)]*\)\{([\s\S]*?)\n\}\n\n(?:const H1_O2_COVER_PAGE_IDS[^\n]*\n\n)?function O2ReportPage\(/,
)?.[1];
const regionStyles = css.match(
  /\/\* Regions \*\/([\s\S]*?)\/\* Global delivery \*\//,
)?.[1];
assert.ok(regions, "O2 regional-growth page source must be discoverable");
assert.ok(reportPage, "O2 report-page shell source must be discoverable");
assert.ok(ibLoop, "O2 partnership-growth page source must be discoverable");
assert.ok(regionStyles, "O2 regional-growth styles must be discoverable");

assert.match(
  regions,
  /const ltvMarkets=\[\["印度","\+485%","86%"\],\["阿联酋","\+220%","52%"\]\];/,
  "page 21 must keep only India and UAE in the main LTV/CAC chart",
);
assert.match(
  regions,
  /const lifecycleProof=\{label:"印度再营销",value:"\+157%",period:"Q1 vs Q2"\};/,
  "page 21 must preserve the India remarketing proof data",
);
assert.match(
  regions,
  /className="h1-o2-region-copy"[\s\S]*?className="h1-o2-lifecycle-proof"[\s\S]*?\{lifecycleProof\.value\}[\s\S]*?\{lifecycleProof\.label\}[\s\S]*?\{lifecycleProof\.period\}/,
  "page 21 must place India remarketing in a dedicated proof card below the chart",
);
assert.doesNotMatch(
  regions,
  /className="h1-o2-ltv-bars"[\s\S]{0,900}印度再营销/,
  "page 21 must not leave India remarketing as a third chart bar",
);
assert.match(
  regionStyles,
  /\.h1-o2-ltv-bars\s*\{[\s\S]*?justify-content:\s*center;[\s\S]*?gap:\s*108px;/,
  "page 21 must use balanced spacing for the two remaining chart bars",
);
assert.match(
  regionStyles,
  /\.h1-o2-region-conclusion\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,1fr\) 360px;[\s\S]*?gap:\s*32px;/,
  "page 21 conclusion must reserve a stable right column for the relocated proof",
);
assert.match(
  regionStyles,
  /\.h1-o2-lifecycle-proof\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,1fr\) auto;[\s\S]*?overflow:\s*hidden;[\s\S]*?background:/,
  "page 21 must render the relocated India proof as a compact card",
);
assert.match(
  regionStyles,
  /\.h1-o2-lifecycle-proof > strong\s*\{[\s\S]*?white-space:\s*nowrap;[\s\S]*?writing-mode:\s*horizontal-tb;/,
  "the relocated +157% value must stay horizontal and unclipped",
);
assert.match(
  regionStyles,
  /\.h1-o2-lifecycle-proof-copy\s*\{[\s\S]*?white-space:\s*nowrap;[\s\S]*?writing-mode:\s*horizontal-tb;/,
  "the relocated India label and period must stay horizontal and unclipped",
);
assert.match(
  reportPage,
  /data-editor-revision=\{page\.id==="o2-regional-engines"\?"india-proof-below-v3":undefined\}/,
  "page 21 must use a new editor revision so stale index-based text cannot overwrite the relocated proof",
);

assert.match(
  ibLoop,
  /<span className="h1-o2-card-label">在 荷 兰<\/span>\s*<strong>21%<\/strong>/,
  "page 27 must preserve the previous editor text slot before the 21% proof",
);

const standaloneThemeVersions = [
  ...html.matchAll(/h1-figma-racing-theme\.css\?v=([^'"\s>]+)/g),
].map((match) => match[1]);
assert.deepEqual(
  standaloneThemeVersions,
  [expectedThemeVersion],
  "the standalone report must use exactly the restored O2 theme revision",
);
const immersiveThemeVersions = [
  ...immersive.matchAll(/h1-figma-racing-theme\.css\?v=([^'"\s;]+)/g),
].map((match) => match[1]);
assert.deepEqual(
  immersiveThemeVersions,
  [expectedThemeVersion, expectedThemeVersion],
  "both immersive theme consumers must use the restored O2 revision",
);
const immersiveReportVersions = [
  ...immersive.matchAll(
    /\.\.\/index\.html\?report=h1&embedded=1&v=([^'"\s>]+)/g,
  ),
].map((match) => match[1]);
assert.deepEqual(
  immersiveReportVersions,
  [expectedThemeVersion],
  "the immersive iframe must invalidate the embedded report with the same revision",
);

console.log("O2 editor/layout regression contract passed.");
