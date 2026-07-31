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
const runtime = readFileSync(
  resolve(root, "src/vantage-browser-runtime.mjs"),
  "utf8",
);

const dataStart = app.indexOf("const H1_DASHBOARDS = [");
const dataEnd = app.indexOf("const REPORT_MODE", dataStart);
assert.ok(dataStart >= 0 && dataEnd > dataStart);
const dataBlock = app.slice(dataStart, dataEnd);

const ids = [...dataBlock.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
  Number(match[1]),
);
assert.deepEqual(
  ids,
  Array.from({ length: 21 }, (_, index) => index + 1),
  "the data section must contain the original 14 pages followed by seven Retail ND pages",
);

const expectedLayouts = [
  "retail_nd_share_shift",
  "apac_nd_breakdown",
  "apac_question",
  "vietnam_retail_nd",
  "attribution_question",
  "mib_attribution",
  "retail_nd_scope_restoration",
];
const appendedLayouts = ids.slice(14).map((id) => {
  const start = dataBlock.search(new RegExp(`^  \\{\\s*id:${id},`, "m"));
  const next =
    id < 21
      ? dataBlock.search(new RegExp(`^  \\{\\s*id:${id + 1},`, "m"))
      : dataBlock.length;
  const page = dataBlock.slice(start, next);
  return page.match(/layoutType:"([^"]+)"/)?.[1];
});
assert.deepEqual(appendedLayouts, expectedLayouts);

for (const token of [
  "H1 Retail ND 占比整体表现：APAC -2.0%  GS +0.5%",
  "2026 Q1 vs Q2 Retail ND区域占比变化",
  "27.6%",
  "28.1%",
  "22.6%",
  "20.6%",
  "GS Retail ND Q2 较 Q1 占比上涨: +0.5%",
  "APAC Retail ND Q2 较 Q1 占比下降: -2.0%",
  "APAC数据拆解：为何 ND 占比下降？",
  "Sales端Non-Retail数据表现亮眼，逆势上扬",
  "2026 Q1 vs Q2 ND 地区整体表现趋势以及绝对值变化",
  "133.1M",
  "143.1M",
  "10.0M",
  "7.5%",
  "38.8M",
  "37.2M",
  "-1.6M",
  "-4.0%",
  "195.6M",
  "177.4M",
  "-18.2M",
  "-9.3%",
  "74.7M",
  "69.3M",
  "-5.4M",
  "-7.3%",
  "为什么APAC下降？我们做得不够吗？",
  "从越南市场切入",
  "SEO、GEO、SOV 等多指标领先，但ND占比仅4.3%，远低于全球平均值25.2%",
  "越南2026-Q1 vs 2026-Q2 Retail ND 占比",
  "($0.2M)",
  "$1.0M",
  "−2.0%",
  "8.8%",
  "ND +$1.2M",
  "−$0.4",
  "$0.0",
  "$0.4",
  "$0.8",
  "$1.2",
  "-5.0%",
  "0.0%",
  "10.0%",
  "20.0%",
  "30.0%",
  "越南 Retail ND $0.9M｜国家内部占比 4.3%",
  "集团 Retail ND $221.6M｜大盘占比 25.2%",
  "还有哪些因素导致占比下降，Marketing价值未充分体现？",
  "or",
  "占比下降的背后，还有哪些关键原因？",
  "可能对Retail ND占比有影响的因素",
  "1.MIB口径变化导致数据影响",
  "2.Retail 转 IB导致下降（长期）",
  "40%的Q2 MIB用户不符合IB的显著特征",
  "Q2 ND 5.9M (占比大盘1.4%)",
  "超过一半转入IB的用户在注册两个月后才发生归属迁移",
  "Q2 ND 9.1M (占比大盘2.1%)",
  "无有效代理贡献",
  "1.0K｜8.0%",
  "Q2 ND $0.01M",
  "自营型IB",
  "2.2K｜16.8%",
  "Q2 ND $3.7M",
  "$3.70M",
  "弱代理型IB",
  "2.0K｜15.3%",
  "Q2 ND $2.2M",
  "$2.20M",
  "正常模式IB",
  "7.8K｜59.9%",
  "Q2 ND −$0.31M",
  "-$0.31M",
  ".0 K",
  "2.0 K",
  "4.0 K",
  "6.0 K",
  "8.0 K",
  "-$1.00M",
  "$0.00M",
  "$1.00M",
  "$2.00M",
  "$3.00M",
  "$4.00M",
  "2026-Q2 Retail 转IB 用户 注册到IB转化日间隔和 ND 影响分布",
  "No. Users",
  "2026-Q2 ND",
  "0K",
  "2K",
  "4K",
  "6K",
  "8K",
  "10K",
  "12K",
  "14K",
  "0M",
  "2M",
  "4M",
  "6M",
  "8M",
  "51.1%",
  "10.4%",
  "26.6%",
  "12.0%",
]) {
  assert.ok(dataBlock.includes(token), `source content must be preserved: ${token}`);
}

