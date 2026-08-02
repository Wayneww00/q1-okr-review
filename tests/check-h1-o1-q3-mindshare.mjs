import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o1-complete-theme.css"),
  "utf8",
);

assert.match(
  app,
  /id:'okr-integrated-marketing-transition'[\s\S]*?id:'okr-omnichannel-amplification'[\s\S]*?id:'okr-ai-recommendation'[\s\S]*?id:'okr-q3-24-7-mindshare'[\s\S]*?id:'okr-tvc-localization'/,
  "the omnichannel and AI pages must swap, with the new Q3 page immediately after 24/7 GEO",
);

for (const copy of [
  "Q3 会持续投入 24/7 心智建设",
  "GEO 持续维持第一",
  "SEO 第一",
  "Social Media SOV 第一",
  "配合 Sales 进行 IB 传播",
  "共同建立「24/7 交易就上 VTG」的行业认知",
]) {
  assert.ok(app.includes(copy), `the Q3 strategy page must preserve: ${copy}`);
}

assert.match(
  app,
  /function OkrQ3MindsharePage\(\{page,index,count\}\)[\s\S]*?useOkrCanvasScale\(\{cover:true\}\)/,
  "the Q3 strategy page must use a full-bleed cover canvas",
);
assert.match(
  app,
  /page\.id==='okr-q3-24-7-mindshare'\s*\?\s*<OkrQ3MindsharePage/,
  "the O1 registry must route the Q3 page to its designed component",
);
assert.match(
  theme,
  /\.h1-okr-q3-mindshare-page\s*\{[\s\S]*?background:\s*transparent/,
  "the Q3 page must preserve the shared Vantage trophy backdrop",
);
assert.match(
  theme,
  /\.h1-okr-q3-mindshare-title\s*\{[\s\S]*?font-size:\s*min\(/,
  "the Q3 strategy title must scale safely across presentation viewports",
);
assert.match(
  app,
  /h1-okr-q3-mindshare-scoreboard[\s\S]*?content\.signals\.map[\s\S]*?h1-okr-q3-mindshare-score[\s\S]*?h1-okr-q3-mindshare-rank/,
  "the selected design must render all three leadership signals as the primary scoreboard",
);
assert.match(
  app,
  /h1-okr-q3-mindshare-outcome-rail[\s\S]*?h1-okr-q3-mindshare-amplifier-mark[\s\S]*?h1-okr-q3-mindshare-equation/,
  "the selected design must resolve Sales × IB into the 24\/7 = VTG outcome rail",
);
assert.match(
  theme,
  /\.h1-okr-q3-mindshare-scoreboard\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,minmax\(0,1fr\)\)/,
  "the three leadership metrics must receive equal visual weight",
);
assert.match(
  theme,
  /\.h1-okr-q3-mindshare-rank\s*\{[\s\S]*?font-size:\s*min\(112px/,
  "NO.1 must be the dominant visual signal on the selected design",
);
assert.match(
  theme,
  /\.h1-embedded-report main\.h1-okr-report \.h1-okr-q3-mindshare-scoreboard,\s*[\s\S]*?\.h1-okr-q3-mindshare-outcome-rail\s*\{[\s\S]*?margin-bottom:\s*0\s*!important;[\s\S]*?padding-top:\s*0\s*!important;/,
  "the Q3 nested sections must neutralize the immersive shell's global section spacing",
);
assert.ok(
  app.includes("h1-o1-complete-theme.css?v=20260802-q3-scoreboard-v3"),
  "the production page must invalidate the cached O1 theme",
);

console.log("H1 O1 Q3 24/7 mindshare strategy contract passed.");
