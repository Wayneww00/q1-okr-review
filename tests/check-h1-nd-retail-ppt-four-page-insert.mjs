import assert from "node:assert/strict";
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
    "nd-retail-transition-vietnam-original.png",
  ],
  20: [
    "越南受 IB 归类口径变化影响最显著",
    "越南 IB 用户占比接近 50%，IB 渗透率高",
    "多层返佣结构使 IB 网络覆盖面更广",
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
    "vietnam-ib-refund-original.jpg",
    "vietnam-ib-nd-donut-original.jpg",
    "$20.33M",
    "IB $19.44M",
    "95.65%",
    "Retail $0.88M",
    "4.31%",
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

assert.ok(
  existsSync(
    resolve(
      root,
      "previews/assets/figma-racing/nd-retail-transition-vietnam-original.png",
    ),
  ),
  "the PPT transition must use its original embedded background asset",
);
for (const file of [
  "vietnam-ib-refund-original.jpg",
  "vietnam-ib-nd-donut-original.jpg",
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
assert.match(theme, /\.is-vietnam-ib-reclassification/);
assert.match(theme, /\.is-vietnam-retail-nd-restored/);

const vietnamIbStart = app.indexOf("function H1VietnamIbReclassification({data})");
const vietnamIbEnd = app.indexOf("function H1VietnamRetailNdRestoredChart", vietnamIbStart);
const vietnamIbComponent = app.slice(vietnamIbStart, vietnamIbEnd);
assert.match(
  vietnamIbComponent,
  /const donut = \{cx:390,cy:224,radius:148,strokeWidth:100\};/,
  "the Vietnam IB donut should follow the PPT's large-ring geometry",
);
assert.match(
  vietnamIbComponent,
  /data-vietnam-ib-refund-network/,
  "the PPT's complete multi-level refund arrow network must be rendered",
);
assert.match(
  vietnamIbComponent,
  /data-vietnam-ib-change-overlay/,
  "the dynamic-IB and MIB classification changes must be visible as donut overlays",
);

const calloutAnchorMatch = vietnamIbComponent.match(
  /const calloutAnchors = \{retail:\{x:(\d+),y:(\d+)\},cpa:\{x:(\d+),y:(\d+)\}\};/,
);
assert.ok(
  calloutAnchorMatch,
  "Retail and CPA callouts should expose explicit anchors tied to their donut slices",
);
const [, retailX, retailY, cpaX, cpaY] = calloutAnchorMatch.map(Number);
const donutCenter = { x: 390, y: 224 };
const anchorAngle = (x, y) => {
  const degrees =
    (Math.atan2(y - donutCenter.y, x - donutCenter.x) * 180) / Math.PI;
  return degrees < 0 ? degrees + 360 : degrees;
};
assert.ok(
  anchorAngle(retailX, retailY) >= 82 &&
    anchorAngle(retailX, retailY) <= 97.6,
  "the Retail leader must start on the light Retail slice",
);
assert.ok(
  anchorAngle(cpaX, cpaY) >= 97.6 &&
    anchorAngle(cpaX, cpaY) <= 98.6,
  "the CPA/Hybrid leader must start on the thin gold slice",
);
assert.match(vietnamIbComponent, /data-vietnam-ib-callout="retail"/);
assert.match(vietnamIbComponent, /data-vietnam-ib-callout="cpa"/);
assert.match(vietnamIbComponent, /data-vietnam-ib-source="flow"/);
assert.match(vietnamIbComponent, /data-vietnam-ib-source="structure"/);
assert.match(vietnamIbComponent, /src=\{data\.flowSourceImage\}/);
assert.match(vietnamIbComponent, /src=\{data\.structureSourceImage\}/);

console.log("H1 Retail ND PPT four-page insertion checks passed.");
