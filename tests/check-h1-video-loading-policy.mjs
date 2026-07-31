import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile("previews/vantage-h1-immersive.html", "utf8");

assert.match(
  shell,
  /\/vendor\/vantage-runtime\.js\?v=20260731-safari-video-v1/,
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
  /\/vendor\/vantage-runtime\.js\?v=20260731-safari-video-v1/,
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
const preloadBlock = report.match(
  /const O1_TVC_PRELOAD_PATHS = \[([\s\S]*?)\];/,
)?.[1] || "";
const preloadPaths = [...preloadBlock.matchAll(/'([^']+\.mp4(?:\?[^']*)?)'/g)]
  .map((match) => match[1].split("?", 1)[0]);
assert.equal(
  preloadPaths.at(-2),
  "previews/assets/o1-complete/tvc-library/cfd-public-good-web.mp4",
  "the second-largest new public-good film must warm immediately before the largest film",
);
assert.equal(
  preloadPaths.at(-1),
  "previews/assets/o1-complete/tvc-library/public-good.mp4",
  "the largest O1 public-good film must remain last in the serial warm-up queue",
);

console.log("H1 video loading policy uses bounded progressive O1 TVC warm-up.");
