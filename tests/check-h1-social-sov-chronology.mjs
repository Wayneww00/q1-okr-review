import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const report = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "previews", "vantage-h1-immersive.html"), "utf8");
const revision = "20260731-region-lifecycle-proof-v1";

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

assert.equal(
  page.chart.subtitle,
  "Monthly Vantage Mentions vs. Industry Mentions (2025 H2 vs 2026 H1)",
  "the chart subtitle should describe the same chronological left-to-right order",
);
assert.equal(
  page.editorRevision,
  "social-sov-order-v1",
  "the corrected page should use a new editable-text namespace instead of restoring stale reversed labels",
);
assert.deepEqual(
  page.socialMonthly.map(({month, period}) => `${period}:${month}`),
  [
    "2025 H2:Jul",
    "2025 H2:Aug",
    "2025 H2:Sep",
    "2025 H2:Oct",
    "2025 H2:Nov",
    "2025 H2:Dec",
    "2026 H1:Jan",
    "2026 H1:Feb",
    "2026 H1:Mar",
    "2026 H1:Apr",
    "2026 H1:May",
    "2026 H1:Jun",
  ],
  "the chart should read chronologically from 2025 H2 on the left to 2026 H1 on the right",
);
assert.equal(page.socialMonthly[5].sovText, "8.10%", "the previous period should end at 8.10%");
assert.equal(page.socialMonthly[11].sovText, "10.23%", "the current period should end at 10.23%");

const componentStart = report.indexOf("function H1SocialSovTrendChart");
const componentEnd = report.indexOf("function H1FollowersShareChart", componentStart);
const component = report.slice(componentStart, componentEnd);
assert.match(
  component,
  /const periods = \[\.\.\.new Set\(chartData\.map\(row=>row\.period\)\)\];/,
  "period bands should derive their order from the chart data",
);
assert.match(
  component,
  /h1-social-period-bands">\{periods\.map\(period=><span key=\{period\}>\{period\}<\/span>\)\}<\/div>/,
  "the chart should render the derived period bands",
);
assert.doesNotMatch(
  component,
  /<span>2026 H1<\/span><span>2025 H2<\/span>/,
  "the component should not retain the reversed hard-coded period order",
);
assert.match(
  report,
  /data-editor-revision=\{board\.editorRevision \|\| \(H1_RETAIL_GROWTH_LAYOUTS\.has\(board\.layoutType\) \? "retail-nd-ppt-v4" : undefined\)\}/,
  "page-specific editor revisions should be applied before loading saved text from Supabase",
);
assert.ok(
  report.includes(`previews/h1-figma-racing-theme.css?v=${revision}`),
  "the standalone report should use the current presentation revision",
);
assert.ok(
  shell.includes(`h1-figma-racing-theme.css?v=${revision}`) &&
    shell.includes(`../index.html?report=h1&embedded=1&v=${revision}`) &&
    shell.includes(`figmaTheme.href = '/previews/h1-figma-racing-theme.css?v=${revision}'`),
  "the immersive shell should invalidate both report and theme caches for the corrected chart order",
);

console.log("H1 social SOV chronological order contract passed.");
