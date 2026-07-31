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
assert.match(component, /aria-label="印度 2026年H2 SSS级项目"/);
assert.match(component, /className="h1-o3-india-wordmark"/);
assert.match(component, /<strong>印度<\/strong>/);
assert.match(component, /<p>2026年H2 SSS级项目<\/p>/);
assert.match(component, /previews\/assets\/o3\/india-h2-sss-desert-racing\.png/);

for (const selector of [
  ".h1-o3-india-chapter",
  ".h1-o3-india-background",
  ".h1-o3-india-copy",
  ".h1-o3-india-wordmark",
]) assert.ok(theme.includes(selector), `${selector} must be styled`);

assert.ok(
  fs.existsSync(path.join(root, "previews", "assets", "o3", "india-h2-sss-desert-racing.png")),
  "the India background asset must ship with the presentation",
);

console.log("H1 O3 India chapter placement and visual contract passed.");
