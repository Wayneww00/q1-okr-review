import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const ibLoop = app.match(
  /function O2IbLoop\([^)]*\)\{([\s\S]*?)\n\}\n\nconst H1_O2_COVER_PAGE_IDS/,
)?.[1];
const ibStyles = theme.match(
  /\/\* IB loop \*\/([\s\S]*?)\/\* O2 SEO \/ GEO pages/,
)?.[1];

assert.ok(ibLoop, "IB loop component must remain discoverable");
assert.ok(ibStyles, "IB loop styles must remain isolated");

assert.match(
  app,
  /id:"o2-ib-loop",[\s\S]*?editorRevision:"ib-loop-h2-scale-plan-v1"/,
  "the added editable copy needs a fresh editor namespace",
);
assert.match(
  ibLoop,
  /<article className="h1-o2-card h1-o2-h2-plan" aria-label="H2 下半年规模化计划">/,
  "the plan must be a semantic, in-page closing band",
);
for (const copy of [
  "H2 SCALE PLAN",
  "复制荷兰打法",
  "在重点市场加码",
  "扩大 EU IB 规模",
]) {
  assert.ok(ibLoop.includes(copy), `the H2 plan must preserve: ${copy}`);
}
assert.match(
  ibLoop,
  /className="h1-o2-h2-plan-connector" aria-hidden="true"/,
  "plan stages must use visual connectors",
);

assert.match(
  ibStyles,
  /\.h1-o2-ib-layout\s*\{[\s\S]*?grid-template-areas:\s*"proof loop"\s*"kpis kpis"\s*"plan plan";[\s\S]*?grid-template-rows:\s*410px 150px 98px;[\s\S]*?row-gap:\s*23px;/,
  "proof, loop, KPIs, and plan must fit the existing 1612×704 content grid",
);
assert.match(
  ibStyles,
  /\.h1-o2-h2-plan\s*\{[\s\S]*?grid-area:\s*plan;[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*250px minmax\(0,\s*1fr\);/,
  "the H2 plan must use a stable full-width two-zone composition",
);
assert.match(
  ibStyles,
  /\.h1-o2-h2-plan-connector\s*\{[\s\S]*?height:\s*1px;[\s\S]*?background:/,
  "the three stages must be joined by thin horizontal lines",
);

console.log("H1 O2 IB H2 scale-plan contract passed.");
