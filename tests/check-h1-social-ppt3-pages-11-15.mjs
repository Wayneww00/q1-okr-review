import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "previews", "vantage-h1-immersive.html"), "utf8");
const css = fs.readFileSync(path.join(root, "previews", "h1-figma-racing-theme.css"), "utf8");

const h1Start = index.indexOf("const H1_DASHBOARDS = [");
const h1End = index.indexOf("const REPORT_MODE", h1Start);
assert.ok(h1Start >= 0 && h1End > h1Start, "H1 dashboard data block should exist");
const h1 = index.slice(h1Start, h1End);

const ids = [...h1.matchAll(/\bid:(\d+)(?:,|\s)/g)].map(([, id]) => Number(id));
assert.deepEqual(ids, Array.from({length:20}, (_,index)=>index+1), "H1 should contain 20 ordered data pages after removing the attribution question page");
assert.match(shell, /dashboard\.before\(makeChapter\('Performance Data','经营数据','20 MODULES'\)\)/, "shell should advertise 20 modules");
assert.doesNotMatch(shell, /'23 MODULES'/, "stale 23-module label should not appear");
assert.ok(
  shell.includes('src="../index.html?report=h1&embedded=1&v=20260801-o1-static-images-v1"'),
  "the formal shell should invalidate the embedded report cache after removing the India chapter",
);
assert.doesNotMatch(
  shell,
  /v=20260727-social-pages-v2/,
  "the stale embedded-report cache key should not keep serving the old gray follower chart",
);

function pageBlock(id) {
  const start = h1.search(new RegExp(`\\{\\s*id:${id}(?:,|\\s)`));
  assert.ok(start >= 0, `H1 page ${id} should exist`);
  const next = id < 20 ? h1.search(new RegExp(`\\{\\s*id:${id + 1}(?:,|\\s)`)) : h1.length;
  assert.ok(next > start, `H1 page ${id} should have an isolated data block`);
  return h1.slice(start, next);
}

function assertOrderedTokens(source, tokens, label) {
  let cursor = -1;
  for (const token of tokens) {
    const next = source.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `${label} should preserve PPT order at: ${token}`);
    cursor = next;
  }
}

const page11 = pageBlock(11);
const page12 = pageBlock(12);
const page13 = pageBlock(13);
const page14 = pageBlock(14);

function parsePage(source) {
  const normalized = source.trim().replace(/\s*\];\s*$/, "").replace(/,\s*$/, "");
  return Function(`"use strict"; return (${normalized});`)();
}

const data11 = parsePage(page11);
const data12 = parsePage(page12);
const data13 = parsePage(page13);
const data14 = parsePage(page14);

