import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const assetDirectory = path.join(root, "previews", "assets", "tvc-library");

for (const filename of [
  "cfd-h1-summary-web.mp4",
  "tvc-brand-main-web.mp4",
  "tvc-global-web.mp4",
  "tvc-vietnam-web.mp4",
  "tvc-thailand-web.mp4",
]) {
  const asset = path.join(assetDirectory, filename);
  assert.ok(fs.existsSync(asset), `${filename} must be packaged with the report`);
  assert.ok(fs.statSync(asset).size > 1_000_000, `${filename} must not be a placeholder`);
}

assert.match(
  app,
  /id:'okr-public-good-video'[\s\S]*?id:'cfd-h1-summary'[\s\S]*?tvc-library\/cfd-h1-summary-web\.mp4[\s\S]*?pptSource:'previews\/assets\/tvc-library\/cfd-h1-summary-ppt\.mp4'[\s\S]*?poster:'previews\/assets\/tvc-library\/posters\/cfd-h1-summary\.jpg'[\s\S]*?fit:'contain'/,
  "the H1 public-good page must use its supplied PPT video without cropping it",
);
const pptSource = path.join(assetDirectory, "cfd-h1-summary-ppt.mp4");
assert.ok(
  fs.existsSync(pptSource) && fs.statSync(pptSource).size > 100_000_000,
  "the exact video extracted from the supplied PPT must be retained as source provenance",
);
assert.match(
  app,
  /id:'okr-tvc-localization'[\s\S]*?id:'tvc-brand-main'[\s\S]*?tvc-brand-main-web\.mp4[\s\S]*?id:'tvc-global'[\s\S]*?tvc-global-web\.mp4[\s\S]*?id:'tvc-vietnam'[\s\S]*?tvc-vietnam-web\.mp4[\s\S]*?id:'tvc-thailand'[\s\S]*?tvc-thailand-web\.mp4/,
  "the TVC matrix must map all four videos embedded by the supplied PPT",
);
assert.match(
  app,
  /function OkrInlineVideo\(\{slot\}\)[\s\S]*?\{active \? \([\s\S]*?<video[\s\S]*?src=\{slot\.src\}[\s\S]*?preload="auto"[\s\S]*?: \([\s\S]*?<button[\s\S]*?h1-okr-inline-video-trigger/,
  "inline videos must render a lightweight cover first and create the real player only after a click",
);
assert.match(
  app,
  /function OkrModalVideoTrigger\(\{page,slot,onVideoPreview\}\)[\s\S]*?h1-okr-inline-video-trigger[\s\S]*?onClick=\{\(\)=>onVideoPreview\?\.\(\{page,slot\}\)\}/,
  "modal videos must keep a lightweight poster trigger and defer creating the player until a click",
);
assert.match(
  app,
  /function OkrTvcLocalizationPage\(\{page,onVideoPreview\}\)[\s\S]*?page\.videoSlots\.map\(slot=><OkrModalVideoTrigger[\s\S]*?onVideoPreview=\{onVideoPreview\}/,
  "the dedicated four-video Figma page must open every supplied video in the shared modal player",
);
assert.match(
  app,
  /id:'okr-tvc-localization'[\s\S]*?figmaNodeId:'146:717'[\s\S]*?left:203,top:481,width:600,height:338[\s\S]*?left:1170\.5,top:462,width:360,height:203[\s\S]*?left:965\.25,top:731,width:360,height:203[\s\S]*?left:1375\.75,top:731,width:360,height:203/,
  "the four videos must keep the 60 - 4 Videos Figma coordinates",
);
assert.doesNotMatch(
  app.slice(app.indexOf("function OkrTvcLocalizationPage"), app.indexOf("function OkrExactFigmaPage")),
  /UAE|p60-foreground/,
  "the replacement page must not retain the empty UAE slot or the old composite foreground",
);

console.log("H1 supplied-PPT video slots contract passed");
