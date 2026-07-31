import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const registryStart = app.indexOf("const O3_REPORT_PAGES=");
const registryEnd = app.indexOf("];", registryStart) + 2;
const registry = app.slice(registryStart, registryEnd);
const retailStart = app.indexOf("function O3RetailComparison");
const retailEnd = app.indexOf("function O3Record", retailStart);
const retail = app.slice(retailStart, retailEnd);

assert.match(
  registry,
  /id:"o3-retail-ftd"[^\n]+editorRevision:"vn-retail-h1-ppt-update-v1"[^\n]+title:"越南 2026-H1 FTD 较2025 H2增长近三倍"[^\n]+description:"越南整体 FTD 绝对值较2025 H2增长 197\.7%，FTD 越南占比提升 2\.8 个百分点。"/,
  "FTD page must use the confirmed comparison wording and PPT headline",
);
assert.match(
  registry,
  /id:"o3-retail-tv"[^\n]+editorRevision:"vn-retail-h1-ppt-update-v1"[^\n]+title:"越南 2026-H1 TV 较2025 H2增长超过三倍"[^\n]+description:"越南整体 TV 绝对值较2025 H2增长 214%，TV 越南占比提升 1\.9 个百分点。"/,
  "TV page must use the confirmed comparison wording and PPT headline",
);
assert.match(
  app,
  /data-editor-revision=\{page\.editorRevision\|\|\(page\.id==="o3-seo"\?"semrush-source-note-v1":undefined\)\}/,
  "O3 pages must publish their per-page editor revision so stored legacy copy cannot overwrite a new approved baseline",
);

for (const fact of [
  "2026 H1 FTD",
  "7,695",
  "22,910",
  "2.7%",
  "5.5%",
  "+197.7%",
  "+2.8%",
  "2026 H1 越南 FTD 半年表现及整体占比变化",
  "FTD（绝对值）",
  "FTD 占 Vantage（占比）",
  "2026 H1 TV",
  "210.3 Bn",
  "660.2 Bn",
  "1.5%",
  "3.4%",
  "+214%",
  "+1.9%",
  "2026 H1 越南 TV 半年表现及整体占比变化",
  "Trading Volume (Bn)",
  "TV 占 Vantage（占比）",
  "2026 H1 vs 2025 H2",
]) {
  assert.ok(retail.includes(fact), `retail pages must retain the PPT fact: ${fact}`);
}

for (const label of ["Year", "越南 FTD", "越南 TV", "越南占比", "越南 FTD 绝对值", "越南 TV 绝对值"]) {
  assert.ok(retail.includes(label), `retail pages must retain the PPT label: ${label}`);
}

for (const staleFact of ["992", "4,808", "12.9%", "21.0%", "6.38 Bn", "24.42 Bn", "3.0%", "3.7%", "+385%", "+283%", "+8.1%", "+0.7%"]) {
  assert.ok(!retail.includes(staleFact), `retail pages must remove the replaced value: ${staleFact}`);
}

assert.doesNotMatch(registry, /o3-retail-(?:ftd|tv)[^\n]+同比增长/);
assert.doesNotMatch(retail, /Julian Song|2026年7月31日 22:02/);
assert.doesNotMatch(retail, /axisLabel:"Retail FTD（绝对值）"/);

console.log("H1 O3 retail FTD/TV PPT content update contract passed.");
