import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const shell = readFileSync(resolve(root, "previews/vantage-h1-immersive.html"), "utf8");
const theme = readFileSync(resolve(root, "previews/h1-figma-racing-theme.css"), "utf8");

const dataStart = app.indexOf("const H1_DASHBOARDS = [");
const dataEnd = app.indexOf("const REPORT_MODE", dataStart);
assert.ok(dataStart >= 0 && dataEnd > dataStart, "H1 dashboard data must exist");
const dataBlock = app.slice(dataStart, dataEnd);

const ids = [...dataBlock.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) => Number(match[1]));
assert.deepEqual(ids, Array.from({ length: 20 }, (_, index) => index + 1));
assert.match(shell, /'Performance Data','经营数据','20 MODULES'/);

function pageBlock(id) {
  const start = dataBlock.search(new RegExp(`^  \\{\\s*id:${id},`, "m"));
  assert.ok(start >= 0, `page ${id} must exist`);
  const next = id < 20
    ? dataBlock.search(new RegExp(`^  \\{\\s*id:${id + 1},`, "m"))
    : dataBlock.length;
  assert.ok(next > start, `page ${id} must be isolated`);
  return dataBlock.slice(start, next);
}

const page18 = pageBlock(18);
const page20 = pageBlock(20);

for (const token of [
  'editorRevision:"retail-nd-scope-restoration-v1"',
  'restoredChartTitle:"口径回归后越南 2026 Q2 Retail ND 表现"',
  'restoredAxisTitle:"ND (million)"',
  'restoredShareAxisTitle:"ND 占比 %"',
  'restoredLeftAxisTicks:["−$1.00M","−$0.50M","$0.00M","$0.50M","$1.00M","$1.50M","$2.00M","$2.50M","$3.00M"]',
  'restoredRightAxisTicks:["0.00%","5.00%","10.00%","15.00%","20.00%","25.00%","30.00%"]',
  'restoredLegend:["当前口径","全RE IB 动态分类ND贡献","5月份MIB 口径变更ND贡献","修正后ND国家占比"]',
  '{label:"2026 Q1",current:-.2,currentText:"−$0.20M",dynamic:2.4,dynamicText:"$2.40M",mib:-.6,mibText:"−$0.60M",share:18.8,shareText:"18.80%"}',
  '{label:"2026 Q2",current:1,currentText:"$1.00M",dynamic:2.8,dynamicText:"$2.80M",mib:-.4,mibText:"−$0.40M",share:28.7,shareText:"28.70%"}',
]) {
  assert.ok(page18.includes(token), `page 18 must preserve PPT slide 1 token: ${token}`);
}

for (const token of [
  'layoutType:"retail_nd_scope_restoration"',
  'editorRevision:"retail-nd-scope-restoration-v1"',
  'title:"口径回归后 Retail ND 占比上升"',
  'subtitle:"口径回归后，在2026 H1 Retail ND 占比较当前口径增长5.4%"',
  'footnote:"*口径回归定义：五月份 MIB 口径变化以及 Retail 转 IB 导致数据下降"',
  'title:"2026 H1 Retail ND半年表现及整体占比变化"',
  'leftAxisTicks:["$0.0M","$50.0M","$100.0M","$150.0M","$200.0M","$250.0M"]',
  'rightAxisTicks:["0.0%","5.0%","10.0%","15.0%","20.0%","25.0%"]',
  '{label:"2025 H2",value:145.4,valueText:"$145.4M",share:24.3,shareText:"24.3%"}',
  '{label:"2026 H1",value:221.6,valueText:"$221.6M",share:25.2,shareText:"25.2%"}',
  'title:"2026 H1 口径回归表现及整体占比变化*"',
  'leftAxisTicks:["$0.00M","$50.00M","$100.00M","$150.00M","$200.00M","$250.00M","$300.00M"]',
  'rightAxisTicks:["0.0%","5.0%","10.0%","15.0%","20.0%","25.0%","30.0%"]',
  '{label:"2025 H2",value:159.3,valueText:"$159.30M",share:30,shareText:"30.0%"}',
  '{label:"2026 H1",value:269.1,valueText:"$269.10M",share:30.6,shareText:"30.6%"}',
]) {
  assert.ok(page20.includes(token), `page 20 must preserve PPT slide 2 token: ${token}`);
}

