import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const css = fs.readFileSync(path.join(root, "previews/h1-figma-racing-theme.css"), "utf8");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "previews/vantage-h1-immersive.html"), "utf8");

assert.match(
  css,
  /--h1-figma-design-width:\s*1442\.25354/,
  "The formal data deck must use the measured Figma module width as its coordinate source."
);
assert.match(
  css,
  /--h1-figma-first-height:\s*970\.208/,
  "The first data page must use the measured 970.208px Figma module height."
);
assert.match(
  css,
  /--h1-figma-detail-height:\s*736\.366/,
  "Detail pages must use the measured 736.366px Figma module height."
);
assert.match(
  css,
  /\.h1-figma-page-content\s*\{[^}]*aspect-ratio:\s*1442\.25354\s*\/\s*736\.366/s,
  "Detail page geometry must preserve the Figma aspect ratio instead of stretching to the viewport."
);
assert.match(
  css,
  /\.h1-figma-data-page\.is-overview\s+\.h1-figma-page-content\s*\{[^}]*aspect-ratio:\s*1442\.25354\s*\/\s*970\.208/s,
  "The overview page must preserve the exact Figma aspect ratio."
);
assert.doesNotMatch(
  css,
  /\.h1-figma-page-content\s*\{[^}]*height:\s*(?:min\()?9[12]vh/s,
  "The page content must not fill 91–92vh; that was the source of the oversized chart card."
);
assert.doesNotMatch(
  css,
  /@media \(max-width:\s*1180px\)[\s\S]*?\.h1-figma-page-content\s*\{[^}]*width:\s*min\(90vw/s,
  "Desktop fidelity must not be overridden from the Figma 75.1% content width to 90vw."
);
assert.doesNotMatch(
  css,
  /\.h1-figma-racing-report\s*\{[^}]*scroll-snap-type/s,
  "Scroll snapping must not be applied to the whole embedded report or it traps navigation on page ten."
);
assert.match(
  css,
  /\.h1-figma-data-stage\.is-region\s+\.h1-figma-chart-panel\s*\{[^}]*grid-template-rows:\s*27\.04225px\s+1fr/s,
  "Region tables without a legend must receive the full remaining chart-card row."
);
assert.match(
  app,
  /\{isOperationalOverview\s*&&\s*\(\s*<header className="h1-figma-operational-title">/,
  "The operational title must appear only on the first data page."
);
assert.match(
  app,
  /\{hasModuleTitle\s*&&\s*\(\s*<div className="h1-figma-module-title">/,
  "Module titles must appear on the Retail opener and Paid Ads opener."
);
assert.match(
  shell,
  /reportPageTop\(reportPages\[index\]\)/,
  "PPT navigation must target an exact report-page offset."
);
assert.match(
  shell,
  /scrollTo\(\{top:\s*targetTop,\s*behavior:'smooth'\}\)/,
  "PPT navigation must animate to the exact target page."
);
assert.match(
  shell,
  /const correctedTop = reportPageTop\(reportPages\[index\]\);[\s\S]*?scrollTo\(\{top:\s*correctedTop,\s*behavior:'instant'\}\)/,
  "PPT navigation must recompute the live report-page position before its final instant correction."
);
assert.match(
  shell,
  /const moveInsideReport = direction => \{\s*if \(reportPaging\) return;/,
  "Repeated wheel or key input must be locked until the current PPT page settles."
);
assert.match(
  shell,
  /doc\.querySelectorAll\('\[data-report-page\]'\)/,
  "The data and OKR sequence must use one real PPT page registry."
);
assert.match(
  shell,
  /next >= reportPages\.length[\s\S]*?moveDeckFromReport\(1\)/,
  "The final OKR page must hand off to Q3 instead of entering a free-scroll region."
);
assert.doesNotMatch(
  shell,
  /innerHeight\s*\*\s*\.86/,
  "The report must not page by a fractional viewport distance."
);

console.log("H1 Figma fidelity and PPT paging checks passed.");
