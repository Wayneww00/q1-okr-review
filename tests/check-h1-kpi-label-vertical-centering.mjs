import assert from "node:assert/strict";
import fs from "node:fs";

const report = fs.readFileSync("index.html", "utf8");
const theme = fs.readFileSync("previews/h1-figma-racing-theme.css", "utf8");
const immersive = fs.readFileSync(
  "previews/vantage-h1-immersive.html",
  "utf8",
);
const centeringRevision = "20260801-vietnam-share-labels-v1";

const imageRule = theme.match(
  /\.h1-figma-kpi\s*>\s*img\s*\{([^}]*)\}/,
)?.[1];
const labelRule = theme.match(
  /\.h1-figma-kpi\s*>\s*span\s*\{([^}]*)\}/,
)?.[1];

assert.ok(imageRule, "the shared KPI ribbon image rule must exist");
assert.ok(labelRule, "the shared KPI ribbon label rule must exist");

const readPx = (rule, property) => {
  const value = rule.match(new RegExp(`${property}:\\s*([\\d.]+)px`))?.[1];
  assert.ok(value, `${property} must use an explicit measured pixel value`);
  return Number(value);
};

const ribbonHeight = readPx(imageRule, "height");
const labelTop = readPx(labelRule, "top");
const labelHeight = readPx(labelRule, "height");

assert.equal(
  labelTop,
  28.84507,
  "the KPI label layer must start at the same measured top edge as the ribbon",
);
assert.equal(
  labelHeight,
  ribbonHeight,
  "the KPI label layer must cover the full ribbon height",
);
assert.match(
  labelRule,
  /display:\s*flex;[\s\S]*?align-items:\s*center;[\s\S]*?justify-content:\s*center;/,
  "the shared KPI label layer must center every label vertically and horizontally",
);
assert.equal(
  (report.match(/<H1FigmaKpi\b/g) || []).length,
  2,
  "all H1 data pages must keep using the same two shared KPI cards",
);
assert.equal(
  (report.match(/periodLabel:"Half"/g) || []).length,
  10,
  "the shared centering fix must continue to cover all ten H1 data pages",
);
assert.ok(
  report.includes(
    `previews/h1-figma-racing-theme.css?v=${centeringRevision}`,
  ),
  "the report must request the centered KPI stylesheet revision",
);
assert.ok(
  immersive.includes(
    `h1-figma-racing-theme.css?v=${centeringRevision}`,
  ),
  "the immersive shell must request the centered KPI stylesheet revision",
);
assert.ok(
  immersive.includes(
    `figmaTheme.href = '/previews/h1-figma-racing-theme.css?v=${centeringRevision}'`,
  ),
  "the embedded report must inject the centered KPI stylesheet revision",
);
assert.ok(
  immersive.includes(
    `../index.html?report=h1&embedded=1&v=${centeringRevision}`,
  ),
  "the embedded report iframe must invalidate its previous layout document",
);

console.log("H1 KPI label vertical-centering contract passed.");
