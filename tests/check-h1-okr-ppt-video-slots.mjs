import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const assetDirectory = path.join(root, "previews", "assets", "tvc-library");

for (const filename of [
  "cfd-h1-summary.mp4",
  "tvc-brand-main.mp4",
  "tvc-global.mp4",
  "tvc-vietnam.mp4",
  "tvc-thailand.mp4",
]) {
  const asset = path.join(assetDirectory, filename);
  assert.ok(fs.existsSync(asset), `${filename} must be packaged with the report`);
  assert.ok(fs.statSync(asset).size > 10_000_000, `${filename} must not be a placeholder`);
}

assert.match(
  app,
  /id:'okr-public-good-video'[\s\S]*?id:'cfd-h1-summary'[\s\S]*?tvc-library\/cfd-h1-summary\.mp4[\s\S]*?fit:'contain'/,
  "the H1 public-good page must use its supplied PPT video without cropping it",
);
assert.match(
  app,
  /id:'okr-tvc-localization'[\s\S]*?id:'tvc-brand-main'[\s\S]*?tvc-brand-main\.mp4[\s\S]*?id:'tvc-global'[\s\S]*?tvc-global\.mp4[\s\S]*?id:'tvc-vietnam'[\s\S]*?tvc-vietnam\.mp4[\s\S]*?id:'tvc-thailand'[\s\S]*?tvc-thailand\.mp4/,
  "the TVC matrix must map all four videos embedded by the supplied PPT",
);
assert.match(
  app,
  /function OkrPositionedFigmaForegroundPage[\s\S]*?page\.videoSlots\?\.filter\(slot=>slot\.inline\)/,
  "positioned Figma pages must render inline video slots above their foreground artwork",
);

console.log("H1 supplied-PPT video slots contract passed");
