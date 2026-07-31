import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile("previews/vantage-h1-immersive.html", "utf8");

assert.match(
  shell,
  /\/vendor\/vantage-runtime\.js\?v=20260731-editor-keyboard-v1/,
  "the shell media runtime must keep its current cache key",
);
assert.doesNotMatch(
  shell,
  /warmPresentationMedia\(\)/,
  "sign-in must not download the complete 2.2GB video manifest",
);
const report = await readFile("index.html", "utf8");
assert.match(
  report,
  /\/vendor\/vantage-runtime\.js\?v=20260731-editor-keyboard-v1/,
  "the report must load the progressive media runtime with a fresh cache key",
);
assert.match(
  report,
  /progressivelyWarmPresentationMedia\(\{[\s\S]*?paths:\s*O1_TVC_PRELOAD_PATHS[\s\S]*?signal:\s*controller\.signal/,
  "the authenticated report must start the bounded O1 TVC warm-up queue",
);
assert.match(
  report,
  /const O1_TVC_PRELOAD_PATHS = \[[\s\S]*?ferrari-co-brand\.mp4[\s\S]*?public-good\.mp4[\s\S]*?\];/,
  "the progressive warm-up list must be explicit and keep the largest public-good film last",
);

console.log("H1 video loading policy uses bounded progressive O1 TVC warm-up.");
