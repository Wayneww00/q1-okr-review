import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-o1-complete-theme.css"),
  "utf8",
);

const componentStart = app.indexOf("function OkrBrandSystemPage");
const componentEnd = app.indexOf(
  "function OkrBrandResultsPage",
  componentStart,
);
assert.ok(componentStart >= 0 && componentEnd > componentStart);
const component = app.slice(componentStart, componentEnd);

for (const text of [
  "ONE BRAND ONE SYSTEM",
  "将Vantage建设成全球一线品牌",
  "从分散表达,走向统一品牌资产",
  "Build a premium and consistent visual-verbal system across every market.",
  "从单点传播,走向线上线下一体化体验",
  "Connect campaigns, products and touchpoints into one coherent experience.",
  "从一次性项目,走向全球可复制的品牌经营系统",
  "Turn isolated execution into a scalable brand operating model for global growth.",
]) {
  assert.ok(
    component.includes(text),
    `the brand-system page must expose source-editable text: ${text}`,
  );
}

assert.match(
  component,
  /className="h1-okr-title-group" data-editor-ignore/,
  "the native title layer must remain source-only and outside Supabase正文 editing",
);
assert.match(
  component,
  /className="h1-okr-insight-rail"[\s\S]*?data-editor-ignore/,
  "the native card copy must remain source-only and outside Supabase正文 editing",
);
assert.match(
  component,
  /className="h1-okr-outline-title" aria-hidden="true">\s*ONE BRAND ONE SYSTEM\s*<\/div>/,
  "the outlined English title must be real HTML text",
);
assert.match(
  component,
  /<h1 id="h1-okr-title"[\s\S]*?<span>将<\/span><span className="h1-okr-title-latin">Vantage<\/span><span>建设成全球一线品牌<\/span>/,
  "the Chinese headline must be real HTML text while preserving the Latin type role",
);
assert.doesNotMatch(
  component,
  /p25-foreground-clean\.png|h1-okr-figma-foreground-layer/,
  "the page must not retain a rasterized foreground text layer",
);

for (const asset of [
  "h1-okr-p25-card-gold-340-222.svg",
  "h1-okr-p25-card-ivory-340-236.svg",
  "h1-okr-p25-card-charcoal-340-250.svg",
  "h1-okr-p25-icon-share-340-243.svg",
  "h1-okr-p25-icon-global-340-253.svg",
]) {
  assert.ok(
    app.includes(asset),
    `the non-text card or icon artwork must remain unchanged: ${asset}`,
  );
}

assert.match(
  component,
  /className="h1-okr-page-number" aria-hidden="true">[\s\S]*?String\(index\+1\)[\s\S]*?String\(count\)/,
  "the existing O1 page-number layer must remain unchanged",
);
assert.match(
  theme,
  /\.h1-okr-outline-title\s*\{[\s\S]*?-webkit-text-stroke:\s*\.923207px rgba\(255,255,255,\.7\)/,
  "the native English title must preserve its outlined CSS treatment",
);
assert.doesNotMatch(
  theme,
  /\.h1-okr-outline-title\s*>\s*span[\s\S]*?h1-one-brand-one-system-outline/,
  "the outlined title must not fall back to a raster background",
);

console.log("H1 O1 brand-system native text static contract passed.");