assert.match(
  css,
  /\.h1-extended-editorial-header > small\s*\{[^}]*width:\s*max-content;[^}]*max-width:\s*none;[^}]*white-space:\s*nowrap;/s,
  "the shared data-source line on pages 11–12 must remain on one line",
);
assert.match(
  css,
  /\.h1-brand-voice-layout > \.h1-editorial-chart-surface\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
  "page 11 chart card should use a vertical fill layout instead of leaving unused space below the chart",
);
assert.match(
  css,
  /\.h1-brand-voice-plot\s*\{[^}]*flex:\s*1 1 auto;[^}]*height:\s*auto;[^}]*min-height:\s*0;/s,
  "page 11 plot should expand into the available card height",
);
assert.doesNotMatch(
  css,
  /\.h1-brand-voice-plot\s*\{[^}]*height:\s*346px;/s,
  "page 11 plot should not retain the fixed height that caused the oversized bottom gap",
);
assert.match(
  css,
  /\.h1-extended-editorial-canvas\s*\{[^}]*grid-template-rows:\s*118px minmax\(0, 1fr\) 144px;/s,
  "the conclusion area must reserve enough height for readable copy",
);
assert.match(
  css,
  /\.h1-extended-editorial-conclusion\s*\{[^}]*padding:\s*20px 26px;[^}]*align-items:\s*center;/s,
  "the key-conclusion label and copy must be vertically centered with equal top and bottom spacing",
);
assert.match(
  css,
  /\.h1-extended-editorial-conclusion b\s*\{[^}]*min-height:\s*42px;[^}]*gap:\s*10px;[^}]*font-size:\s*17px;/s,
  "the key-conclusion label must be larger and structured as a clear visual marker",
);
assert.match(
  css,
  /\.h1-extended-editorial-conclusion b::before\s*\{[^}]*width:\s*4px;[^}]*background:\s*#ff5b11;/s,
  "the key-conclusion label must retain a precise Vantage orange accent",
);
assert.match(
  css,
  /\.h1-extended-editorial-conclusion p\s*\{[^}]*font-size:\s*18px;[^}]*line-height:\s*1\.62;/s,
  "the key-conclusion copy must use presentation-readable type and leading",
);
assert.match(
  css,
  /\.h1-editorial-insight-rail small\s*\{[^}]*color:\s*#f0e4de;[^}]*font-size:\s*14px;[^}]*font-weight:\s*700;/s,
  "page 11 insight-card labels must remain crisp at presentation scale",
);
assert.match(
  css,
  /\.h1-editorial-insight-rail strong\s*\{[^}]*color:\s*#fff7f2;[^}]*font:\s*800 38px\/1[^;]*;[^}]*text-shadow:/s,
  "page 11 headline metrics must use a larger high-contrast treatment",
);
assert.match(
  css,
  /\.h1-editorial-insight-rail p\s*\{[^}]*color:\s*#d8cbc5;[^}]*font-size:\s*13\.5px;[^}]*font-weight:\s*600;[^}]*line-height:\s*1\.45;/s,
  "page 11 supporting copy must remain readable against the dark card",
);
assert.match(
  css,
  /\.h1-reputation-keywords strong\s*\{[^}]*border:\s*1px solid rgba\(255,118,46,\.55\);[^}]*background:\s*rgba\(54,5,9,\.9\);[^}]*color:\s*#fff7f2;[^}]*font-size:\s*15px;[^}]*font-weight:\s*700;/s,
  "page 12 keyword labels must use a clear high-contrast card treatment",
);
assert.match(
  css,
  /\.h1-reputation-panel > p\s*\{[^}]*color:\s*#d8cbc5;[^}]*font-size:\s*15px;[^}]*font-weight:\s*600;[^}]*line-height:\s*1\.65;/s,
  "page 12 reputation conclusion must remain legible at presentation scale",
);
assert.equal(
  [...shell.matchAll(/h1-figma-racing-theme\.css\?v=20260801-organic-chart-clarity-v1/g)].length,
  2,
  "the formal shell and embedded report must both load the current cache-busted theme",
);

assert.match(page11, /layoutType:"brand_voice_search_combined"/);
assert.match(page12, /layoutType:"social_sov_trend"/);
assert.match(page13, /layoutType:"followers_share"/);
assert.match(page14, /layoutType:"followers_trend"/);

for (const token of [
  "品牌整体数据 品牌SOV",
  "2025 H2 vs 2026 年 H1 月度表现及整体对比",
  "声量：Meltwater · 自然流量：Excel（Worldwide Organic Traffic，2026 H1）· 口碑：Meltwater",
  "声量 · Meltwater SoV",
  "Share of Voice by Mentions",
  "−30% 同比",
  "2025 H2 36.8k → 2026 H1 25.7k",
  "2026全球声量占比 29.3%（仅次于Exness）",
  "正面情感第 2",
  "约 37%，仅次于xm",
  "Exness 30.3%",
  "主因 2025 H2 有一波高声量、今年回归常态",
  "自 2 月起持续领先 IC Markets，但与 Exness 和 XM 仍有明显差距",
  "扩大自然搜索覆盖并持续缩小竞品差距",
  "H2核心：扩大自然搜索覆盖，把已有的口碑和专业优势转化为更大的认知与声量"
]) {
  assert.ok(page11.includes(token), `page 11 should preserve PPT token: ${token}`);
}
assertOrderedTokens(page11, [
  '{period:"2026 H1",sourceCategory:"H1-VTG",value:25.7,valueText:"25.7k"}',
  '{period:"2025 H2",sourceCategory:"H2-VTG",value:36.8,valueText:"36.8k"}'
], "page 11 voice bars");
assert.equal(Math.round((data11.voiceMetrics.points[0].value / data11.voiceMetrics.points[1].value - 1) * 100), -30, "page 11 -30% should reconcile with 25.7k vs 36.8k");

