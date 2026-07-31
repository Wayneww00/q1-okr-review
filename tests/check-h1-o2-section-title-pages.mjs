import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const registry = app.slice(
  app.indexOf("const O2_REPORT_PAGES=["),
  app.indexOf("const O2_ORGANIC_ROWS="),
);

for (const exactPage of [
  'id:"o2-aso-chapter",\n    layout:"section-divider",\n    section:"ASO",\n    eyebrow:"APP STORE OPTIMIZATION",\n    title:"2026 H1 ASO",\n    description:"建立应用商店搜索优势，持续放大自然下载与品牌词增长。"',
  'id:"o2-paid-ads-chapter",\n    layout:"section-divider",\n    section:"ADS",\n    eyebrow:"PERFORMANCE MARKETING",\n    title:"2026 H1 PAID ADS",\n    description:"以数据驱动投放效率，持续提升转化规模与 ROI。"',
]) {
  assert.ok(registry.includes(exactPage), `O2 must include the approved title page: ${exactPage}`);
}

const orderedIds = [
  "o2-geo-roadmap",
  "o2-aso-chapter",
  "o2-aso-leadership",
  "o2-aso-evidence",
  "o2-paid-ads-chapter",
  "o2-profit-scale",
];
let previousIndex = -1;
for (const id of orderedIds) {
  const currentIndex = registry.indexOf(`id:"${id}"`);
  assert.ok(currentIndex > previousIndex, `${id} must appear in the approved O2 sequence`);
  previousIndex = currentIndex;
}

assert.equal(
  (registry.match(/\n\s+id:"o2-[^"]+"/g) || []).length,
  27,
  "the two approved title pages must increase O2 from 25 to 27 pages",
);
assert.match(
  app,
  /<O2ReportPage key=\{page\.id\} page=\{page\} index=\{index\} count=\{O2_REPORT_PAGES\.length\}\/>/,
  "the section title pages must participate in automatic O2 numbering",
);

console.log("H1 O2 ASO and Paid Ads section-title page contract passed.");
