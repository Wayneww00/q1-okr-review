import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

assert.doesNotMatch(
  app,
  /function NestedOKRSection\(|\bselectedModule\b|<NestedOKRSection\b|statusLegend:\s*\[|summaryMetrics:\s*\[|headlineMetrics:\s*\[/,
  "the obsolete long-form OKR UI must stay removed",
);
assert.doesNotMatch(
  shell,
  /data-label="(?:OKR Review|Objective 02|KR 01 Review)"/,
  "obsolete OKR scenes must not survive as hidden duplicate content",
);
assert.match(
  app,
  /const OKR_FIGMA_PAGES=\[[\s\S]*?function OkrExactFigmaPage/,
  "the approved Figma pages must be registered as an exact-image deck",
);

const exactPages = [
  ["okr-review", "p25-source.png"],
  ["okr-brand-results", "p27-source.png"],
  ["okr-tvc-matrix", "okr-p32-matrix-source.jpg"],
  ["okr-tvc-library", "okr-p32-tvc-source.jpg"],
  ["okr-application-roadmap", "okr-p33-source.png"],
  ["okr-high-value-actions", "okr-p34-source.png"],
  ["okr-awards", "awards-source.png"],
  ["okr-offline-event-01", "salon.jpg"],
  ["okr-offline-event-02", "expo.jpg"],
];
for (const [pageId, fileName] of exactPages) {
  assert.ok(app.includes(`id:'${pageId}'`), `${pageId} must be registered`);
  assert.ok(
    app.includes(`previews/assets/figma-exact/${fileName}`),
    `${pageId} must use the authenticated Figma export`,
  );
  assert.ok(
    fs.existsSync(
      path.join(root, "previews", "assets", "figma-exact", fileName),
    ),
    `${fileName} must exist`,
  );
}

assert.match(
  app,
  /className="h1-okr-exact-frame"[\s\S]*?draggable="false"/,
  "the exact Figma artwork must render as an undraggable frame",
);
assert.match(
  theme,
  /\.h1-okr-exact-artboard\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?left:\s*30%;[\s\S]*?width:\s*min\(54vw,\s*calc\(72vh \* 16 \/ 9\)\);[\s\S]*?aspect-ratio:\s*16\s*\/\s*9;[\s\S]*?border-radius:\s*18\.02817px;/,
  "each Figma page must own a proportional artboard styled as a racing data-deck surface",
);
assert.ok(
  app.includes(
    'style={{\'--h1-okr-page-image\':`url("/${page.src}")`}}',
  ),
  "each OKR page must retain its own Figma foreground image",
);
assert.match(
  theme,
  /\.h1-okr-exact-frame\s*\{[\s\S]*?width:\s*100%;[\s\S]*?height:\s*100%;[\s\S]*?object-fit:\s*contain;[\s\S]*?object-position:\s*50%\s+50%;/,
  "the exact Figma frame must remain complete and undistorted over the shared trophy edge fill",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-canvas\s*\{[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;[\s\S]*?transform:\s*translate\(-50%,\s*-50%\)\s*scale\(var\(--h1-okr-scale\)\);/,
  "the shared trophy must use the original 1920 × 1080 Figma canvas geometry",
);
assert.match(
  app,
  /function OkrFixedBackdrop\(\)[\s\S]*?className="h1-okr-fixed-stage-background"[\s\S]*?figma-untitled\/p25-background\.png/,
  "the deck must render the directly exported Untitled trophy background inside the shared stage",
);
assert.match(
  app,
  /function OkrBrandSystemPage\(\)[\s\S]*?className="h1-okr-figma-foreground-layer"[\s\S]*?figma-untitled\/p25-foreground\.png/,
  "the first page must use the directly exported Untitled foreground layer rather than reconstructed cards",
);
assert.match(
  app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══")),
  /page\.id==='okr-brand-results'[\s\S]*?figma-untitled\/p26-foreground\.png[\s\S]*?page\.id==='okr-brand-refresh'[\s\S]*?OkrBrandRefreshForegroundPage[\s\S]*?page\.id==='okr-brand-operating-system'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-tvc-matrix'[\s\S]*?figma-untitled\/p28-foreground\.png[\s\S]*?page\.id==='okr-tvc-library'[\s\S]*?figma-untitled\/p28-2-foreground\.png[\s\S]*?page\.id==='okr-application-roadmap'[\s\S]*?figma-untitled\/p33-foreground\.png[\s\S]*?page\.id==='okr-high-value-actions'[\s\S]*?figma-untitled\/p31-foreground\.png[\s\S]*?page\.id==='okr-awards'[\s\S]*?figma-exact\/awards-source\.png[\s\S]*?page\.id==='okr-offline-event-01'[\s\S]*?figma-untitled\/p33-34-foreground\.png[\s\S]*?page\.id==='okr-offline-event-02'[\s\S]*?figma-untitled\/p36-1-foreground\.png[\s\S]*?page\.id==='okr-merchandise'[\s\S]*?figma-untitled\/p52-foreground\.png[\s\S]*?page\.id==='okr-ai-recommendation'[\s\S]*?figma-untitled\/p58-foreground\.png[\s\S]*?page\.id==='okr-omnichannel-amplification'[\s\S]*?figma-untitled\/p59-foreground\.png[\s\S]*?page\.id==='okr-tvc-localization'[\s\S]*?figma-untitled\/p60-foreground\.png[\s\S]*?page\.id==='okr-superapp-activation'[\s\S]*?figma-untitled\/p61-foreground\.png[\s\S]*?page\.id==='okr-premium-unlimited'[\s\S]*?figma-untitled\/p62-foreground\.png[\s\S]*?page\.id==='okr-brand-experience-audit'[\s\S]*?figma-untitled\/p63-foreground\.png/,
  "the remaining Figma foreground exports must be assigned to their matching report pages",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "p52-foreground.png")),
  "the merchandise Figma foreground export must exist locally",
);
for (const fileName of ["p58-foreground.png", "p59-foreground.png", "p60-foreground.png", "p61-foreground.png", "p62-foreground.png", "p63-foreground.png"]) {
  assert.ok(
    fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", fileName)),
    `${fileName} must exist locally`,
  );
}
assert.match(
  app,
  /function OkrBrandRefreshForegroundPage[\s\S]*?h1-okr-brand-refresh-foreground[\s\S]*?src=\{page\.src\}[\s\S]*?left:'160px',top:'67px',width:'1619px',height:'950px'/,
  "Brand Refresh must render its Figma foreground at the original composition position over the shared trophy",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "brand-refresh-foreground.png")),
  "the transparent Brand Refresh Figma foreground export must exist locally",
);
assert.ok(
  app.includes("previews/assets/figma-untitled/brand-operating-system-foreground.svg"),
  "Brand operating system must use the requested transparent Figma foreground",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "brand-operating-system-foreground.svg")),
  "the requested Brand operating system foreground must exist locally",
);
const brandOperatingSystemForeground = fs.readFileSync(
  path.join(root, "previews", "assets", "figma-untitled", "brand-operating-system-foreground.svg"),
  "utf8",
);
assert.doesNotMatch(
  brandOperatingSystemForeground,
  /<rect width="1920" height="1080" fill="#F5F5F5"\/>|<rect width="1920" height="1080" fill="black" fill-opacity="0\.2"\/>/,
  "the transparent Brand operating system foreground must not cover the shared trophy background",
);
assert.ok(
  fs.statSync(path.join(root, "previews", "assets", "figma-untitled", "brand-refresh-foreground.png")).size > 100_000,
  "the Brand Refresh foreground export must retain presentation resolution",
);
assert.match(
  app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══")),
  /OkrBrandSystemPage/,
  "the first page must use independent Untitled foreground components",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260730-figma-brand-operating-system-transparent-v9"',
  ),
  "the formal shell must load the exact Figma revision without stale cache",
);

console.log("H1 authenticated Figma OKR replacement contract passed.");
