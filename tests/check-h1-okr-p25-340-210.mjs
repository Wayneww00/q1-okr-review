import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const p25Path = path.join(
  root,
  "previews",
  "assets",
  "figma-exact",
  "p25-source.png",
);

assert.ok(fs.existsSync(p25Path), "the exact authenticated Figma p25 export must exist");
assert.ok(fs.statSync(p25Path).size > 200_000, "p25 must retain full presentation detail");
assert.match(
  app,
  /id:'okr-review'[\s\S]*?src:'previews\/assets\/figma-exact\/p25-source\.png'/,
  "the p25 report page must use the exact Figma export",
);
assert.match(
  app,
  /<OkrExactFigmaPage key=\{page\.id\} page=\{page\} onPreview=\{setPreview\}\/>/,
  "p25 must use the shared exact-frame renderer",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260729-figma-source-okr-v2"',
  ),
  "the shell must load the exact p25 revision",
);

console.log("H1 exact Figma p25 contract passed.");
