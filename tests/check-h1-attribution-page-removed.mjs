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

assert.ok(dataStart >= 0 && dataEnd > dataStart, "H1 dashboard data must exist");

const dataBlock = app.slice(dataStart, dataEnd);
const ids = [...dataBlock.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
  Number(match[1]),
);

assert.deepEqual(
  ids,
  Array.from({ length: 20 }, (_, index) => index + 1),
  "removing the attribution question must leave 20 continuously numbered pages",
);
assert.doesNotMatch(
  dataBlock,
  /layoutType:"attribution_question"|Marketing价值未充分体现|为什么Marketing做得好，反而ND占比低/,
  "the removed attribution question page must not remain in the report data",
);

const page19Start = dataBlock.search(/^  \{\s*id:19,/m);
const page20Start = dataBlock.search(/^  \{\s*id:20,/m);
assert.ok(page19Start >= 0 && page20Start > page19Start);
assert.match(
  dataBlock.slice(page19Start, page20Start),
  /layoutType:"mib_attribution"/,
  "the MIB attribution analysis must become page 19",
);
assert.match(
  dataBlock.slice(page20Start),
  /layoutType:"retail_nd_scope_restoration"/,
  "the scope-restoration conclusion must become page 20",
);
assert.match(
  shell,
  /'Performance Data','经营数据','20 MODULES'/,
  "the report chapter label must show the new 20-page total",
);
assert.doesNotMatch(shell, /'Performance Data','经营数据','21 MODULES'/);

console.log("H1 attribution question page removal contract passed.");
