import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const o2Theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);
const o3Theme = fs.readFileSync(
  path.join(root, "previews", "h1-o3-theme.css"),
  "utf8",
);

// The IB page must be structurally laid out. Absolute positioning caused the
// KPI row to render underneath the H2 plan bar on shorter viewports.
assert.match(
  o2Theme,
  /\.h1-o2-ib-layout\s*\{[^}]*display:\s*grid;[^}]*grid-template-areas:/,
  "IB content must use named grid areas",
);
for (const area of ["proof", "loop", "kpis", "plan"]) {
  assert.match(
    o2Theme,
    new RegExp(`grid-area:\\s*${area};`),
    `IB region ${area} must have a stable grid area`,
  );
}

// Organic growth uses one visual language. Direction is encoded by position
// around a real zero baseline, not by switching negative bars to grey.
assert.ok(app.includes("h1-o2-seo-zero-axis"), "SEO chart needs a zero baseline");
assert.ok(app.includes("h1-o2-seo-brand-logo"), "SEO table needs brand logos");
assert.match(
  app,
  /className=\{value>=0\?"is-positive":"is-negative"\}/,
  "SEO growth bars must expose positive and negative direction",
);
assert.match(
  o2Theme,
  /\.h1-o2-seo-growth-bars i\.is-positive\s*\{[^}]*bottom:\s*50%;/,
  "positive SEO bars must rise from the baseline",
);
assert.match(
  o2Theme,
  /\.h1-o2-seo-growth-bars i\.is-negative\s*\{[^}]*top:\s*50%;/,
  "negative SEO bars must fall from the baseline",
);
assert.doesNotMatch(
  o2Theme,
  /\.h1-o2-seo-growth-bars i\.is-negative\s*\{[^}]*rgba\(255,255,255/,
  "negative SEO bars must not use grey as the sign encoding",
);

// The sentiment evidence page is a readable evidence grid instead of one
// large free-positioned brown surface.
assert.ok(app.includes("is-keywords"), "sentiment keyword evidence needs an explicit grid area");
assert.ok(app.includes("is-trend"), "sentiment trend evidence needs an explicit grid area");
assert.match(
  o3Theme,
  /\.h1-o3-100-stage\s*\{[^}]*display:\s*grid;[^}]*grid-template-areas:/,
  "sentiment evidence must use a responsive grid",
);
assert.doesNotMatch(
  o3Theme,
  /\.h1-o3-100-stage figure\s*\{[^}]*position:\s*absolute/,
  "sentiment evidence images must not be freely positioned",
);

// Frame 102 keeps the five strategic pillars but gives them a compact,
// connected system instead of five oversized isolated columns.
assert.ok(app.includes("h1-o3-102-sequence"), "growth-engine page needs a clear sequence label");
assert.match(
  o3Theme,
  /\.h1-o3-102-pillars::before\s*\{[^}]*height:\s*2px;/,
  "growth-engine cards must share a visual connector",
);
assert.match(
  o3Theme,
  /\.h1-o3-102-pillars section\s*\{[^}]*min-height:\s*0;/,
  "growth-engine cards must avoid forced tall empty columns",
);

console.log("Combined visual regression checks passed.");
