import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const assetRevision = "20260801-organic-chart-clarity-v1";

assert.ok(index.includes(`h1-figma-racing-theme.css?v=${assetRevision}`));
assert.equal(
  shell.split(`h1-figma-racing-theme.css?v=${assetRevision}`).length - 1,
  2,
  "the immersive shell and embedded report should share the Organic Traffic chart cache revision",
);

const h1Start = index.indexOf("const H1_DASHBOARDS = [");
const h1End = index.indexOf("const REPORT_MODE", h1Start);
assert.ok(h1Start >= 0 && h1End > h1Start, "H1 dashboard data should exist");
const h1 = index.slice(h1Start, h1End);
const page11Start = h1.search(/\{\s*id:11(?:,|\s)/);
const page12Start = h1.search(/\{\s*id:12(?:,|\s)/);
assert.ok(page11Start >= 0 && page12Start > page11Start, "page 11 should exist");
const page11Source = h1.slice(page11Start, page12Start);
const normalizedPage11 = page11Source.trim().replace(/,\s*$/, "");
const page11 = Function(`"use strict"; return (${normalizedPage11});`)();

assert.equal(page11.editorRevision, "organic-traffic-four-series-v2");
assert.deepEqual(page11.searchMetrics.months, ["1月", "2月", "3月", "4月", "5月", "6月"]);
assert.equal(
  page11.searchMetrics.title,
  "2026 H1：Vantage、Exness、IC Markets 与 XM 月度 Organic Traffic",
);
assert.equal(
  page11.searchMetrics.subtitle,
  "数据源：overview-trend-2026-07-31T15_27_38Z.xlsx｜Worldwide｜月度 Organic Traffic",
);
assert.equal(
  "annotation" in page11.searchMetrics,
  false,
  "the legend summary strip should be removed from the Organic Traffic card",
);
assert.deepEqual(page11.searchMetrics.axisDomain, [0,1200000]);
assert.deepEqual(page11.searchMetrics.axisTicks, [0,200000,400000,600000,800000,1000000,1200000]);
assert.deepEqual(page11.searchMetrics.series, [
  {key:"vantage", label:"Vantage", values:[281879,280432,284742,377242,326603,346906]},
  {key:"exness", label:"Exness", values:[968962,965658,930173,970707,673913,762862]},
  {key:"ic-markets", label:"IC Markets", values:[286463,274734,258355,277135,269437,290741]},
  {key:"xm", label:"XM", values:[955636,942214,884564,975333,1013629,1105283]},
]);
assert.equal(
  "conclusion" in page11.searchMetrics,
  false,
  "the chart-level key-conclusion card should be removed",
);

for (const stale of [
  "+43% 同比",
  "2025 H2 月均 9.1 → 2026 H1 13.0",
  "主动品牌搜索 · Jul’25 → Jun’26 上行",
  "Google Trends｜全球｜月度平均值",
  "Vantage 与 Exness 的差距从 1月 21.6 缩至 6月 3.6",
  "月均搜索热度",
]) {
  assert.ok(!page11Source.includes(stale), `old Google Trends copy should be removed: ${stale}`);
}

assert.match(
  page11.description,
  /281,879[^。]*346,906（\+23\.1%）[^。]*2 月起持续领先 IC Markets[^。]*Exness 和 XM/,
  "the page-level conclusion should summarize the Excel Organic Traffic chart",
);
assert.match(page11.sourceLine, /Excel（Worldwide Organic Traffic，2026 H1）/);
assert.doesNotMatch(page11.description, /Google Trends|搜索热度|1 月 21\.6|主动品牌搜索 \+43%/);
assert.ok(index.includes("function H1BrandSearchFourSeriesChart"));
assert.ok(index.includes("<H1BrandSearchFourSeriesChart data={data.searchMetrics}/>"));
assert.ok(index.includes('aria-label="自然流量趋势图例"'));
assert.ok(index.includes('pageTitle = data.layoutType === "brand_voice_search_combined" ? "品牌声量、自然流量与口碑"'));
assert.ok(index.includes("function formatH1OrganicTrafficAxis"));
assert.ok(index.includes("function formatH1OrganicTrafficValue"));
assert.ok(index.includes("const H1_BRAND_SEARCH_VALUE_OFFSETS"));
assert.ok(
  index.includes("function getH1BrandSearchValueOffset"),
  "paired series should select upper and lower label lanes from their value order each month",
);
assert.ok(index.includes("labelOffset={getH1BrandSearchValueOffset(data,series.key,props.index)}"));

const offsetSourceStart = index.indexOf("const H1_BRAND_SEARCH_VALUE_OFFSETS");
const offsetSourceEnd = index.indexOf("function H1BrandSearchValueLabel", offsetSourceStart);
assert.ok(offsetSourceStart >= 0 && offsetSourceEnd > offsetSourceStart);
const getValueOffset = Function(
  `${index.slice(offsetSourceStart, offsetSourceEnd)}; return getH1BrandSearchValueOffset;`,
)();
assert.equal(getValueOffset(page11.searchMetrics, "ic-markets", 0), -15);
assert.equal(getValueOffset(page11.searchMetrics, "vantage", 0), 19);
assert.equal(getValueOffset(page11.searchMetrics, "xm", 3), -15);
assert.equal(getValueOffset(page11.searchMetrics, "exness", 3), 12);
assert.equal(
  getValueOffset(page11.searchMetrics, "exness", 4),
  -15,
  "widely separated high-volume series should both label above their lines to protect the low-volume label lane",
);
assert.ok(index.includes("domain={data.axisDomain}"));
assert.ok(index.includes("ticks={data.axisTicks}"));
assert.ok(index.includes("tickFormatter={formatH1OrganicTrafficAxis}"));
assert.ok(index.includes('strokeWidth={series.key === "vantage" ? 3.6 : 2.8}'));
assert.doesNotMatch(index, /h1-brand-search-chart-(?:annotation|conclusion)/);

for (const className of [
  ".h1-brand-search-four-series",
  ".h1-brand-search-series-legend",
  ".h1-brand-search-chart-plot",
]) {
  assert.ok(css.includes(className), `four-series chart CSS should include ${className}`);
}

const chartCssStart = css.indexOf(".h1-brand-search-four-series");
const chartCssEnd = css.indexOf(".h1-brand-combined-reputation", chartCssStart);
const chartCss = css.slice(chartCssStart, chartCssEnd);
assert.ok(chartCssStart >= 0 && chartCssEnd > chartCssStart, "four-series chart CSS block should exist");
assert.match(
  chartCss,
  /grid-template-rows:\s*auto 26px minmax\(0, 1fr\);/,
  "heading and legend should leave the remaining card height to the chart",
);
assert.match(
  chartCss,
  /\.h1-brand-search-chart-plot\s*\{[^}]*height:\s*100%;[^}]*min-height:\s*0;/s,
  "the plot should fill the height released by the removed copy blocks",
);
assert.match(
  chartCss,
  /\.h1-brand-search-series-value\s*\{[^}]*font-size:\s*11px;/s,
  "series values should be enlarged for presentation readability",
);
assert.doesNotMatch(chartCss, /\.h1-brand-search-chart-(?:annotation|conclusion)\s*\{/);
assert.doesNotMatch(
  chartCss,
  /#(?:00a6a6|00b8d9|14b8a6|2aa1a9|22d3ee|4d7dea|55bddf|5bc0de)/i,
  "the new chart should not introduce cyan or blue data-series colors",
);

console.log("H1 brand-search four-series contract passed.");
