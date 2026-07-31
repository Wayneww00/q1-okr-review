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
assert.deepEqual(ids, [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], "H1 should contain 15 ordered data pages");
assert.match(shell, /dashboard\.before\(makeChapter\('Performance Data','经营数据','15 MODULES'\)\)/, "shell should advertise 15 modules");
assert.doesNotMatch(shell, /'14 MODULES'/, "stale 14-module label should be removed");
assert.ok(
  shell.includes('src="../index.html?report=h1&embedded=1&v=20260731-endorsement-frame45-v1"'),
  "the formal shell should invalidate the stale embedded-report cache after the follower-chart correction",
);
assert.doesNotMatch(
  shell,
  /v=20260727-social-pages-v2/,
  "the stale embedded-report cache key should not keep serving the old gray follower chart",
);

function pageBlock(id) {
  const start = h1.search(new RegExp(`\\{\\s*id:${id}(?:,|\\s)`));
  assert.ok(start >= 0, `H1 page ${id} should exist`);
  const next = id < 15 ? h1.search(new RegExp(`\\{\\s*id:${id + 1}(?:,|\\s)`)) : h1.length;
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
const page15 = pageBlock(15);

function parsePage(source) {
  const normalized = source.trim().replace(/\s*\];\s*$/, "").replace(/,\s*$/, "");
  return Function(`"use strict"; return (${normalized});`)();
}

const data11 = parsePage(page11);
const data12 = parsePage(page12);
const data14 = parsePage(page14);
const data15 = parsePage(page15);

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
  [...shell.matchAll(/h1-figma-racing-theme\.css\?v=20260731-endorsement-frame45-v1/g)].length,
  2,
  "the formal shell and embedded report must both bust the cached theme after the follower-chart correction",
);

assert.match(page11, /layoutType:"brand_voice"/);
assert.match(page12, /layoutType:"brand_search_reputation"/);
assert.match(page13, /layoutType:"social_sov_trend"/);
assert.match(page14, /layoutType:"followers_share"/);
assert.match(page15, /layoutType:"followers_trend"/);

for (const token of [
  "品牌整体数据 品牌SOV",
  "2025 H2 vs 2026 年 H1 月度表现及整体对比",
  "2025 H2 → 2026 H1 同比 · Vantage · 数据源：Meltwater（声量 / 口碑）+ Google Trends（品牌搜索）",
  "声量 · Meltwater SoV",
  "Share of Voice by Mentions",
  "−30% 同比",
  "2025 H2 36.8k → 2026 H1 25.7k",
  "2026全球声量占比 29.3%（仅次于Exness）",
  "正面情感第 2",
  "约 37%，仅次于xm",
  "Exness 30.3%",
  "主因2025 H2 有一波高声量、今年回归常态",
  "声量竞争力强、需求与口碑向好",
  "缩小与 Exness 的差距、冲击第一",
  "H2核心：把已有的口碑和专业优势，扩大到更大的认知与声量"
]) {
  assert.ok(page11.includes(token), `page 11 should preserve PPT token: ${token}`);
}
assertOrderedTokens(page11, [
  '{period:"2026 H1",sourceCategory:"H1-VTG",value:25.7,valueText:"25.7k"}',
  '{period:"2025 H2",sourceCategory:"H2-VTG",value:36.8,valueText:"36.8k"}'
], "page 11 voice bars");
assert.equal(Math.round((data11.voiceMetrics.points[0].value / data11.voiceMetrics.points[1].value - 1) * 100), -30, "page 11 -30% should reconcile with 25.7k vs 36.8k");

