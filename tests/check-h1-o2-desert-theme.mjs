import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
const background = path.join(
  root,
  "previews",
  "assets",
  "o2",
  "figma-desert-vantage-bg.png",
);

assert.ok(fs.existsSync(background), "the exact Figma O2 desert background must be stored locally");
assert.ok(
  fs.statSync(background).size > 2_000_000,
  "the Figma O2 background must retain its original high-resolution export",
);

assert.equal(
  (app.match(/data-o2-desert-stage/g) || []).length,
  1,
  "O2 must use exactly one shared desert background layer",
);
assert.doesNotMatch(
  app,
  /data-o2-racing-stage/,
  "the obsolete O2 racing-stage marker must be removed",
);
assert.match(
  theme,
  /--h1-o2-desert-stage:\s*url\("\.\/assets\/o2\/figma-desert-vantage-bg\.png"\)/,
  "O2 must bind the exported Figma asset through an O2-scoped token",
);
assert.match(
  theme,
  /\.h1-o2-fixed-stage\s*\{[\s\S]*?var\(--h1-o2-desert-stage\);[\s\S]*?background-position:\s*center;[\s\S]*?background-size:\s*cover;/,
  "the shared O2 background must fill the viewport without distortion",
);

assert.match(
  theme,
  /--h1-o2-panel:\s*linear-gradient\([\s\S]*?rgba\(20,\s*10,\s*6,\s*\.94\)[\s\S]*?rgba\(67,\s*34,\s*15,\s*\.88\)/,
  "O2 panels must use the approved deep warm-brown glass palette",
);
assert.match(
  theme,
  /--h1-o2-gold:\s*#d9a24a;/,
  "O2 must expose the approved amber-gold accent",
);
assert.match(
  theme,
  /\.h1-o2-report \.h1-o2-card\s*\{[\s\S]*?backdrop-filter:\s*blur\(24px\) saturate\(1\.08\);/,
  "O2 cards must use the approved high-contrast warm glass treatment",
);

assert.match(
  theme,
  /\.h1-figma-fixed-stage\s*\{[\s\S]*?var\(--h1-figma-data-stage\)/,
  "the data report background must remain unchanged",
);
const dataStageRule = theme.match(/\.h1-figma-fixed-stage\s*\{([^}]*)\}/)?.[1] ?? "";
assert.ok(
  !dataStageRule.includes("--h1-o2-desert-stage"),
  "the O2 background token must never leak into the data report",
);
assert.equal(
  [...app.matchAll(/\bid:"o2-/g)].length,
  25,
  "the O2 redesign must retain all 25 approved pages",
);
assert.match(
  app,
  /function H1SourceImage\(/,
  "the existing PPT-original click-to-enlarge behavior must be preserved",
);

console.log("H1 O2 Figma desert background and scoped warm-glass theme contract passed.");
