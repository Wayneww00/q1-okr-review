import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const report = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "previews", "vantage-h1-immersive.html"), "utf8");
const presentationRevision = "20260801-organic-chart-clarity-v1";
const reportRevision = "20260801-o1-static-images-v1";

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
  page.subtitle,
  "2025 H2 vs 2026 年 H1 月度环比增长率对比趋势",
  "the page subtitle should introduce 2025 H2 before 2026 H1",
);
assert.equal(
  page.chart.subtitle,
  "2025 Jul to 2026 Jun Monthly Performance",
  "the chart subtitle should describe the same chronological order",
);
assert.equal(
  page.editorRevision,
  "social-sov-vantage-exness-v1",
  "the corrected page should use a new editable-text namespace instead of restoring stale reversed labels",
);
assert.deepEqual(
  page.socialMonthly.map(({month}) => month),
  [
    "Jul '25",
    "Aug '25",
    "Sep '25",
    "Oct '25",
    "Nov '25",
    "Dec '25",
    "Jan '26",
    "Feb '26",
    "Mar '26",
    "Apr '26",
    "May '26",
    "Jun '26",
  ],
  "the chart should put 2025 H2 on the left and 2026 H1 on the right",
);
assert.equal(page.socialMonthly[5].vantageSovText, "8.10%", "2025 H2 should end at 8.10%");
assert.equal(page.socialMonthly[11].vantageSovText, "10.23%", "2026 H1 should end at 10.23%");
assert.equal(page.socialMonthly[0].exnessSovText, "16.20%", "the Exness comparison should begin in Jul 2025");
assert.equal(page.socialMonthly[11].exnessSovText, "13.32%", "the Exness comparison should end in Jun 2026");

const componentStart = report.indexOf("function H1SocialSovTrendChart");
const componentEnd = report.indexOf("function H1FollowersShareChart", componentStart);
const component = report.slice(componentStart, componentEnd);
assert.doesNotMatch(
  component,
  /h1-social-period-bands|h1-social-values/,
  "the chart should not retain the obsolete period band and mentions table",
);
assert.match(component, /dataKey="vantageSov"/, "the component should render the Vantage SOV line");
assert.match(component, /dataKey="exnessSov"/, "the component should render the Exness SOV line");
assert.match(
  report,
  /data-editor-revision=\{board\.editorRevision \|\| \(H1_RETAIL_GROWTH_LAYOUTS\.has\(board\.layoutType\) \? "retail-nd-ppt-v4" : undefined\)\}/,
  "page-specific editor revisions should be applied before loading saved text from Supabase",
);
assert.ok(
  report.includes(`previews/h1-figma-racing-theme.css?v=${presentationRevision}`),
  "the standalone report should use the current presentation revision",
);
assert.ok(
  shell.includes(`h1-figma-racing-theme.css?v=${presentationRevision}`) &&
    shell.includes(`../index.html?report=h1&embedded=1&v=${reportRevision}`) &&
    shell.includes(`figmaTheme.href = '/previews/h1-figma-racing-theme.css?v=${presentationRevision}'`),
  "the immersive shell should retain the approved presentation theme and independently invalidate the updated report cache",
);

console.log("H1 social SOV chronological order contract passed.");