for (const token of [
  "2026 H1：Vantage、Exness、IC Markets 与 XM 月度 Organic Traffic",
  "数据源：overview-trend-2026-07-31T15_27_38Z.xlsx｜Worldwide｜月度 Organic Traffic",
  "口碑关键词 · Meltwater",
  "transparent ecosystem",
  "reliable platform",
  "multi-asset brokerage",
  "editorial criteria",
  "集中在“专业 · 稳健 · 可信”，区别于竞品的促销 / 信号导向。"
]) {
  assert.ok(page11.includes(token), `combined page 11 should preserve PPT token: ${token}`);
}
assert.equal("annotation" in data11.searchMetrics, false, "the Organic Traffic legend summary should be removed");
assert.equal("conclusion" in data11.searchMetrics, false, "the Organic Traffic chart conclusion should be removed");
for (const month of ["1月","2月","3月","4月","5月","6月"]) {
  assert.ok(page11.includes(`"${month}"`), `combined page 11 should preserve month label ${month}`);
}
assert.deepEqual(data11.searchMetrics.series.map(series=>series.values), [
  [281879,280432,284742,377242,326603,346906],
  [968962,965658,930173,970707,673913,762862],
  [286463,274734,258355,277135,269437,290741],
  [955636,942214,884564,975333,1013629,1105283],
]);
assert.deepEqual(data11.searchMetrics.axisDomain, [0,1200000]);
assert.deepEqual(data11.searchMetrics.axisTicks, [0,200000,400000,600000,800000,1000000,1200000]);
assert.equal(data11.searchMetrics.months.length, 6, "page 11 should show the six 2026 H1 month labels");
assert.doesNotMatch(page11, /Google Trends|月均搜索热度|1 月 21\.6|6 月 3\.6/);

for (const token of [
  "2025 H2 vs 2026 年 H1 月度环比增长率对比趋势",
  "SHARE OF VOICE (SOV) TREND",
  "2025 Jul to 2026 Jun Monthly Performance",
  "Vantage SOV (%)",
  "Exness SOV (%)",
  "SOV (%)",
  "ticks:[0,2,4,6,8,10,12,14,16,18,20]",
  "尽管 Exness 在行业品牌声量占比（Share of Voice）方面仍保持领先",
  "与 2025 年 6 月相比",
  "Vantage 与 Exness 的差距正持续缩小",
  "Vantage 的品牌影响力不断增强"
]) {
  assert.ok(page12.includes(token), `page 12 should preserve approved figure token: ${token}`);
}
for (const row of [
  '{month:"Jul \'25",vantageSov:4.79,vantageSovText:"4.79%",exnessSov:16.20,exnessSovText:"16.20%"}',
  '{month:"Aug \'25",vantageSov:4.68,vantageSovText:"4.68%",exnessSov:15.76,exnessSovText:"15.76%"}',
  '{month:"Sep \'25",vantageSov:5.90,vantageSovText:"5.90%",exnessSov:15.48,exnessSovText:"15.48%"}',
  '{month:"Oct \'25",vantageSov:6.65,vantageSovText:"6.65%",exnessSov:16.82,exnessSovText:"16.82%"}',
  '{month:"Nov \'25",vantageSov:7.61,vantageSovText:"7.61%",exnessSov:13.28,exnessSovText:"13.28%"}',
  '{month:"Dec \'25",vantageSov:8.10,vantageSovText:"8.10%",exnessSov:11.67,exnessSovText:"11.67%"}',
  '{month:"Jan \'26",vantageSov:5.79,vantageSovText:"5.79%",exnessSov:10.00,exnessSovText:"10.00%"}',
  '{month:"Feb \'26",vantageSov:5.53,vantageSovText:"5.53%",exnessSov:15.05,exnessSovText:"15.05%"}',
  '{month:"Mar \'26",vantageSov:6.33,vantageSovText:"6.33%",exnessSov:12.97,exnessSovText:"12.97%"}',
  '{month:"Apr \'26",vantageSov:7.80,vantageSovText:"7.80%",exnessSov:13.42,exnessSovText:"13.42%"}',
  '{month:"May \'26",vantageSov:9.43,vantageSovText:"9.43%",exnessSov:13.76,exnessSovText:"13.76%"}',
  '{month:"Jun \'26",vantageSov:10.23,vantageSovText:"10.23%",exnessSov:13.32,exnessSovText:"13.32%"}'
]) {
  assert.ok(page12.includes(row), `page 12 should preserve exact approved row: ${row}`);
}
assertOrderedTokens(page12, [
  '{month:"Jul \'25"',
  '{month:"Aug \'25"',
  '{month:"Sep \'25"',
  '{month:"Oct \'25"',
  '{month:"Nov \'25"',
  '{month:"Dec \'25"',
  '{month:"Jan \'26"',
  '{month:"Feb \'26"',
  '{month:"Mar \'26"',
  '{month:"Apr \'26"',
  '{month:"May \'26"',
  '{month:"Jun \'26"'
], "page 12 chronological monthly groups");

