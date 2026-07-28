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

for (const fileName of ["p25-source.png", "p27-source.png", "awards-source.png", "salon.jpg", "expo-source.png"]) {
  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "figma-exact",
    fileName,
  );
  assert.ok(fs.existsSync(assetPath), `${fileName} must exist`);
  assert.ok(fs.statSync(assetPath).size > 100_000, `${fileName} must be full-resolution`);
  assert.ok(app.includes(`previews/assets/figma-exact/${fileName}`));
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
  /\.h1-okr-exact-page::before\s*\{[\s\S]*?background-size:\s*cover;/,
  "the exact frame must extend its own background without black side bars",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260729-figma-source-okr-v2"',
  ),
  "the formal shell must load the exact Figma background revision",
);

console.log("H1 exact Figma full-bleed background contract passed.");
