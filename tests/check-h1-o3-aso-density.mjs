import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-o3-theme.css"),
  "utf8",
);
const asoSource = app.slice(
  app.indexOf("function O3AsoRatingPanel"),
  app.indexOf("function O3Summary"),
);

for (const exactDataset of [
  '["2025.05","2.8","12%"]',
  '["2025.07","4.2","64%"]',
  '["2025.09","4.5","76%"]',
  '["2026.01","5.0","96%"]',
  '["当前","4.8","88%"]',
  '["优化前","2025年9月前","日均约 200","基线","10%"]',
  '["阶段1","2025年9–11月","日均曝光 +250%","起量期","34%"]',
  '["阶段2","2025年12月–2026年4月","日均曝光 +650%","爆发期","68%"]',
  '["阶段3","2026年4月后","日均约 2,200","稳固期 · +800%","92%"]',
  '["REGISTER","+1,511%","100%"]',
  '["LIVE KYC","+741%","49%"]',
  '["FTD","+1,412%","93%"]',
]) {
  assert.ok(
    asoSource.includes(exactDataset),
    `ASO density work must preserve ${exactDataset}`,
  );
}

assert.match(
  asoSource,
  /const storyFlow=\[\["搜索曝光","10×\+"\],\["Register","\+1,511%"\],\["Live KYC","\+741%"\],\["FTD","\+1,412%"\]\];/,
  "the story card must reuse the verified funnel values",
);
assert.match(
  asoSource,
  /className="h1-o3-aso-story-flow"/,
  "the story card must fill its space with a scannable funnel",
);
assert.match(
  asoSource,
  /<strong>时间关系<\/strong>[\s\S]*合理滞后1月左右/,
  "the growth note must expose its time-lag conclusion",
);
assert.match(
  asoSource,
  /<strong>下一步<\/strong>[\s\S]*进一步促进这些Organic用户转化为入金/,
  "the growth note must expose its next-step conclusion",
);
assert.match(
  app,
  /previews\/h1-o3-theme\.css\?v=20260731-aso-proof-rank-v1/,
  "the revised ASO layout must ship with a fresh stylesheet cache key",
);

for (const [pattern, message] of [
  [
    /\.h1-o3-97-evidence-grid\{[^}]*height:813px;[^}]*grid-template-rows:455px 290px/,
    "the ASO grid must provide enough height for the denser lower cards",
  ],
  [
    /\.h1-o3-97-evidence-grid h3\{[^}]*font-size:26px/,
    "ASO card titles must use a 26px presentation size",
  ],
  [
    /\.h1-o3-aso-rating-summary strong\{[^}]*font-size:54px/,
    "the rating KPI must be visually dominant",
  ],
  [
    /\.h1-o3-aso-rating-chart\{[^}]*height:190px/,
    "the rating chart must use the available vertical space",
  ],
  [
    /\.h1-o3-aso-exposure-kpi strong\{[^}]*font-size:52px/,
    "the exposure KPI must be visually dominant",
  ],
  [
    /\.h1-o3-aso-exposure-phases\{[^}]*height:218px/,
    "the exposure phases must use the available vertical space",
  ],
  [
    /\.h1-o3-aso-story-flow\{/,
    "the verified funnel must be styled",
  ],
  [
    /\.h1-o3-aso-growth-bars strong\{[^}]*font-size:21px/,
    "conversion lift values must remain readable",
  ],
  [
    /\.h1-o3-aso-note-item p\{[^}]*font-size:16px/,
    "growth conclusions must use presentation-readable copy",
  ],
  [
    /\.h1-o3-aso-note-item\{[^}]*padding:6px 11px/,
    "growth conclusions must fit without being clipped",
  ],
]) {
  assert.match(theme, pattern, message);
}

console.log("H1 O3 ASO density and data-fidelity contract passed.");
