import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

assert.match(
  theme,
  /\.h1-o3-97-evidence-grid h3\{[^}]*font-size:26px/,
  "ASO section titles must use the improved 26px reading size",
);

console.log("H1 O3 ASO coded dashboard contract passed.");
