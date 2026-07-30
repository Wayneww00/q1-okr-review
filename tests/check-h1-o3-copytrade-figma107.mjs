import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(
  path.join(root, "previews/h1-o3-theme.css"),
  "utf8",
);

const component = app.match(
  /function O3CopyTrade\(\)\{[\s\S]*?\n\}\n\nconst O3_VIDEOS=/,
)?.[0];
assert.ok(component, "the O3 Copy Trade page component must exist");

for (const text of [
  "全案营销 本地化的成功案例",
  "第一时间抓住业务本地竞争窗口期",
  "抓住Exness退出市场时间窗口期",
  "第一时间承接用户流量",
  "+152.1%",
  "活跃用户数",
  "+128.5%",
  "跟单交易笔数",
  "91.5%",
  "新开户交易额占比",
  "186K",
  "本地化内容曝光",
  "本地头部KOL传播",
  "本地头部PR背书",
  "世界杯主题UGC破圈认知",
]) {
  assert.ok(component.includes(text), `PPT 17 content must retain: ${text}`);
}

assert.match(
  component,
  /className="h1-o3-copytrade-figma107"/,
  "the page must use the dedicated Figma 107 two-column composition",
);
assert.match(
  component,
  /className="h1-o3-copytrade-strategy"/,
  "the left strategy panel must remain a distinct visual block",
);
assert.match(
  component,
  /className="h1-o3-copytrade-evidence"/,
  "the right evidence panel must remain a distinct visual block",
);

for (const group of ["kol", "pr", "ugc"]) {
  assert.match(
    component,
    new RegExp(`copytrade-figma107/${group}/`),
    `${group.toUpperCase()} must use original PPT image assets`,
  );
}
assert.match(
  component,
  /<H1SourceImage\b/g,
  "every evidence image must retain click-to-enlarge behavior",
);

assert.match(
  css,
  /\.h1-o3-copytrade-figma107\{[^}]*display:grid[^}]*grid-template-columns:/,
  "Figma 107 must be implemented as a coded two-column grid",
);
assert.match(
  css,
  /\.h1-o3-copytrade-evidence-row/,
  "the three evidence rows must have a reusable coded layout",
);
assert.match(
  css,
  /\.h1-o3-copytrade-evidence\{[^}]*grid-template-rows:repeat\(3,minmax\(0,1fr\)\)/,
  "the KOL, PR, and UGC evidence rows must use three equal-height Figma tracks",
);

console.log("H1 O3 Copy Trade Figma 107 contract passed.");
