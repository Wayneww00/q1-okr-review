import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-o3-theme.css"),
  "utf8",
);
const asoSource = app.slice(
  app.indexOf("function O3AsoRatingPanel"),
  app.indexOf("function O3Summary"),
);
const googlePlayProof = resolve(
  root,
  "previews/assets/o3/aso-google-play-5-score.png",
);

assert.ok(
  existsSync(googlePlayProof),
  "the ASO rating panel must ship the supplied Google Play 5.0 proof image",
);
assert.match(
  asoSource,
  /className="h1-o3-aso-google-play-proof"[\s\S]*?src="previews\/assets\/o3\/aso-google-play-5-score\.png"/,
  "the ASO rating panel must render the supplied Google Play 5.0 proof image",
);
assert.match(
  theme,
  /\.h1-o3-aso-google-play-proof figcaption\{[^}]*clip-path:inset\(50%\)/,
  "the proof caption must remain accessible without obscuring the supplied screenshot",
);
assert.ok(
  asoSource.includes('function O3AsoRankTone(rank,cellIndex){') &&
    asoSource.includes('if(cellIndex===0&&(rank==="#11"||rank==="#15"))return "is-low-rank";') &&
    asoSource.includes('return cellIndex===0?"is-vantage":rank==="#1"?"is-first":"";'),
  "only Vantage #11 and #15 may use the lighter rank treatment",
);
assert.ok(
  asoSource.includes('className={O3AsoRankTone(rank,cellIndex)}'),
  "keyword ranks must preserve the original classes except for Vantage #11 and #15",
);

for (const component of [
  "O3AsoRatingPanel",
  "O3AsoKeywordMatrix",
  "O3AsoExposurePanel",
  "O3AsoGrowthPanel",
]) {
  assert.match(
    app,
    new RegExp(`function ${component}\\(\\)`),
    `${component} must render as native code`,
  );
  assert.match(
    asoSource,
    new RegExp(`<${component}\\/>`),
    `O3Aso must render ${component}`,
  );
}

assert.doesNotMatch(
  asoSource,
  /<H1SourceImage/,
  "the O3 ASO dashboard must no longer render evidence screenshots",
);

for (const requiredCopy of [
  "长期稳定在4.8，最高达到5.0",
  "用户口碑行业第一",
  "前10关键词占领率行业第一",
  "曝光量提升10倍+",
  "日均约 200",
  "日均约 2,200",
  "ASO增长不止于曝光，也为后端增长带来实质性利好",
  "+1,511%",
  "+741%",
  "+1,412%",
  "合理滞后1月左右",
]) {
  assert.ok(
    asoSource.includes(requiredCopy),
    `coded ASO dashboard must preserve: ${requiredCopy}`,
  );
}

for (const keywordRow of [
  '["exness","#3","#7","#1","#63"]',
  '["vantage","#1","#31","#10","#42"]',
  '["investing","#15","#117","#64","—"]',
  '["xm","#11","#1","#7","—"]',
  '["mitrade","#4","#19","#10","#1"]',
  '["fxpro","#5","#8","#14","#26"]',
  '["crypto trading","#2","#157","#122","—"]',
  '["forex app","#1","#9","#7","#136"]',
  '["stock broker","#4","#20","#62","—"]',
  '["trade stocks","#5","#20","#65","#15"]',
]) {
  assert.ok(
    asoSource.includes(keywordRow),
    `coded keyword matrix must preserve ${keywordRow}`,
  );
}

for (const className of [
  ".h1-o3-aso-rating-panel",
  ".h1-o3-aso-keyword-matrix",
  ".h1-o3-aso-exposure-panel",
  ".h1-o3-aso-growth-panel",
  ".h1-o3-aso-story",
]) {
  assert.ok(theme.includes(className), `${className} must be styled`);
}

for (const rankClass of [
  ".h1-o3-aso-keyword-row>b.is-vantage",
  ".h1-o3-aso-keyword-row>b.is-first",
  ".h1-o3-aso-keyword-row>b.is-low-rank",
]) {
  assert.ok(theme.includes(rankClass), `${rankClass} must be styled`);
}
assert.doesNotMatch(
  theme,
  /\.h1-o3-aso-keyword-row>b\.is-(?:top3|top10|standard|empty)/,
  "rank colors outside Vantage #11 and #15 must remain unchanged",
);

assert.match(
  theme,
  /\.h1-o3-97-evidence-grid h3\{[^}]*font-size:26px/,
  "ASO section titles must use the improved 26px reading size",
);

console.log("H1 O3 ASO coded dashboard contract passed.");
