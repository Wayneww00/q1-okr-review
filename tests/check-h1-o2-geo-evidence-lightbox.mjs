import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
for (const asset of [
  "geo-evidence-overall.jpg",
  "geo-evidence-chatgpt.jpg",
  "geo-evidence-gemini.jpg",
  "geo-evidence-ai-overview.jpg",
]) {
  const evidencePath = path.join(root, "previews", "assets", "o2", asset);
  assert.ok(
    fs.existsSync(evidencePath) && fs.statSync(evidencePath).size > 30_000,
    `the GEO baseline page must ship the preserved PPT page 80 evidence image: ${asset}`,
  );
}

for (const platform of ["Overall", "ChatGPT", "Gemini", "AI Overview"]) {
  assert.match(
    app,
    new RegExp(`O2_GEO_EVIDENCE[\\s\\S]*?name:"${platform.replace(" ", "\\s")}"`),
    `the GEO evidence strip must include ${platform}`,
  );
}

assert.match(
  app,
  /function O2GeoEvidenceLightbox\([\s\S]*?role="dialog"[\s\S]*?aria-modal="true"/,
  "the GEO evidence preview must render as a modal dialog",
);
for (const control of ["关闭大图", "查看上一张", "查看下一张"]) {
  assert.ok(
    app.includes(`aria-label="${control}"`),
    `the GEO evidence preview must provide the ${control} control`,
  );
}
assert.match(
  app,
  /function O2GeoBaseline\(\)[\s\S]*?h1-o2-geo-evidence-strip[\s\S]*?aria-haspopup="dialog"[\s\S]*?setEvidenceIndex/,
  "the GEO baseline page must expose four clickable evidence thumbnails",
);
assert.match(
  app,
  /event\.key==='Escape'[\s\S]*?event\.key==='ArrowLeft'[\s\S]*?event\.key==='ArrowRight'/,
  "the GEO evidence lightbox must support Escape and left/right keyboard navigation",
);

assert.match(
  theme,
  /\.h1-o2-geo-evidence-strip\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4,\s*1fr\)/,
  "the four evidence screenshots must render in one horizontal row",
);
assert.match(
  theme,
  /\.h1-o2-geo-evidence-lightbox\s*\{[\s\S]*?position:\s*fixed[\s\S]*?inset:\s*0/,
  "the evidence lightbox must cover the full report viewport",
);
assert.match(
  theme,
  /\.h1-o2-geo-evidence-image\s*\{[\s\S]*?background-size:\s*cover/,
  "thumbnail and modal images must preserve the PPT page 80 evidence crop",
);

console.log("H1 O2 GEO page 80 evidence lightbox contract passed.");