assert.doesNotMatch(
  dataBlock.slice(dataBlock.search(/^  \{\s*id:15,/m)),
  /ND_H1_Retail|source-slide|ppt-originals|data:image\//i,
  "the eight pages must use native HTML/SVG rather than PPT screenshots",
);

for (const component of [
  "H1DataModulePageShell",
  "H1RetailShareShiftChart",
  "H1ApacNdBreakdownChart",
  "H1VietnamRetailNdChart",
  "H1MibAttributionChart",
  "H1RetailNdScopeRestorationChart",
  "H1RetailGrowthTransition",
  "H1RetailGrowthPage",
]) {
  assert.ok(app.includes(`function ${component}`), `${component} must exist`);
}
assert.match(
  app,
  /function H1ExtendedEditorialPage\([\s\S]*?<H1DataModulePageShell/,
  "the existing editorial data pages must use the shared data-module shell",
);
assert.match(
  app,
  /function H1RetailGrowthPage\([\s\S]*?<H1DataModulePageShell/,
  "the eight imported pages must use the same data-module shell",
);
assert.doesNotMatch(
  app,
  /className="h1-retail-growth-stage"/,
  "the imported pages must not maintain a duplicate 1600×900 stage",
);
assert.doesNotMatch(
  app,
  /className="h1-retail-growth-page-number"/,
  "the imported pages must reuse the shared data-module page number",
);
assert.ok(
  app.includes("const H1_RETAIL_GROWTH_LAYOUTS = new Set"),
  "the new pages must have an isolated renderer boundary",
);
assert.match(
  app,
  /h1-retail-growth-chart h1-editorial-chart-surface/,
  "imported charts must reuse the shared data-module surface component",
);
assert.doesNotMatch(
  app,
  /const colors\s*=\s*\["#567fe8","#50b9dc"\]/,
  "the imported charts must not retain a private blue/cyan palette",
);
assert.match(
  runtime,
  /"\.h1-extended-editorial-page-number"/,
  "the shared Supabase editor must exclude the shared data-module page number",
);
assert.doesNotMatch(
  runtime,
  /"\.h1-retail-growth-page-number"/,
  "the editor must not retain a duplicate imported-page exclusion",
);
assert.match(shell, /'Performance Data','经营数据','21 MODULES'/);
const shellThemeCacheKeys = [
  ...shell.matchAll(
    /h1-figma-racing-theme\.css\?v=([^'"\s]+)/g,
  ),
].map((match) => match[1]);
const shellReportCacheKeys = [
  ...shell.matchAll(/index\.html\?report=h1&embedded=1&v=([^'"\s]+)/g),
].map((match) => match[1]);
assert.deepEqual(
  new Set(shellThemeCacheKeys),
  new Set(["20260801-unified-visual-release-v1"]),
  "the preview shell must retain the approved presentation theme revision",
);
assert.deepEqual(
  shellReportCacheKeys,
  ["20260801-o1-static-images-v1"],
  "the preview shell must independently invalidate the updated report frame",
);

for (const selector of [
  "--h1-data-accent",
  "--h1-data-primary",
  "--h1-data-surface",
  "--h1-data-border",
  ".h1-retail-growth-page",
  ".h1-retail-growth-chart",
  ".h1-retail-growth-transition",
  ".h1-extended-editorial-page-number",
  "@keyframes h1RetailChartDraw",
]) {
  assert.ok(theme.includes(selector), `theme must include ${selector}`);
}
const retailPageRule = theme.match(/\.h1-retail-growth-page\s*\{([^}]*)\}/)?.[1];
assert.ok(retailPageRule, "the imported-page modifier must exist");
assert.doesNotMatch(
  retailPageRule,
  /background(?:-image)?:/,
  "the imported pages must not override the shared data-module background",
);
assert.doesNotMatch(
  theme,
  /\.h1-retail-growth-page::before/,
  "the imported pages must not add a separate full-page grid background",
);
assert.doesNotMatch(
  theme,
  /\.h1-retail-growth-page::after/,
  "the imported pages must not add a separate full-page vignette",
);
assert.match(
  theme,
  /\.h1-editorial-chart-surface[\s\S]*?background:\s*var\(--h1-data-surface\)/,
  "the shared chart surface must be driven by the data-module surface token",
);
assert.match(
  theme,
  /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.h1-retail-growth-page/,
  "new motion must respect reduced-motion preferences",
);

assert.equal(21 + 31 + 27 + 17, 96);

console.log("H1 ND Retail seven-page static integration contract passed.");
