import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-o3-theme.css"),
  "utf8",
);
const geoSource = app.slice(
  app.indexOf("function O3GeoBrandTable"),
  app.indexOf("function O3Aso"),
);

assert.match(
  app,
  /function O3GeoBrandTable\(\)/,
  "the Top 7 Brands evidence must be a native coded table",
);
for (const row of [
  '["IG","27%","17%","56","2.1"',
  '["eToro","22%","24%","62","1.9"',
  '["Vantage","21%","30%","62","1.7"',
  '["Interactive Brokers","11%","9%","54","3.8"',
  '["Pepperstone","9%","7%","57","3.0"',
  '["IC Markets","6%","5%","57","2.8"',
  '["Exness","4%","4%","62","1.8"',
]) {
  assert.ok(geoSource.includes(row), `coded GEO table must preserve ${row}`);
}
assert.match(
  geoSource,
  /<O3GeoBrandTable\/>/,
  "the GEO page must render the coded brand table",
);
assert.doesNotMatch(
  geoSource,
  /geo-platform-evidence\.png/,
  "the GEO table must no longer render as a screenshot",
);
for (const className of [
  ".h1-o3-geo-brand-table",
  ".h1-o3-geo-brand-head",
  ".h1-o3-geo-brand-row",
  ".h1-o3-geo-brand-row.is-vantage",
]) {
  assert.ok(theme.includes(className), `${className} must be styled`);
}
for (const logo of ["ig.png", "etoro.png", "interactive-brokers.png", "ic-markets.png"]) {
  assert.ok(
    existsSync(resolve(root, "previews/assets/o3/geo-brands", logo)),
    `exact source logo crop must exist: ${logo}`,
  );
}

console.log("H1 O3 GEO coded Top 7 Brands table contract passed.");
