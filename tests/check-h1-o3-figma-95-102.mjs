import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o3-theme.css"),
  "utf8",
);

for (let frame = 95; frame <= 102; frame += 1) {
  assert.match(
    app,
    new RegExp(`data-figma-frame="${frame}"`),
    `Figma frame ${frame} must have an explicit coded implementation`,
  );
  const proof = path.join(
    root,
    "previews",
    "assets",
    "o3",
    "figma-95-102",
    `${frame}.png`,
  );
  assert.ok(fs.existsSync(proof), `Figma frame ${frame} proof must be retained`);
  assert.ok(fs.statSync(proof).size > 500_000, `${frame}.png must be full quality`);
}

for (const fact of [
  "13,170",
  "+8,021",
  "Copytrading",
  "7×24黄金交易",
  "+1,511%",
  "10,217",
  "123K",
  "62.7%",
  "热门内容亮点",
  "营销与销售形成闭环",
  "Facebook 依然是主要的增长驱动力",
  "品牌可见性21%位于第一梯队",
  "REGISTER",
  "+1,511%",
]) {
  assert.ok(app.includes(fact), `Figma 95–102 fact must be preserved: ${fact}`);
}

for (const className of [
  "h1-o3-figma-page",
  "h1-o3-95-market-card",
  "h1-o3-95-keyword-card",
  "h1-o3-95-growth-card",
  "h1-o3-96-evidence-left",
  "h1-o3-96-evidence-right",
  "h1-o3-97-evidence-grid",
  "h1-o3-99-proof-grid",
  "h1-o3-100-sentiment-stage",
  "h1-o3-101-facebook-proof",
  "h1-o3-102-pillars",
  "h1-o3-slope-chart",
  "h1-o3-code-pie",
]) {
  assert.ok(
    app.includes(className) || theme.includes(className),
    `${className} must be part of the coded Figma implementation`,
  );
}

assert.ok(
  (app.match(/<H1SourceImage\b/g) || []).length >= 11,
  "Figma/PPT evidence must remain clickable and zoomable",
);
assert.doesNotMatch(
  app,
  /<img[^>]+figma-95-102\/(?:95|96|97|98|99|100|101|102)\.png/,
  "full Figma frames must never replace the coded page UI",
);
const exactTargetSource = app.slice(
  app.indexOf("function O3Seo"),
  app.indexOf("function O3CopyTrade"),
);
assert.doesNotMatch(
  exactTargetSource,
  /<O3FigmaProof\b/,
  "Figma proof badges are not part of frames 95–102 and must not render",
);
assert.doesNotMatch(
  exactTargetSource,
  /h1-o3-95-kpis/,
  "frame 95 must use the Figma two-card plus bottom-summary composition",
);
assert.match(
  theme,
  /\.h1-o3-figma-page\s*\{[\s\S]*?width:\s*1920px;[\s\S]*?height:\s*1080px;/,
  "Figma pages must use an exact 1920×1080 artboard",
);
assert.match(
  theme,
  /\.h1-o3-figma-card\s*\{[\s\S]*?backdrop-filter:\s*blur\(/,
  "Figma cards must retain the amber glass treatment",
);
for (const [selector, geometry] of [
  [".h1-o3-95-market-card", ["left:155px", "top:248px", "width:716px", "height:517px"]],
  [".h1-o3-95-keyword-card", ["left:908px", "top:248px", "width:837px", "height:517px"]],
  [".h1-o3-95-growth-card", ["left:155px", "top:806px", "width:1590px", "height:218px"]],
  [".h1-o3-98-table", ["left:148px", "top:397px", "width:1048px", "height:458px"]],
  [".h1-o3-98-pie", ["left:1232px", "top:397px", "width:557px", "height:458px"]],
  [".h1-o3-102-pillars", ["left:160px", "top:322px", "width:1600px", "height:635px"]],
]) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const declaration of geometry) {
    assert.match(
      theme,
      new RegExp(`${escaped}\\s*\\{[^}]*${declaration.replace(":", "\\s*:\\s*")}`),
      `${selector} must preserve Figma geometry: ${declaration}`,
    );
  }
}
assert.match(
  theme,
  /\.h1-o3-figma-page\s*\{[^}]*font-family:\s*"Gilroy","Noto Sans SC"/,
  "frames 95–102 must use the Figma-matched Gilroy/Noto Sans SC stack",
);
assert.match(
  theme,
  /\.h1-o3-figma-card\s*\{[^}]*background:\s*linear-gradient\([^}]*rgba\(111,57,18,\.54\)/,
  "Figma cards must use the measured translucent amber glass surface instead of the generic red card",
);

assert.match(
  app,
  /function O3ContentHeader\(\{eyebrow,title,description,className=""\}\)/,
  "all Vietnam content pages must share one title component",
);
assert.match(
  app,
  /function O3PageHeader\(\{page\}\)\{[\s\S]*?<O3ContentHeader/,
  "standard O3 pages must use the shared Vietnam title component",
);
assert.match(
  app,
  /function O3FigmaTitle\(\{eyebrow,title,subtitle\}\)\{[\s\S]*?<O3ContentHeader/,
  "Figma-coded O3 pages must use the shared Vietnam title component",
);
assert.match(
  app,
  /function O3CopyTrade\(\)\{[\s\S]*?<O3ContentHeader/,
  "Copy Trade must use the shared Vietnam title component",
);

console.log("H1 O3 Figma 95–102 coded-layout contract passed.");
