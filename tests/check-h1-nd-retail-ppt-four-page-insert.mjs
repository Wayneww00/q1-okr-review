import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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

const dataStart = app.indexOf("const H1_DASHBOARDS = [");
const dataEnd = app.indexOf("const REPORT_MODE", dataStart);
assert.ok(dataStart >= 0 && dataEnd > dataStart);
const dataBlock = app.slice(dataStart, dataEnd);

const ids = [...dataBlock.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
  Number(match[1]),
);
assert.deepEqual(
  ids,
  Array.from({ length: 23 }, (_, index) => index + 1),
  "replacing page 18 with four PPT pages must shift the former pages 19–20 to 22–23",
);

const pageSource = (id) => {
  const start = dataBlock.search(new RegExp(`^  \\{\\s*id:${id},`, "m"));
  const next =
    id < 23
      ? dataBlock.search(new RegExp(`^  \\{\\s*id:${id + 1},`, "m"))
      : dataBlock.length;
  assert.ok(start >= 0 && next > start, `page ${id} must exist`);
  return dataBlock.slice(start, next);
};

const expectedLayouts = [
  "retail_nd_share_shift",
  "apac_nd_breakdown",
  "apac_question",
  "vietnam_retail_nd_ppt",
  "vietnam_marketing_transition",
  "vietnam_ib_reclassification",
  "vietnam_retail_nd_restored",
  "mib_attribution",
  "retail_nd_scope_restoration",
];
assert.deepEqual(
  ids.slice(14).map((id) =>
    pageSource(id).match(/layoutType:"([^"]+)"/)?.[1],
  ),
  expectedLayouts,
  "the four PPT pages must be inserted at page 18 without deleting the former page 19 onward",
);

const requiredByPage = {
  18: [
    "从越南市场切入",
    "SEO、GEO、SOV 等多指标领先，但ND占比仅4.3%，远低于全球平均值25.2%",
    "越南2026-Q1 vs 2026-Q2 Retail ND 占比",
    "ND (Million)",
    "Retail ND 占比%",
    "($0.2M)",
    "$1.0M",
    "−2.0%",
    "8.8%",
    "ND +$1.2M",
    "越南 Retail ND $0.9M｜国家内部占比 4.3%",
    "集团 Retail ND $221.6M｜大盘占比 25.2%",
  ],
  19: [
    "为什么Marketing做得好，反而ND占比低？",
  ],
  20: [
    "越南受 IB 归类口径变化影响最显著",
    "越南 IB 用户占比接近 50%，IB 渗透率高",
    "多层返佣结构使 IB 网络覆盖面更广",
    "现有垂直返佣 · 层级与返佣示意",
    "【现有垂直返佣】层级与返佣示意",
    "销售层级",
    "IB 层级",
    "IB James",
    "IB Stan",
    "IB Tony",
    "IB Hulk",
    "IB Philip",
    "Client交易",
    "系统集成+人工一键开户",
    "按照固定层级规则值，可全层级返佣",
    "两类 IB 口径变化重塑越南 ND 结构",
    "2026-H1 越南用户 ND 贡献占比",
    "vietnam-ib-hierarchy-standalone.svg",
    "vietnam-ib-distribution-standalone.svg",
    "$20.3M",
    "IB $19.4M",
    "95.7%",
    "Retail $0.9M",
    "4.3%",
    "CPA/Hybrid $0.01M",
    "0.04%",
    "全民IB动态分类",
    "25.6%",
    "5月 MIB口径变更",
    "-4.9%",
  ],
  21: [
    "还原口径影响后，越南 Retail ND 在 2026-H1 显著提升",
    "全民IB与MIB变更回归后，越南2026-H1 Retail ND国家占比从4.3%上升到24.6%",
    "口径还原后，越南 Retail ND 规模及占比对比（2026 Q1 vs. Q2）",
    "ND (Million)",
    "Retail ND 占比%",
    "$2.4M",
    "$2.8M",
    "−$0.2M",
    "$1.0M",
    "−$0.6M",
    "−$0.4M",
    "18.8%",
    "28.7%",
    "当前口径",
    "全民IB 动态分类ND贡献",
    "5月份MIB 口径变更ND贡献",
    "修正后ND国家占比",
  ],
  22: [
    "可能对Retail ND占比有影响的因素",
    "1.MIB口径变化导致数据影响",
    "2.Retail 转 IB导致下降（长期）",
  ],
  23: [
    "口径回归后 Retail ND 占比上升",
    "口径回归后，在2026 H1 Retail ND 占比较当前口径增长5.4%",
  ],
};

for (const [id, tokens] of Object.entries(requiredByPage)) {
  const source = pageSource(Number(id));
  for (const token of tokens) {
    assert.ok(source.includes(token), `page ${id} must preserve PPT content: ${token}`);
  }
}

for (const component of [
  "H1VietnamRetailNdPptChart",
  "H1VietnamMarketingTransition",
  "H1VietnamIbReclassification",
  "H1VietnamRetailNdRestoredChart",
]) {
  assert.ok(app.includes(`function ${component}`), `${component} must exist`);
}

