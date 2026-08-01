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

assert.equal(ids.length, 31, "reordering O1 must preserve all 31 pages");
assert.deepEqual(
  ids.slice(0, 7),
  [
    "okr-review",
    "okr-brand-results",
    "okr-brand-refresh",
    "okr-brand-operating-system",
    "okr-tvc-matrix",
    "okr-brand-experience-audit",
    "okr-tvc-framework",
  ],
  "the former O1 page 02 must sit immediately after the former page 06",
);

console.log("H1 O1 requested page order contract passed.");
