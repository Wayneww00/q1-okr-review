import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const assetRoot = path.join(
  root,
  "previews",
  "assets",
  "o3",
  "ppt-native",
);

const evidence = {
  "aso-rating.png": 300_000,
  "aso-app.jpeg": 95_000,
  "aso-keywords.jpeg": 60_000,
  "aso-exposure.jpeg": 700_000,
  "aso-growth.png": 70_000,
  "social-followers.png": 190_000,
  "social-new-followers.png": 150_000,
  "social-views.png": 145_000,
  "social-overall.png": 115_000,
  "sentiment-keywords.png": 650_000,
  "sentiment-trend.png": 1_000_000,
  "sentiment-overview.png": 500_000,
  "sentiment-hashtags.png": 70_000,
};

for (const [fileName, minimumBytes] of Object.entries(evidence)) {
  const assetPath = path.join(assetRoot, fileName);
  assert.ok(
    fs.existsSync(assetPath),
    `${fileName} must be extracted from the O3 PPT`,
  );
  assert.ok(
    fs.statSync(assetPath).size >= minimumBytes,
    `${fileName} must retain the native PPT image resolution`,
  );
  assert.ok(
    app.includes(`ppt-native/${fileName}`) ||
      (app.includes(fileName) && app.includes("ppt-native/${file}")),
    `${fileName} must replace the low-resolution Figma crop`,
  );
}

for (const lowResolutionCrop of [
  "97-rating.png",
  "97-app.png",
  "97-keywords.png",
  "97-exposure.png",
  "97-growth.png",
  "99-followers.png",
  "99-new-followers.png",
  "99-views.png",
  "99-overall.png",
  "100-keywords.png",
  "100-trend.png",
  "100-sentiment.png",
  "100-hashtags.png",
]) {
  assert.ok(
    !app.includes(`figma-95-102/evidence/${lowResolutionCrop}`),
    `${lowResolutionCrop} must no longer be used as the rendered evidence source`,
  );
}

assert.ok(
  (app.match(/<H1SourceImage\b/g) || []).length >= 20,
  "native PPT evidence must keep the click-to-enlarge interaction",
);

console.log("O3 native PPT evidence image checks passed.");