for (const token of [
  "VANTAGE MARKETS’ SHARE OF CFD INDUSTRY FOLLOWERS",
  "Comparison of global-only accounts vs. global + regional/sub-accounts",
  "Total Industry Followers",
  "Vantage Markets Followers",
  "Vantage Markets Share (%)",
  "Global Accounts Only",
  "Global + Regional/Sub-Accounts",
  "10,783,372",
  "2,291,951",
  "21.3%",
  "16,420,972",
  "2,653,508",
  "16.2%",
  "全球官方 CFD 经纪商账号",
  "全球 + 区域/子账号 CFD 经纪商账号",
  "Vantage整体排第二，且离第一越来越近了",
  "把全球号和区域号拧成一股绳"
]) {
  assert.ok(page13.includes(token), `page 13 should preserve PPT token: ${token}`);
}
assert.ok(page13.includes("leftTicks:[0,2000000,4000000,6000000,8000000,10000000,12000000,14000000,16000000,18000000,20000000]"), "page 13 should preserve the PPT follower-axis ticks");
assert.ok(page13.includes("rightAxisLabel:\"VANTAGE MARKETS SHARE (%)\", rightTicks:[0,5,10,15,20,25,30,35,40]"), "page 13 should preserve the PPT share-axis ticks");
for (const row of [
  '{scope:"Global Accounts Only",industry:10783372,industryText:"10,783,372",vantage:2291951,vantageText:"2,291,951",share:21.3,shareText:"21.3%"}',
  '{scope:"Global + Regional/Sub-Accounts",industry:16420972,industryText:"16,420,972",vantage:2653508,vantageText:"2,653,508",share:16.2,shareText:"16.2%"}'
]) {
  assert.ok(page13.includes(row), `page 13 should preserve exact PPT row: ${row}`);
}
for (const scope of data13.followerScopes) {
  assert.equal(Number((scope.vantage / scope.industry * 100).toFixed(1)), scope.share, `page 13 ${scope.scope} share should reconcile`);
}
assert.ok((data13.followerScopes[1].industry / data13.followerScopes[0].industry - 1) * 100 > 50, "page 13 industry audience should grow by more than 50%");

