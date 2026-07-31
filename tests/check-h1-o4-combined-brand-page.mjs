import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const css = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const h1Start = index.indexOf("const H1_DASHBOARDS = [");
const h1End = index.indexOf("const REPORT_MODE", h1Start);
assert.ok(h1Start >= 0 && h1End > h1Start, "H1 dashboard data should exist");
const h1 = index.slice(h1Start, h1End);

const ids = [...h1.matchAll(/\bid:(\d+)(?:,|\s)/g)].map(([, id]) => Number(id));
assert.deepEqual(
  ids,
  Array.from({ length: 21 }, (_, index) => index + 1),
  "the combined O4 brand page must remain present within the 21-page data deck",
);
assert.match(
  shell,
  /dashboard\.before\(makeChapter\('Performance Data','经营数据','21 MODULES'\)\)/,
  "the formal shell should advertise 21 data modules",
);

const page11Start = h1.search(/\{\s*id:11(?:,|\s)/);
const page12Start = h1.search(/\{\s*id:12(?:,|\s)/);
assert.ok(page11Start >= 0 && page12Start > page11Start, "combined page 11 should exist");
const page11 = h1.slice(page11Start, page12Start);

assert.match(page11, /layoutType:"brand_voice_search_combined"/);
assert.doesNotMatch(h1, /layoutType:"brand_voice"/);
assert.doesNotMatch(h1, /layoutType:"brand_search_reputation"/);
assert.match(h1, /id:12, layoutType:"social_sov_trend"/);
assert.match(h1, /id:13, layoutType:"followers_share"/);
assert.match(h1, /id:14, layoutType:"followers_trend"/);

for (const token of [
  "品牌整体数据 品牌SOV",
  "2025 H2 vs 2026 年 H1 月度表现及整体对比",
  "2025 H2 → 2026 H1 同比 · Vantage · 数据源：Meltwater（声量 / 口碑）+ Google Trends（品牌搜索）",
  "声量 · Meltwater SoV",
  "−30% 同比",
  "2025 H2 36.8k → 2026 H1 25.7k",
  "2026全球声量占比 29.3%（仅次于Exness）",
  "正面情感第 2",
  "约 37%，仅次于xm",
  "品牌搜索 · Google Trends",
  "+43% 同比",
  "2025 H2 月均 9.1 → 2026 H1 13.0",
  "主动品牌搜索 · Jul’25 → Jun’26 上行",
  "口碑关键词 · Meltwater",
  "transparent ecosystem",
  "reliable platform",
  "multi-asset brokerage",
  "editorial criteria",
  "集中在“专业 · 稳健 · 可信”，区别于竞品的促销 / 信号导向。",
  "声量竞争力强、需求与口碑向好",
  "H2核心：把已有的口碑和专业优势，扩大到更大的认知与声量",
]) {
  assert.ok(page11.includes(token), `combined page 11 should preserve PPT content: ${token}`);
}

for (const month of ["7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月"]) {
  assert.ok(page11.includes(`"${month}"`), `combined page 11 should preserve ${month}`);
}

assert.ok(
  index.includes("function H1BrandVoiceSearchCombinedChart"),
  "the combined page should render as native HTML/SVG",
);
assert.match(
  css,
  /\.h1-brand-combined-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.2fr\)\s+minmax\(0,\s*\.8fr\);/s,
  "the combined page should use a deliberate two-column presentation layout",
);
assert.match(
  css,
  /\.h1-brand-combined-kpi strong\s*\{[^}]*font-size:\s*34px;/s,
  "PPT headline metrics should remain visually prominent",
);

console.log("H1 O4 combined brand page contract passed.");
