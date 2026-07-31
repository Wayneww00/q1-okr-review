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
const registry = app.slice(registryStart, registryEnd);
const onlineOfflineIndex = registry.indexOf('id:"o3-online-offline"');
const insightIndex = registry.indexOf('id:"o3-vn-key-insight"');

assert.ok(onlineOfflineIndex >= 0, "the online/offline page must remain present");
assert.ok(
  insightIndex > onlineOfflineIndex,
  "the Vietnam key-insight page must sit immediately after online/offline",
);
assert.equal(
  [...registry.matchAll(/\bid:"o3-/g)].length,
  18,
  "O3 must contain the Vietnam sequence plus the following India chapter",
);
assert.match(
  registry.slice(onlineOfflineIndex),
  /id:"o3-online-offline"[\s\S]*?\},\s*\{id:"o3-vn-key-insight",layout:"vn-key-insight",eyebrow:"越南关键洞察",title:"越南关键洞察"/,
  "the new page must directly follow the approved online/offline page and use a Chinese title",
);

const componentStart = app.indexOf("function O3VnKeyInsight()");
const componentEnd = app.indexOf("\nfunction O3Chapter", componentStart);
const component = app.slice(componentStart, componentEnd);

for (const copy of [
  "越南关键洞察",
  "关键洞察 · 越南",
  "同一个团队，以高本地化能力实现快速联动与响应。",
  "本地化程度高",
  "联动快",
  "响应快",
  "同一个",
  "团队",
]) {
  assert.ok(component.includes(copy), `the Figma insight page must render: ${copy}`);
}
assert.doesNotMatch(
  component,
  /VN Key insight|洞察更贴近本地市场|线上线下协同推进|快速承接市场机会/,
  "the implemented slide must keep the Figma composition concise and translate the visible title",
);
assert.match(
  component,
  /<O3ContentHeader className="h1-o3-vn-insight-header" eyebrow="关键洞察 · 越南" title="越南关键洞察" description="同一个团队，以高本地化能力实现快速联动与响应。"\s*\/>/,
  "the insight title must use the same structured O3 title treatment as the online/offline page",
);
assert.match(
  component,
  /className="h1-o3-vn-insight-wheel"[\s\S]*?className="h1-o3-vn-insight-shapes"/,
  "the three-segment Figma wheel must have an editable vector layer",
);
assert.doesNotMatch(
  component,
  /strokeWidth="240"/,
  "the three insight modules must not overlap into one continuous ring",
);
for (const gradient of ["o3InsightTop", "o3InsightLeft", "o3InsightRight"]) {
  assert.match(
    component,
    new RegExp(`<path[^>]*fill="url\\(#${gradient}\\)"`),
    `${gradient} must be rendered as an independent filled segment`,
  );
}

for (const selector of [
  ".h1-o3-vn-insight",
  ".h1-o3-vn-insight-header",
  ".h1-o3-vn-insight-wheel",
  ".h1-o3-vn-insight-shapes",
  ".h1-o3-vn-insight-center",
]) {
  assert.ok(theme.includes(selector), `${selector} must be styled in the O3 theme`);
}
assert.doesNotMatch(
  theme,
  /\.h1-o3-vn-insight::before/,
  "the insight page must not place a black translucent overlay above the trophy background",
);
assert.match(
  theme,
  /\.h1-o3-vn-insight-wheel\{[^}]*width:900px;[^}]*height:900px;/,
  "the insight wheel must retain the large centered Figma scale",
);
assert.match(
  theme,
  /\.h1-o3-vn-insight-center\{[^}]*width:260px;[^}]*height:260px;/,
  "the translated One Team core must remain visually dominant",
);

console.log(
  "H1 O3 Vietnam key-insight placement, translation, and Figma composition contract passed.",
);
