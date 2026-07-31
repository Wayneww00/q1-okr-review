import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const css = fs.readFileSync(
  path.join(repoRoot, "previews/h1-figma-racing-theme.css"),
  "utf8",
);

const ibLoopSource = html.match(
  /function O2IbLoop\([^)]*\)\{([\s\S]*?)\n\}\n\nconst H1_O2_COVER_PAGE_IDS/,
)?.[1];
const reportPageSource = html.match(
  /function O2ReportPage\(\{page,index,count\}\)\{([\s\S]*?)\n\}\n\nfunction O2ReportDeck/,
)?.[1];
const ibStyles = css.match(
  /\/\* IB loop \*\/([\s\S]*?)\/\* O2 SEO \/ GEO pages/,
)?.[1];

assert.ok(ibLoopSource, "the IB loop component must remain discoverable");
assert.ok(reportPageSource, "the O2 page shell must remain discoverable");
assert.ok(ibStyles, "the IB loop styles must remain isolated");

assert.match(
  html,
  /id:"o2-ib-loop",[\s\S]*?layout:"ib-loop",[\s\S]*?editorRevision:"ib-loop-h2-scale-plan-v1"/,
  "the standardized page must use a fresh editor namespace",
);
assert.doesNotMatch(
  ibLoopSource,
  /h1-o2-ib-header/,
  "the IB page must not maintain a divergent custom header",
);
assert.match(
  reportPageSource,
  /page\.layout==="ib-loop"\)content=<><O2PageHeader page=\{page\}\/><O2IbLoop\/><\/>;/,
  "the IB page must reuse the common O2 page header",
);
assert.match(
  ibStyles,
  /\.h1-o2-ib-layout\s*\{[\s\S]*?grid-template-columns:\s*520px minmax\(0,\s*1fr\);[\s\S]*?grid-template-rows:\s*410px 150px 98px;[\s\S]*?column-gap:\s*22px;[\s\S]*?row-gap:\s*23px;/,
  "the IB composition must fit the common 1612×704 O2 content grid",
);
const ibLayoutRule = ibStyles.match(/\.h1-o2-ib-layout\s*\{([\s\S]*?)\}/)?.[1] || "";
assert.doesNotMatch(
  ibLayoutRule,
  /(?:^|\n)\s*(?:top|left|width|height):/,
  "the IB layout must inherit the common O2 position and dimensions",
);
assert.match(
  ibStyles,
  /\.h1-o2-nl-proof strong\s*\{[\s\S]*?font:\s*900 140px\//,
  "the 21% proof must return to the O2 type scale",
);
assert.match(
  ibStyles,
  /\.h1-o2-ib-kpis \.h1-o2-metric > strong\s*\{[\s\S]*?font:\s*900 48px\//,
  "the KPI values must match the surrounding O2 metric density",
);
assert.doesNotMatch(
  ibStyles,
  /\.is-ib-loop \.h1-o2-page-number/,
  "the IB page must use the common O2 page-number safe area",
);

console.log("H1 O2 IB standard-layout contract passed.");
