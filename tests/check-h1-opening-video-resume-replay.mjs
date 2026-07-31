import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync("previews/vantage-h1-immersive.html", "utf8");

const openingTag = page.match(/<video id="openingVideo"[\s\S]*?<\/video>/)?.[0];
assert.ok(openingTag, "the opening video element must exist");
assert.doesNotMatch(
  openingTag,
  /\sloop(?:\s|>)/,
  "the opening video must not loop because it should hold on its final frame",
);

assert.match(
  page,
  /let openingPlaybackCompleted = false;/,
  "the deck must distinguish a completed opening from a mid-play pause",
);
assert.match(
  page,
  /openingVideo\.addEventListener\('ended',[\s\S]*?openingPlaybackCompleted = true;[\s\S]*?openingVideo\.pause\(\);/,
  "when the opening finishes it must stay paused on the final frame",
);
assert.match(
  page,
  /const playSceneVideo = \(video\) => \{[\s\S]*?if \(video === openingVideo && openingPlaybackCompleted\) return;/,
  "re-activating the current scene must not restart a completed opening",
);
assert.match(
  page,
  /const unlockSoundOnInteraction = event => \{[\s\S]*?if \(currentVideo === openingVideo && openingPlaybackCompleted\) return;/,
  "a sound interaction must not restart a completed opening before the user leaves",
);
assert.match(
  page,
  /const returningToCompletedOpening = index === 0[\s\S]*?previousIndex !== 0[\s\S]*?openingPlaybackCompleted;/,
  "a completed opening must only reset after the user leaves and returns",
);
assert.match(
  page,
  /if \(video === openingVideo && returningToCompletedOpening\) \{[\s\S]*?video\.currentTime = 0;[\s\S]*?openingPlaybackCompleted = false;/,
  "returning after completion must restart the opening from the beginning",
);
assert.doesNotMatch(
  page,
  /if \(video === openingVideo[\s\S]{0,240}?video\.currentTime = 0;[\s\S]{0,240}?returningToCompletedOpening/,
  "returning mid-play must not reset currentTime before the completion check",
);

console.log("H1 opening-video resume/replay contract passed.");
