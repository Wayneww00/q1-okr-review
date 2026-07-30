import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = [
  fs.readFileSync(
    path.join(root, "previews", "h1-figma-racing-theme.css"),
    "utf8",
  ),
  fs.readFileSync(path.join(root, "previews", "h1-o3-theme.css"), "utf8"),
].join("\n");

const expectedPages = [
  "o3-chapter",
  "o3-retail-ftd",
  "o3-retail-tv",
  "o3-vn-record",
  "o3-seo",
  "o3-geo",
  "o3-aso",
  "o3-growth-summary",
  "o3-social-sov",
  "o3-social-overview",
  "o3-brand-sentiment",
  "o3-highlight-content",
  "o3-local-growth-engine",
  "o3-copy-trade",
  "o3-local-content",
  "o3-online-offline",
  "o3-vn-key-insight",
];

const registryStart = app.indexOf("const O3_REPORT_PAGES=");
const registryEnd = app.indexOf("];", registryStart) + 2;
assert.ok(
  registryStart >= 0 && registryEnd > registryStart,
  "O3 must expose one explicit 17-page registry",
);
const registry = app.slice(registryStart, registryEnd);

let cursor = -1;
for (const pageId of expectedPages) {
  const next = registry.indexOf(`id:"${pageId}"`);
  assert.ok(next > cursor, `${pageId} must follow the approved PPT order`);
  cursor = next;
}
assert.equal(
  [...registry.matchAll(/\bid:"o3-/g)].length,
  17,
  "O3 must contain the restored Vietnam chapter plus 16 substantive pages",
);
assert.match(
  registry,
  /id:"o3-chapter",layout:"chapter",eyebrow:"O3 · 关键区域复盘",title:"关键区域打造 · 越南",description:"从经营增长、搜索与品牌可见性，到本地内容和转化闭环，复盘越南市场的阶段成果。"/,
  "the original Vietnam chapter title and copy must be restored exactly",
);

assert.match(
  app,
  /<main[^>]*data-report-section="o3"[^>]*className="h1-o3-report"/,
  "O3 must be independently scoped",
);
assert.equal(
  (app.match(/data-o3-trophy-stage/g) || []).length,
  1,
  "all O3 pages must share exactly one fixed trophy background layer",
);
assert.match(
  app,
  /<OkrReportDeck\/>\s*<O2ReportDeck\/>\s*<O3ReportDeck\/>[\s\S]*?Thank You image/,
  "O3 must sit after O2 and before closing content",
);
assert.match(
  app,
  /className="h1-o3-page-number"[\s\S]*?String\(index\+1\)\.padStart\(2,"0"\)[\s\S]*?String\(count\)\.padStart\(2,"0"\)/,
  "O3 page numbering must run independently from 01/17",
);

for (const fact of [
  "4,808",
  "+385%",
  "24.42 Bn",
  "+283%",
  "Top10 关键词",
  "122 → 310",
  "品牌可见性",
  "自然流量行业第一",
  "2,380",
  "H1 2026 品牌关键词情绪对比",
  "62.7%",
  "从品牌认知到本地增长引擎",
  "+152.1%",
  "186K",
  "内容本地化",
  "越南线上线下联动",
]) {
  assert.ok(app.includes(fact), `O3 must preserve the PPT fact: ${fact}`);
}

for (const fileName of [
  "vn-tvc-park-chess.mp4",
  "vn-tvc-banh-mi.mp4",
  "vn-tvc-printer.mp4",
  "vn-online-offline.mp4",
]) {
  const asset = path.join(root, "previews", "assets", "o3", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must be extracted from the PPT`);
  assert.ok(fs.statSync(asset).size > 250_000, `${fileName} must be playable`);
  assert.ok(app.includes(fileName), `${fileName} must be wired`);
}

assert.match(
  app,
  /<OkrVideoModal\s+preview=\{videoPreview\}/,
  "O3 video cards must reuse the approved autoplay/fullscreen modal",
);
assert.match(
  theme,
  /\.h1-o3-fixed-stage\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?var\(--h1-o3-trophy-stage\);[\s\S]*?background-size:\s*cover;/,
  "O3 must use the approved trophy background",
);
assert.match(
  theme,
  /\.h1-o3-page\s*\{[\s\S]*?height:\s*100vh;[\s\S]*?scroll-snap-align:\s*start;[\s\S]*?scroll-snap-stop:\s*always;/,
  "every O3 page must use vertical PPT snap",
);
assert.match(
  theme,
  /\.h1-o3-artboard\s*\{[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;[\s\S]*?scale\(var\(--h1-o3-scale\)\);/,
  "O3 must use the 1920×1080 fixed-canvas scaling model",
);

assert.doesNotMatch(
  registry,
  /没写完/,
  "unfinished-editor labels must not leak into the report",
);
assert.doesNotMatch(
  registry,
  /o3-slide-\d+\.(png|jpe?g)|slide-\d+\.(png|jpe?g)/i,
  "O3 must not embed whole-slide screenshots",
);

console.log("H1 O3 restored-title content, media, placement, and paging contract passed.");
