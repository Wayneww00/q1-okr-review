import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);

assert.match(
  shell,
  /const SHOW_Q3_OUTLOOK = false;/,
  "Q3 Outlook must be disabled through one reversible feature switch",
);
assert.match(
  shell,
  /<section class="scene outlook" data-label="Q3 Outlook">[\s\S]*?<h2 class="title">Q3 Outlook<\/h2>[\s\S]*?关键目标[\s\S]*?核心举措[\s\S]*?预期结果[\s\S]*?<\/section>/,
  "the complete Q3 Outlook markup must remain available for later restoration",
);
assert.match(
  shell,
  /const q3OutlookScene = document\.querySelector\('\.scene\[data-label="Q3 Outlook"\]'\);[\s\S]*?q3OutlookScene\.hidden = !SHOW_Q3_OUTLOOK;/,
  "the disabled Q3 scene must be removed from the rendered deck without deleting it",
);
assert.match(
  shell,
  /const scenes = \[\.\.\.document\.querySelectorAll\('\.scene'\)\]\.filter\(scene => !legacyLabels\.has\(scene\.dataset\.label\) && !scene\.hidden\);/,
  "navigation, progress, and rail dots must ignore hidden scenes",
);
assert.match(
  shell,
  /const syncSceneNumbers = \(\) => \{[\s\S]*?scenes\.length[\s\S]*?\};\s*syncSceneNumbers\(\);/,
  "visible scene numbering must be recalculated after Q3 is hidden",
);

console.log(
  "H1 Q3 Outlook reversible visibility, navigation, and numbering contract passed.",
);
