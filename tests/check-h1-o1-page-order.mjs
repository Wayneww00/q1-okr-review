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

assert.equal(ids.length, 40, "the Q3 strategy conclusion must extend the O1 deck to 40 pages");
assert.deepEqual(
  ids.slice(0, 11),
  [
    "okr-review",
    "okr-brand-results",
    "okr-brand-build-transition",
    "okr-brand-upgrade-transition",
    "okr-brand-refresh",
    "okr-brand-operating-system",
    "okr-tvc-matrix",
    "okr-tvc-framework",
    "okr-tvc-library",
    "okr-brand-experience-audit",
    "okr-application-roadmap",
  ],
  "the brand audit must sit immediately before the application roadmap",
);

console.log("H1 O1 requested page order contract passed.");