for (const token of [
  "品牌搜索 · Google Trends",
  "+43% 同比",
  "2025 H2 月均 9.1 → 2026 H1 13.0",
  "2025 H2 · 月均 9.1",
  "2026 H1 · 月均 13.0",
  "主动品牌搜索 · Jul’25 → Jun’26 上行",
  "数据源：Google Trends（0-100 相对指数，非绝对搜索量），全球，周度数据按月汇总。",
  "口碑关键词 · Meltwater",
  "transparent ecosystem",
  "reliable platform",
  "multi-asset brokerage",
  "editorial criteria",
  "集中在“专业 · 稳健 · 可信”，区别于竞品的促销 / 信号导向。"
]) {
  assert.ok(page12.includes(token), `page 12 should preserve PPT token: ${token}`);
}
for (const month of ["7月","8月","9月","10月","11月","12月","1月","2月","3月","4月","5月","6月"]) {
  assert.ok(page12.includes(`"${month}"`), `page 12 should preserve month label ${month}`);
}
assert.equal(Math.round((13.0 / 9.1 - 1) * 100), 43, "page 12 +43% should reconcile with the two displayed phase averages");
assert.equal(data12.searchMetrics.months.length, 12, "page 12 should retain all 12 month labels");

for (const token of [
  "2025 H2 vs 2026 年 H1 月度表现及整体占比走势",
  "SHARE OF VOICE (SOV) TREND",
  "Monthly Vantage Mentions vs. Industry Mentions (2026 H1 vs 2025 H2)",
  "Vantage Mentions (in thousands)",
  "Total Industry Mentions (in thousands)",
  "Vantage SOV (%)",
  "MENTIONS (IN THOUSANDS)",
  "SOV (%)",
  "leftTicks:[0,50,100,150,200,250,300,350,400,450,500]",
  "rightAxisLabel:\"SOV (%)\", rightTicks:[0,2,4,6,8,10,12,14,16,18,20]",
  "Note: Mentions include major social media platforms. Data checked on 24 July 2026.",
  "8.1% 提升至 10.23%（增长 26.3%）",
  "品牌在行业讨论中的竞争力和可见度持续增强"
]) {
  assert.ok(page13.includes(token), `page 13 should preserve PPT token: ${token}`);
}
for (const row of [
  '{month:"Jan",period:"2026 H1",vantage:62.3,vantageText:"62.3",industry:1078.9,industryText:"1,078.9",sov:5.79,sovText:"5.79%"}',
  '{month:"Feb",period:"2026 H1",vantage:59.6,vantageText:"59.6",industry:1072.6,industryText:"1,072.6",sov:5.53,sovText:"5.53%"}',
  '{month:"Mar",period:"2026 H1",vantage:68.2,vantageText:"68.2",industry:1079.3,industryText:"1,079.3",sov:6.33,sovText:"6.33%"}',
  '{month:"Apr",period:"2026 H1",vantage:84.0,vantageText:"84.0",industry:1077.6,industryText:"1,077.6",sov:7.80,sovText:"7.80%"}',
  '{month:"May",period:"2026 H1",vantage:96.9,vantageText:"96.9",industry:1023.7,industryText:"1,023.7",sov:9.43,sovText:"9.43%"}',
  '{month:"Jun",period:"2026 H1",vantage:104.7,vantageText:"104.7",industry:1023.5,industryText:"1,023.5",sov:10.23,sovText:"10.23%"}',
  '{month:"Jul",period:"2025 H2",vantage:51.8,vantageText:"51.8",industry:1081.7,industryText:"1,081.7",sov:4.79,sovText:"4.79%"}',
  '{month:"Aug",period:"2025 H2",vantage:61.0,vantageText:"61.0",industry:1554.6,industryText:"1,554.6",sov:4.61,sovText:"4.61%"}',
  '{month:"Sep",period:"2025 H2",vantage:76.5,vantageText:"76.5",industry:1721.5,industryText:"1,721.5",sov:5.65,sovText:"5.65%"}',
  '{month:"Oct",period:"2025 H2",vantage:122.1,vantageText:"122.1",industry:2011.5,industryText:"2,011.5",sov:6.06,sovText:"6.06%"}',
  '{month:"Nov",period:"2025 H2",vantage:158.1,vantageText:"158.1",industry:2062.9,industryText:"2,062.9",sov:7.66,sovText:"7.66%"}',
  '{month:"Dec",period:"2025 H2",vantage:163.7,vantageText:"163.7",industry:2017.1,industryText:"2,017.1",sov:8.10,sovText:"8.10%"}'
]) {
  assert.ok(page13.includes(row), `page 13 should preserve exact PPT row: ${row}`);
}
// The source PPT directly displays the SOV labels, including Aug and Sep.
// Per the user's instruction, those visible PPT percentages remain authoritative here.
assertOrderedTokens(page13, [
  '{month:"Jan",period:"2026 H1"',
  '{month:"Feb",period:"2026 H1"',
  '{month:"Mar",period:"2026 H1"',
  '{month:"Apr",period:"2026 H1"',
  '{month:"May",period:"2026 H1"',
  '{month:"Jun",period:"2026 H1"',
  '{month:"Jul",period:"2025 H2"',
  '{month:"Aug",period:"2025 H2"',
  '{month:"Sep",period:"2025 H2"',
  '{month:"Oct",period:"2025 H2"',
  '{month:"Nov",period:"2025 H2"',
  '{month:"Dec",period:"2025 H2"'
], "page 13 monthly groups");

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
  "区域账号及子账号",
  "行业整体受众规模增长超过 50%",
  "在更广泛的竞争格局中仍保持 16.2% 的份额"
]) {
  assert.ok(page14.includes(token), `page 14 should preserve PPT token: ${token}`);
}
assert.ok(page14.includes("leftTicks:[0,2000000,4000000,6000000,8000000,10000000,12000000,14000000,16000000,18000000,20000000]"), "page 14 should preserve the PPT follower-axis ticks");
assert.ok(page14.includes("rightAxisLabel:\"VANTAGE MARKETS SHARE (%)\", rightTicks:[0,5,10,15,20,25,30,35,40]"), "page 14 should preserve the PPT share-axis ticks");
for (const row of [
  '{scope:"Global Accounts Only",industry:10783372,industryText:"10,783,372",vantage:2291951,vantageText:"2,291,951",share:21.3,shareText:"21.3%"}',
  '{scope:"Global + Regional/Sub-Accounts",industry:16420972,industryText:"16,420,972",vantage:2653508,vantageText:"2,653,508",share:16.2,shareText:"16.2%"}'
]) {
  assert.ok(page14.includes(row), `page 14 should preserve exact PPT row: ${row}`);
}
for (const scope of data14.followerScopes) {
  assert.equal(Number((scope.vantage / scope.industry * 100).toFixed(1)), scope.share, `page 14 ${scope.scope} share should reconcile`);
}
assert.ok((data14.followerScopes[1].industry / data14.followerScopes[0].industry - 1) * 100 > 50, "page 14 industry audience should grow by more than 50%");

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
  assert.ok(page15.includes(token), `page 15 should preserve PPT token: ${token}`);
}
for (const row of [
  '{month:"Month 1",h2:1949275,h2Text:"1,949,275",h1:2064174,h1Text:"2,064,174",h2Growth:null,h2GrowthText:"—",h1Growth:null,h1GrowthText:"—"}',
  '{month:"Month 2",h2:2023234,h2Text:"2,023,234",h1:2107418,h1Text:"2,107,418",h2Growth:3.80,h2GrowthText:"+3.80%",h1Growth:2.10,h1GrowthText:"+2.10%"}',
  '{month:"Month 3",h2:2015010,h2Text:"2,015,010",h1:2144591,h1Text:"2,144,591",h2Growth:-0.41,h2GrowthText:"-0.41%",h1Growth:1.77,h1GrowthText:"+1.77%"}',
  '{month:"Month 4",h2:2014077,h2Text:"2,014,077",h1:2191985,h1Text:"2,191,985",h2Growth:-0.05,h2GrowthText:"-0.05%",h1Growth:2.21,h1GrowthText:"+2.21%"}',
  '{month:"Month 5",h2:2014469,h2Text:"2,014,469",h1:2234889,h1Text:"2,234,889",h2Growth:0.02,h2GrowthText:"+0.02%",h1Growth:1.96,h1GrowthText:"+1.96%"}',
  '{month:"Month 6",h2:2044947,h2Text:"2,044,947",h1:2267829,h1Text:"2,267,829",h2Growth:1.51,h2GrowthText:"+1.51%",h1Growth:1.47,h1GrowthText:"+1.47%"}'
]) {
  assert.ok(page15.includes(row), `page 15 should preserve exact PPT row: ${row}`);
}
for (let index = 1; index < data15.followersTrend.length; index += 1) {
  const previous = data15.followersTrend[index - 1];
  const current = data15.followersTrend[index];
  const h1Calculated = (current.h1 / previous.h1 - 1) * 100;
  const h2Calculated = (current.h2 / previous.h2 - 1) * 100;
  assert.ok(Math.abs(h1Calculated - current.h1Growth) < 0.011, `page 15 H1 growth should reconcile within the PPT's 0.01-point display precision at ${current.month}`);
  assert.ok(Math.abs(h2Calculated - current.h2Growth) < 0.011, `page 15 H2 growth should reconcile within the PPT's 0.01-point display precision at ${current.month}`);
}

