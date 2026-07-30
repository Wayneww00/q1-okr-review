import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o3-theme.css"),
  "utf8",
);
const backgroundPath = path.join(
  root,
  "previews",
  "assets",
  "o1-complete",
  "figma-untitled",
  "p68-trophy-background.png",
);

assert.ok(
  fs.existsSync(backgroundPath),
  "O3 must use the exported Figma trophy background asset",
);

const png = fs.readFileSync(backgroundPath);
assert.equal(
  png.subarray(1, 4).toString("ascii"),
  "PNG",
  "O3 background must remain a lossless PNG",
);
assert.equal(
  png.readUInt32BE(16),
  1920,
  "O3 background must preserve the Figma width",
);
assert.equal(
  png.readUInt32BE(20),
  1080,
  "O3 background must preserve the Figma height",
);

assert.equal(
  (app.match(/data-o3-trophy-stage/g) || []).length,
  1,
  "all 17 O3 pages must share one fixed trophy background",
);
assert.doesNotMatch(
  app,
  /data-o3-racing-stage/,
  "the previous racing-stage marker must be retired",
);
assert.match(
  app,
  /<OkrReportDeck\/>\s*<O2ReportDeck\/>\s*<O3ReportDeck\/>/,
  "O3 placement must remain unchanged",
);

assert.match(
  theme,
  /--h1-o3-trophy-stage:\s*url\("\.\/assets\/o1-complete\/figma-untitled\/p68-trophy-background\.png"\)/,
  "O3 must expose the isolated date-free Figma background token",
);
assert.match(
  theme,
  /\.h1-o3-fixed-stage\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?var\(--h1-o3-trophy-stage\);[\s\S]*?background-size:\s*cover;[\s\S]*?background-position:\s*center;/,
  "O3 background must cover the viewport without distortion or black bars",
);
assert.match(
  theme,
  /\.h1-o3-card\s*\{[\s\S]*?background:\s*var\(--h1-o3-panel\);[\s\S]*?backdrop-filter:\s*blur\(28px\)\s+saturate\(1\.08\);/,
  "O3 existing cards must carry the approved warm glass treatment",
);
assert.match(
  theme,
  /--h1-o3-panel:\s*linear-gradient\([^;]+rgba\(14,8,5,\.88\)/,
  "O3 cards must use the darker warm-brown Figma palette",
);
assert.doesNotMatch(
  theme,
  /\.h1-o3-card::(?:before|after)/,
  "O3 must not add a separate fake-opacity layer over existing cards",
);

const registryStart = app.indexOf("const O3_REPORT_PAGES=");
const registryEnd = app.indexOf("function O3ReportDeck", registryStart);
const registry = app.slice(registryStart, registryEnd);
assert.equal(
  [...registry.matchAll(/\bid:"o3-/g)].length,
  17,
  "O3 must include the approved Vietnam key-insight page",
);

for (const protectedMarker of [
  'data-report-section="data"',
  "data-o2-desert-stage",
  'data-report-section="okr"',
  "H1SourceImage",
  "OkrVideoModal",
]) {
  assert.ok(
    app.includes(protectedMarker),
    `${protectedMarker} must remain intact outside the O3 theme`,
  );
}

console.log(
  "H1 O3 Figma trophy background, glass palette, and isolation contract passed.",
);
