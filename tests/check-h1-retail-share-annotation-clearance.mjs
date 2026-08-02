import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const start = app.indexOf("function H1RetailShareShiftChart({data})");
const end = app.indexOf("function H1ApacNdBreakdownChart({data})", start);

assert.ok(start >= 0 && end > start, "Retail ND share chart component should exist");

const component = app.slice(start, end);

assert.match(
  component,
  /const groupX = \[300,900\];/,
  "GS and APAC bar groups should align to the centers of the two equal-width summary cards",
);

function readNumericConstant(name) {
  const match = component.match(new RegExp(`const ${name} = (\\d+);`));
  assert.ok(match, `${name} should be an explicit chart geometry constant`);
  return Number(match[1]);
}

const valueLabelOffset = readNumericConstant("valueLabelOffset");
const annotationOffset = readNumericConstant("annotationOffset");
const annotationArrowRadius = readNumericConstant("annotationArrowRadius");
const estimatedValueTextHeight = 20;
const visualClearance =
  annotationOffset - valueLabelOffset - estimatedValueTextHeight - annotationArrowRadius;

assert.ok(
  visualClearance >= 12,
  `Retail ND change arrows need at least 12px of visual clearance above percentage labels; received ${visualClearance}px`,
);
assert.match(
  component,
  /markerUnits="userSpaceOnUse"/,
  "Arrowheads should use screen-space sizing so their clearance stays predictable",
);
assert.match(
  component,
  /data-retail-share-annotation=/,
  "Each change arrow should expose an annotation hook for runtime geometry checks",
);
assert.match(
  component,
  /data-retail-share-value=/,
  "Each percentage label should expose a value hook for runtime geometry checks",
);

console.log("H1 Retail ND share annotation clearance contract passed.");