for (const componentName of [
  "H1BrandVoiceChart",
  "H1BrandSearchReputationChart",
  "H1SocialSovTrendChart",
  "H1FollowersShareChart",
  "H1FollowersTrendChart"
]) {
  const start = index.indexOf(`function ${componentName}`);
  const next = index.indexOf("\nfunction ", start + 10);
  assert.ok(start >= 0, `${componentName} should exist`);
  const source = index.slice(start, next > start ? next : index.length);
  assert.match(source, /<(?:ResponsiveContainer|svg|H1SearchTrendGlyph)\b/, `${componentName} should render a native chart`);
  assert.doesNotMatch(source, /<(?:img|image)\b|data:image\/|pptImage|chartImage|(?:src|href|background-image)[^\\n]*(?:\.png|\.jpe?g|\.webp)/i, `${componentName} should not embed a PPT chart image`);
}

const socialChartStart = index.indexOf("function H1SocialSovTrendChart");
const socialChartEnd = index.indexOf("\nfunction ", socialChartStart + 10);
const socialChartSource = index.slice(socialChartStart, socialChartEnd);
assert.match(
  socialChartSource,
  /h1-social-period-bands"><span>2026 H1<\/span><span>2025 H2<\/span>/,
  "page 13 period bands should follow the PPT's H1 then H2 order"
);

