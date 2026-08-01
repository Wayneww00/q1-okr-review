import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const start = app.indexOf("const OKR_FIGMA_PAGES=[");
const end = app.indexOf("\n];", start);

assert.ok(start >= 0 && end > start, "the O1 page registry must exist");

const ids = [
  ...app.slice(start, end).matchAll(/^  \{(?:\n    )?id:["']([^"']+)["']/gm),
].map((match) => match[1]);

assert.equal(ids.length, 32, "the O1 transition must extend the deck to 32 pages");
assert.deepEqual(
  ids.slice(0, 8),
  [
    "okr-review",
    "okr-brand-results",
    "okr-brand-build-transition",
    "okr-brand-refresh",
    "okr-brand-operating-system",
    "okr-tvc-matrix",
    "okr-brand-experience-audit",
    "okr-tvc-framework",
  ],
  "the brand-building transition must sit between the definition and the upgrade pages",
);

console.log("H1 O1 requested page order contract passed.");
