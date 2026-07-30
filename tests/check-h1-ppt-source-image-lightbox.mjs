import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = [
  fs.readFileSync(
    path.join(root, "previews", "h1-figma-racing-theme.css"),
    "utf8",
  ),
  fs.readFileSync(path.join(root, "previews", "h1-o3-theme.css"), "utf8"),
].join("\n");

assert.match(
  app,
  /function H1SourceImage\(\{src,alt/,
  "content images must use one reusable PPT-source image component",
);
assert.match(
  app,
  /ReactDOM\.createPortal/,
  "the enlarged image must escape scaled report canvases through a portal",
);
assert.match(
  app,
  /role="dialog"[\s\S]*?aria-modal="true"[\s\S]*?关闭图片预览/,
  "the source-image viewer must be an accessible, closable dialog",
);
assert.match(
  app,
  /event\.key===['"]Escape['"]/,
  "Escape must close the source-image viewer",
);

const pptSourceImages = [
  "seo-tech-vantage.jpeg",
  "seo-tech-exness.jpeg",
  "brand-ai-trust.png",
  "brand-ai-arabic.png",
  "brand-ai-esp.png",
  "brand-ai-trade-weekend.png",
  "geo-platform-evidence.png",
  "geo-visibility-evidence.png",
  "aso-ranking-evidence.jpeg",
  "aso-growth-evidence.png",
  "facebook-highlights.png",
  "facebook-feed.png",
  "youtube-highlights.png",
  "copytrade-kol.png",
  "copytrade-pr.png",
  "copytrade-ugc.png",
];

for (const fileName of pptSourceImages) {
  assert.ok(app.includes(fileName), `${fileName} must remain wired`);
}
assert.ok(
  (app.match(/<H1SourceImage\b/g) || []).length >= 9,
  "all direct and mapped O2/O3 image groups must use H1SourceImage",
);
assert.doesNotMatch(
  app,
  /<img[^>]+(?:seo-tech-(?:vantage|exness)|brand-ai-|geo-(?:platform|visibility)-evidence|aso-(?:ranking|growth)-evidence|facebook-(?:highlights|feed)|youtube-highlights|copytrade-(?:kol|pr|ugc))/,
  "PPT content images must not bypass the source-image viewer",
);

for (const fileName of [
  "awards-fortune-crypto-innovators.png",
  "awards-global-forex-b2b.png",
  "awards-best-range-of-markets.png",
]) {
  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "ppt-originals",
    fileName,
  );
  assert.ok(fs.existsSync(assetPath), `${fileName} must be extracted from PPT`);
  assert.ok(
    fs.statSync(assetPath).size > 100_000,
    `${fileName} must preserve the original PPT image binary`,
  );
  assert.ok(app.includes(fileName), `${fileName} must be available in the award gallery`);
}

assert.match(
  app,
  /h1-source-image-trigger/,
  "content images must expose a visible zoom affordance",
);
assert.match(
  theme,
  /\.h1-source-image-modal\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;/,
  "the source-image viewer must fill the viewport",
);
assert.match(
  theme,
  /\.h1-source-image-modal img\s*\{[\s\S]*?object-fit:\s*contain;/,
  "the original image must be shown without cropping or distortion",
);

for (const poster of [
  "vn-tvc-park-chess-poster.png",
  "vn-tvc-banh-mi-poster.png",
  "vn-tvc-printer-poster.png",
]) {
  assert.ok(app.includes(poster), `${poster} must remain a video poster`);
}

console.log("PPT source-image extraction and full-screen lightbox contract passed.");
