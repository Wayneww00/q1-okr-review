import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const report = await readFile("index.html", "utf8");
const shell = await readFile("previews/vantage-h1-immersive.html", "utf8");
const runtime = await readFile("src/vantage-browser-runtime.mjs", "utf8");

const reportVideoCount = report.match(/<video\b/g)?.length || 0;
const reportTypedSourceCount =
  report.match(/<source\b[^>]*type="video\/mp4"/g)?.length || 0;
assert.equal(reportVideoCount, 4, "the report video inventory must stay explicit");
assert.equal(
  reportTypedSourceCount,
  reportVideoCount,
  "every report video must declare an MP4 source so Safari does not depend on MIME sniffing",
);

const shellVideoCount = shell.match(/<video\b/g)?.length || 0;
const shellTypedSourceCount =
  shell.match(/<source\b[^>]*type="video\/mp4"/g)?.length || 0;
assert.equal(shellVideoCount, 3, "the presentation shell video inventory must stay explicit");
assert.equal(
  shellTypedSourceCount,
  shellVideoCount,
  "every presentation-shell video must declare an MP4 source",
);

assert.match(
  shell,
  /VantageBrowserRuntime\.setVideoSource\([\s\S]*?resolveMediaUrl\(video\.dataset\.src\)/,
  "deferred shell videos must use the typed-source runtime helper",
);
assert.match(
  runtime,
  /video\.preload = "metadata"/,
  "background warming must request metadata instead of downloading complete films",
);
assert.match(
  runtime,
  /addEventListener\("loadedmetadata", onReady/,
  "metadata warming must settle as soon as the MP4 header is available",
);
assert.doesNotMatch(
  runtime,
  /canplaythrough/,
  "background warming must not wait for an unreliable whole-film canplaythrough estimate",
);

console.log("H1 Safari video delivery contract passed.");
