import assert from "node:assert/strict";
import fs from "node:fs";

const report = fs.readFileSync("index.html", "utf8");
const labelRenderer = report.match(
  /const CustomPercentLabel = \(props\) => \{([\s\S]*?)\n\};/,
)?.[1] || "";

assert.ok(labelRenderer, "the percentage label renderer must exist");
assert.match(
  labelRenderer,
  /const percentValue = Number\.parseFloat\(percentText\);/,
  "the collision rule must use the actual percentage value",
);
assert.match(
  labelRenderer,
  /const isNearXAxis = Number\.isFinite\(percentValue\) && percentValue <= 12;/,
  "percentages at or below 12% must be treated as near the x-axis",
);
assert.match(
  labelRenderer,
  /const bubbleOffset = isNearXAxis \? 48 : 32;/,
  "near-axis labels must receive a larger upward offset",
);
assert.match(
  labelRenderer,
  /const placeBelow = isFirst && !isNearXAxis && y <= 190;/,
  "near-axis labels must never be placed below their data point",
);

console.log("H1 percentage-label collision contract passed.");
