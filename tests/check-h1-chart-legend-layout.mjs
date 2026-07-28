import assert from "node:assert/strict";
import fs from "node:fs";

const theme = fs.readFileSync("previews/h1-figma-racing-theme.css", "utf8");

assert.match(
  theme,
  /\.h1-figma-chart-legend\s*\{[\s\S]*?justify-content:\s*center;[\s\S]*?gap:\s*9px;[\s\S]*?font-size:\s*16px;/,
  "the chart legend must be a compact group centered within the chart card",
);
assert.match(
  theme,
  /\.h1-figma-chart-legend \.bar\s*\{[\s\S]*?width:\s*11px;[\s\S]*?height:\s*11px;/,
  "the absolute-value icon must be smaller than the current oversized square",
);
assert.match(
  theme,
  /\.h1-figma-chart-legend \.line\s*\{[\s\S]*?margin-left:\s*20px;[\s\S]*?font-size:\s*15px;/,
  "the share icon must be smaller and separated by a restrained inner gap",
);

console.log("H1 chart-legend layout contract passed.");