assert.match(app, /"retail_nd_scope_restoration"/);
assert.match(app, /function H1RetailNdScopeRestorationChart\(\{data\}\)/);
assert.match(app, /data\.layoutType === "retail_nd_scope_restoration" \? <H1RetailNdScopeRestorationChart data=\{data\}\/>/);
assert.match(app, /h1-retail-growth-scope-arrow/);
assert.match(app, /h1-retail-growth-restored-stack/);
assert.match(app, /data-vietnam-scope-card="current"/);
assert.match(app, /data-vietnam-comparison-placement="left-panel"/);
assert.match(app, /data-vietnam-scope-card="primary"/);

const vietnamChartStart = app.indexOf("function H1VietnamRetailNdChart");
const vietnamChartEnd = app.indexOf("function H1RetailNdScopeRestorationChart", vietnamChartStart);
const vietnamChartBlock = app.slice(vietnamChartStart, vietnamChartEnd);
const currentCardStart = vietnamChartBlock.indexOf('data-vietnam-scope-card="current"');
const comparisonStart = vietnamChartBlock.indexOf('data-vietnam-comparison-placement="left-panel"');
const connectorStart = vietnamChartBlock.indexOf('className="h1-retail-growth-scope-arrow"');
assert.ok(currentCardStart >= 0 && comparisonStart > currentCardStart && connectorStart > comparisonStart, "Vietnam comparison must live inside the left data card before the scope connector");

assert.match(theme, /\.h1-retail-growth-vietnam-scope-grid\s*\{[^}]*height:\s*100%;[^}]*grid-template-columns:\s*minmax\(0,\.9fr\)\s+68px\s+minmax\(0,1\.18fr\);/s);
assert.match(
  theme,
  /\.h1-retail-growth-page\.is-vietnam-retail-nd\s*>\s*\.h1-extended-editorial-canvas\.is-retail-data-detail,\s*\.h1-retail-growth-page\.is-retail-nd-scope-restoration\s*>\s*\.h1-extended-editorial-canvas\.is-retail-data-detail\s*\{[^}]*padding:\s*30px\s+40px\s+24px;[^}]*grid-template-rows:\s*136px\s+minmax\(0,1fr\);[^}]*gap:\s*14px;[^}]*scale\(1\.14\);/s,
  "pages 18 and 20 must share the compact, viewport-filling data layout",
);
assert.match(theme, /\.is-vietnam-retail-nd \.h1-retail-growth-comparison\s*\{[^}]*position:\s*relative;[^}]*grid-template-columns:\s*100px\s+minmax\(0,1fr\);/s);
assert.match(vietnamChartBlock, /const leftPlot = \{left:50,right:490,top:24,bottom:342\};/);
assert.match(vietnamChartBlock, /const restoredPlot = \{left:68,right:520,top:24,bottom:346\};/);
assert.match(vietnamChartBlock, /width="112"/);
assert.match(vietnamChartBlock, /width="116"/);

const restorationChartStart = app.indexOf("function H1RetailNdScopeRestorationChart");
const restorationChartEnd = app.indexOf("function H1MibAttributionChart", restorationChartStart);
const restorationChartBlock = app.slice(restorationChartStart, restorationChartEnd);
assert.match(restorationChartBlock, /const plot = \{left:64,right:526,top:34,bottom:374\};/);
assert.match(restorationChartBlock, /viewBox="0 0 590 420"/);
assert.match(restorationChartBlock, /width="128"/);
assert.match(theme, /\.h1-retail-growth-restoration-panel\s*\{[^}]*grid-template-rows:\s*32px\s+26px\s+minmax\(0,1fr\);/s);

const paletteStart = theme.indexOf(".h1-retail-growth-scope-panel.is-restored");
const paletteEnd = theme.indexOf(".h1-retail-growth-transition", paletteStart);
assert.ok(paletteStart >= 0 && paletteEnd > paletteStart, "scope-restoration palette styles must exist");
const paletteBlock = theme.slice(paletteStart, paletteEnd).toLowerCase();
for (const forbiddenColor of ["#4d7dea", "#55bddf", "#8f55df", "#2aa1a9", "#68d1d6", "rgba(22,117,126"]){
  assert.ok(!paletteBlock.includes(forbiddenColor), `scope-restoration charts must not use cyan/blue/purple color ${forbiddenColor}`);
}
for (const dataToken of ["var(--h1-data-primary)", "var(--h1-data-accent)", "var(--h1-data-ivory)", "#e7b25b"]){
  assert.ok(paletteBlock.includes(dataToken), `scope-restoration charts must reuse data-module color ${dataToken}`);
}

console.log("Retail ND scope-restoration pages contract passes.");
