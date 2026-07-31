import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-figma-racing-theme.css"),
  "utf8",
);
const shell = readFileSync(
  resolve(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);
const runtime = readFileSync(
  resolve(root, "src/vantage-browser-runtime.mjs"),
  "utf8",
);

const dataStart = app.indexOf("const H1_DASHBOARDS = [");
const dataEnd = app.indexOf("const REPORT_MODE", dataStart);
const dataBlock = app.slice(dataStart, dataEnd);

for (const exactSourceText of [
  "H1 Retail ND 占比整体表现：APAC -2.0%  GS +0.5%",
  "Sales端IB数据表现亮眼，逆势上扬",
  "为什么APAC下降？我们做得不够吗？",
  "从越南市场切入",
  "SEO、GEO、SOV 等多指标领先，但ND占比仅4.3%，远低于全球平均值25.2%",
  "还有哪些因素导致占比下降，Marketing价值未充分体现？",
  "占比下降的背后，还有哪些关键原因？",
  "MIB口径变化导致数据影响",
  "Retail 转 IB导致下降（长期）",
  "H2 Retail ND占比迈向32.0%！",
]) {
  assert.ok(
    dataBlock.includes(exactSourceText),
    `PPT copy must remain complete: ${exactSourceText}`,
  );
}

for (const oneDecimalPercent of [
  'delta:"-2.0%"',
  'leftInsight:"40.0%的Q2 MIB用户不符合IB的显著特征，"',
  'title:"H2 Retail ND占比迈向32.0%！"',
  'share:"32.0%"',
]) {
  assert.ok(
    dataBlock.includes(oneDecimalPercent),
    `visible percentages must use one decimal: ${oneDecimalPercent}`,
  );
}

assert.match(
  app,
  /id="retail-shift-arrow-up"[\s\S]*?id="retail-shift-arrow-down"/,
  "the Q1/Q2 comparison must define visible up/down arrowheads",
);
assert.match(
  app,
  /h1-retail-growth-delta-line[\s\S]*?markerEnd=/,
  "the Q1/Q2 delta trajectory must end in an arrow",
);
assert.match(
  app,
  /id="retail-vietnam-arrow-up"[\s\S]*?h1-retail-growth-share-line is-dotted[\s\S]*?markerEnd=/,
  "the Vietnam growth trajectory must end in an arrow",
);
assert.match(
  app,
  /H1_RETAIL_GROWTH_SECTION_LABELS/,
  "each content page must expose a Chinese module label",
);
assert.match(
  app,
  /data-editor-revision=\{board\.editorRevision \|\| \(H1_RETAIL_GROWTH_LAYOUTS\.has\(board\.layoutType\)\s*\?\s*"retail-nd-ppt-v4"/,
  "the rebuilt PPT pages must use a fresh editor-content namespace",
);
assert.match(
  runtime,
  /scope\.dataset\.editorRevision[\s\S]*?`\$\{pageId\}@\$\{pageRevision\}`/,
  "the editor must isolate stale persisted text by page revision",
);

assert.doesNotMatch(
  theme,
  /\.h1-retail-growth-bar\.is-muted\s*\{\s*fill:\s*#89918e/,
  "retail charts must not use gray bars",
);
assert.doesNotMatch(
  theme,
  /\.h1-retail-growth-bar\.is-sand\s*\{\s*fill:\s*rgba\(255,255,255,\.34\)/,
  "target charts must not use translucent gray bars",
);
assert.match(
  theme,
  /\.h1-retail-growth-delta-line\.is-up[\s\S]*?\.h1-retail-growth-delta-line\.is-down/,
  "up/down trajectories must have distinct brand colors",
);

const dualQuestionRule = theme.match(
  /\.h1-retail-growth-dual-question\s*\{([^}]*)\}/,
)?.[1];
assert.ok(dualQuestionRule, "the dual-question transition must be styled");
assert.match(dualQuestionRule, /justify-items:\s*center/);
assert.match(dualQuestionRule, /text-align:\s*center/);
assert.match(
  theme,
  /\.h1-embedded-report \.dash-page \.h1-retail-growth-dual-question h1\s*\{[\s\S]*?font-size:\s*(?:5[4-9]|[6-9]\d)px/,
  "the first transition question must be presentation-scale",
);
assert.match(
  theme,
  /\.h1-embedded-report \.dash-page \.h1-retail-growth-dual-question p\s*\{[\s\S]*?font-size:\s*(?:6[0-9]|[7-9]\d)px/,
  "the second transition question must be presentation-scale",
);
assert.match(
  theme,
  /\.dash-page\.is-active \.h1-retail-growth-dual-question h1[\s\S]*?\.dash-page\.is-active \.h1-retail-growth-dual-question p/,
  "the transition lines must animate in a deliberate sequence",
);

const expectedCacheKey = "20260731-remove-india-cover-v1";
assert.ok(app.includes(`h1-figma-racing-theme.css?v=${expectedCacheKey}`));
const shellCacheKeys = [
  ...shell.matchAll(
    /h1-figma-racing-theme\.css\?v=([^'"\s]+)/g,
  ),
].map((match) => match[1]);
assert.ok(shellCacheKeys.length >= 2);
assert.deepEqual(new Set(shellCacheKeys), new Set([expectedCacheKey]));

console.log("H1 ND Retail PPT polish contract passed.");
