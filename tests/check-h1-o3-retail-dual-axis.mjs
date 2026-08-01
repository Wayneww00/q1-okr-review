import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(path.join(root, "previews/h1-o3-theme.css"), "utf8");

assert.match(
  app,
  /function\s+O3RetailDualAxisChart\s*\(/,
  "Vietnam Retail comparison pages should use a dedicated dual-axis chart component",
);

const retailStart = app.indexOf("function O3RetailComparison");
const retailEnd = app.indexOf("function O3FigmaTitle", retailStart);
assert.ok(retailStart >= 0 && retailEnd > retailStart, "O3RetailComparison section should exist");
const retailSection = app.slice(retailStart, retailEnd);

assert.match(
  retailSection,
  /<O3RetailDualAxisChart\s+data=\{data\}\s*\/>/,
  "Only the two Vietnam Retail comparison pages should render the dual-axis chart",
);

for (const expected of [
  "shareRaw:2.7",
  "shareRaw:5.5",
  "valueMax:25000",
  "shareMax:7",
  "leftAxisTicks:[0,5000,10000,15000,20000,25000]",
  "rightAxisTicks:[0,1,2,3,4,5,6,7]",
  "shareRaw:1.5",
  "shareRaw:3.4",
  "valueMax:700",
  "shareMax:4",
  "leftAxisTicks:[0,100,200,300,400,500,600,700]",
  "rightAxisTicks:[0,1,2,3,4]",
]) {
  assert.ok(
    retailSection.replace(/\s+/g, "").includes(expected),
    `Vietnam Retail comparison config should include ${expected}`,
  );
}

for (const contract of [
  /data-o3-retail-dual-axis/,
  /data-o3-retail-share-line/,
  /data-axis-side="left"/,
  /data-axis-side="right"/,
  /h1-o3-retail-share-path/,
  /h1-o3-retail-share-point/,
]) {
  assert.match(app, contract, `Dual-axis chart should expose ${contract}`);
}

assert.match(
  theme,
  /\.h1-o3-retail-share-path\s*\{[^}]*stroke:\s*var\(--h1-o3-gold\)[^}]*stroke-dasharray:/s,
  "The data connector must be a gold dashed line",
);
assert.match(theme, /\.h1-o3-retail-axis-line\s*\{/, "Dual-axis chart should draw vertical axis lines");
assert.match(theme, /\.h1-o3-retail-axis-tick\s*\{/, "Dual-axis chart should style both axis tick labels");

console.log("H1 O3 Vietnam Retail dual-axis chart contract verified.");
