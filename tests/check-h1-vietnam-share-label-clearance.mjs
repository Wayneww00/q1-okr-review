import assert from "node:assert/strict";
import fs from "node:fs";

const report = fs.readFileSync("index.html", "utf8");
const theme = fs.readFileSync("previews/h1-figma-racing-theme.css", "utf8");

const componentStart = report.indexOf("function H1VietnamRetailNdChart");
const componentEnd = report.indexOf("function H1MibAttributionChart", componentStart);
assert.ok(componentStart >= 0 && componentEnd > componentStart, "the Vietnam Retail ND chart must exist");

const component = report.slice(componentStart, componentEnd);
const offsetsSource = component.match(/const shareLabelOffsets\s*=\s*\[([\s\S]*?)\];/)?.[1];
assert.ok(offsetsSource, "the two trend labels must use explicit endpoint offsets");

const offsets = [...offsetsSource.matchAll(
  /\{dx:(-?\d+),dy:(-?\d+),textAnchor:"(start|middle|end)"\}/g,
)].map((match) => ({
  dx: Number(match[1]),
  dy: Number(match[2]),
  textAnchor: match[3],
}));

assert.deepEqual(
  offsets.map(({dx, dy, textAnchor}) => [Math.sign(dx), Math.sign(dy), textAnchor]),
  [[-1, -1, "end"], [1, 1, "start"]],
  "Q1 must sit above-left and Q2 below-right of their line endpoints",
);
assert.ok(offsets.every(({dx, dy}) => Math.abs(dx) >= 20 && Math.abs(dy) >= 28), "labels need presentation-safe clearance from the dots and line");
assert.match(component, /data-vietnam-share-point=\{period\.label\}/, "each trend point needs a runtime geometry hook");
assert.match(component, /data-vietnam-share-label=\{period\.label\}/, "each trend label needs a runtime geometry hook");
assert.match(
  theme,
  /\.is-vietnam-retail-nd \.h1-retail-growth-share-label\.is-endpoint\s*\{[\s\S]*?paint-order:\s*stroke fill;[\s\S]*?stroke:\s*rgba\(0,0,0,\.72\);[\s\S]*?stroke-width:\s*4px;/,
  "the gold endpoint labels need a dark halo over the chart",
);

console.log("H1 Vietnam share-label clearance contract passed.");
