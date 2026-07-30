import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);

const expectedPages = [
  ["okr-review", "p25-source.png"],
  ["okr-brand-results", "p27-source.png"],
  ["okr-tvc-matrix", "okr-p32-matrix-source.jpg"],
  ["okr-tvc-library", "okr-p32-tvc-source.jpg"],
  ["okr-high-value-actions", "okr-p34-source.png"],
  ["okr-offline-event-01", "salon.jpg"],
  ["okr-offline-event-02", "expo.jpg"],
];

const registryStart = app.indexOf("const OKR_FIGMA_PAGES=");
const registryEnd = app.indexOf("function OkrExactFigmaPage", registryStart);
const registry = app.slice(registryStart, registryEnd);
let cursor = -1;

for (const [pageId, fileName] of expectedPages) {
  const next = registry.indexOf(`id:'${pageId}'`);
  assert.ok(next > cursor, `${pageId} must appear in the requested Figma order`);
  cursor = next;
  assert.ok(
    registry.includes(`previews/assets/figma-exact/${fileName}`),
    `${pageId} must render its exact Figma export`,
  );

  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "figma-exact",
    fileName,
  );
  assert.ok(fs.existsSync(assetPath), `${fileName} must exist`);
  assert.ok(
    fs.statSync(assetPath).size > 100_000,
    `${fileName} must be a full-resolution export`,
  );
}

for (const fileName of ["salon-modal-source.png", "expo-modal-source.png"]) {
  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "figma-exact",
    fileName,
  );
  assert.ok(fs.existsSync(assetPath), `${fileName} must exist`);
  assert.ok(
    fs.statSync(assetPath).size > 100_000,
    `${fileName} must be a full-resolution modal export`,
  );
}
assert.ok(
  registry.includes("previews/assets/figma-untitled/brand-operating-system-foreground.svg"),
  "Brand operating system must use the requested transparent Figma foreground",
);
assert.match(
  registry,
  /id:'okr-application-roadmap'[\s\S]*?src:'previews\/assets\/figma-untitled\/application-roadmap-foreground\.svg'/,
  "application roadmap must use the requested transparent Figma foreground",
);
assert.match(
  registry,
  /id:'okr-awards'[\s\S]*?src:'previews\/assets\/figma-untitled\/awards-group-1940698522\.svg'/,
  "awards must use the requested transparent Figma foreground",
);

assert.match(
  app,
  /className="h1-okr-exact-frame"[\s\S]*?src=\{page\.src\}/,
  "each OKR page must render the exact Figma frame",
);
assert.match(
  app,
  /className=\{`h1-okr-exact-hotspot \$\{page\.hotspotClass\}`\}[\s\S]*?onClick=\{\(\)=>onPreview\(page\)\}/,
  "event image rows must open their exact Figma modal state",
);
assert.match(
  app,
  /role="dialog"[\s\S]*?aria-modal="true"[\s\S]*?className="h1-okr-exact-modal-frame"/,
  "the enlarged image must use an accessible exact-image modal",
);
assert.match(
  app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══")),
  /OkrBrandSystemPage/,
  "the first page must use its independently rebuilt Untitled foreground",
);
assert.match(
  theme,
  /\.h1-okr-exact-frame\s*\{[\s\S]*?object-fit:\s*contain;/,
  "exact Figma pages must remain uncropped and undistorted",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-canvas\s*\{[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;/,
  "awards and offline-event pages must share the fixed trophy canvas without covering the data deck",
);
assert.match(
  theme,
  /\.h1-okr-exact-modal\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/,
  "the exact Figma modal must fill the current report viewport",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260730-elite-door-v27"',
  ),
  "the formal shell must invalidate the embedded report after the exact Figma update",
);

console.log("Exact Figma OKR, awards, and offline-event contract passed.");
