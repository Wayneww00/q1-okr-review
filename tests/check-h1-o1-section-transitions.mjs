import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o1-complete-theme.css"),
  "utf8",
);

const transitions = [
  ["okr-awards-transition", "INDUSTRY AWARDS", "行业大奖", "从“采买”到真正被评选为行业头部平台", "okr-awards"],
  ["okr-offline-events-transition", "OFFLINE EVENTS", "线下活动", "将品牌植入线下场景，成为前端的抓手", "okr-offline-event-01"],
  ["okr-elite-client-service-transition", "ELITE CLIENT SERVICE", "高净值客户服务体系", "用真诚的服务、用心的体验，与高净值客户共同打造 Vantage 核心圈层", "okr-elite-client-identity"],
  ["okr-merchandise-transition", "MERCHANDISE", "周边", "让 Vantage 触手可及", "okr-merchandise"],
  ["okr-public-good-transition", "PUBLIC GOOD", "公益", "成为 CFD 行业领军者", "okr-cfd-public-good-story"],
  ["okr-integrated-marketing-transition", "INTEGRATED MARKETING", "整合营销", "全域联动，打造“心智”", "okr-ai-recommendation"],
];

for (const [id, english, title, subtitle, nextId] of transitions) {
  const start = app.indexOf(`id:'${id}'`);
  const next = app.indexOf(`id:'${nextId}'`, start);
  assert.ok(start >= 0 && next > start, `${id} must sit before ${nextId}`);
  const block = app.slice(start, next);
  assert.ok(block.includes(`watermark:'${english}'`), `${id} must use ${english}`);
  assert.ok(block.includes(`eyebrow:'${english}'`), `${id} must repeat the English chapter cue`);
  assert.ok(block.includes(`title:'${title}'`), `${id} must use the approved Chinese title`);
  assert.ok(block.includes(`subtitle:'${subtitle}'`), `${id} must use the approved subtitle`);
}

assert.match(
  app,
  /page\.transition\s*\?\s*<OkrChapterTransitionPage/,
  "all new transition records must route through one shared component",
);
assert.match(
  app,
  /useOkrCanvasScale\(\{cover:true\}\)/,
  "transition canvases must use cover scaling to eliminate letterbox edges",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-page\s*\{[\s\S]*?background:\s*transparent/,
  "the shared trophy backdrop must remain visible through every transition page",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-canvas\s*\{[\s\S]*?overflow:\s*hidden[\s\S]*?background:\s*transparent/,
  "the full-bleed veil must preserve the shared background instead of covering it",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-content h1\s*\{[\s\S]*?font-size:\s*min\(132px,/,
  "all section titles must share the 132px brand-upgrade size with responsive downscaling",
);
assert.match(
  theme,
  /\.h1-okr-chapter-transition-content p\s*\{[\s\S]*?font-size:\s*min\(47px,/,
  "all section subtitles must share the 47px brand-upgrade size with responsive downscaling",
);

console.log("H1 O1 six-section transition and full-bleed contract passed.");
