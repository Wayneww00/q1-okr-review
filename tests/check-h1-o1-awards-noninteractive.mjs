import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);

const awardsStart = app.indexOf("id:'okr-awards'");
const awardsEnd = app.indexOf("id:'okr-offline-event-01'", awardsStart);
assert.ok(awardsStart >= 0 && awardsEnd > awardsStart, "awards page must exist");
const awardsPage = app.slice(awardsStart, awardsEnd);

const auditStart = app.indexOf("id:'okr-brand-experience-audit'");
const auditEnd = app.indexOf("id:'okr-tvc-framework'", auditStart);
assert.ok(auditStart >= 0 && auditEnd > auditStart, "brand audit page must exist");
const auditPage = app.slice(auditStart, auditEnd);

const hotspotsStart = app.indexOf("function OkrImageHotspots(");
const hotspotsEnd = app.indexOf("function OkrPositionedFigmaForegroundPage(", hotspotsStart);
assert.ok(
  hotspotsStart >= 0 && hotspotsEnd > hotspotsStart,
  "image hotspot component must exist",
);
const hotspotsComponent = app.slice(hotspotsStart, hotspotsEnd);

assert.match(
  awardsPage,
  /imagePreview:false/,
  "the awards page must explicitly disable image previews",
);
assert.match(
  auditPage,
  /imagePreview:false/,
  "the brand audit collage must explicitly disable image previews",
);
assert.match(
  hotspotsComponent,
  /if\(page\.imagePreview===false\)return null;/,
  "disabled image previews must not render clickable hotspot buttons",
);
assert.match(
  hotspotsComponent,
  /className="h1-okr-image-hotspot"/,
  "other O1 pages must retain their intentional image previews",
);
assert.match(
  shell,
  /src="\.\.\/index\.html\?report=h1&embedded=1&v=20260801-o1-static-images-v1"/,
  "the immersive shell must invalidate the embedded report cache for this release",
);

console.log("H1 O1 static-image pages noninteractive contract passed.");
