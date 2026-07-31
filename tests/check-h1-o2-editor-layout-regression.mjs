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
const expectedThemeVersion = "20260731-region-lifecycle-proof-v1";

const regions = html.match(
  /function O2Regions\(\)\{([\s\S]*?)\n\}\n\nfunction O2Delivery\(\)/,
)?.[1];
const ibLoop = html.match(
  /function O2IbLoop\(\)\{([\s\S]*?)\n\}\n\nfunction O2ReportPage\(/,
)?.[1];
const regionStyles = css.match(
  /\/\* Regions \*\/([\s\S]*?)\/\* Global delivery \*\//,
)?.[1];
const ltvBarsStart = regions?.indexOf(
  '<div className="h1-o2-ltv-bars">',
) ?? -1;
const ltvBarsEnd = regions?.indexOf("</article>", ltvBarsStart) ?? -1;
const ltvBarsSource = regions?.slice(ltvBarsStart, ltvBarsEnd);
const conclusionStart = regions?.indexOf(
  '<article className="h1-o2-card h1-o2-region-conclusion">',
) ?? -1;
const conclusionEnd = regions?.indexOf("</article>", conclusionStart) ?? -1;
const conclusionSource = regions?.slice(conclusionStart, conclusionEnd);

assert.ok(regions, "O2 regional-growth page source must be discoverable");
assert.ok(ibLoop, "O2 partnership-growth page source must be discoverable");
assert.ok(regionStyles, "O2 regional-growth styles must be discoverable");
assert.ok(ltvBarsSource, "page 21 LTV/CAC chart source must be discoverable");
assert.ok(conclusionSource, "page 21 conclusion source must be discoverable");

assert.match(
  regions,
  /<div className="h1-o2-panel-title"><span>LTV \/ CAC 提升<\/span><\/div>/,
  "page 21 must keep lifecycle validation in the relocated bottom proof card",
);
assert.match(
  regions,
  /const lifecycleProof=\{label:"印度再营销",value:"\+157%",period:"Q1 vs Q2"\};/,
  "page 21 must preserve the India remarketing proof data",
);
assert.match(
  conclusionSource,
  /className="h1-o2-lifecycle-proof"[\s\S]*?\{lifecycleProof\.value\}[\s\S]*?\{lifecycleProof\.label\}[\s\S]*?\{lifecycleProof\.period\}/,
  "page 21 must render India remarketing inside the bottom conclusion panel",
);
assert.match(
  ltvBarsSource,
  /\{ltvMarkets\.map\(/,
  "page 21 chart must render only the two approved LTV markets",
);
assert.doesNotMatch(
  ltvBarsSource,
  /lifecycleProof|印度再营销|\+157%/,
  "page 21 chart must not render the relocated India remarketing proof",
);
assert.match(
  regionStyles,
  /\.h1-o2-ltv-bars\s*\{[\s\S]*?justify-content:\s*space-evenly;[\s\S]*?gap:\s*92px;/,
  "page 21 must use the two-bar spacing after relocating India remarketing",
);
assert.match(
  regionStyles,
  /\.h1-o2-region-conclusion\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,1fr\) 330px;[\s\S]*?gap:\s*18px 34px;/,
  "page 21 conclusion must reserve the right column for the relocated proof",
);
assert.match(
  regionStyles,
  /\.h1-o2-lifecycle-proof\s*\{[\s\S]*?grid-column:\s*2;[\s\S]*?background:/,
  "page 21 must style the relocated proof as a dedicated bottom card",
);

assert.match(
  ibLoop,
  /<span className="h1-o2-card-label">荷兰市场验证<\/span>\s*<strong>21%<\/strong>/,
  "page 25 must preserve the previous editor text slot before the 21% proof",
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
