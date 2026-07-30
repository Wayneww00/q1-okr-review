import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const theme = readFileSync(
  resolve(root, "previews/h1-o3-theme.css"),
  "utf8",
);
const sentimentSource = app.slice(
  app.indexOf("function O3SentimentBrandCard"),
  app.indexOf("function O3Highlights"),
);

assert.match(
  app,
  /function O3SentimentBrandCard\(\{brand,tone,positive,count,delta,metrics\}\)/,
  "sentiment comparison must use a shared brand-card component",
);
assert.match(
  sentimentSource,
  /<O3SentimentBrandCard brand="VANTAGE" tone="vantage" positive="62\.7%" count="1\.49K" delta="领先 Exness 15\.5pp"/,
  "Vantage card must expose its headline comparison",
);
assert.match(
  sentimentSource,
  /<O3SentimentBrandCard brand="EXNESS" tone="exness" positive="47\.2%" count="1\.1K" delta="负面占比为 Vantage 2\.6×"/,
  "Exness card must expose the risk comparison",
);
assert.doesNotMatch(
  sentimentSource,
  /<O3Donut\b/,
  "the two brand cards must use the same comparable layout",
);
assert.match(
  sentimentSource,
  /<div className="h1-o3-figma-page h1-o3-figma-100" data-figma-frame="100" data-editor-ignore>/,
  "the revised sentiment page must not inherit stale text-editor mappings",
);

for (const metric of [
  '["正面","1.49K","62.7%","62.7"]',
  '["中性","766","32.3%","32.3"]',
  '["负面","116","4.89%","4.89"]',
  '["未评级","116","4.89%","4.89"]',
  '["正面","1.1K","47.2%","47.2"]',
  '["中性","934","40.2%","40.2"]',
  '["负面","292","12.6%","12.6"]',
]) {
  assert.ok(
    sentimentSource.includes(metric),
    `sentiment card must preserve ${metric}`,
  );
}

for (const selector of [
  ".h1-o3-100-brand-card",
  ".h1-o3-100-brand-card.is-vantage",
  ".h1-o3-100-brand-card.is-exness",
  ".h1-o3-100-brand-hero",
  ".h1-o3-100-brand-row",
]) {
  assert.ok(theme.includes(selector), `${selector} must be styled`);
}
assert.match(
  theme,
  /\.h1-o3-100-brand-card h4\{[^}]*font-size:22px/,
  "brand names must be presentation-readable",
);
assert.match(
  theme,
  /\.h1-o3-100-brand-hero strong\{[^}]*font-size:38px/,
  "primary sentiment percentages must be visually dominant",
);
assert.match(
  theme,
  /\.h1-o3-100-brand-row\{[^}]*font-size:13px/,
  "sentiment row copy must remain readable within the compact cards",
);

console.log("H1 O3 sentiment brand card layout contract passed.");