for (const token of [
  "FOLLOWERS TREND COMPARISON",
  "2026 H1 vs 2025 H2 Monthly Performance",
  "2026 H1 Followers",
  "2025 H2 Followers",
  "2026 H1 MoM Growth (%)",
  "2025 H2 MoM Growth (%)",
  "FOLLOWERS",
  "MoM GROWTH (%)",
  "leftAxisLabel:\"FOLLOWERS\", leftTicks:[0,500000,1000000,1500000,2000000,2500000,3000000]",
  "rightAxisLabel:\"MoM GROWTH (%)\", rightTicks:[-8,-6,-4,-2,0,2,4,6,8]",
  "绝大多数月份的环比增速均超过 2025 年下半年",
  "更强劲的受众增长势头和持续扩大的社区规模"
]) {
  assert.ok(page14.includes(token), `page 14 should preserve PPT token: ${token}`);
}
for (const row of [
  '{month:"Month 1",h2:1949275,h2Text:"1,949,275",h1:2064174,h1Text:"2,064,174",h2Growth:null,h2GrowthText:"—",h1Growth:null,h1GrowthText:"—"}',
  '{month:"Month 2",h2:2023234,h2Text:"2,023,234",h1:2107418,h1Text:"2,107,418",h2Growth:3.80,h2GrowthText:"+3.80%",h1Growth:2.10,h1GrowthText:"+2.10%"}',
  '{month:"Month 3",h2:2015010,h2Text:"2,015,010",h1:2144591,h1Text:"2,144,591",h2Growth:-0.41,h2GrowthText:"-0.41%",h1Growth:1.77,h1GrowthText:"+1.77%"}',
  '{month:"Month 4",h2:2014077,h2Text:"2,014,077",h1:2191985,h1Text:"2,191,985",h2Growth:-0.05,h2GrowthText:"-0.05%",h1Growth:2.21,h1GrowthText:"+2.21%"}',
  '{month:"Month 5",h2:2014469,h2Text:"2,014,469",h1:2234889,h1Text:"2,234,889",h2Growth:0.02,h2GrowthText:"+0.02%",h1Growth:1.96,h1GrowthText:"+1.96%"}',
  '{month:"Month 6",h2:2044947,h2Text:"2,044,947",h1:2267829,h1Text:"2,267,829",h2Growth:1.51,h2GrowthText:"+1.51%",h1Growth:1.47,h1GrowthText:"+1.47%"}'
]) {
  assert.ok(page14.includes(row), `page 14 should preserve exact PPT row: ${row}`);
}
for (let index = 1; index < data14.followersTrend.length; index += 1) {
  const previous = data14.followersTrend[index - 1];
  const current = data14.followersTrend[index];
  const h1Calculated = (current.h1 / previous.h1 - 1) * 100;
  const h2Calculated = (current.h2 / previous.h2 - 1) * 100;
  assert.ok(Math.abs(h1Calculated - current.h1Growth) < 0.011, `page 15 H1 growth should reconcile within the PPT's 0.01-point display precision at ${current.month}`);
  assert.ok(Math.abs(h2Calculated - current.h2Growth) < 0.011, `page 15 H2 growth should reconcile within the PPT's 0.01-point display precision at ${current.month}`);
}

for (const componentName of [
  "H1BrandVoiceSearchCombinedChart",
  "H1BrandVoiceChart",
  "H1BrandSearchReputationChart",
  "H1SocialSovTrendChart",
  "H1FollowersTrendChart"
]) {
  const start = index.indexOf(`function ${componentName}`);
  const next = index.indexOf("\nfunction ", start + 10);
  assert.ok(start >= 0, `${componentName} should exist`);
  const source = index.slice(start, next > start ? next : index.length);
  assert.match(source, /<(?:ResponsiveContainer|svg|H1SearchTrendGlyph)\b/, `${componentName} should render a native chart`);
  assert.doesNotMatch(source, /<(?:img|image)\b|data:image\/|pptImage|chartImage|(?:src|href|background-image)[^\\n]*(?:\.png|\.jpe?g|\.webp)/i, `${componentName} should not embed a PPT chart image`);
}

