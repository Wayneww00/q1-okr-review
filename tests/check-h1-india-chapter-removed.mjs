import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const shell = readFileSync(
  resolve(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);

const dataStart = app.indexOf("const H1_DASHBOARDS = [");
const dataEnd = app.indexOf("const REPORT_MODE", dataStart);
assert.ok(dataStart >= 0 && dataEnd > dataStart);
const dataBlock = app.slice(dataStart, dataEnd);

const ids = [...dataBlock.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
  Number(match[1]),
);

assert.deepEqual(
  ids,
  Array.from({ length: 20 }, (_, index) => index + 1),
  "removing the India chapter and H2 target must leave 20 consecutive data pages",
);
assert.doesNotMatch(
  dataBlock,
  /layoutType:"india_chapter"/,
  "the standalone H2 India chapter page must not remain in the deck",
);
assert.doesNotMatch(
  dataBlock,
  /layoutType:"h2_retail_nd_target"/,
  "the H2 target page must not remain in the deck",
);
assert.match(
  shell,
  /dashboard\.before\(makeChapter\('Performance Data','\u7ecf\u8425\u6570\u636e','20 MODULES'\)\)/,
  "the embedded report chapter counter must advertise 20 data modules",
);

console.log("H1 standalone India chapter removal contract passed.");
