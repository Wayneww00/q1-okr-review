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
  ["okr-brand-refresh", "okr-p29-source.png"],
  ["okr-brand-operating-system", "okr-p30-source.png"],
  ["okr-tvc-matrix", "okr-p32-matrix-source.jpg"],
  ["okr-tvc-library", "okr-p32-tvc-source.jpg"],
  ["okr-application-roadmap", "okr-p33-source.png"],
  ["okr-high-value-actions", "okr-p34-source.png"],
  ["okr-awards", "awards-source.png"],
  ["okr-offline-event-01", "salon-source.png"],
  ["okr-offline-event-02", "expo-source.png"],
];

const registryStart = app.indexOf("const OKR_FIGMA_PAGES=");
const registryEnd = app.indexOf("function OkrExactFigmaPage", registryStart);
assert.ok(registryStart >= 0 && registryEnd > registryStart);
const registry = app.slice(registryStart, registryEnd);

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
  11,
  "the OKR section must contain exactly 11 pages",
);
assert.match(
  app,
  /<OkrExactFigmaPage[\s\S]*?index=\{index\}[\s\S]*?count=\{OKR_FIGMA_PAGES\.length\}/,
  "each OKR page must receive its one-based page-number context",
);
assert.match(
  app,
  /className="h1-okr-page-number"[\s\S]*?String\(index\+1\)\.padStart\(2,"0"\)[\s\S]*?String\(count\)\.padStart\(2,"0"\)/,
  "OKR page numbers must run from 01/11 and match the data-page style",
);
assert.ok(
  app.includes(
    'style={{\'--h1-okr-page-image\':`url("/${page.src}")`}}',
  ),
  "every OKR page must bind its own exact Figma frame as its independent background",
);
assert.doesNotMatch(
  app,
  /className="h1-okr-fixed-stage"/,
  "the former shared background stage must not survive",
);
assert.match(
  theme,
  /main\.h1-okr-report > \.h1-okr-exact-page::before\s*\{[\s\S]*?var\(--h1-okr-page-image\);[\s\S]*?background-size:\s*cover;/,
  "each OKR page must fill its own viewport edges without black gutters",
);
assert.match(
  theme,
  /\.h1-okr-exact-frame\s*\{[\s\S]*?object-fit:\s*contain;/,
  "the foreground Figma frame must stay complete and undistorted",
);
assert.match(
  theme,
  /\.h1-okr-exact-artboard\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?width:\s*min\(100%,\s*calc\(100vh \* 16 \/ 9\)\);/,
  "the OKR artboard must belong to its own page rather than a fixed shared layer",
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
