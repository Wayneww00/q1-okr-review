import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(path.join(root, "previews", "h1-o3-theme.css"), "utf8");
const registryStart = app.indexOf("const O3_REPORT_PAGES=");
const registryEnd = app.indexOf("];", registryStart) + 2;
const registry = app.slice(registryStart, registryEnd);

assert.match(
  registry,
  /id:"o3-vn-key-insight"[\s\S]*?\},\s*\{id:"o3-india-chapter",layout:"india-chapter",eyebrow:"India",title:"印度",description:"2026年H2 SSS级项目"/,
  "the India chapter must sit immediately after the Vietnam key-insight page",
);
assert.equal([...registry.matchAll(/\bid:"o3-/g)].length, 18);

const componentStart = app.indexOf("function O3IndiaChapter()");
const componentEnd = app.indexOf("\nfunction O3Chapter", componentStart);
const component = app.slice(componentStart, componentEnd);
assert.match(component, /aria-label="印度 2026年H2 SSS级项目 45天的等待"/);
assert.match(component, /className="h1-o3-india-wait"/);
assert.match(component, /<p className="h1-o3-india-wait">45天的等待<\/p>/);
assert.match(component, /previews\/assets\/o3\/india-h2-sss-figma\.png/);
assert.doesNotMatch(component, /h1-o3-india-wordmark|india-h2-sss-desert-racing/);

for (const selector of [
  ".h1-o3-india-chapter",
  ".h1-o3-india-background",
  ".h1-o3-india-wait",
]) assert.ok(theme.includes(selector), `${selector} must be styled`);

assert.match(theme, /\.h1-o3-india-background\{[^}]*width:100%[^}]*height:100%[^}]*object-fit:cover/s);

const figmaAsset = path.join(root, "previews", "assets", "o3", "india-h2-sss-figma.png");
assert.ok(fs.existsSync(figmaAsset), "the India frame exported from Figma must ship with the presentation");
const png = fs.readFileSync(figmaAsset);
assert.equal(png.toString("ascii", 1, 4), "PNG");
assert.equal(png.readUInt32BE(16), 2280);
assert.equal(png.readUInt32BE(20), 1346);

console.log("H1 O3 India Figma asset, fullscreen contract, and wait-line copy passed.");
