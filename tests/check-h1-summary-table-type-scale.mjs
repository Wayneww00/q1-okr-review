import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const report = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
const immersive = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const typeScaleRevision = "20260801-mib-bottom-compat-v1";

const h1DataStart = report.indexOf("const H1_DASHBOARDS = [");
const h1DataEnd = report.indexOf("const REPORT_MODE", h1DataStart);
const h1Data = report.slice(h1DataStart, h1DataEnd);
const summaryTableRows = theme.match(
  /\.h1-figma-summary-table > div > span\s*\{([^}]*)\}/,
)?.[1];

assert.ok(h1DataStart >= 0 && h1DataEnd > h1DataStart, "H1 data pages must exist");
assert.ok(summaryTableRows, "summary-table row typography must remain explicit");
for (let id = 1; id <= 10; id += 1) {
  assert.match(
    h1Data,
    new RegExp(`(?:\\{|,)\\s*id:${id}(?:,|\\s)`),
    `H1 data page ${id} must remain in the shared summary-table range`,
  );
}
assert.match(
  summaryTableRows,
  /font:\s*500 20px\/29\.42px "Noto Sans SC", sans-serif !important;/,
  "summary-table years and values must be large enough for presentation viewing",
);
assert.ok(
  report.includes(`previews/h1-figma-racing-theme.css?v=${typeScaleRevision}`),
  "the standalone report must invalidate the previous table typography",
);
assert.ok(
  immersive.includes(`h1-figma-racing-theme.css?v=${typeScaleRevision}`) &&
    immersive.includes(
      `figmaTheme.href = '/previews/h1-figma-racing-theme.css?v=${typeScaleRevision}'`,
    ),
  "both immersive theme consumers must invalidate the previous table typography",
);

console.log("H1 summary-table type-scale contract passed.");
