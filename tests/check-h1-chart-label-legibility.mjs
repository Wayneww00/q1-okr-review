import assert from "node:assert/strict";
import fs from "node:fs";

const report = fs.readFileSync("index.html", "utf8");
const theme = fs.readFileSync("previews/h1-figma-racing-theme.css", "utf8");
const h1ChartBlock = report.slice(
  report.indexOf("function H1FigmaStandardChart"),
  report.indexOf("function H1FigmaRegionTable"),
);

assert.match(
  report,
  /const CustomAbsoluteLabel = \(props\) => \{[\s\S]*?className:'h1-figma-chart-value-text'/,
  "bar-top values must use the dedicated high-contrast text treatment",
);
assert.equal(
  (h1ChartBlock.match(/content=\{\(props\)=>\{var row=chartData\[props\.index\];return <CustomAbsoluteLabel/g) || []).length,
  2,
  "both comparison and profit charts must use the same clear bar-value renderer",
);
assert.match(
  report,
  /const CustomPercentLabel = \(props\) => \{[\s\S]*?className:'h1-figma-percent-pill'/,
  "percentage values must render inside a solid high-contrast pill",
);
assert.match(
  report,
  /className:'h1-figma-percent-pill-text'/,
  "percentage text must have its own legibility treatment",
);
assert.match(
  report,
  /const isNearXAxis = Number\.isFinite\(percentValue\) && percentValue <= 12;[\s\S]*?const bubbleOffset = isNearXAxis \? 48 : 32;[\s\S]*?const bubbleY = y \+ \(placeBelow \? 32 : -bubbleOffset\);/,
  "low percentage labels must receive extra clearance from the x-axis",
);
assert.match(
  report,
  /dot=\{\{r:6,fill:"#c61b21",stroke:"#fff",strokeWidth:3\}\}/,
  "percentage line points must remain visible over the chart and background",
);

assert.match(
  theme,
  /\.h1-figma-chart-value-text\s*\{[\s\S]*?font-size:\s*15px;[\s\S]*?font-weight:\s*800;[\s\S]*?paint-order:\s*stroke;[\s\S]*?stroke:\s*rgba\(0,0,0,\.88\);[\s\S]*?font-variant-numeric:\s*tabular-nums;/,
  "bar values must use a crisp white face, dark outline, and tabular numerals",
);
assert.match(
  theme,
  /\.h1-figma-percent-pill\s*\{[\s\S]*?fill:\s*rgba\(93,10,16,\.96\);[\s\S]*?stroke:\s*rgba\(255,92,92,\.92\);/,
  "percentage pills must retain the existing red palette with stronger contrast",
);
assert.match(
  theme,
  /\.h1-figma-percent-pill-text\s*\{[\s\S]*?fill:\s*#fff;[\s\S]*?font-size:\s*14px;[\s\S]*?font-weight:\s*800;[\s\S]*?font-variant-numeric:\s*tabular-nums;/,
  "percentage values must be large, bold, white, and numerically aligned",
);

console.log("H1 chart-label legibility contract passed.");
