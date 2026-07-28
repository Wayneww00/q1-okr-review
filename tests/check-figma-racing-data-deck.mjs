import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const file = "previews/vantage-h1-figma-racing-data-deck.html";
const html = await readFile(resolve(file), "utf8");

assert.match(html, /data-deck-count=["']10["']/, "the deck should declare ten data pages");
assert.match(html, /assets\/vantage-racing-stage-bg\.png/, "the Ferrari collaboration background should remain fixed");
assert.match(html, /class=["'][^"']*fixed-stage-bg/, "the racing background must live outside the moving slide layer");
assert.match(html, /data-page-id=["']retail-ftd["']/, "the first page should be Retail FTD");
assert.match(html, /data-page-id=["']seo-clicks["']/, "the tenth page should be SEO clicks");

const titles = html.match(/data-performance-title/g) ?? [];
assert.equal(titles.length, 1, "整体表现 should appear as a large title on the first data page only");

for (const fact of [
  "105,743",
  "135,103",
  "$145.4M",
  "$221.6M",
  "3,247.35 Bn",
  "4,540.25 Bn",
  "39,650",
  "55,226",
  "$42.5M",
  "$73.8M",
  "818.42 Bn",
  "1,415.59 Bn",
  "$37.4M",
  "$63.0M",
  "314,795",
  "10.7",
  "338K",
  "414K",
  "10,571",
  "13,609",
]) {
  assert.ok(html.includes(fact), `the deck should retain current H1 fact "${fact}"`);
}

for (const interaction of ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "wheel", "pointerdown", "ppt-next", "ppt-prev"]) {
  assert.ok(html.includes(interaction), `the deck should support ${interaction} navigation`);
}

assert.match(
  html,
  /\.data-slide\s*\{[\s\S]*?translate3d\(0,\s*10[036]%/,
  "future slides should enter vertically from below",
);
assert.match(
  html,
  /\.data-slide\.past\s*\{[\s\S]*?translate3d\(0,\s*-\d+%/,
  "past slides should leave vertically through the top",
);
assert.ok(html.includes("pointerStartY"), "swipe navigation should measure vertical movement");
assert.ok(!html.includes("pointerStartX"), "the deck should no longer use horizontal swipe navigation");
assert.ok(!html.includes("rotateY("), "the page-flip effect should not rotate around the vertical axis");

for (const figmaVisual of [
  "figma-spotlight",
  "figma-title-lockup",
  "OVERALL PERFORMANCE",
  "--figma-card-alpha",
]) {
  assert.ok(html.includes(figmaVisual), `the deck should retain the Figma visual token "${figmaVisual}"`);
}

console.log("Figma racing data deck contract passed.");
