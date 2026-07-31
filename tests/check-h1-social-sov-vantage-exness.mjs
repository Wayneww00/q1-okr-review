import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const report = fs.readFileSync(path.join(root, "index.html"), "utf8");

const dashboardsStart = report.indexOf("const H1_DASHBOARDS = [");
const dashboardsEnd = report.indexOf("const REPORT_MODE", dashboardsStart);
assert.ok(dashboardsStart >= 0 && dashboardsEnd > dashboardsStart, "H1 dashboard data should exist");

const dashboards = report.slice(dashboardsStart, dashboardsEnd);
const pageStart = dashboards.indexOf('id:12, layoutType:"social_sov_trend"');
const nextPageMarker = dashboards.indexOf('id:13, layoutType:"followers_share"', pageStart);
const pageEnd = dashboards.lastIndexOf("{", nextPageMarker);
assert.ok(pageStart >= 0 && nextPageMarker > pageStart && pageEnd > pageStart, "social SOV page data should exist");

const pageSource = dashboards
  .slice(dashboards.lastIndexOf("{", pageStart), pageEnd)
  .trim()
  .replace(/,\s*$/, "");
const page = Function(`"use strict"; return (${pageSource});`)();

assert.equal(page.editorRevision, "social-sov-vantage-exness-v1");
assert.equal(page.subtitle, "2025 H2 vs 2026 年 H1 月度环比增长率对比趋势");
assert.equal(
  page.description,
  "尽管 Exness 在行业品牌声量占比（Share of Voice）方面仍保持领先，但与 2025 年 6 月相比，Vantage 与 Exness 的差距正持续缩小，显示 Vantage 的品牌影响力不断增强。",
  "the confirmed June 2025 comparison must remain unchanged",
);
assert.equal(page.chart.title, "SHARE OF VOICE (SOV) TREND");
assert.equal(page.chart.subtitle, "2025 Jul to 2026 Jun Monthly Performance");
assert.deepEqual(page.chart.legends, ["Vantage SOV (%)", "Exness SOV (%)"]);
assert.equal(page.chart.axisLabel, "SOV (%)");
assert.deepEqual(page.chart.ticks, [0,2,4,6,8,10,12,14,16,18,20]);

assert.deepEqual(
  page.socialMonthly,
  [
    {month:"Jul '25", vantageSov:4.79, vantageSovText:"4.79%", exnessSov:16.20, exnessSovText:"16.20%"},
    {month:"Aug '25", vantageSov:4.68, vantageSovText:"4.68%", exnessSov:15.76, exnessSovText:"15.76%"},
    {month:"Sep '25", vantageSov:5.90, vantageSovText:"5.90%", exnessSov:15.48, exnessSovText:"15.48%"},
    {month:"Oct '25", vantageSov:6.65, vantageSovText:"6.65%", exnessSov:16.82, exnessSovText:"16.82%"},
    {month:"Nov '25", vantageSov:7.61, vantageSovText:"7.61%", exnessSov:13.28, exnessSovText:"13.28%"},
    {month:"Dec '25", vantageSov:8.10, vantageSovText:"8.10%", exnessSov:11.67, exnessSovText:"11.67%"},
    {month:"Jan '26", vantageSov:5.79, vantageSovText:"5.79%", exnessSov:10.00, exnessSovText:"10.00%"},
    {month:"Feb '26", vantageSov:5.53, vantageSovText:"5.53%", exnessSov:15.05, exnessSovText:"15.05%"},
    {month:"Mar '26", vantageSov:6.33, vantageSovText:"6.33%", exnessSov:12.97, exnessSovText:"12.97%"},
    {month:"Apr '26", vantageSov:7.80, vantageSovText:"7.80%", exnessSov:13.42, exnessSovText:"13.42%"},
    {month:"May '26", vantageSov:9.43, vantageSovText:"9.43%", exnessSov:13.76, exnessSovText:"13.76%"},
    {month:"Jun '26", vantageSov:10.23, vantageSovText:"10.23%", exnessSov:13.32, exnessSovText:"13.32%"},
  ],
  "the chart must use the exact Vantage and Exness SOV values from figure 2",
);

const componentStart = report.indexOf("function H1SocialSovTrendChart");
const componentEnd = report.indexOf("const H1_FOLLOWER_TONE_VARS", componentStart);
const component = report.slice(componentStart, componentEnd);
assert.match(component, /dataKey="vantageSov"/);
assert.match(component, /dataKey="exnessSov"/);
assert.doesNotMatch(component, /<Bar\b/);
assert.doesNotMatch(component, /h1-social-values|h1-social-period-bands/);

console.log("H1 Vantage vs Exness SOV trend contract passed.");
