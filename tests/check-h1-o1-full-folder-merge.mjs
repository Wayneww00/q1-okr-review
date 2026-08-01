import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const ndRetailRollback = spawnSync(
  "tar",
  [
    "-xOf",
    path.join(
      root,
      "backups",
      "nd-h1-retail-8-pages-before-20260731-001104",
      "rollback-files.tar.gz",
    ),
    "index.html",
  ],
  { encoding: "utf8" },
);
assert.equal(ndRetailRollback.status, 0, ndRetailRollback.stderr);
const appBeforeNdRetail = ndRetailRollback.stdout;

function constantBlock(source, declaration) {
  const start = source.indexOf(declaration);
  assert.ok(start >= 0, `${declaration} must exist`);
  const end = source.indexOf("\n];", start);
  assert.ok(end > start, `${declaration} must have a closing array`);
  return source.slice(start, end + 3);
}

function topLevelStringIds(block) {
  return [
    ...block.matchAll(/^  \{(?:\n    )?id:["']([^"']+)["']/gm),
  ].map((match) => match[1]);
}

function topLevelNumericIds(block) {
  return [...block.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
    Number(match[1]),
  );
}

const expectedO1Ids = [
  "okr-review",
  "okr-brand-results",
  "okr-brand-build-transition",
  "okr-brand-upgrade-transition",
  "okr-brand-refresh",
  "okr-brand-operating-system",
  "okr-tvc-matrix",
  "okr-brand-experience-audit",
  "okr-tvc-framework",
  "okr-tvc-library",
  "okr-application-roadmap",
  "okr-high-value-actions",
  "okr-awards-transition",
  "okr-awards",
  "okr-offline-events-transition",
  "okr-offline-event-01",
  "okr-offline-event-02",
  "okr-elite-client-service-transition",
  "okr-elite-client-identity",
  "okr-client-experience-model",
  "okr-client-experience-cases",
  "okr-elite-client-no1-experience",
  "okr-elite-endorsement-resources",
  "okr-elite-ferrari-experience",
  "okr-elite-black-label",
  "okr-elite-business-enablement",
  "okr-merchandise-transition",
  "okr-merchandise",
  "okr-public-good-transition",
  "okr-cfd-public-good-story",
  "okr-cfd-public-good",
  "okr-public-good-video",
  "okr-un-ngo-engagement",
  "okr-integrated-marketing-transition",
  "okr-ai-recommendation",
  "okr-omnichannel-amplification",
  "okr-tvc-localization",
  "okr-superapp-activation",
  "okr-premium-unlimited",
];

const dataIds = topLevelNumericIds(
  constantBlock(app, "const H1_DASHBOARDS = ["),
);
const o1Block = constantBlock(app, "const OKR_FIGMA_PAGES=[");
const o1Ids = topLevelStringIds(o1Block);
const o2Ids = topLevelStringIds(constantBlock(app, "const O2_REPORT_PAGES=["));
const o3Ids = topLevelStringIds(constantBlock(app, "const O3_REPORT_PAGES=["));

assert.deepEqual(
  dataIds,
  Array.from({ length: 20 }, (_, index) => index + 1),
  "the current 21 data pages must remain in order",
);
assert.deepEqual(
  o1Ids,
  expectedO1Ids,
  "the O1 section must retain all 39 pages in the approved presentation order",
);
assert.doesNotMatch(
  app.slice(
    app.indexOf("function OkrBrandSystemPage"),
    app.indexOf("// ═══ O2 growth review"),
  ),
  /<span>\/ 19<\/span>/,
  "no transplanted O1 page may retain the downloaded folder's stale 19-page denominator",
);
assert.equal(o2Ids.length, 27, "all 27 current O2 pages must remain");
assert.deepEqual(
  o2Ids.slice(0, 2),
  ["o2-chapter", "o2-seo-chapter"],
  "O1 must hand off to the retained O2 chapter before 2026 H1 SEO",
);
assert.equal(
  o3Ids.length,
  18,
  "the restored Vietnam sequence plus the India chapter must remain",
);
assert.deepEqual(
  o3Ids.slice(0, 2),
  ["o3-chapter", "o3-retail-ftd"],
  "O3 must begin with the restored Vietnam title before its first data page",
);
assert.equal(
  dataIds.length + o1Ids.length + o2Ids.length + o3Ids.length,
  98,
  "the unified embedded report must contain 98 pages after adding the O1 transition",
);
assert.doesNotMatch(
  app.slice(
    app.indexOf("function OkrReportDeck()"),
    app.indexOf("// ═══ O2 growth review"),
  ),
  /<O1ChapterPage\b/,
  "the package's page 01 must replace the former extra O1 chapter",
);

const currentDataBlock = constantBlock(app, "const H1_DASHBOARDS = [");
const rollbackDataBlock = constantBlock(
  appBeforeNdRetail,
  "const H1_DASHBOARDS = [",
);
function numericPageBlock(block, id, finalId) {
  const start = block.search(new RegExp(`^  \\{\\s*id:${id},`, "m"));
  const next =
    id < finalId
      ? block.search(new RegExp(`^  \\{\\s*id:${id + 1},`, "m"))
      : block.lastIndexOf("\n];");
  assert.ok(start >= 0 && next > start, `data page ${id} must be isolated`);
  return block.slice(start, next).trim().replace(/,$/, "");
}
for (let id = 1; id <= 14; id += 1) {
  assert.equal(
    numericPageBlock(currentDataBlock, id, 21),
    numericPageBlock(rollbackDataBlock, id, 14),
    `retained data page ${id} must remain byte-for-byte unchanged`,
  );
}
const dashboardRender = app.indexOf("<DashboardSection editMode={editMode}/>");
const o1Render = app.indexOf("<OkrReportDeck/>", dashboardRender);
const o2Render = app.indexOf("<O2ReportDeck/>", o1Render);
const o3Render = app.indexOf("<O3ReportDeck/>", o2Render);
assert.ok(
  dashboardRender >= 0 &&
    o1Render > dashboardRender &&
    o2Render > o1Render &&
    o3Render > o2Render,
  "the report render order must remain data → O1 → O2 → O3",
);

for (const component of [
  "function OkrFixedBackdrop(",
  "function OkrDirectFigmaForegroundPage(",
  "function OkrEliteClientForegroundPage(",
  "function OkrPublicGoodVideoPage(",
  "function OkrBrandRefreshForegroundPage(",
  "function OkrBrandContentMatrixForegroundPage(",
  "function OkrPositionedFigmaForegroundPage(",
]) {
  assert.ok(app.includes(component), `${component} must be transplanted`);
}

assert.ok(
  /<link id="h1-o1-complete-theme" rel="stylesheet" href="previews\/h1-o1-complete-theme\.css\?v=[^"]+">/.test(
    app,
  ),
  "the isolated complete O1 theme must be loaded",
);
assert.ok(
  /src="\.\.\/index\.html\?report=h1&amp;embedded=1&amp;v=[^"]+"/.test(
    shell.replaceAll("&", "&amp;"),
  ),
  "the immersive shell must load a cache-busted embedded report",
);

assert.doesNotMatch(
  o1Block,
  /previews\/assets\/(?:figma-untitled|figma-exact|tvc-library)\//,
  "the transplanted O1 registry must not overwrite or depend on the current asset roots",
);

const o1AssetReferences = [
  ...app.matchAll(
    /["'`](previews\/assets\/o1-complete\/[^"'`?]+)(?:\?[^"'`]*)?["'`]/g,
  ),
].map((match) => match[1]);
assert.ok(
  o1AssetReferences.length >= 20,
  "the complete O1 implementation must use its isolated asset root",
);
for (const relativePath of new Set(o1AssetReferences)) {
  assert.ok(
    fs.existsSync(path.join(root, relativePath)),
    `${relativePath} must exist`,
  );
}

console.log(
  "H1 complete 39-page O1 replacement, section preservation, and isolated-asset contract passed.",
);
