import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o3-theme.css"),
  "utf8",
);

const registryStart = app.indexOf("const O3_REPORT_PAGES=");
const registryEnd = app.indexOf("];", registryStart) + 2;
assert.ok(registryStart >= 0 && registryEnd > registryStart);
const registry = app.slice(registryStart, registryEnd);

assert.equal(
  [...registry.matchAll(/\bid:"o3-/g)].length,
  17,
  "removing the redundant Vietnam record page should reduce O3 to 17 pages",
);
assert.doesNotMatch(registry, /id:"o3-vn-record"|layout:"record"/);
assert.match(
  registry,
  /id:"o3-retail-tv"[^\n]+\n\s*\{id:"o3-seo"/,
  "the SEO page should directly follow the Vietnam Retail TV page",
);

for (const removedCopy of [
  "越南 H1 增长，达到历史新高",
  "FTD 与 TV 同步突破",
  "增长不只体现在速度",
  "4,808",
  "+385%",
  "24.42 Bn",
  "+283%",
]) {
  assert.ok(!app.includes(removedCopy), `removed page copy should be absent: ${removedCopy}`);
}

assert.doesNotMatch(app, /function O3Record\s*\(|page\.layout==="record"/);
assert.doesNotMatch(theme, /\.h1-o3-record/);

console.log("H1 O3 redundant Vietnam record page removal contract passed.");
