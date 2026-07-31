import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8"
);

const start = index.indexOf("const H1_DASHBOARDS = [");
const end = index.indexOf("const REPORT_MODE", start);
assert.ok(start >= 0 && end > start, "H1 dashboard data block should exist");
const h1Block = index.slice(start, end);

for (let id = 1; id <= 21; id += 1) {
  assert.match(
    h1Block,
    new RegExp(`\\bid:${id}(?:,|\\s)`),
    `H1 data page ${id} should exist`
  );
}
assert.equal(
  [...h1Block.matchAll(/\bid:(\d+)(?:,|\s)/g)].length,
  21,
  "H1 should contain exactly 21 data pages"
);

const orderedNewPages = [
  'id:11, layoutType:"brand_voice_search_combined"',
  'id:12, layoutType:"social_sov_trend"',
  'id:13, layoutType:"followers_share"',
  'id:14, layoutType:"followers_trend"'
];
let previousPosition = -1;
for (const marker of orderedNewPages) {
  const position = h1Block.indexOf(marker);
  assert.ok(position > previousPosition, `${marker} should follow the approved PPT order`);
  previousPosition = position;
}

const requiredSourceValues = [
  "品牌整体数据",
  "36.8k",
  "25.7k",
  "29.3%",
  "30.3%",
  "37%",
  "281879",
  "968962",
  "286463",
  "955636",
  "transparent ecosystem",
  "reliable platform",
  "multi-asset brokerage",
  "editorial criteria",
  "SHARE OF VOICE (SOV) TREND",
  "5.79%",
  "10.23%",
  "4.79%",
  "8.10%",
  "16.20%",
  "15.76%",
  "15.48%",
  "16.82%",
  "13.28%",
  "11.67%",
  "10.00%",
  "15.05%",
  "12.97%",
  "13.42%",
  "13.76%",
  "13.32%",
  "10,783,372",
  "2,291,951",
  "21.3%",
  "16,420,972",
  "2,653,508",
  "16.2%",
  "2,064,174",
  "2,267,829",
  "1,949,275",
  "2,044,947",
  "+2.10%",
  "+1.47%",
  "+3.80%",
  "-0.41%"
];
for (const value of requiredSourceValues) {
  assert.ok(h1Block.includes(value), `PPT source value should be preserved: ${value}`);
}

const page11Start = h1Block.indexOf("id:11");
const appendedBlock = h1Block.slice(page11Start);
assert.doesNotMatch(
  appendedBlock,
  /(?:pptImage|chartImage|data:image\/|image4[0-5]\.(?:png|jpe?g|webp))/i,
  "new charts must be native HTML/SVG, not embedded PPT chart images"
);

for (const component of [
  "H1BrandVoiceSearchCombinedChart",
  "H1BrandVoiceChart",
  "H1BrandSearchReputationChart",
  "H1SocialSovTrendChart",
  "H1FollowersShareChart",
  "H1FollowersTrendChart"
]) {
  assert.ok(index.includes(`function ${component}`), `${component} should render a native chart`);
}
assert.ok(
  index.includes('count={DASHBOARDS.length}'),
  "page count should continue to derive from the H1 data length"
);
assert.ok(
  index.includes('String(count).padStart(2,"0")'),
  "visible page numbers should remain dynamic"
);
assert.ok(shell.includes("'21 MODULES'"), "outer report chapter should declare 21 modules");
assert.ok(
  shell.includes("doc.querySelectorAll('[data-report-page]')") &&
    shell.includes("reportPages.length") &&
    shell.includes("reportPageTop(reportPages[index])"),
  "vertical PPT paging must remain dynamic across 21 data pages plus OKR"
);

console.log("H1 combined brand plus social data contract passed.");
