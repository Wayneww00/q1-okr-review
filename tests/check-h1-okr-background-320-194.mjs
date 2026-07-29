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

const sourceFiles = [
  "p25-source.png",
  "p27-source.png",
  "okr-p29-source.png",
  "okr-p30-source.png",
  "okr-p32-matrix-source.jpg",
  "okr-p32-tvc-source.jpg",
  "okr-p33-source.png",
  "okr-p34-source.png",
  "awards-source.png",
  "salon.jpg",
  "expo.jpg",
];

for (const fileName of sourceFiles) {
  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "figma-exact",
    fileName,
  );
  assert.ok(fs.existsSync(assetPath), `${fileName} must exist`);
  assert.ok(fs.statSync(assetPath).size > 100_000, `${fileName} must be full-resolution`);
}

assert.match(
  theme,
  /\.h1-figma-racing-report body\.h1-embedded-report main\.h1-okr-report > \.h1-okr-exact-page\s*\{[\s\S]*?height:\s*100vh;[\s\S]*?overflow:\s*hidden;/,
  "each Figma page must fill the live report viewport",
);
assert.match(
  theme,
  /\.h1-okr-exact-frame\s*\{[\s\S]*?object-fit:\s*contain;/,
  "the complete Figma frame must stay undistorted and uncropped",
);
assert.match(
  theme,
  /main\.h1-okr-report > \.h1-okr-exact-page::before\s*\{[\s\S]*?var\(--h1-okr-trophy\);[\s\S]*?background-size:\s*cover;/,
  "each OKR page must use the approved trophy image to fill side bars",
);
assert.match(
  theme,
  /\.h1-okr-exact-artboard\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?width:\s*min\(100%,\s*calc\(100vh \* 16 \/ 9\)\);[\s\S]*?aspect-ratio:\s*16\s*\/\s*9;/,
  "each page must contain its own proportional artboard",
);
assert.doesNotMatch(
  app,
  /h1-okr-fixed-stage/,
  "the rejected shared OKR background must stay removed",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260729-okr-independent-bg-v1"',
  ),
  "the formal shell must load the exact Figma background revision",
);

console.log("H1 exact Figma full-bleed background contract passed.");
