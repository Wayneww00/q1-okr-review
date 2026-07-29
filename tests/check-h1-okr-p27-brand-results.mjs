import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const p27Path = path.join(
  root,
  "previews",
  "assets",
  "figma-exact",
  "p27-source.png",
);

const p25Index = app.indexOf("id:'okr-review'");
const p27Index = app.indexOf("id:'okr-brand-results'");
assert.ok(p25Index >= 0, "p25 must remain registered");
assert.ok(p27Index > p25Index, "p27 must follow p25");
assert.ok(fs.existsSync(p27Path), "the exact authenticated Figma p27 export must exist");
assert.ok(fs.statSync(p27Path).size > 200_000, "p27 must retain full presentation detail");
assert.match(
  app,
  /id:'okr-brand-results'[\s\S]*?src:'previews\/assets\/figma-exact\/p27-source\.png'/,
  "p27 must use the exact full-resolution Figma frame rather than a reconstructed matrix",
);
assert.match(
  shell,
  /const reportPages = \[\.\.\.doc\.querySelectorAll\('\[data-report-page\]'\)\];/,
  "p27 must inherit the existing dynamic PPT page registry",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260729-okr-independent-bg-v1"',
  ),
  "the formal shell must invalidate the embedded report after the p27 update",
);

console.log("H1 exact Figma p27 contract passed.");