assert.doesNotMatch(
  pageSource(19),
  /nd-retail-transition-vietnam-original\.png/,
  "page 19 must not render the watermarked PPT export as its background",
);
const transitionStart = app.indexOf("function H1VietnamMarketingTransition({data,count})");
const transitionEnd = app.indexOf("function H1VietnamIbReclassification", transitionStart);
const transitionComponent = app.slice(transitionStart, transitionEnd);
assert.match(
  transitionComponent,
  /className="h1-vietnam-marketing-transition-title"[^>]*>\{data\.title\}<\/h1>/,
  "page 19 must render the transition title as live visible text",
);
assert.match(
  transitionComponent,
  /className="h1-vietnam-marketing-transition-progress"/,
  "page 19 must preserve the 18–19–20 transition progress as live markup",
);
assert.doesNotMatch(
  transitionComponent,
  /<img\s+src=\{data\.transitionBackground\}/,
  "page 19 must reuse the shared default car stage instead of stacking another background image",
);
for (const file of [
  "vietnam-ib-hierarchy-standalone.svg",
  "vietnam-ib-distribution-standalone.svg",
]) {
  assert.ok(
    existsSync(resolve(root, "previews/assets/figma-racing", file)),
    `page 20 source image must be deployed: ${file}`,
  );
}
assert.match(
  shell,
  /'Performance Data','经营数据','23 MODULES'/,
  "the chapter counter must reflect the three inserted pages",
);
assert.match(theme, /\.is-vietnam-marketing-transition/);
assert.match(
  theme,
  /\.h1-vietnam-marketing-transition\s*\{[\s\S]*?background:\s*transparent;/,
  "the transition must expose the shared default car background",
);
assert.doesNotMatch(
  theme,
  /\.h1-vietnam-marketing-transition\s+img\s*\{/,
  "the transition must not keep a second full-page image layer",
);
assert.match(theme, /\.is-vietnam-ib-reclassification/);
assert.match(theme, /\.is-vietnam-retail-nd-restored/);

const vietnamIbStart = app.indexOf("function H1VietnamIbReclassification({data})");
const vietnamIbEnd = app.indexOf("function H1VietnamRetailNdRestoredChart", vietnamIbStart);
const vietnamIbComponent = app.slice(vietnamIbStart, vietnamIbEnd);
const standaloneChartAssets = [
  {
    path: "previews/assets/figma-racing/vietnam-ib-hierarchy-standalone.svg",
    hash: "399d6bb34589beedf1e46510091c40b8635b17078334a2615356b4c951fcc104",
  },
  {
    path: "previews/assets/figma-racing/vietnam-ib-distribution-standalone.svg",
    hash: "39a6acdff625840a4922e15557319b872eb340a324a943845b19abde8feff946",
  },
];
for (const asset of standaloneChartAssets) {
  const absolutePath = resolve(root, asset.path);
  assert.equal(
    existsSync(absolutePath),
    true,
    `${asset.path} must be extracted from the approved Standalone report`,
  );
  assert.equal(
    createHash("sha256").update(readFileSync(absolutePath)).digest("hex"),
    asset.hash,
    `${asset.path} must remain byte-identical to the Standalone embedded SVG`,
  );
}
const page20Source = pageSource(20);
assert.match(page20Source, /flowSourceImage:"previews\/assets\/figma-racing\/vietnam-ib-hierarchy-standalone\.svg"/);
assert.match(page20Source, /structureSourceImage:"previews\/assets\/figma-racing\/vietnam-ib-distribution-standalone\.svg"/);
assert.equal(
  (vietnamIbComponent.match(/data-vietnam-ib-standalone-chart=/g) || []).length,
  2,
  "page 20 must render exactly the two approved Standalone chart canvases",
);
assert.doesNotMatch(
  vietnamIbComponent,
  /<svg|h1-vietnam-ib-flow-map|h1-vietnam-ib-flow-title|h1-vietnam-ib-flow-notes|data-vietnam-ib-change-overlay/,
  "the replaced live chart drawings must not remain underneath the Standalone artwork",
);
assert.match(vietnamIbComponent, /data-vietnam-ib-source="flow"/);
assert.match(vietnamIbComponent, /data-vietnam-ib-source="structure"/);
assert.match(vietnamIbComponent, /src=\{data\.flowSourceImage\}/);
assert.match(vietnamIbComponent, /src=\{data\.structureSourceImage\}/);
assert.doesNotMatch(
  vietnamIbComponent,
  /data-vietnam-ib-enlarge=|requestFullscreen\?\.\(\)|放大查看/,
  "page 20 must not expose the removed enlarge actions or fullscreen logic",
);
assert.equal(
  (vietnamIbComponent.match(/triggerLabel="查看原图"/g) || []).length,
  2,
  "both page-20 panels must retain their original-image actions",
);
assert.match(
  theme,
  /\.is-vietnam-ib-reclassification \.h1-vietnam-ib-standalone-artboard/,
  "Standalone chart sizing must remain scoped to page 20",
);
assert.match(vietnamIbComponent, />01 \/ STRUCTURE</);
assert.match(vietnamIbComponent, />02 \/ ATTRIBUTION</);
assert.match(
  theme,
  /\.h1-retail-growth-page\.is-vietnam-ib-reclassification\s*>\s*\.h1-extended-editorial-canvas\.is-retail-data-detail\s*\{[\s\S]*?width:\s*1624px;[\s\S]*?padding:\s*37px\s+20px\s+0\s+42px;[\s\S]*?grid-template-rows:\s*160px\s+minmax\(0,1fr\);[\s\S]*?gap:\s*19px;[\s\S]*?scale\(1\.28\);/,
  "page 20 must use the approved full-canvas geometry from the reference image",
);

console.log("H1 Retail ND PPT four-page insertion checks passed.");
