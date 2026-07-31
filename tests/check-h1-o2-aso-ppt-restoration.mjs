import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const registryStart = app.indexOf("const O2_REPORT_PAGES=");
const registryEnd = app.indexOf("function O2ReportPage", registryStart);
const registry = app.slice(registryStart, registryEnd);

for (const pageId of ["o2-aso-leadership", "o2-aso-evidence"]) {
  assert.equal(
    (registry.match(new RegExp(`id:"${pageId}"`, "g")) || []).length,
    1,
    `${pageId} must remain one complete report page`,
  );
}

for (const exactCopy of [
  "VANTAGE MARKETS · 2026 H1 ASO 复盘",
  "关键词、品牌曝光、用户口碑、Organic增长四大能力全面领先",
  "Top 10 行业头部关键词占有率",
  "远超 Exness、XM、Pepperstone 等",
  "非品牌占比也有优化 8% → 36%",
  "真正开始获取“不认识 Vantage 的新用户”",
  "20 国核心词登顶 · 突破4.5高分口碑门槛 · 流量增长182% · 非品牌自然下载增长741%",
  "全球头部关键词（部分展示）",
  "各国头部关键词（部分展示）",
  "优化前（25.10–26.02） VS 优化后（26.03–26.06）总曝光量增长 +182%",
  "非品牌词下载成为增长主力",
]) {
  assert.ok(app.includes(exactCopy), `ASO pages must preserve the PPT copy: ${exactCopy}`);
}

assert.match(
  app,
  /function O2AsoAwardSummary\(\)[\s\S]*?h1-o2-aso-award-stage"[\s\S]*?h1-o2-aso-award-grid[\s\S]*?核心关键词[\s\S]*?品牌曝光[\s\S]*?GOOGLE PLAY 全球评分[\s\S]*?ORGANIC 下载量/,
  "page 18 must be one editable four-award PPT composition",
);
assert.match(
  app,
  /function O2AsoEvidence\(\)[\s\S]*?h1-o2-aso-evidence-stage"[\s\S]*?h1-o2-aso-evidence-columns[\s\S]*?01[\s\S]*?02[\s\S]*?03[\s\S]*?04/,
  "page 19 must remain one editable four-column PPT evidence composition",
);
assert.doesNotMatch(
  app,
  /h1-o2-aso-(?:award|evidence)-stage" data-editor-ignore/,
  "ASO pages 18–19 must be discoverable by the persisted text editor",
);
assert.match(
  app,
  /page\.layout==="aso-summary"\)content=<O2AsoAwardSummary\/>/,
  "page 18 must use the dedicated PPT award composition without the old card header",
);
assert.match(
  app,
  /page\.layout==="aso-evidence"\)content=<O2AsoEvidence\/>/,
  "page 19 must use the dedicated PPT evidence composition without the old card header",
);

for (const [fileName, minBytes] of [
  ["aso-laurel-wreath.png", 100_000],
  ["aso-exposure-chart.png", 100_000],
  ["aso-organic-share-chart.png", 100_000],
]) {
  const asset = path.join(root, "previews", "assets", "o2", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must be extracted from the source PPT`);
  assert.ok(fs.statSync(asset).size > minBytes, `${fileName} must retain source quality`);
  assert.ok(app.includes(`previews/assets/o2/${fileName}`), `${fileName} must be used by the ASO pages`);
}

assert.match(
  theme,
  /\.h1-o2-page\.is-aso-summary \.h1-o2-artboard[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*\.8/,
  "page 18 must use a near-black PPT content surface while the shared desert stage remains available",
);
assert.match(
  theme,
  /\.h1-o2-aso-award-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*1fr\)/,
  "page 18 must preserve the PPT two-by-two award layout",
);
assert.match(
  theme,
  /\.h1-o2-aso-evidence-columns\s*\{[\s\S]*?grid-template-columns:\s*1fr\s+1fr\s+1fr\s+1fr/,
  "page 19 must preserve the PPT four-column evidence layout",
);
assert.match(
  theme,
  /\.h1-o2-aso-laurel\s*\{[\s\S]*?object-fit:\s*contain/,
  "the source PPT laurel must be rendered as an image asset without CSS reconstruction",
);
assert.match(
  theme,
  /\.h1-o2-aso-laurel\s*\{[\s\S]*?width:\s*82%[\s\S]*?height:\s*82%[\s\S]*?transform:\s*translate\(-50%,\s*-50%\)/,
  "the laurels on both ASO pages must be reduced and centered so the typography leads",
);
assert.match(
  theme,
  /\.h1-o2-aso-award-copy > strong\s*\{[\s\S]*?font-size:\s*52px/,
  "page 18 award values must be enlarged for presentation-distance legibility",
);
assert.match(
  theme,
  /\.h1-o2-aso-award-copy p,[\s\S]*?\.h1-o2-aso-award-copy small\s*\{[\s\S]*?font-size:\s*18px/,
  "page 18 supporting award copy must be enlarged",
);
assert.match(
  theme,
  /\.h1-o2-aso-evidence-badges strong\s*\{[\s\S]*?font-size:\s*33px/,
  "page 19 evidence values must be enlarged inside the reduced laurels",
);
assert.match(
  theme,
  /\.h1-o2-aso-evidence-badges small\s*\{[\s\S]*?font-size:\s*14px/,
  "page 19 evidence notes must remain readable inside the badges",
);

console.log("H1 O2 ASO pages 18–19 PPT restoration contract passed.");
