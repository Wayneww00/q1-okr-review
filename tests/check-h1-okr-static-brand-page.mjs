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
assert.doesNotMatch(staticPage, /OkrImageHotspots|onPreview|setPreview|modalSrc/);
assert.doesNotMatch(staticPage, /h1-okr-static-click-shield/);
assert.doesNotMatch(operatingSystemPage, /imageSlots|figma-lightbox|modalSrc/);
assert.doesNotMatch(theme, /\.h1-okr-static-click-shield/);

console.log("Static 05/31 brand page contract passed.");
