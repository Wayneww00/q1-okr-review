import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const formal = await readFile(
  resolve("previews/vantage-h1-immersive.html"),
  "utf8",
);

assert.match(
  formal,
  /id="loginGate"[\s\S]*?VANTAGE[\s\S]*?H1 2026 REVIEW[\s\S]*?AUTHORIZED ACCESS ONLY/,
  "the formal H1 page must restore the previous Vantage login presentation",
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
  "the login must expose a visible and accessible video preload progress bar",
);

assert.match(
  formal,
  /const updateLoginPreloadState = \(\) => \{[\s\S]*?readyCount[\s\S]*?loginPreloadProgress\.setAttribute\('aria-valuenow', String\(readyCount\)\)[\s\S]*?loginPreloadProgressFill\.style\.width = `\$\{\(readyCount \/ targets\.length\) \* 100\}%`/,
  "the preload bar must be driven by the real number of videos ready to play",
);

assert.match(
  formal,
  /const preloadLoginVideos = \(\) => \{[\s\S]*?openingVideo\.load\(\)[\s\S]*?secondScreenVideo\.load\(\)/,
  "opening and second-screen films must begin preloading while the login is visible",
);

assert.match(
  formal,
  /const completeLogin = \(\) => \{[\s\S]*?openingVideo\.currentTime = 0[\s\S]*?openingVideo\.muted = false[\s\S]*?openingVideo\.play\(\)[\s\S]*?loginGate\.classList\.add\('is-hidden'\)/,
  "the sign-in gesture must start the opening film from the beginning with sound before hiding the login",
);

assert.match(
  formal,
  /loginSubmit\.addEventListener\('click', submitLogin\)/,
  "the login button must invoke the authenticated entry flow from a user gesture",
);

assert.match(
  formal,
  /username === 'vantage' && password === 'vantage'/,
  "the confirmed credentials must be validated before entry",
);

console.log("H1 login preload and audible-entry contract passed.");
