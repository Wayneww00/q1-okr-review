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
  ["okr-high-value-actions", "okr-p34-source.png"],
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
  /function OkrFixedBackdrop\(\)[\s\S]*?className="h1-okr-fixed-stage-background"[\s\S]*?figma-untitled\/p68-trophy-background\.png/,
  "the deck must render the directly exported Figma Frame 68 trophy background inside the shared stage",
);
assert.match(
  app,
  /className="h1-okr-fixed-stage-ambient"[\s\S]*?figma-untitled\/p68-trophy-background\.png[\s\S]*?width="2280"[\s\S]*?height="1346"/,
  "the shared trophy stage must include a 2280 × 1346 ambient overscan layer",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-ambient\s*\{[\s\S]*?top:\s*-133px;[\s\S]*?left:\s*-180px;[\s\S]*?width:\s*2280px;[\s\S]*?height:\s*1346px;[\s\S]*?filter:\s*blur\(22px\)\s+saturate\(\.92\)\s+brightness\(\.84\);/,
  "the ambient overscan must extend the background without moving the 1920 × 1080 trophy composition",
);
assert.match(
  app,
  /h1-okr-fixed-stage-edge h1-okr-fixed-stage-edge--left[\s\S]*?p68-trophy-edge-left\.png[\s\S]*?width="244"[\s\S]*?height="1080"[\s\S]*?h1-okr-fixed-stage-edge h1-okr-fixed-stage-edge--right[\s\S]*?p68-trophy-edge-right\.png/,
  "the shared trophy stage must extend its exact boundary pixels into the side gutters",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-edge\s*\{[\s\S]*?z-index:\s*1;[\s\S]*?width:\s*244px;[\s\S]*?object-fit:\s*fill;[\s\S]*?\.h1-okr-fixed-stage-edge--left\s*\{[\s\S]*?left:\s*-180px;[\s\S]*?\.h1-okr-fixed-stage-edge--right\s*\{[\s\S]*?right:\s*-180px;/,
  "the edge-pixel fills must extend beneath the original Figma canvas for a feathered transition",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-background\s*\{[\s\S]*?-webkit-mask-image:\s*linear-gradient\([\s\S]*?transparent 0,[\s\S]*?#000 48px,[\s\S]*?#000 calc\(100% - 48px\),[\s\S]*?transparent 100%[\s\S]*?mask-image:\s*linear-gradient\(/,
  "the original Figma canvas must feather into the edge fills instead of exposing a vertical boundary",
);
assert.match(
  app,
  /className="h1-okr-fixed-stage-matte"/,
  "the shared stage must own the only global foreground-contrast matte",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-matte\s*\{[\s\S]*?top:\s*-133px;[\s\S]*?left:\s*-180px;[\s\S]*?width:\s*2280px;[\s\S]*?height:\s*1346px;[\s\S]*?background:\s*rgba\(0,\s*0,\s*0,\s*\.12\);/,
  "the global 12% matte must cover the complete overscan canvas",
);
assert.match(
  app,
  /function OkrEliteClientForegroundPage[\s\S]*?h1-okr-elite-client-page[\s\S]*?h1-okr-canvas h1-okr-elite-client-canvas[\s\S]*?h1-okr-elite-client-background[\s\S]*?elite-client-background-38-39-2\.png[\s\S]*?width="1920"[\s\S]*?height="1080"/,
  "all Elite Client pages must share the exact 38+39-2 Figma background",
);
assert.match(
  theme,
  /\.h1-okr-page\.h1-okr-elite-client-page\s*\{[\s\S]*?isolation:\s*isolate;[\s\S]*?background:\s*#000\s*!important;[\s\S]*?\.h1-okr-page\.h1-okr-elite-client-page::before\s*\{[\s\S]*?inset:\s*0;[\s\S]*?background:\s*#000;[\s\S]*?\.h1-okr-elite-client-canvas\s*\{[\s\S]*?overflow:\s*hidden;[\s\S]*?\.h1-okr-elite-client-background\s*\{[\s\S]*?top:\s*0;[\s\S]*?left:\s*0;[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;/,
  "the Elite Client chapter must keep black widescreen letterboxing while aligning the exact 1920 × 1080 Figma background with every authored foreground",
);
assert.ok(
  fs.existsSync(
    path.join(
      root,
      "previews",
      "assets",
      "figma-untitled",
      "elite-client-background-38-39-2.png",
    ),
  ),
  "the exact 38+39-2 Elite Client background asset must exist locally",
);
assert.ok(
  app.includes("previews/assets/figma-untitled/p38-39-1-elite-client-foreground.png"),
  "the 顶级客户身份体系 page must use the exact transparent 38+39-1 foreground",
);
const eliteClientIdentityForeground = path.join(
  root,
  "previews",
  "assets",
  "figma-untitled",
  "p38-39-1-elite-client-foreground.png",
);
assert.ok(
  fs.existsSync(eliteClientIdentityForeground) &&
    fs.statSync(eliteClientIdentityForeground).size > 100_000,
  "the exact 38+39-1 foreground export must exist at presentation resolution",
);
assert.equal(
  fs.readFileSync(eliteClientIdentityForeground)[25],
  6,
  "the 38+39-1 foreground PNG must retain alpha transparency",
);
assert.ok(
  app.includes("previews/assets/figma-untitled/p69-client-experience-foreground.png"),
  "the 大客户体验体系 page must use the completed Figma Frame 69 foreground",
);
const clientExperienceFrame69 = path.join(
  root,
  "previews",
  "assets",
  "figma-untitled",
  "p69-client-experience-foreground.png",
);
assert.ok(
  fs.existsSync(clientExperienceFrame69) && fs.statSync(clientExperienceFrame69).size > 500_000,
  "the transparent Frame 69 foreground export must exist at presentation resolution",
);
const frame69Png = fs.readFileSync(clientExperienceFrame69);
assert.equal(
  frame69Png[25],
  6,
  "the Frame 69 PNG must retain an alpha channel so the Elite Client background remains visible",
);
assert.ok(
  !app.includes("previews/assets/figma-untitled/p66-client-experience-foreground.svg"),
  "the incomplete Frame 66 foreground must no longer be assigned to 大客户体验体系",
);
const eliteClientInsertions = [
  ["okr-elite-client-no1-experience", "p70-elite-client-foreground.png"],
  ["okr-elite-endorsement-resources", "p45-elite-endorsement-resources-figma-150-1072.png"],
  ["okr-elite-ferrari-experience", "p46-elite-ferrari-foreground.png"],
  ["okr-elite-black-label", "p71-black-label-foreground.png"],
  ["okr-elite-business-enablement", "p48-elite-business-enablement-foreground.png"],
];
const eliteClientRegistration = app.slice(
  app.indexOf("id:'okr-client-experience-cases'"),
  app.indexOf("id:'okr-merchandise'"),
);
let previousEliteInsertion = -1;
for (const [pageId, fileName] of eliteClientInsertions) {
  const pagePosition = eliteClientRegistration.indexOf(`id:'${pageId}'`);
  assert.ok(
    pagePosition > previousEliteInsertion,
    `${pageId} must be inserted after 顶尖大客户体验案例 in Figma order`,
  );
  previousEliteInsertion = pagePosition;
  assert.ok(
    app.includes(`previews/assets/figma-untitled/${fileName}`),
    `${pageId} must use its transparent Figma foreground`,
  );
  const foreground = path.join(root, "previews", "assets", "figma-untitled", fileName);
  assert.ok(
    fs.existsSync(foreground) && fs.statSync(foreground).size > 100_000,
    `${fileName} must exist at presentation resolution`,
  );
  assert.equal(
    fs.readFileSync(foreground)[25],
    6,
    `${fileName} must preserve alpha transparency over the Elite Client background`,
  );
}
const okrRenderer = app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══"));
for (const [pageId] of eliteClientInsertions.filter(([pageId])=>pageId!=='okr-elite-endorsement-resources')) {
  assert.ok(
    okrRenderer.includes(`page.id==='${pageId}' ? <OkrEliteClientForegroundPage`),
    `${pageId} must reuse the Elite Client full-bleed background component`,
  );
}
assert.match(
  app,
  /id:'okr-elite-endorsement-resources'[\s\S]*?p45-elite-endorsement-resources-figma-150-1072\.png[\s\S]*?figmaNodeId:'150:1072'/,
  "顶级背书资源 must use the current foreground-only Figma node 150:1072",
);
assert.match(
  app,
  /function OkrEliteEndorsementResourcesPage[\s\S]*?elite-client-background-38-39-2\.png[\s\S]*?h1-okr-elite-endorsement-foreground[\s\S]*?width="1716"[\s\S]*?height="904"[\s\S]*?left:'102px',top:'72px',width:'1716px',height:'904px'/,
  "顶级背书资源 must preserve the authored 1716 × 904 foreground placement over the shared Elite Client background",
);
assert.ok(
  okrRenderer.includes("page.id==='okr-elite-endorsement-resources' ? <OkrEliteEndorsementResourcesPage"),
  "顶级背书资源 must use its exact current-Figma renderer without a stale editable mask",
);
assert.match(
  app,
  /function OkrBrandSystemPage\(\)[\s\S]*?className="h1-okr-figma-foreground-layer"[\s\S]*?figma-untitled\/p25-foreground-clean\.png/,
  "the first page must use the matte-free Untitled foreground layer rather than reconstructed cards",
);
assert.match(
  app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══")),
  /page\.id==='okr-brand-results'[\s\S]*?figma-untitled\/p26-foreground-clean\.png[\s\S]*?page\.id==='okr-brand-refresh'[\s\S]*?OkrBrandRefreshForegroundPage[\s\S]*?page\.id==='okr-brand-operating-system'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-tvc-matrix'[\s\S]*?OkrBrandContentMatrixForegroundPage[\s\S]*?page\.id==='okr-tvc-framework'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-tvc-library'[\s\S]*?figma-untitled\/p28-2-foreground-clean\.png[\s\S]*?page\.id==='okr-application-roadmap'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-high-value-actions'[\s\S]*?figma-untitled\/p31-foreground-clean\.png[\s\S]*?page\.id==='okr-awards'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-offline-event-01'[\s\S]*?figma-untitled\/p33-34-foreground-clean\.png[\s\S]*?page\.id==='okr-offline-event-02'[\s\S]*?figma-untitled\/p36-1-foreground-clean\.png[\s\S]*?page\.id==='okr-merchandise'[\s\S]*?figma-untitled\/p52-foreground-clean\.png[\s\S]*?page\.id==='okr-cfd-public-good'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-public-good-video'[\s\S]*?OkrPublicGoodVideoPage[\s\S]*?page\.id==='okr-un-ngo-engagement'[\s\S]*?src=\{page\.src\}[\s\S]*?page\.id==='okr-ai-recommendation'[\s\S]*?figma-untitled\/p58-foreground\.png[\s\S]*?page\.id==='okr-omnichannel-amplification'[\s\S]*?src=\{page\.src\}[\s\S]*?left:195,top:75,width:1575,height:987[\s\S]*?page\.id==='okr-tvc-localization'[\s\S]*?OkrTvcLocalizationPage[\s\S]*?page\.id==='okr-superapp-activation'[\s\S]*?figma-untitled\/p61-foreground\.png[\s\S]*?page\.id==='okr-premium-unlimited'[\s\S]*?figma-untitled\/p62-foreground\.png[\s\S]*?page\.id==='okr-brand-experience-audit'[\s\S]*?figma-untitled\/p63-foreground\.png/,
  "the remaining Figma foreground exports must be assigned to their matching report pages",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "p52-foreground-clean.png")),
  "the matte-free merchandise Figma foreground export must exist locally",
);
for (const fileName of ["p64-cfp-foreground.svg", "p54-1-cfp-panel-foreground.svg", "p65-ngo-foreground.svg"]) {
  const asset = path.join(root, "previews", "assets", "figma-untitled", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must exist locally`);
  assert.doesNotMatch(
    fs.readFileSync(asset, "utf8"),
    /<rect width="1920" height="1080" fill="#F5F5F5"\/>|<rect width="1920" height="1080" fill="black" fill-opacity="0\.2"\/>/,
    `${fileName} must remain transparent outside its Figma foreground content so the fixed trophy background is visible`,
  );
}
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "p54-1-cfp-video-preview.png")),
  "the p54-1 Figma video-preview layer must exist locally",
);
assert.match(
  app,
  /function OkrPublicGoodVideoPage[\s\S]*?src:page\.src,left:277,top:75,width:1366,height:931[\s\S]*?src:page\.videoSrc,left:338,top:254,width:1245,height:698/,
  "p54-1 must preserve its separately exported Figma panel and video-preview layers",
);
for (const fileName of ["p58-foreground.png", "omnichannel-amplification-figma-145-716.png", "p60-foreground.png", "p61-foreground.png", "p62-foreground.png", "p63-foreground.png"]) {
  assert.ok(
    fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", fileName)),
    `${fileName} must exist locally`,
  );
}
const brandRefreshLayers = [
  ["141:125", "brand-refresh-title-figma-141-125.png", 643, 67, 635, 106],
  ["141:115", "brand-refresh-summary-figma-141-115.png", 160, 190, 1600, 120],
  ["141:128", "brand-refresh-left-panel-figma-141-128.png", 141, 330, 1600, 687],
  ["141:171", "brand-refresh-core-figma-141-171.png", 682, 375, 707, 631],
  ["141:215", "brand-refresh-subtitle-figma-141-215.png", 833, 256, 251, 18],
  ["141:217", "brand-refresh-connectors-figma-141-217.png", 1157, 540, 197, 366],
  ["141:221", "brand-refresh-channels-figma-141-221.png", 1321, 375, 411, 631],
];
const brandRefreshRenderer = app.slice(
  app.indexOf("function OkrBrandRefreshForegroundPage"),
  app.indexOf("function OkrBrandContentMatrixForegroundPage"),
);
for (const [nodeId, fileName, left, top, width, height] of brandRefreshLayers) {
  assert.ok(
    brandRefreshRenderer.includes(
      `{nodeId:'${nodeId}',src:'previews/assets/figma-untitled/${fileName}',left:${left},top:${top},width:${width},height:${height}}`,
    ),
    `${nodeId} must retain its Figma position in the Brand Refresh composition`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", fileName)),
    `${fileName} must exist locally`,
  );
}
assert.match(
  brandRefreshRenderer,
  /className="h1-okr-figma-foreground-layer is-positioned h1-okr-brand-refresh-foreground"[\s\S]*?data-figma-node-id=\{foreground\.nodeId\}/,
  "Brand Refresh must render the current Figma foreground nodes over the shared trophy",
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
for (const fileName of ["summary.svg", "content-grid.svg", "microcopy.svg"]) {
  const asset = path.join(root, "previews", "assets", "figma-untitled", "brand-content-matrix", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must exist locally`);
  assert.doesNotMatch(
    fs.readFileSync(asset, "utf8"),
    /fill="#F5F5F5"/,
    `${fileName} must preserve a transparent background over the fixed trophy`,
  );
}
const tvcFrameworkForeground = path.join(root, "previews", "assets", "figma-untitled", "tvc-framework-foreground.svg");
assert.ok(fs.existsSync(tvcFrameworkForeground), "the inserted TVC framework foreground must exist locally");
assert.doesNotMatch(
  fs.readFileSync(tvcFrameworkForeground, "utf8"),
  /<rect width="1920" height="1080" fill="#F5F5F5"\/>|<rect width="1920" height="1080" fill="black" fill-opacity="0\.2"\/>/,
  "the inserted TVC framework foreground must not cover the shared trophy background",
);
const applicationRoadmapForeground = path.join(root, "previews", "assets", "figma-untitled", "application-roadmap-foreground.svg");
assert.ok(fs.existsSync(applicationRoadmapForeground), "the application-roadmap Figma foreground must exist locally");
assert.doesNotMatch(
  fs.readFileSync(applicationRoadmapForeground, "utf8"),
  /<rect width="1920" height="1080" fill="#F5F5F5"\/>|<g id="background">/,
  "the application-roadmap foreground must not replace the fixed trophy background",
);
const awardsForeground = path.join(root, "previews", "assets", "figma-untitled", "awards-group-1940698522.svg");
assert.ok(fs.existsSync(awardsForeground), "the awards Figma foreground must exist locally");
assert.doesNotMatch(
  fs.readFileSync(awardsForeground, "utf8"),
  /<rect width="1600" height="1012" fill="#F5F5F5"\/>|<rect width="1920" height="1080" fill="#F5F5F5"\/>|<rect width="1920" height="1080" fill="black" fill-opacity="0\.2"\/>|<g id="&#232;&#131;&#140;&#230;&#153;&#175;">/,
  "the Awards foreground must exclude Figma's artboard fill so the shared trophy background remains visible",
);
const awardsForegroundMarkup = fs.readFileSync(awardsForeground, "utf8");
assert.match(
  awardsForegroundMarkup,
  /<g id="Group 50_2" transform="translate\(0 27\.944\)">/,
  "the H2 S badge must align vertically with the H1 S badge",
);
assert.ok(
  awardsForegroundMarkup.indexOf('id="Rectangle 37"') < awardsForegroundMarkup.indexOf('id="Rectangle 34"'),
  "the H1 glass body must cover the lower header edge exactly as composed in Figma",
);
assert.ok(
  awardsForegroundMarkup.indexOf('id="Rectangle 39"') < awardsForegroundMarkup.indexOf('id="Rectangle 38"'),
  "the H2 glass body must cover the lower header edge exactly as composed in Figma",
);
assert.match(
  app,
  /function OkrBrandContentMatrixForegroundPage[\s\S]*?summary\.svg[\s\S]*?left:'160px',top:'184px',width:'1600px',height:'96px'[\s\S]*?content-grid\.svg[\s\S]*?left:'190px',top:'364px',width:'1600px',height:'716px'[\s\S]*?microcopy\.svg[\s\S]*?left:'435px',top:'215\.096px',width:'1209px',height:'36px'/,
  "Brand content matrix must preserve the Figma foreground composition over the shared trophy",
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
    'src="../index.html?report=h1&embedded=1&v=20260731-endorsement-frame45-v1"',
  ),
  "the formal shell must load the exact Figma revision without stale cache",
);

console.log("H1 authenticated Figma OKR replacement contract passed.");
