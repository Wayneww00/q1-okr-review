import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("index.html", "utf8");
const formatter = source.match(
  /const h1FormatTick = \(value, format\) => \{([\s\S]*?)\n\};/,
)?.[1] || "";

assert.ok(formatter, "the H1 chart tick formatter must exist");
assert.match(
  formatter,
  /format === "currencyBn"[\s\S]*?"\\u00A0Bn"/,
  "currency Bn ticks must use a non-breaking space before the unit",
);
assert.match(
  formatter,
  /format === "bn"[\s\S]*?"\\u00A0Bn"/,
  "Bn ticks must use a non-breaking space before the unit",
);
assert.doesNotMatch(
  formatter,
  /\+ " Bn"/,
  "the H1 tick formatter must not expose a normal breaking space before Bn",
);

console.log("H1 axis-unit nowrap contract passed.");
