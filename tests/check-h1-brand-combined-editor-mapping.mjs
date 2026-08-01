import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const index = readFileSync(resolve(root, "index.html"), "utf8");

assert.match(
  index,
  /id:11, layoutType:"brand_voice_search_combined", editorRevision:"brand-voice-combined-semantic-v3"/,
  "the combined brand page must isolate stale index-based editor content",
);

const shellSource = index.slice(
  index.indexOf("function H1DataModulePageShell"),
  index.indexOf("function H1RetailGrowthPage"),
);
for (const key of [
  "brand-combined-header-eyebrow",
  "brand-combined-header-title",
  "brand-combined-header-subtitle",
  "brand-combined-header-source",
  "brand-combined-conclusion-label",
  "brand-combined-conclusion-copy",
  "brand-combined-takeaway",
]) {
  assert.ok(shellSource.includes(key), `page shell must expose stable key ${key}`);
}

const chartSource = index.slice(
  index.indexOf("function H1BrandVoiceSearchCombinedChart"),
  index.indexOf("function H1SocialSovTrendChart"),
);
for (const key of [
  "brand-combined-voice-title",
  "brand-combined-voice-subtitle",
  "brand-combined-voice-change",
  "brand-combined-share-label",
  "brand-combined-share-value",
  "brand-combined-share-copy",
  "brand-combined-share-competitor",
  "brand-combined-sentiment-label",
  "brand-combined-sentiment-value",
  "brand-combined-sentiment-copy",
  "brand-combined-competition-label",
  "brand-combined-competition-value",
  "brand-combined-competition-copy",
  "brand-combined-axis-label",
  "brand-combined-comparison",
  "brand-combined-reputation-title",
  "brand-combined-reputation-conclusion",
]) {
  assert.ok(chartSource.includes(key), `combined chart must expose stable key ${key}`);
}

assert.match(
  chartSource,
  /data-vantage-text-key=\{`brand-combined-reputation-keyword-\$\{index\+1\}`\}/,
  "each reputation keyword must keep a stable semantic editor key",
);

assert.match(
  chartSource,
  /<H1BrandSearchFourSeriesChart data=\{data\.searchMetrics\} editorKey="brand-combined-search-title"\/>/,
  "the organic traffic title must use a stable semantic editor key",
);

console.log("H1 combined brand page semantic editor mapping contract passed.");
