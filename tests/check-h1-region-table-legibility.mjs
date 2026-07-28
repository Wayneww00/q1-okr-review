import assert from "node:assert/strict";
import fs from "node:fs";

const report = fs.readFileSync("index.html", "utf8");
const theme = fs.readFileSync("previews/h1-figma-racing-theme.css", "utf8");

assert.match(
  report,
  /<colgroup><col className="is-half"\/><col className="is-region"\/><col className="is-register"\/><col className="is-ftd"\/><col className="is-nd"\/><col className="is-tv"\/><col className="is-roi"\/><\/colgroup>/,
  "the ROI table must declare a deliberate width for all seven visible columns",
);
const h1RegionTable = report.match(
  /function H1FigmaRegionTable\(\{data\}\) \{[\s\S]*?\n\}/,
)?.[0];
assert.ok(h1RegionTable, "the H1 regional table component must exist");
assert.doesNotMatch(
  h1RegionTable,
  /CONV\. COST|is-cost|row\.convCost/,
  "Conv. Cost must stay hidden from the H1 regional ROI table",
);
assert.match(
  report,
  /function H1FigmaRegionTable\(\{data\}\) \{\s*const previous = data\.tableRegionsQuarter1 \|\| \[\];\s*const current = data\.tableRegionsQuarter2 \|\| \[\];/,
  "the two period arrays must be defined in the table component before the divider uses them",
);
assert.match(
  report,
  /row\.isCurrent && index === previous\.length \? "is-period-start" : ""/,
  "the 2026 H1 rows must begin with a clear period divider",
);

assert.match(
  theme,
  /\.h1-figma-region-table\s*\{[\s\S]*?height:\s*100%;[\s\S]*?table-layout:\s*fixed;[\s\S]*?font-variant-numeric:\s*tabular-nums;/,
  "the table must fill the available card height while keeping stable columns",
);
assert.match(
  theme,
  /\.h1-figma-region-table col\.is-half\s*\{\s*width:\s*11%;\s*\}[\s\S]*?col\.is-tv\s*\{\s*width:\s*24%;\s*\}[\s\S]*?col\.is-roi\s*\{\s*width:\s*13%;\s*\}/,
  "the narrow and long-value columns must receive proportionate widths",
);
assert.match(
  theme,
  /\.h1-figma-region-table th\s*\{[\s\S]*?font-size:\s*12\.5px\s*!important;[\s\S]*?letter-spacing:\s*\.08em;/,
  "table headers must be large and distinct enough for presentation viewing",
);
assert.match(
  theme,
  /\.h1-figma-region-table td\s*\{[\s\S]*?padding:\s*7px 8px;[\s\S]*?font-size:\s*14px;[\s\S]*?line-height:\s*1\.2;/,
  "table values must be materially larger while all eight rows remain visible",
);
assert.match(
  theme,
  /\.h1-figma-region-table th,[\s\S]*?\.h1-figma-region-table td\s*\{[\s\S]*?vertical-align:\s*middle;/,
  "the extra vertical space must be distributed around centered cell content",
);
assert.match(
  theme,
  /\.h1-figma-region-table tr\.is-period-start td\s*\{[\s\S]*?border-top:\s*2px solid rgba\(233,54,59,\.72\)\s*!important;/,
  "the second half-year group must be visually separated",
);
assert.match(
  theme,
  /\.h1-figma-region-table strong\s*\{[\s\S]*?min-height:\s*24px;[\s\S]*?color:\s*#fff;[\s\S]*?font-size:\s*14\.5px;[\s\S]*?background:\s*rgba\(151,20,27,\.82\);/,
  "ROI values must use a high-contrast red badge",
);

console.log("H1 region-table legibility contract passed.");
