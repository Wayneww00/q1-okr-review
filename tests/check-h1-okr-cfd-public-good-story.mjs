import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const assetPath = path.join(
  root,
  "previews",
  "assets",
  "figma-untitled",
  "p73-cfd-public-good-video-foreground.png",
);
const publicGoodVideoPath = path.join(
  root,
  "previews",
  "assets",
  "tvc-library",
  "cfd-public-good-web.mp4",
);
const ferrariVideoPath = path.join(
  root,
  "previews",
  "assets",
  "tvc-library",
  "ferrari-personal-moment-web.mp4",
);

const registry = app.slice(
  app.indexOf("const OKR_FIGMA_PAGES=["),
  app.indexOf("function OkrDirectFigmaForegroundPage"),
);
const merchandisePosition = registry.indexOf("id:'okr-merchandise'");
const storyPosition = registry.indexOf("id:'okr-cfd-public-good-story'");
const nextPagePosition = registry.indexOf("id:'okr-cfd-public-good'");

assert.ok(
  merchandisePosition >= 0 &&
    merchandisePosition < storyPosition &&
    storyPosition < nextPagePosition,
  "the Frame 73 story page must be inserted immediately after merchandise",
);
assert.ok(
  fs.existsSync(assetPath) && fs.statSync(assetPath).size > 1_000_000,
  "the exact Frame 73 foreground must exist at presentation resolution",
);

const png = fs.readFileSync(assetPath);
assert.equal(png.toString("ascii", 1, 4), "PNG");
assert.equal(png.readUInt32BE(16), 1920, "Frame 73 must retain its Figma width");
assert.equal(png.readUInt32BE(20), 1080, "Frame 73 must retain its Figma height");
assert.equal(
  png[25],
  6,
  "Frame 73 must retain alpha transparency over the shared trophy background",
);

assert.match(
  app,
  /id:'okr-cfd-public-good-story'[\s\S]*?p73-cfd-public-good-video-foreground\.png[\s\S]*?id:'cfd-public-good-story'[\s\S]*?tvc-library\/cfd-public-good-web\.mp4[\s\S]*?poster:'previews\/assets\/tvc-library\/posters\/cfd-public-good\.jpg'[\s\S]*?inline:true/,
  "the Frame 73 page must use its PPT public-good video as an inline player",
);
assert.match(
  app,
  /id:'okr-elite-ferrari-experience'[\s\S]*?p46-elite-ferrari-foreground\.png[\s\S]*?id:'ferrari-personal-moment'[\s\S]*?tvc-library\/ferrari-personal-moment-web\.mp4[\s\S]*?poster:'previews\/assets\/tvc-library\/posters\/ferrari-personal-moment\.jpg'[\s\S]*?inline:true/,
  "the Ferrari page must use its PPT Personal Moment video as an inline player",
);
assert.ok(
  fs.existsSync(publicGoodVideoPath) && fs.statSync(publicGoodVideoPath).size > 10_000_000,
  "the web-optimized public-good MP4 must be present",
);
assert.ok(
  fs.existsSync(ferrariVideoPath) && fs.statSync(ferrariVideoPath).size > 1_000_000,
  "the web-optimized Ferrari MP4 must be present",
);
assert.match(
  app,
  /function OkrInlineVideo\(\{slot\}\)[\s\S]*?h1-okr-inline-video-trigger[\s\S]*?onClick=\{activate\}/,
  "PPT videos must wait for an explicit user click before creating the native player",
);
assert.match(
  app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══")),
  /page\.id==='okr-merchandise'[\s\S]*?page\.id==='okr-cfd-public-good-story'\s*\?\s*<OkrDirectFigmaForegroundPage[\s\S]*?onVideoPreview=\{setVideoPreview\}[\s\S]*?page\.id==='okr-cfd-public-good'/,
  "the new page must render in sequence on the existing fixed-background deck",
);

console.log("H1 Frame 73 public-good story page contract passed");