const followersShareComponentStart = index.indexOf("function H1FollowersShareChart");
const followersShareComponentEnd = index.indexOf("\nfunction ", followersShareComponentStart + 10);
const followersShareComponentSource = index.slice(followersShareComponentStart, followersShareComponentEnd);
assert.match(followersShareComponentSource, /h1-follower-pie/, "H1FollowersShareChart should render its comparison with HTML and CSS");
assert.doesNotMatch(followersShareComponentSource, /<(?:img|image)\b|data:image\/|pptImage|chartImage|(?:src|href|background-image)[^\\n]*(?:\.png|\.jpe?g|\.webp)/i, "H1FollowersShareChart should not embed a PPT chart image");

const socialChartStart = index.indexOf("function H1SocialSovTrendChart");
const socialChartEnd = index.indexOf("\nfunction ", socialChartStart + 10);
const socialChartSource = index.slice(socialChartStart, socialChartEnd);
assert.match(
  socialChartSource,
  /dataKey="vantageSov"[\s\S]*dataKey="exnessSov"/,
  "page 12 should render the approved Vantage and Exness SOV lines",
);
assert.doesNotMatch(socialChartSource, /<Bar\b|h1-social-period-bands|h1-social-values/, "page 12 should remove the obsolete mentions bars and detail table");

const followersShareStart = index.indexOf("function H1FollowersShareChart");
const followersShareEnd = index.indexOf("\nfunction ", followersShareStart + 10);
const followersShareSource = index.slice(followersShareStart, followersShareEnd);
assert.match(
  followersShareSource,
  /style=\{\{"--follower-pie":buildFollowerShareGradient\(panel\.segments\)\}\}/,
  "page 13 should build the share comparison from CSS data segments",
);
assert.match(
  css,
  /--h1-follower-exness:\s*#8f1620/,
  "page 13 should retain the shared deep-red chart baseline",
);
assert.match(
  css,
  /--h1-follower-vantage:\s*#ff5b11/,
  "page 13 Vantage share should retain the shared orange highlight",
);
assert.match(
  followersShareSource,
  /className=\{segment\.tone === "vantage" \? "is-vantage" : ""\}/,
  "page 13 should visibly prioritize Vantage inside both rankings",
);
assert.doesNotMatch(
  followersShareSource,
  /<(?:ResponsiveContainer|ComposedChart|Bar|Line)\b/,
  "page 13 should not retain the superseded chart-library rendering",
);

