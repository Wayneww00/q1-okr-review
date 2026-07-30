import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(
  path.join(root, "previews/h1-figma-racing-theme.css"),
  "utf8",
);

for (const code of ["vn", "in", "th", "ph", "za"]) {
  assert.match(
    app,
    new RegExp(`previews/assets/o2/flags/${code}\\.svg`),
    `the SEO/GEO pages must render the real ${code.toUpperCase()} flag asset`,
  );
  assert.ok(
    fs.existsSync(path.join(root, `previews/assets/o2/flags/${code}.svg`)),
    `the ${code.toUpperCase()} flag asset must exist locally`,
  );
}

for (const brand of ["vantage", "xm", "pepperstone", "exness", "capital-com"]) {
  assert.match(
    app,
    new RegExp(`previews/assets/o2/brands/${brand}\\.png`),
    `the SEO/GEO pages must render the ${brand} brand mark`,
  );
  assert.ok(
    fs.existsSync(path.join(root, `previews/assets/o2/brands/${brand}.png`)),
    `the ${brand} brand mark must exist locally`,
  );
}

assert.match(
  css,
  /\.h1-o2-real-flag/,
  "country flags must have a shared responsive presentation rule",
);
assert.match(
  css,
  /\.h1-o2-seo-brand-logo img/,
  "brand marks must be rendered as images rather than invented initials",
);

console.log("H1 O2 real flags and logos contract passed.");
