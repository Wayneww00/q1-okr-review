import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const shellPath = resolve(root, "previews/vantage-h1-immersive.html");
const modulePath = resolve(root, "previews/ai-data-products/index.html");
const assetDir = resolve(root, "previews/ai-data-products/assets");
const shell = readFileSync(shellPath, "utf8");

assert.ok(
  existsSync(modulePath),
  "the complete AI data products module must be copied",
);
assert.ok(
  existsSync(assetDir),
  "the AI module asset directory must be copied",
);
const expectedAssets = [
  "ad-compliance-monitor-white.png",
  "ai-news-bot-clean-key.png",
  "ai-news-bot-clean.png",
  "ai-news-bot-demo.png",
  "cockpit-laptop-white.png",
  "cockpit-laptop.png",
  "cockpit-product-progress-plan-left.png",
  "cockpit-product-progress-plan-no-goal-icon.png",
  "cockpit-product-progress-plan.png",
  "cross-platform-content-monitor.png",
  "eih-dashboard-monitor.png",
  "eih-dashboard.png",
  "hygenie-demo-white-solid.png",
  "hygenie-demo-white.png",
  "marketing-command-bg.png",
  "reddit-review-analysis-black.png",
  "sentiment-monitor-dashboard.png",
  "sentiment-monitor.png",
  "toolbox-dashboard-shadowed-v2.png",
  "toolbox-dashboard-shadowed-v3.png",
  "toolbox-dashboard-shadowed-v4.png",
  "toolbox-dashboard-shadowed.png",
  "toolbox-dashboard-white.png",
  "toolbox-dashboard.png",
  "trend-monitor-platform-black.png",
  "trend-monitor-platform-v2-black.png",
  "trustpilot-review-analysis-black.png",
  "vantage-insight-demo.png",
].sort();
assert.deepEqual(
  readdirSync(assetDir).sort(),
  expectedAssets,
  "the exact 28 source asset filenames must be preserved",
);

const sceneLabels = [
  ...shell.matchAll(
    /<section\b[^>]*class="[^"]*\bscene\b[^"]*"[^>]*data-label="([^"]+)"/g,
  ),
]
  .map((match) => match[1])
  .filter(
    (label) =>
      ![
        "Executive Snapshot",
        "Retail Performance",
        "Paid Ads Efficiency",
      ].includes(label),
  );

assert.deepEqual(sceneLabels, [
  "Opening Film",
  "H1 Review",
  "Full Report",
  "AI Data Products",
  "Q3 Outlook",
  "Closing Film",
]);

const aiScene = shell.match(
  /<section\b[^>]*class="[^"]*\bai-products-scene\b[^"]*"[\s\S]*?<\/section>/,
)?.[0];
assert.ok(aiScene, "the shell must contain one isolated AI products scene");
assert.match(aiScene, /data-src="ai-data-products\/index\.html"/);
assert.doesNotMatch(
  aiScene,
  /(?:^|\s)src="ai-data-products\/index\.html"/,
  "the AI iframe must not load before the AI scene is entered",
);
assert.match(aiScene, /04 <small>\/ 06<\/small>/);
assert.match(shell, /Continue to AI Data Products&nbsp;&nbsp;→/);
assert.match(shell, /05 <small>\/ 06<\/small>/);
assert.match(shell, /06 <small>\/ 06<\/small>/);
assert.match(shell, /const ensureAiProductsFrameSource = \(\) =>/);
assert.match(shell, /function prepareAiProductsNavigation\(\)/);
assert.match(
  shell,
  /document\.querySelector\('\[data-next-scene\]'\)\.addEventListener\('click', \(\) => \{\s*ensureAiProductsFrameSource\(\);\s*aiProductsScene\?\.scrollIntoView/,
);
assert.match(
  shell,
  /if \(advanceProducts\(direction, distance\)\) return;/,
);
assert.match(
  shell,
  /if \(exitArmedDirection === direction\)[\s\S]*?moveDeckFromAiProducts\(direction\)/,
);
assert.match(
  shell,
  /armOuterDeckExit\(direction\)/,
);
assert.match(
  shell,
  /if \(isProductInteraction\(\) \|\| event\.defaultPrevented\) return;/,
);
assert.match(
  shell,
  /if \(Math\.abs\(distanceX\) >= Math\.abs\(distanceY\)\) return;/,
);
assert.match(
  shell,
  /if \(!advanceProducts\(direction\)\) moveDeckFromAiProducts\(direction\)/,
);

const moduleSource = readFileSync(modulePath, "utf8");
assert.match(moduleSource, /id="products"/);
assert.match(moduleSource, /id="tool-modal"/);
assert.equal((moduleSource.match(/target="_blank"/g) || []).length, 10);

console.log("H1 AI data products static integration contract passed.");
