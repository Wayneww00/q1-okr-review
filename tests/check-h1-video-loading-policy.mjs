import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile("previews/vantage-h1-immersive.html", "utf8");

assert.match(
  shell,
  /\/vendor\/vantage-runtime\.js\?v=20260731-editor-hud-v6-media/,
  "the media resolver fix must use a fresh browser cache key",
);
assert.doesNotMatch(
  shell,
  /warmPresentationMedia\(\)/,
  "sign-in must not download the complete 690MB video manifest",
);
assert.doesNotMatch(
  shell,
  /startSilentPresentationWarmup/,
  "the shell must load presentation videos only when their scene or modal is opened",
);

console.log("H1 video loading policy is on-demand only.");
