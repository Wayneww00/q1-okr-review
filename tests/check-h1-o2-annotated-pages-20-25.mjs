import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

// Page 20: prioritize the percentage comparison and label the measures as absolute-value metrics.
for (const fact of [
  '"FTD 绝对值","+39.3%"',
  '"ND 绝对值","+73.4%"',
  '"TV 绝对值","+73.0%"',
  'label="无风险收益绝对值" value="+49.7%"',
]) {
  assert.ok(app.includes(fact), `page 20 must expose the PPT fact: ${fact}`);
}
const profitPageSource = app.slice(
  app.indexOf("function O2ProfitScale()"),
  app.indexOf("function O2Regions()"),
);
assert.doesNotMatch(
  profitPageSource,
  /55,226|\$73\.8M|1,415\.59 Bn|h1-o2-absolute-column-title/,
  "page 20 must remove the newly added absolute numbers and yellow column heading",
);
assert.doesNotMatch(
  theme,
  /\.h1-o2-absolute-column-title/,
  "the removed yellow absolute-value heading must leave no dedicated CSS",
);

// Page 21: make the growth leaders and lifecycle proof explicit.
assert.match(
  app,
  /h1-o2-region-card \$\{index<2\?"is-growth-leader":""\}/,
  "APAC and MENA must receive the growth-leader emphasis",
);
for (const fact of [
  '"LATAM","ROI 打正","H2 重点","聚焦渠道链路与预算效率，重点放大"',
  'className="h1-o2-ltv-kicker">重点市场用户价值释放</div>',
  '<div className="h1-o2-panel-title"><span>LTV / CAC 提升</span></div>',
  'const ltvMarkets=[["印度","+485%","86%"],["阿联酋","+220%","52%"]];',
  'const lifecycleProof={label:"印度再营销",value:"+157%",period:"Q1 vs Q2"};',
  'className="h1-o2-region-copy"',
  'className="h1-o2-lifecycle-proof"',
  "重点市场用户价值释放",
  "生命周期运营验证",
  "重点市场继续做大",
  "重点国家提升用户价值",
  "存量激活带新增",
]) {
  assert.ok(app.includes(fact), `page 21 must include: ${fact}`);
}
const regionsPageSource = app.slice(
  app.indexOf("function O2Regions()"),
  app.indexOf("function O2Delivery()"),
);
assert.match(
  regionsPageSource,
  /const ltvMarkets[\s\S]*?const lifecycleProof[\s\S]*?h1-o2-region-copy[\s\S]*?h1-o2-lifecycle-proof/,
  "page 21 must keep the chart markets separate from the relocated lifecycle proof",
);
assert.match(
  theme,
  /\.h1-o2-region-card\.is-growth-leader\s*\{[\s\S]*?background:/,
  "the growth combination needs a visibly elevated background",
);
assert.doesNotMatch(
  app,
  /className="h1-o2-region-path"[\s\S]{0,260}市场分层/,
  "the old market-segmentation path must be replaced by the approved conclusion",
);
assert.doesNotMatch(
  app,
  /className="h1-o2-region-summary"/,
  "the approved conclusion must live inside the panel instead of being duplicated below it",
);
assert.doesNotMatch(
  regionsPageSource,
  /className="h1-o2-ltv-bars"[\s\S]{0,900}印度再营销/,
  "the +157% remarketing result must move out of the LTV chart",
);
assert.match(
  theme,
  /\.h1-o2-lifecycle-proof\s*\{[\s\S]*?background:/,
  "the relocated +157% result must use a dedicated bottom proof card",
);

// Page 22: annotated title and the four source-PPT resilience capabilities.
for (const fact of [
  'title:"打破受限渠道，构建增长韧性"',
  'description:"多层次资产组合与储备，确保各市场持续在线、增长不停。"',
  'editorRevision:"delivery-ppt88-v1"',
  'title:"看得准【市场 & 竞品监测】"',
  'copy:"监管要求 · 平台政策 · 行情变动 · 竞品动向"',
  'proof:"AI（市场&行情监控）｜爬虫日级监控（竞品动态监控）｜响应速度2x"',
  'title:"上得快【资产模块化 & 效率升级】"',
  'copy:"主体 · 账户 · 域名 · 素材"',
  'proof:"【单页平台成本约$6.8 ｜ 多语言落地页生产到上线仅需3h】"',
  'title:"投得进【多层媒体供给 & 受限渠道打通】"',
  'copy:"主流媒体 · 稀缺曝光资源 · AI Ads资源"',
  'channels:["Snapchat","careem","Zalo","Uber","Telegram","Microsoft Copilot"]',
  'note:"【差异化渠道&流量补位】"',
  'title:"放得大【地域验证 & 业务持续增长】"',
  'copy:"监测 · 判断 · 优化 · 复制"',
  'proof:"重点市场验证先行：Vietnam ｜ Thailand ｜ Russia ｜ Korea ｜ UAE"',
  'brand:"Meta TikTok"',
  'outcome:"盈利增量跑通"',
  'outcome:"高质量增量验证"',
  '"区域稀缺渠道：Naver ｜ Yandex"',
  '"AI Ads 布局：ChatGPT Ads｜Gemini Ads"',
]) {
  assert.ok(app.includes(fact), `page 22 must reproduce the source PPT: ${fact}`);
}
assert.match(
  theme,
  /\.h1-o2-delivery-metric-main strong\s*\{[\s\S]*?font:\s*800 50px\/\.95/,
  "page 22 ROI and CAC values must remain presentation-readable",
);

// Page 24: annotated operating capabilities, with the crossed-out paragraph removed.
for (const fact of [
  'label="SEM 攻防双效" value="+156% FTD" note="筑牢流量护城河"',
  'label="ASA 品牌关键词" value="SOV 95%"',
  'label="竞品监测自动化 · 爬虫" value="人工 → 自动化"',
  'note="自动化面板提效，覆盖 30+ 国家的品牌监控"',
]) {
  assert.ok(app.includes(fact), `page 24 must include: ${fact}`);
}
assert.doesNotMatch(
  app,
  /监测频次由周提升至天，人力成本 -50%，响应速度 ×2/,
  "the crossed-out page 24 paragraph must be removed",
);
assert.doesNotMatch(
  app,
  /className="h1-o2-card h1-o2-barrier-summary"/,
  "all page 24 footer content must be removed",
);
assert.match(
  theme,
  /\.h1-o2-media-grid \.h1-source-image-trigger\s*\{[\s\S]*?height:\s*430px;/,
  "page 24 media must fill the space released by the removed footer",
);

// Page 27: one strong proof card, a four-node closed loop, clean KPI cards.
for (const fact of [
  'title:"从 IB 获客，走向可复制的商业闭环"',
  'description:"从「只拿 Leads」升级为全链路可追踪、可归因的运营，且 ROI 打正"',
  "每 5 个新 IB",
  "就有 1 个来自我们",
  '<span className="h1-o2-card-label">在 荷 兰</span>',
  'const steps=["Paid Ads","IB Leads","IB 转化","真实入金（ND）"];',
  "可复制闭环",
  "<O2MetricCard label=\"EU Leads\" value=\"+237%\" note=\"增长 · Q1→Q2\"/>",
  "<O2MetricCard label=\"IB 转化\" value=\"+156%\" note=\"增长 · Q1→Q2\"/>",
  "<O2MetricCard label=\"CAC\" value=\"−41%\" note=\"降本 · Q1→Q2\"/>",
  "<O2MetricCard label=\"CPL\" value=\"−55%\" note=\"降本 · Q1→Q2\"/>",
]) {
  assert.ok(app.includes(fact), `page 27 must include: ${fact}`);
}
assert.doesNotMatch(app, /"持续复购"/, "page 27 loop must contain only four nodes");
const ibLoopSource = app.slice(
  app.indexOf("function O2IbLoop("),
  app.indexOf("function O2ReportPage("),
);
assert.doesNotMatch(
  ibLoopSource,
  /h1-o2-ib-brand|vantage-logo\.svg/,
  "page 27 must remove the standalone Vantage logo from the IB page header",
);
assert.match(
  ibLoopSource,
  /<span className="h1-o2-card-label">在 荷 兰<\/span>\s*<strong>21%<\/strong>/,
  "page 27 must preserve the editable Netherlands market-validation label",
);
assert.match(
  theme,
  /\.h1-o2-loop-label\s*\{[\s\S]*?top:\s*50%;[\s\S]*?left:\s*50%;/,
  "the closed-loop label must sit in the visual center of the four-node loop",
);
assert.match(
  theme,
  /\.h1-o2-ib-layout\s*\{[\s\S]*?grid-template-areas:\s*"proof loop"\s*"kpis kpis"\s*"plan plan";[\s\S]*?grid-template-rows:\s*410px 150px 98px;/,
  "page 27 must fit proof, loop, KPIs, and the H2 plan inside the standard O2 content grid",
);
assert.match(ibLoopSource, /h1-o2-h2-plan/, "page 27 must include the H2 scale-plan block");
for (const stage of ["复制荷兰打法", "在重点市场加码", "扩大 EU IB 规模"]) {
  assert.ok(ibLoopSource.includes(stage), `page 27 must include H2 scale-plan stage: ${stage}`);
}

console.log("H1 O2 annotated pages 22–27 contract checks passed.");
