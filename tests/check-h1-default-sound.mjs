import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const shell = fs.readFileSync(
  path.join(root, "previews/vantage-h1-immersive.html"),
  "utf8"
);

assert.match(
  shell,
  /let soundOn = true;/,
  "The H1 presentation must enter with sound enabled by default."
);

assert.match(
  shell,
  /const applySoundState = \(\) => \{[\s\S]*?const isCurrent = video\.closest\('\.scene'\) === scenes\[activeIndex\];[\s\S]*?video\.muted = !soundOn \|\| !isCurrent;[\s\S]*?sound-wave[\s\S]*?soundOn \? '' : 'none'/,
  "Only the active scene video may be audible while the sound button remains globally enabled."
);

assert.match(
  shell,
  /applySoundState\(\);\s*activate\(0\);/,
  "The sound state must be applied before the opening scene begins playback."
);

assert.match(
  shell,
  /const unlockSoundOnInteraction = \(\) => \{[\s\S]*?videos\.forEach\(video => \{ video\.muted = true; \}\);[\s\S]*?currentVideo\.muted = false;[\s\S]*?currentVideo\?\.play\(\)/,
  "A user interaction fallback must restore sound when autoplay-with-audio is browser-blocked."
);

assert.match(
  shell,
  /const soundUnlockEvents = \['pointerdown','pointerup','mousedown','click','keydown','touchend'\];[\s\S]*?soundUnlockEvents\.forEach\(type =>[\s\S]*?unlockSoundOnInteraction/,
  "The first common user interaction must unlock default audio."
);

assert.match(
  shell,
  /else \{\s*video\.pause\(\);\s*video\.muted = true;\s*\}/,
  "A video that leaves the current scene must pause and become silent immediately."
);

assert.match(
  shell,
  /video\.play\(\)\.catch\(\(\) => \{\s*if \(!soundOn\) return;\s*video\.muted = true;\s*video\.play\(\)\.catch\(\(\) => \{\}\);\s*\}\)/,
  "If audible autoplay is blocked, the active film must continue muted until normal user interaction unlocks sound."
);

assert.doesNotMatch(
  shell,
  /id="audioPrompt"|点击开启声音|audio-permission-prompt|showAudioPrompt|hideAudioPrompt/,
  "The deck must not add a separate sound-unlock prompt."
);

console.log("H1 default sound contract passed.");
