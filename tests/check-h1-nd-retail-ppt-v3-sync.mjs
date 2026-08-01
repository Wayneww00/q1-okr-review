import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-figma-racing-theme.css"),
  "utf8",
);
const shell = readFileSync(
  resolve(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);

const dataStart = app.indexOf("const H1_DASHBOARDS = [");
const dataEnd = app.indexOf("const REPORT_MODE", dataStart);
assert.ok(dataStart >= 0 && dataEnd > dataStart);
const dataBlock = app.slice(dataStart, dataEnd);

assert.match(
  app,
  /h1-figma-racing-theme\.css\?v=20260801-mib-bottom-compat-v1/,
  "the compatibility release must invalidate cached copies of the layout CSS",
);
assert.equal(
  [...shell.matchAll(/h1-figma-racing-theme\.css\?v=20260801-mib-bottom-compat-v1/g)]
    .length,
  2,
  "the shell and embedded report handoff must use the compatibility CSS revision",
);

assert.equal(
  [...dataBlock.matchAll(/editorRevision:"retail-nd-ppt-v5"/g)].length,
  3,
  "only pages 15, 16, and 19 should invalidate persisted editor copy",
);
assert.match(
  app,
  /data-editor-revision=\{board\.editorRevision \|\| \(H1_RETAIL_GROWTH_LAYOUTS\.has\(board\.layoutType\)\s*\?\s*"retail-nd-ppt-v4"/,
  "untouched Retail pages should retain the v4 editor fallback",
);

const ids = [...dataBlock.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
  Number(match[1]),
);
assert.deepEqual(
  ids,
  Array.from({ length: 20 }, (_, index) => index + 1),
  "the data section must contain 20 continuously numbered pages",
);

for (const note of [
  "GS Retail ND Q2 较 Q1 占比上涨: +0.5%",
  "APAC Retail ND Q2 较 Q1 占比下降: -2.0%",
]) {
  assert.ok(dataBlock.includes(note), `page 15 must preserve PPT slide 2 note: ${note}`);
}

for (const token of [
  'layoutType:"apac_nd_breakdown"',
  'title:"APAC数据拆解：为何 ND 占比下降？"',
  'subtitle:"Sales端Non-Retail数据表现亮眼，逆势上扬"',
  'chartTitle:"2026 Q1 vs Q2 ND 地区整体表现趋势以及绝对值变化"',
  'label:"APAC-Non-Retail"',
  'q1Text:"133.1M"',
  'q2Text:"143.1M"',
  'absoluteText:"10.0M"',
  'deltaText:"7.5%"',
  'label:"APAC-Retail"',
  'q1Text:"38.8M"',
  'q2Text:"37.2M"',
  'absoluteText:"-1.6M"',
  'deltaText:"-4.0%"',
  'label:"GS-Non-Retail"',
  'q1Text:"195.6M"',
  'q2Text:"177.4M"',
  'absoluteText:"-18.2M"',
  'deltaText:"-9.3%"',
  'label:"GS-Retail"',
  'q1Text:"74.7M"',
  'q2Text:"69.3M"',
  'absoluteText:"-5.4M"',
  'deltaText:"-7.3%"',
]) {
  assert.ok(dataBlock.includes(token), `page 16 must preserve PPT slide 3 content: ${token}`);
}

for (const token of [
  'title:"可能对Retail ND占比有影响的因素"',
  'leftFactorTitle:"1.MIB口径变化导致数据影响"',
  'rightFactorTitle:"2.Retail 转 IB导致下降（长期）"',
  'leftInsight:"40%的Q2 MIB用户不符合IB的显著特征，"',
  'rightInsight:"超过一半转入IB的用户在注册两个月后才发生归属迁移，"',
  'mibChartTitle:"Q2 MIB 用户类型人数及其贡献ND占比"',
  'intervalTitle:"2026-Q2 Retail 转IB 用户 注册到IB转化日间隔和 ND 影响分布"',
]) {
  assert.ok(dataBlock.includes(token), `page 19 must preserve PPT slide 8 content: ${token}`);
}

for (const removed of [
  'layoutType:"h2_retail_nd_target"',
  "H2 Retail ND占比迈向32.0%！",
  "$137.6M",
]) {
  assert.ok(!dataBlock.includes(removed), `removed page content must be absent: ${removed}`);
}

for (const component of [
  "H1ApacNdBreakdownChart",
  "H1MibAttributionChart",
]) {
  assert.ok(app.includes(`function ${component}`), `${component} must exist`);
}

assert.match(
  app,
  /<div className="h1-retail-growth-mib-plot">[\s\S]*?aria-label=\{data\.mibChartTitle\}[\s\S]*?<\/div>\s*<p className="h1-retail-growth-mib-caption">\{data\.mibChartTitle\}<\/p>/,
  "page 19 must render the MIB source caption below a shrink-safe plot wrapper",
);
assert.match(
  app,
  /<div className="h1-retail-growth-mib-plot">[\s\S]*?aria-label=\{data\.intervalTitle\}[\s\S]*?<\/div>\s*<p className="h1-retail-growth-mib-caption">\{data\.intervalTitle\}<\/p>/,
  "page 19 must render the interval source caption below a shrink-safe plot wrapper",
);
assert.doesNotMatch(
  app,
  /<h3>(?:2026-Q2 MIB 用户类型人数及其贡献ND占比|\{data\.intervalTitle\})<\/h3>/,
  "page 19 must not duplicate the source captions above the plots",
);
assert.match(
  theme,
  /\.h1-retail-growth-factor-panel\s*\{[\s\S]*?grid-template-rows:\s*auto\s+auto\s+minmax\(0,1fr\)\s+auto;/,
  "page 19 panels must reserve an explicit bottom caption row",
);
assert.match(
  theme,
  /\.h1-retail-growth-mib-plot\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?overflow:\s*hidden;/,
  "page 19 plots must shrink inside the panel before overflow clipping applies",
);

for (const selector of [
  ".h1-retail-growth-chart-notes",
  ".h1-retail-growth-factor-panel",
  ".h1-retail-growth-factor-summary",
]) {
  assert.ok(theme.includes(selector), `${selector} must define the revised layout`);
}

console.log("Retail ND PPT v3 synchronization contract passes.");
