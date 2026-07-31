import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const expectedPages = [
  "o2-chapter",
  "o2-seo-chapter",
  "o2-seo-overview",
  "o2-seo-organic",
  "o2-seo-top10",
  "o2-seo-five-markets",
  "o2-seo-philippines",
  "o2-seo-south-africa",
  "o2-seo-thailand",
  "o2-seo-india",
  "o2-seo-vietnam",
  "o2-seo-technical",
  "o2-seo-engines",
  "o2-seo-h2-layouts",
  "o2-geo-chapter",
  "o2-geo-baseline",
  "o2-geo-roadmap",
  "o2-aso-chapter",
  "o2-aso-leadership",
  "o2-aso-evidence",
  "o2-paid-ads-chapter",
  "o2-profit-scale",
  "o2-regional-engines",
  "o2-global-delivery",
  "o2-brand-methodology",
  "o2-brand-barrier",
  "o2-ib-loop",
];

const registryStart = app.indexOf("const O2_REPORT_PAGES=");
const registryEnd = app.indexOf("function O2ReportPage", registryStart);
assert.ok(
  registryStart >= 0 && registryEnd > registryStart,
  "the O2 section must expose one explicit 27-page registry",
);
const registry = app.slice(registryStart, registryEnd);

let cursor = -1;
for (const pageId of expectedPages) {
  const next = registry.indexOf(`id:"${pageId}"`);
  assert.ok(next > cursor, `${pageId} must follow the approved PPT order`);
  cursor = next;
}
assert.equal(
  [...registry.matchAll(/\bid:"o2-/g)].length,
  27,
  "O2 must contain exactly 27 pages",
);

assert.match(
  app,
  /<main[^>]*data-report-section="o2"[^>]*className="h1-o2-report"/,
  "O2 must be an independently scoped report section",
);
assert.equal(
  (app.match(/data-o2-desert-stage/g) || []).length,
  1,
  "all O2 pages must share exactly one fixed desert background layer",
);
assert.match(
  theme,
  /\.h1-o2-fixed-stage\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?var\(--h1-o2-desert-stage\);[\s\S]*?background-size:\s*cover;/,
  "the O2 deck must use the approved Figma desert background",
);
assert.match(
  app,
  /className="h1-o2-page-number"[\s\S]*?String\(index\+1\)\.padStart\(2,"0"\)[\s\S]*?String\(count\)\.padStart\(2,"0"\)/,
  "O2 page numbering must run independently from 01/27",
);
assert.match(
  app,
  /<OkrReportDeck\/>\s*<O2ReportDeck\/>[\s\S]*?Thank You image/,
  "O2 must sit after OKR and before the closing content",
);
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
assert.match(
  shell,
  /\[0,2,7,8,9\]\.forEach/,
  "the formal shell must keep O2 and O3 visible while hiding only the non-report siblings",
);

const exactFacts = [
  "五国第一",
  "1,246",
  "2,345",
  "+45.3%",
  "567,221",
  "菲律宾：前三从零起步，已领先竞对",
  "南非：前十、前三双双反超 AvaTrade",
  "泰国：关键词翻倍并反超 Exness",
  "印度：起步落后于 Exness，如今前十和前三都第一",
  "越南：XTB 曾以 16 倍优势垄断前三，如今已被反超",
  "Low quality URL",
  "−61%",
  "High quality URL",
  "+194%",
  "我们产出了 349 篇内容",
  "头部集团中整体表现垫底，ChatGPT 场景最弱",
  "90 天行动路线：从基线测算到规模化运营",
  "20 国第一",
  "11 国第一",
  "4.58",
  "非品牌词",
  "+741%",
  "+182%",
  "利润与规模双增长，质量持续提升",
  "构建可调度的全球投放体系，保障增长连续",
  "三级预算池：全球品牌盘 · 区域本地化专项 · 弹性机动补位",
  "分配标尺：市场潜力 × 竞品格局 × 合规约束",
  "H1 成果：",
  "品效全链路体系搭建完毕",
  "H2 规划：",
  "深挖增量流量、追赶头部竞品流量体量",
  "监测频次由周提升至天",
  "人力成本 -50%",
  "响应速度 ×2",
  "每 5 个新 IB",
];
for (const fact of exactFacts) {
  assert.ok(app.includes(fact), `O2 must preserve the PPT fact: ${fact}`);
}
for (const pattern of [
  /label="成本"\s+value="\+16\.3%"/,
  /label="利润"\s+value="\+89\.3%"/,
  /label="ROI"\s+value="6\.8"/,
  /\["APAC","ROI \+91%","ND \+121%"/,
  /\["MENA","ROI \+98%","ND \+162%"/,
  /label="EU Leads"\s+value="\+237%"/,
  /label="IB 转化"\s+value="\+156%"/,
  /label="CAC"\s+value="-41%"/,
  /label="CPL"\s+value="-55%"/,
  /label="SEM 防御"\s+value="\+156% FTD"/,
  /label="品牌关键词"\s+value="SOV 95%"/,
]) {
  assert.match(app, pattern, `O2 must preserve the structured PPT metric ${pattern}`);
}

assert.doesNotMatch(
  app,
  /数字人分身\s*x\s*个|AI\s*素材\s*Y\s*条|覆盖\s*Z\s*市场/i,
  "the unconfirmed brand-barrier placeholder strip must stay omitted",
);
assert.doesNotMatch(
  registry,
  /01\s*\/\s*03|02\s*\/\s*03/,
  "the obsolete ASO internal slide markers must be removed",
);
assert.doesNotMatch(
  app,
  /template-inspect\/source\/slide-|o2-slide-\d+\.(png|jpe?g)/i,
  "O2 must not embed whole-slide screenshots",
);

for (const fileName of [
  "brand-ai-trust.png",
  "brand-ai-arabic.png",
  "brand-ai-esp.png",
  "brand-ai-trade-weekend.png",
]) {
  const asset = path.join(root, "previews", "assets", "o2", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must be extracted from the PPT`);
  assert.ok(fs.statSync(asset).size > 50_000, `${fileName} must retain source quality`);
}

for (const [fileName, altText] of [
  ["seo-tech-vantage.jpeg", "Vantage Lighthouse 技术测试报告"],
  ["seo-tech-exness.jpeg", "Exness Lighthouse 技术测试报告"],
]) {
  const asset = path.join(root, "previews", "assets", "o2", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must be extracted from the PPT`);
  assert.ok(fs.statSync(asset).size > 100_000, `${fileName} must retain source quality`);
  assert.ok(app.includes(`src="./previews/assets/o2/${fileName}"`), `${fileName} must appear on the SEO technical page`);
  assert.ok(app.includes(`alt="${altText}"`), `${fileName} must have a precise accessible label`);
}
assert.match(
  app,
  /className="h1-o2-seo-tech-evidence"[\s\S]*?seo-tech-vantage\.jpeg[\s\S]*?seo-tech-exness\.jpeg/,
  "the two original Lighthouse report images must remain together in the SEO evidence panel",
);

assert.match(
  theme,
  /\.h1-o2-page\s*\{[\s\S]*?height:\s*100vh;[\s\S]*?scroll-snap-align:\s*start;[\s\S]*?scroll-snap-stop:\s*always;/,
  "every O2 page must use the same vertical PPT snap contract as the data pages",
);
assert.match(
  theme,
  /\.h1-o2-artboard\s*\{[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;[\s\S]*?transform:[\s\S]*scale\(var\(--h1-o2-scale\)\);/,
  "O2 must use the approved 1920×1080 fixed-canvas scaling model",
);

console.log("H1 O2 27-page content, placement, and fixed-background contract passed.");
