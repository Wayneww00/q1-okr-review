import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews/h1-figma-racing-theme.css"),
  "utf8",
);
const shell = fs.readFileSync(
  path.join(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);

assert.ok(
  app.includes('title:"SEO技术基础全面提升，达到行业顶级水平"'),
  "the slide title must match the PPT copy exactly",
);
assert.ok(
  app.includes(
    'description:"Google Lighthouse评分各项指标接近满分，较Exness高出27分。"'
  ),
  "the slide subtitle must match the PPT copy exactly",
);
assert.ok(
  app.includes(
    'data-editor-ignore={page.layout==="seo-technical"||undefined}',
  ),
  "saved text revisions must not overwrite the PPT title and subtitle",
);

for (const value of [
  "−61%",
  "+194%",
  "6.0s → 2.4s",
  "+37.2%",
  "−24%",
  "−11.1%",
]) {
  assert.ok(app.includes(value), `missing PPT metric ${value}`);
}

for (const asset of [
  "seo-tech-vantage.jpeg",
  "seo-tech-exness.jpeg",
  "seo-tech-vantage-logo.png",
  "seo-tech-exness-logo.png",
]) {
  assert.ok(
    fs.existsSync(path.join(root, "previews/assets/o2", asset)),
    `missing PPT asset ${asset}`,
  );
  assert.ok(app.includes(asset), `the SEO technical component must use ${asset}`);
}

assert.match(
  app,
  /<figure className="h1-o2-card is-vantage">[\s\S]*?h1-o2-seo-tech-brand[\s\S]*?seo-tech-vantage-logo\.png/,
);
assert.match(
  app,
  /<figure className="h1-o2-card is-exness">[\s\S]*?h1-o2-seo-tech-brand[\s\S]*?seo-tech-exness-logo\.png/,
);

const technicalRule = theme.match(
  /\.h1-o2-page\.is-seo-technical \.h1-o2-seo-technical\s*\{([\s\S]*?)\}/,
)?.[1] ?? "";
assert.match(technicalRule, /top:\s*272px/);
assert.match(technicalRule, /left:\s*100px/);
assert.match(technicalRule, /width:\s*1706px/);
assert.match(technicalRule, /grid-template-rows:\s*455px 319px/);

const imageRule = theme.match(
  /\.h1-o2-page\.is-seo-technical \.h1-o2-seo-tech-evidence img:not\(\.h1-o2-seo-tech-brand\)\s*\{([\s\S]*?)\}/,
)?.[1] ?? "";
assert.match(imageRule, /position:\s*absolute/);
assert.match(imageRule, /object-fit:\s*fill/);
assert.match(
  theme,
  /\.h1-o2-page\.is-seo-technical \.is-vantage \.h1-source-image-trigger > img\s*\{[\s\S]*?left:\s*-2\.906%[\s\S]*?width:\s*104\.759%[\s\S]*?height:\s*151\.966%/,
  "the Vantage screenshot must use the PPT source crop",
);
assert.match(
  theme,
  /\.h1-o2-page\.is-seo-technical \.is-exness \.h1-source-image-trigger > img\s*\{[\s\S]*?top:\s*-9\.565%[\s\S]*?left:\s*-3\.04%[\s\S]*?width:\s*105\.476%[\s\S]*?height:\s*164\.468%/,
  "the Exness screenshot must use the PPT source crop",
);

assert.match(
  theme,
  /\.h1-o2-page\.is-seo-technical \.h1-source-image-zoom\s*\{[\s\S]*?display:\s*none/,
);
assert.match(
  theme,
  /\.h1-o2-page\.is-seo-technical \.h1-o2-seo-tech-metrics strong\s*\{[\s\S]*?color:\s*var\(--h1-o2-amber\)/,
  "bottom values must use the O2 amber token instead of green",
);
assert.match(
  theme,
  /\.h1-o2-page\.is-seo-technical \.h1-o2-seo-tech-metrics\s*\{[\s\S]*?border-top:\s*9px solid var\(--h1-o2-gold\)/,
);

const expectedCacheKey = "20260731-h1-growth-release-v1";
assert.ok(app.includes(`h1-figma-racing-theme.css?v=${expectedCacheKey}`));
assert.ok(
  [...shell.matchAll(new RegExp(
    `h1-figma-racing-theme\\.css\\?v=${expectedCacheKey}`,
    "g",
  ))].length >= 2,
  "the immersive shell must refresh both theme references",
);

console.log("H1 O2 SEO technical PPT restoration contract passed.");
