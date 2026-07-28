import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("index.html", "utf8");

for (const label of [
  "Retail FTD (绝对值)",
  "Paid Ads FTD (绝对值)",
  "Net Deposit (M)",
  "Trading Volume (Bn)",
  "FTD 占 Vantage% (占比)",
  "ND 占 Vantage% (占比)",
  "TV 占 Vantage% (占比)",
  "利润绝对值 (M)",
  "日均曝光",
  "日均点击",
]) {
  assert.ok(source.includes(label), `missing H1 chart annotation: ${label}`);
}

assert.match(
  source,
  /className="h1-figma-axis-note is-left"[\s\S]*?data\.chart\.leftAxisLabel/,
  "every H1 chart must visibly render its left-axis annotation",
);
assert.match(
  source,
  /hasPercent && <span className="h1-figma-axis-note is-right">\{data\.chart\.rightAxisLabel\}<\/span>/,
  "dual-axis H1 charts must visibly render the Vantage-share annotation",
);

const h1Profit = source.match(
  /id:7, layoutType:"profit", periodLabel:"Half"[\s\S]*?\n  \},\n  \{\n    id:8, layoutType:"region_table"/,
)?.[0];
assert.ok(h1Profit, "the H1 profit dashboard must exist");
assert.match(h1Profit, /q2025:\{label:"2025 H2",absoluteText:"\$33\.3M"/);
assert.match(h1Profit, /q2026:\{label:"2026 H1",absoluteText:"\$63\.0M"/);
assert.match(h1Profit, /leftAxisLabel:"利润绝对值 \(M\)"/);
assert.doesNotMatch(h1Profit, /monthlyData|Jan-26|Jun-26|月利润呈稳步上升趋势/);

assert.match(
  source,
  /function H1FigmaProfitChart\(\{data\}\) \{\s*const chartData = \[\s*\{name:data\.tableData\.q2025\.label,[\s\S]*?\{name:data\.tableData\.q2026\.label,/,
  "the profit chart must compare 2025 H2 with 2026 H1 instead of showing months",
);

const h1Region = source.match(
  /id:8, layoutType:"region_table", periodLabel:"Half"[\s\S]*?\n  \},\n  \{\n    id:9, layoutType:"simple_bar"/,
)?.[0];
assert.ok(h1Region, "the H1 regional ROI dashboard must exist");
assert.match(h1Region, /quarter:"2025 H2",region:"APAC"[\s\S]*?roi:"5\.6"/);
assert.doesNotMatch(h1Region, /convCost:/);

const regionTable = source.match(
  /function H1FigmaRegionTable\(\{data\}\) \{[\s\S]*?\n\}/,
)?.[0];
assert.ok(regionTable, "the H1 regional table component must exist");
assert.doesNotMatch(regionTable, /CONV\. COST|is-cost|row\.convCost/);

console.log("H1 chart annotations, profit comparison, and regional ROI contract passed.");