const followersShareStart = index.indexOf("function H1FollowersShareChart");
const followersShareEnd = index.indexOf("\nfunction ", followersShareStart + 10);
const followersShareSource = index.slice(followersShareStart, followersShareEnd);
assert.match(
  followersShareSource,
  /\{kind:"vantage",label:data\.chart\.legends\[0\]\}/,
  "page 14 total-industry legend should use the shared deep-red chart baseline",
);
assert.match(
  followersShareSource,
  /<Bar yAxisId="followers" dataKey="industry"[^>]*fill="#8f1620"/,
  "page 14 total-industry bars should use the same deep red as the other H1 charts",
);
assert.match(
  followersShareSource,
  /<Bar yAxisId="followers" dataKey="vantage"[^>]*fill="#ff5b11"/,
  "page 14 Vantage bars should retain the shared orange highlight",
);
assert.match(
  followersShareSource,
  /<Line yAxisId="share"[^>]*stroke="#fff"/,
  "page 14 share line should retain the shared white trend treatment",
);
assert.doesNotMatch(
  followersShareSource,
  /fill="rgba\(255,255,255,\.32\)"/,
  "page 14 should not fall back to a disconnected gray bar palette",
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
assert.doesNotMatch(index, /className="h1-(?:figma|extended-editorial)-page-number"/, "data pages should not render a duplicate page counter");
assert.match(shell, /const reportPages = \[\.\.\.doc\.querySelectorAll\('\[data-report-page\]'\)\];/, "shell should discover the unified data and OKR page registry dynamically");
assert.match(shell, /goToReportPage\(reportPages\.length - 1\)/, "backward handoff should target the final dynamic report page");

console.log("H1 PPT3 expanded social pages 11–15 contract passed.");