const followersTrendStart = index.indexOf("function H1FollowersTrendChart");
const followersTrendEnd = index.indexOf("\nfunction ", followersTrendStart + 10);
const followersTrendSource = index.slice(followersTrendStart, followersTrendEnd);
assertOrderedTokens(followersTrendSource, [
  '<Bar yAxisId="followers" dataKey="h1"',
  '<Bar yAxisId="followers" dataKey="h2"'
], "page 15 follower bars");
assert.match(
  index,
  /const H1GrowthPointLabel = \([\s\S]*?if \(value === undefined \|\| value === null \|\| value === ""\) return null;/,
  "page 15 should render the PPT's Month 1 em-dash labels instead of suppressing them",
);
assert.match(
  followersTrendSource,
  /const h1GrowthPlot = row\.h1Growth \?\? -2;[\s\S]*?const h2GrowthPlot = row\.h2Growth \?\? -2;[\s\S]*?h1GrowthPlot,[\s\S]*?h2GrowthPlot,/,
  "page 15 should preserve the PPT's visible Month 1 line origin while keeping the source growth values null",
);
assert.match(
  followersTrendSource,
  /<Line yAxisId="growth"[^>]*dataKey="h2GrowthPlot"[^>]*stroke="#ff762e"[^>]*strokeWidth=\{3\.2\}[^>]*strokeLinecap="round"[^>]*dot=\{\{r:5\.5,fill:"#ff762e",stroke:"#fff7f2",strokeWidth:2\}\}/,
  "page 15 H2 growth line should use a thick high-visibility orange treatment",
);
assert.match(
  followersTrendSource,
  /<Line yAxisId="growth"[^>]*dataKey="h1GrowthPlot"[^>]*stroke="#fff1e3"[^>]*strokeWidth=\{3\.2\}[^>]*strokeLinecap="round"[^>]*dot=\{\{r:5\.5,fill:"#8f1620",stroke:"#fff1e3",strokeWidth:2\}\}/,
  "page 15 H1 growth line should use a thick warm-white high-visibility treatment",
);
assertOrderedTokens(followersTrendSource, [
  '<Bar yAxisId="followers" dataKey="h1"',
  '<Bar yAxisId="followers" dataKey="h2"',
  '<Line yAxisId="growth" type="linear" dataKey="h2GrowthPlot"',
  '<Line yAxisId="growth" type="linear" dataKey="h1GrowthPlot"'
], "page 15 bars and foreground growth lines");
assert.match(
  css,
  /\.h1-editorial-legend i\s*\{[^}]*background:\s*#8f1620;/s,
  "the follower-chart legend should use the same deep red as the actual primary bars",
);
assert.match(
  css,
  /\.h1-followers-trend-surface \.h1-editorial-legend\s*\{[^}]*color:\s*#f0e4de;[^}]*font-size:\s*12px;[^}]*font-weight:\s*650;/s,
  "page 15 legend text must remain readable without changing the other social charts",
);
assert.match(
  css,
  /\.h1-followers-trend-surface \.h1-editorial-legend i\.sov-line\s*\{[^}]*border-top:\s*3px solid #fff1e3;/s,
  "page 15 H1 legend line must match the visible warm-white series",
);
assert.match(
  css,
  /\.h1-followers-trend-surface \.h1-editorial-legend i\.orange-line\s*\{[^}]*border-top:\s*3px solid #ff762e;/s,
  "page 15 H2 legend line must match the visible orange series",
);
assert.match(
  css,
  /\.h1-followers-trend-surface \.recharts-line-curve\s*\{[^}]*filter:\s*drop-shadow\([^;]+;[^}]*stroke-linecap:\s*round;[^}]*stroke-linejoin:\s*round;/s,
  "page 15 growth lines must keep a dark separation shadow over the bars",
);

assert.match(index, /function H1ExtendedEditorialPage\(/, "expanded social pages should use a purpose-built editorial layout");
assert.match(index, /<H1ExtendedEditorialPage data=\{data\} count=\{count\}/, "extended pages should route to the editorial layout");
assert.match(css, /\.h1-extended-editorial-page\b/, "editorial page styling should exist");
assert.match(css, /\.h1-extended-editorial-canvas\b/, "editorial canvas styling should exist");
assert.match(css, /background:[^;]*(?:rgba\(0,0,0,\.(?:7|8)|rgba\(8,0,2,\.(?:7|8))/, "new chart surfaces should be more opaque");
assert.match(
  css,
  /\.h1-figma-racing-report \.h1-extended-editorial-main\s*\{[\s\S]*?max-width:\s*none\s*!important;[\s\S]*?padding:\s*0\s*!important;/,
  "new data pages should neutralize legacy main padding from h1-middle-theme.css"
);
assert.match(
  css,
  /\.h1-figma-racing-report \.h1-extended-editorial-main \.h1-editorial-chart-surface\s*\{[\s\S]*?margin-bottom:\s*0\s*!important;[\s\S]*?padding:\s*24px 28px 18px\s*!important;/,
  "chart surfaces should neutralize legacy section spacing from h1-middle-theme.css"
);

assert.match(index, /<H1FigmaDataPage data=\{board\} count=\{DASHBOARDS\.length\}/, "dynamic total count should remain wired");
assert.match(index, /String\(data\.id\)\.padStart\(2,"0"\)[\s\S]*?String\(count\)\.padStart\(2,"0"\)/, "page counter should remain dynamic");
assert.match(shell, /const reportPages = \[\.\.\.doc\.querySelectorAll\('\[data-report-page\]'\)\];/, "shell should discover the unified data and OKR page registry dynamically");
assert.match(shell, /goToReportPage\(reportPages\.length - 1\)/, "backward handoff should target the final dynamic report page");

console.log("H1 PPT3 expanded social pages 11–15 contract passed.");
