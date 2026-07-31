import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const formal = await readFile(
  resolve("previews/vantage-h1-immersive.html"),
  "utf8",
);

assert.match(
  formal,
  /id="loginGate"[\s\S]*?class="login-logo"[\s\S]*?alt="Vantage"[\s\S]*?H1 2026 Review[\s\S]*?Authorized Access Only/,
  "the formal H1 page must use the approved Figma Vantage login presentation",
);

assert.match(
  formal,
  /id="loginUsername"[\s\S]*?value="vantage"[\s\S]*?id="loginPassword"[\s\S]*?value="vantage"/,
  "the login must retain the confirmed default credentials",
);

assert.match(
  formal,
  /id="loginSubmit"[\s\S]*?>\s*Sign In\s*</,
  "the login must expose a clear sign-in action",
);

assert.match(
  formal,
  /class="login-preload-progress"[\s\S]*?id="loginPreloadProgress"[\s\S]*?role="progressbar"[\s\S]*?aria-valuemin="0"[\s\S]*?aria-valuemax="2"[\s\S]*?id="loginPreloadProgressFill"/,
  "the login must expose a visible and accessible two-video preload progress bar",
);

assert.match(
  formal,
  /const LOGIN_PRELOAD_TARGETS = \[[\s\S]*?openingVideo[\s\S]*?secondScreenVideo[\s\S]*?\];[\s\S]*?const updateLoginPreloadState = \(\) => \{[\s\S]*?readyCount[\s\S]*?failedCount[\s\S]*?settledCount[\s\S]*?loginPreloadProgress\.setAttribute\('aria-valuenow', String\(settledCount\)\)[\s\S]*?loginPreloadProgressFill\.style\.width = `\$\{\(settledCount \/ totalCount\) \* 100\}%`/,
  "the preload bar must be driven by the real ready, failed, and settled state of both videos",
);

assert.match(
  formal,
  /const preloadLoginVideos = \(\) => \{[\s\S]*?addEventListener\('canplay'[\s\S]*?addEventListener\('error'[\s\S]*?video\.preload = 'auto'[\s\S]*?VantageBrowserRuntime\.setVideoSource\([\s\S]*?video\.load\(\)/,
  "preload listeners must be attached before both typed video sources load their metadata",
);

assert.match(
  formal,
  /const beginAudibleOpeningPlayback = \(\) => \{[\s\S]*?openingVideo\.currentTime = 0[\s\S]*?openingVideo\.muted = false[\s\S]*?openingVideo\.play\(\)[\s\S]*?const submitLogin = async \(\) => \{[\s\S]*?beginAudibleOpeningPlayback\(\)[\s\S]*?await window\.VantageBrowserRuntime\.signIn/,
  "the sign-in gesture must request audible opening playback before awaiting authentication",
);

assert.match(
  formal,
  /loginSubmit\.addEventListener\('click', submitLogin\)/,
  "the login button must invoke the authenticated entry flow from a user gesture",
);

assert.match(
  formal,
  /await window\.VantageBrowserRuntime\.signIn\(\{username,password\}\)/,
  "the confirmed credentials must be validated by the shared authentication runtime before entry",
);

assert.doesNotMatch(
  formal,
  /window\.VantageBrowserRuntime\.getSession\(\)[\s\S]{0,240}?completeLogin\(\)/,
  "a stored session must never bypass the manual login gate",
);

console.log("H1 login preload and audible-entry contract passed.");
