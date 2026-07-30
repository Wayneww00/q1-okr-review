import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
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
assert.ok(registryStart >= 0 && registryEnd > registryStart);
const registry = app.slice(registryStart, registryEnd);

const reviewPosition = registry.indexOf("id:'okr-review'");
const auditPosition = registry.indexOf("id:'okr-brand-experience-audit'");
const brandResultsPosition = registry.indexOf("id:'okr-brand-results'");
assert.ok(
  reviewPosition >= 0 && auditPosition > reviewPosition && brandResultsPosition > auditPosition,
  "the brand-experience audit must immediately follow the first global-brand page",
);

let cursor = -1;
for (const [pageId, fileName] of expectedPages) {
  const next = registry.indexOf(`id:'${pageId}'`);
  assert.ok(next > cursor, `${pageId} must follow the exact requested order`);
  cursor = next;
  assert.ok(
    registry.includes(`previews/assets/figma-exact/${fileName}`),
    `${pageId} must use the exact Figma export ${fileName}`,
  );
  const asset = path.join(
    root,
    "previews",
    "assets",
    "figma-exact",
    fileName,
  );
  assert.ok(fs.existsSync(asset), `${fileName} must exist locally`);
  assert.ok(
    fs.statSync(asset).size > 100_000,
    `${fileName} must remain a full-resolution Figma export`,
  );
}

