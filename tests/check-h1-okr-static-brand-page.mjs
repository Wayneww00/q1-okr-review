import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const staticPage = app.slice(
  app.indexOf("function OkrBrandSystemPage"),
  app.indexOf("function OkrBrandResultsPage"),
);
const operatingSystemPage = app.slice(
  app.indexOf("id:'okr-brand-operating-system'"),
  app.indexOf("id:'okr-tvc-matrix'"),
);

assert.match(staticPage, /className="h1-okr-page"/);
assert.match(
  staticPage,
  /data-objective-index="O1"[\s\S]*?aria-label="O1 将 Vantage 建设成全球一线品牌"/,
  "the first OKR page must identify itself as Objective 1",
);
assert.match(
  staticPage,
  /className="h1-okr-objective-marker"[\s\S]*?O1/,
  "the first OKR page must render the visible O1 chapter marker",
);
assert.doesNotMatch(staticPage, /OkrImageHotspots|onPreview|setPreview|modalSrc/);
assert.doesNotMatch(staticPage, /h1-okr-static-click-shield/);
assert.doesNotMatch(operatingSystemPage, /imageSlots|figma-lightbox|modalSrc/);
assert.doesNotMatch(theme, /\.h1-okr-static-click-shield/);
assert.match(
  theme,
  /\.h1-figma-racing-report body\.h1-embedded-report \.h1-okr-objective-marker\s*\{[\s\S]*?top:\s*160px;[\s\S]*?left:\s*250px;[\s\S]*?height:\s*72px;[\s\S]*?color:\s*#f0a33c;[\s\S]*?font-size:\s*68px;/,
  "O1 must align to the title baseline and use the warm objective-number accent",
);

console.log("Static 05/31 brand page contract passed.");
