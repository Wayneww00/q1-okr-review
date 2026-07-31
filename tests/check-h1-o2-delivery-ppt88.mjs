import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const deliveryStart = app.indexOf("function O2Delivery()");
const deliveryEnd = app.indexOf("function O2Methodology()", deliveryStart);
assert.ok(
  deliveryStart >= 0 && deliveryEnd > deliveryStart,
  "the O2 global-delivery page must expose a dedicated renderer",
);
const delivery = app.slice(deliveryStart, deliveryEnd);

assert.match(
  app,
  /id:"o2-global-delivery",[\s\S]*?layout:"delivery",[\s\S]*?editorRevision:"delivery-ppt88-v1",/,
  "the rebuilt page must use a new editor revision so stale saved copy cannot remap onto the new DOM",
);
assert.match(
  app,
  /data-editor-revision=\{page\.editorRevision\|\|[\s\S]*?\}/,
  "O2 pages must pass their page-scoped editor revision to the persistence layer",
);

for (const fact of [
  "data-ppt-reference=\"88\"",
  "外部监管与平台合规约束常态化",
  "多层次资产组合与储备，确保各市场持续在线、增长不停。",
  "H1增量验证",
  "2026 H1 vs 2025 H2",
  "Meta TikTok",
  "盈利增量跑通",
  "ROI",
  "2.2",
  "CAC",
  "-53%",
  "FTD +46%",
  "Net Deposit +115%",
  "DSP",
  "高质量增量验证",
  "19.9",
  "ROI +66%",
  "-21%",
  "FTD +13%",
  "Net Deposit +49%",
  "看得准【市场 & 竞品监测】",
  "监管要求 · 平台政策 · 行情变动 · 竞品动向",
  "AI（市场&行情监控）｜爬虫日级监控（竞品动态监控）｜响应速度2x",
  "上得快【资产模块化 & 效率升级】",
  "主体 · 账户 · 域名 · 素材",
  "【单页平台成本约$6.8 ｜ 多语言落地页生产到上线仅需3h】",
  "投得进【多层媒体供给 & 受限渠道打通】",
  "主流媒体 · 稀缺曝光资源 · AI Ads资源",
  "Snapchat",
  "careem",
  "Zalo",
  "Uber",
  "Telegram",
  "Microsoft Copilot",
  "【差异化渠道&流量补位】",
  "放得大【地域验证 & 业务持续增长】",
  "监测 · 判断 · 优化 · 复制",
  "重点市场验证先行：Vietnam ｜ Thailand ｜ Russia ｜ Korea ｜ UAE",
  "H2 突破重点",
  "稀缺流量 x AI Ads",
  "区域稀缺渠道：Naver ｜ Yandex",
  "AI Ads 布局：ChatGPT Ads｜Gemini Ads",
  "Performance Marketing · 2026 H1 Review",
]) {
  assert.ok(delivery.includes(fact), `PPT page 88 content must be retained: ${fact}`);
}

for (const className of [
  "h1-o2-delivery-columns",
  "h1-o2-delivery-left",
  "h1-o2-delivery-intro",
  "h1-o2-delivery-step-list",
  "h1-o2-delivery-right",
  "h1-o2-delivery-section-title",
  "h1-o2-delivery-proof",
  "h1-o2-delivery-breakthrough",
  "h1-o2-delivery-source-footer",
]) {
  assert.ok(
    delivery.includes(className),
    `PPT page 88 layout must include ${className}`,
  );
}

assert.match(
  theme,
  /\.h1-o2-delivery-columns\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*970px\s+620px;[\s\S]*?gap:\s*22px;/,
  "PPT page 88 must use the source slide's asymmetric two-column layout",
);
assert.match(
  theme,
  /\.h1-o2-delivery-step-list\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-rows:\s*repeat\(4,\s*1fr\);/,
  "the four left-hand capability rows must share the available height",
);
assert.match(
  theme,
  /\.h1-o2-page\.is-delivery \.h1-o2-page-header p\s*\{\s*display:\s*none;\s*\}/,
  "the source intro copy must move into its own panel without being duplicated in the header",
);
assert.match(
  theme,
  /\.h1-embedded-report main\.h1-o2-report \.h1-o2-delivery-left,\s*\.h1-embedded-report main\.h1-o2-report \.h1-o2-delivery-right\s*\{\s*margin-bottom:\s*0\s*!important;\s*padding-top:\s*0\s*!important;\s*\}/,
  "legacy report section spacing must not stretch the rebuilt two-column layout",
);
assert.doesNotMatch(
  delivery,
  /h1-o2-delivery-tagline/,
  "the invented footer tagline must be replaced by the source PPT's H2 breakthrough section",
);

console.log("H1 O2 delivery PPT page 88 content and layout contract passed.");