assert.equal(
  [...registry.matchAll(/\bid:'okr-/g)].length,
  30,
  "the OKR section must contain the approved thirty pages after the Black Label insertion",
);
assert.ok(
  registry.includes("previews/assets/figma-untitled/brand-operating-system-foreground.svg"),
  "Brand operating system must use the requested transparent Figma foreground",
);
assert.match(
  registry,
  /id:'okr-application-roadmap'[\s\S]*?src:'previews\/assets\/figma-untitled\/application-roadmap-foreground\.svg'/,
  "application roadmap must use the requested transparent Figma foreground",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "application-roadmap-foreground.svg")),
  "the application-roadmap foreground must exist locally",
);
assert.match(
  registry,
  /id:'okr-awards'[\s\S]*?src:'previews\/assets\/figma-untitled\/awards-group-1940698522\.svg'/,
  "awards must use the requested transparent Figma foreground",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "awards-group-1940698522.svg")),
  "the awards foreground must exist locally",
);
assert.match(
  app,
  /page\.id==='okr-merchandise'[\s\S]*?figma-untitled\/p52-foreground-clean\.png/,
  "the appended merchandise page must use its matte-free Untitled foreground",
);
assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", "p52-foreground-clean.png")),
  "the appended matte-free merchandise foreground must exist locally",
);
for (const [pageId, fileName] of [
  ["okr-cfd-public-good", "p64-cfp-foreground.svg"],
  ["okr-un-ngo-engagement", "p65-ngo-foreground.svg"],
]) {
  assert.match(
    app,
    new RegExp(`page\\.id==='${pageId}'[\\s\\S]*?src=\\{page\\.src\\}`),
    `${pageId} must use the direct Figma foreground renderer`,
  );
  const asset = path.join(root, "previews", "assets", "figma-untitled", fileName);
  assert.ok(fs.existsSync(asset), `${fileName} must exist locally`);
  assert.doesNotMatch(
    fs.readFileSync(asset, "utf8"),
    /<rect width="1920" height="1080" fill="#F5F5F5"\/>|<rect width="1920" height="1080" fill="black" fill-opacity="0\.2"\/>/,
    `${fileName} must leave the fixed trophy background visible`,
  );
}
const p54Panel = path.join(root, "previews", "assets", "figma-untitled", "p54-1-cfp-panel-foreground.svg");
const p54Video = path.join(root, "previews", "assets", "figma-untitled", "p54-1-cfp-video-preview.png");
assert.ok(fs.existsSync(p54Panel) && fs.existsSync(p54Video), "p54-1 must keep both of its Figma foreground layers");
assert.doesNotMatch(
  fs.readFileSync(p54Panel, "utf8"),
  /<rect width="1366" height="931" fill="#F5F5F5"\/>|<rect width="1920" height="1080" transform="translate\(-277 -75\)" fill="black" fill-opacity="0\.2"\/>/,
  "p54-1's panel layer must not cover the shared trophy background",
);
assert.match(
  app,
  /page\.id==='okr-public-good-video'[\s\S]*?OkrPublicGoodVideoPage/,
  "p54-1 must use its dedicated two-layer Figma renderer",
);
assert.match(
  app,
  /function OkrPublicGoodVideoPage[\s\S]*?src:page\.src,left:277,top:75,width:1366,height:931[\s\S]*?src:page\.videoSrc,left:338,top:254,width:1245,height:698/,
  "the p54-1 Figma video preview must remain at its source coordinates over the panel",
);
assert.ok(
  registry.indexOf("id:'okr-merchandise'") < registry.indexOf("id:'okr-cfd-public-good'") &&
    registry.indexOf("id:'okr-cfd-public-good'") < registry.indexOf("id:'okr-public-good-video'") &&
    registry.indexOf("id:'okr-public-good-video'") < registry.indexOf("id:'okr-un-ngo-engagement'") &&
    registry.indexOf("id:'okr-un-ngo-engagement'") < registry.indexOf("id:'okr-ai-recommendation'"),
  "the three requested Figma pages must be inserted immediately after merchandise",
);
for (const [pageId, fileName] of [
  ["okr-ai-recommendation", "p58-foreground.png"],
  ["okr-omnichannel-amplification", "p59-foreground-v2.png"],
  ["okr-tvc-localization", "p60-foreground.png"],
  ["okr-superapp-activation", "p61-foreground.png"],
  ["okr-premium-unlimited", "p62-foreground.png"],
  ["okr-brand-experience-audit", "p63-foreground.png"],
]) {
  assert.match(
    app,
    new RegExp(`page\\.id==='${pageId}'[\\s\\S]*?figma-untitled\\/${fileName.replace('.', '\\.')}`),
    `${pageId} must use its Figma foreground`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "previews", "assets", "figma-untitled", fileName)),
    `${fileName} must exist locally`,
  );
}
assert.match(
  app,
  /page\.id==='okr-brand-refresh'[\s\S]*?OkrBrandRefreshForegroundPage/,
  "the Brand Refresh page must retain its dedicated Figma foreground renderer",
);
assert.match(
  registry,
  /id:'okr-brand-refresh'[\s\S]*?src:'previews\/assets\/figma-untitled\/brand-refresh-foreground\.png'/,
  "the Brand Refresh page must use the exported Figma foreground rather than a full background screenshot",
);
assert.match(
  app,
  /function OkrBrandRefreshForegroundPage\([\s\S]*?className="h1-okr-figma-foreground-layer is-positioned h1-okr-brand-refresh-foreground"[\s\S]*?src=\{page\.src\}[\s\S]*?left:'160px',top:'67px',width:'1619px',height:'950px'/,
  "the Brand Refresh foreground must preserve its Figma position over the shared trophy stage",
);
assert.doesNotMatch(
  app,
  /function OkrBrandRefreshForegroundPage\([\s\S]*?h1-brand-refresh-title/,
  "the Brand Refresh page must not fall back to a hand-redrawn content layer",
);
assert.match(
  app,
  /<OkrExactFigmaPage[\s\S]*?index=\{index\+1\}[\s\S]*?count=\{OKR_FIGMA_PAGES\.length\}/,
  "each OKR page must receive its one-based page-number context",
);
assert.match(
  app,
  /className="h1-okr-page-number"[\s\S]*?String\(index\+1\)\.padStart\(2,"0"\)[\s\S]*?String\(count\)\.padStart\(2,"0"\)/,
  "OKR page numbers must run from 01/22 and match the data-page style",
);
assert.match(
  registry,
  /id:'okr-tvc-matrix'[\s\S]*?id:'okr-tvc-framework'[\s\S]*?src:'previews\/assets\/figma-untitled\/tvc-framework-foreground\.svg'[\s\S]*?id:'okr-tvc-library'/,
  "the requested TVC framework page must be inserted immediately after the content matrix",
);
assert.ok(
  app.includes(
    'style={{\'--h1-okr-page-image\':`url("/${page.src}")`}}',
  ),
  "every OKR page must retain its own exact Figma foreground frame",
);
assert.match(
  app,
  /<OkrFixedBackdrop\/>/,
  "the OKR deck must use one stable visual background",
);
assert.match(
  theme,
  /\.h1-okr-fixed-stage-canvas\s*\{[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;/,
  "the fixed trophy stage must remain on one original Figma canvas across the OKR deck",
);
assert.match(
  theme,
  /\.h1-okr-exact-frame\s*\{[\s\S]*?object-fit:\s*contain;/,
  "the foreground Figma frame must stay complete and undistorted",
);
assert.match(
  theme,
  /\.h1-okr-exact-artboard\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?left:\s*30%;[\s\S]*?width:\s*min\(54vw,\s*calc\(72vh \* 16 \/ 9\)\);[\s\S]*?transform:\s*translate\(-50%,\s*-50%\);/,
  "the OKR artboard must be a page-owned, data-deck-style content surface",
);
assert.match(
  registry,
  /id:'okr-tvc-matrix'[\s\S]*?videoSlots:\[/,
  "the TVC matrix page must retain future video playback slots",
);
assert.match(
  registry,
  /id:'okr-tvc-library'[\s\S]*?videoSlots:\[/,
  "the TVC library page must retain future video playback slots",
);
assert.match(
  app,
  /page\.videoSlots\?\.map\([\s\S]*?h1-okr-video-hotspot[\s\S]*?onClick=\{\(\)=>onVideoPreview/,
  "video thumbnails must expose reusable playback controls",
);

console.log("OKR p29–p34 exact-order, paging, and independent-background contract passed.");
