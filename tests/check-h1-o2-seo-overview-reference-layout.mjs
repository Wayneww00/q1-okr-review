import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const start = app.indexOf("function O2SeoOverview()");
const end = app.indexOf("function O2SeoOrganic()", start);
assert.ok(start >= 0 && end > start, "the SEO overview component must exist");
const overview = app.slice(start, end);
const cssBlock = (selector) => {
  const blockStart = theme.indexOf(`${selector} {`);
  assert.ok(blockStart >= 0, `${selector} styles must exist`);
  return theme.slice(blockStart, theme.indexOf("}", blockStart) + 1);
};
const marketStyles = cssBlock(".h1-o2-seo-overview-market");
const marketLeadValueStyles = cssBlock(
  ".h1-o2-seo-overview-market-lead > strong",
);
const growthStyles = cssBlock(".h1-o2-seo-overview-growth");

assert.match(
  app,
  /id:"o2-seo-overview"[\s\S]*?title:"SEO进入收获期：五国登顶，增长领跑头部品牌"[\s\S]*?description:"市场份额、流量增长、关键词覆盖和技术性能四项取得突破。"/,
  "the overview header must use the approved management-summary wording",
);

for (const fact of [
  "五国第一",
  "Vietnam",
  "India",
  "Thailand",
  "Philippines",
  "South Africa",
  "+45.3%",
  "头部品牌中增速最快",
  "+88%",
  "1,246",
  "2,345",
  "99",
  "/100",
  "Lighthouse Performance",
  "较 Exness 高 27 分",
]) {
  assert.ok(overview.includes(fact), `the overview must preserve the summary fact: ${fact}`);
}

for (const className of [
  "h1-o2-seo-overview-market",
  "h1-o2-seo-overview-growth",
  "h1-o2-seo-overview-foot",
  "h1-o2-seo-overview-keywords",
  "h1-o2-seo-overview-lighthouse",
]) {
  assert.ok(
    overview.includes(className),
    `the reference layout must expose ${className}`,
  );
}

assert.doesNotMatch(
  overview,
  /h1-o2-seo-speed|O2_ORGANIC_ROWS\.map/,
  "the summary page must not repeat the detailed head-to-head bar chart",
);
assert.doesNotMatch(
  overview,
  /grid-template-columns:\s*repeat\(5,1fr\)/,
  "the country leadership summary must not use five tall mini-cards",
);

assert.match(
  theme,
  /\.h1-o2-seo-overview\s*\{[\s\S]*?grid-template-columns:\s*650px\s+1fr;[\s\S]*?column-gap:\s*72px;/,
  "the page must use the approved left-summary/right-insight composition",
);
assert.match(
  marketStyles,
  /display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto;/,
  "the five-country card must keep the big result above a compact market list",
);
assert.match(
  marketStyles,
  /height:\s*100%;[\s\S]*?min-height:\s*0;/,
  "the five-country card must stay inside the fixed presentation grid",
);
assert.match(
  marketLeadValueStyles,
  /color:\s*#ff5e2c;/,
  "the five-country lead value must use the approved orange accent",
);
assert.match(
  growthStyles,
  /display:\s*grid;[\s\S]*?grid-template-rows:\s*minmax\(0,\s*1fr\)\s+auto;/,
  "the right column must keep the organic-traffic conclusion above the two supporting metrics",
);
assert.match(
  growthStyles,
  /height:\s*100%;[\s\S]*?min-height:\s*0;/,
  "the insight column must share the same vertical presentation grid",
);
assert.match(
  theme,
  /\.h1-o2-seo-overview-foot\s*\{[\s\S]*?grid-template-columns:\s*1fr\s+1fr;/,
  "the two supporting metrics must share one balanced bottom row",
);

console.log("H1 O2 SEO overview reference-layout contract passed.");
