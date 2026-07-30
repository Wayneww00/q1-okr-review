import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o3-theme.css"),
  "utf8",
);

const targetSource = app.slice(
  app.indexOf("function O3Sentiment"),
  app.indexOf("function O3CopyTrade"),
);

for (const title of [
  "2026 H1 品牌关键词情感",
  "Vantage 与 Exness 品牌关键词情感对比",
  "关键洞察",
  "热门内容亮点",
  "Facebook 热门内容",
  "YouTube 热门内容",
  "从品牌建设到本地增长引擎——越南",
  "越南社交媒体",
]) {
  assert.ok(targetSource.includes(title), `missing Chinese O3 title: ${title}`);
}

for (const legacyTitle of [
  "H1 2026 Brand key word sentiment",
  "Brand Keyword Sentiment Comparison Between Vantage and Exness",
  "Key Insights",
  "Top Highlight Content",
  "Facebook Top Highlight Content",
  "Youtube Top Highlight Content",
  "From Brand Presence to Local Growth Engine – VN",
  "VN SOCIAL MEDIA",
]) {
  assert.ok(
    !targetSource.includes(legacyTitle),
    `legacy English title must be removed: ${legacyTitle}`,
  );
}

assert.match(
  theme,
  /\.h1-o3-101-facebook-proof\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:/,
  "frame 101 evidence panel must use a deliberate full-height image grid",
);
assert.match(
  theme,
  /\.h1-o3-101-insights p\s*\{[^}]*font-size:\s*(?:18|19|20)px;/,
  "frame 101 insight copy must be presentation-readable",
);
assert.match(
  theme,
  /\.h1-o3-102-pillars section\s*\{[^}]*border-right:\s*0;/,
  "frame 102 must not use full-height column dividers",
);
assert.match(
  theme,
  /\.h1-o3-102-pillars h3::before\s*\{[^}]*height:\s*(?:28|30|32|34|36)px;/,
  "frame 102 must use short title-height red accents",
);

const summarySource = app.slice(
  app.indexOf("function O3Summary"),
  app.indexOf("function O3Donut"),
);
assert.doesNotMatch(
  summarySource,
  /<i\s*\/>/,
  "O3 summary footer must not render decorative horizontal lines",
);
assert.doesNotMatch(
  summarySource,
  /h1-o3-summary-footer[^]*?<O3RacingMark\s*\/>/,
  "O3 summary footer must not turn the racing mark into stray horizontal rules",
);

console.log("H1 O3 Chinese readability and spacing contract passed.");
