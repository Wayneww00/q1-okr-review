import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_PREVIEW_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    let runtimeValue;
    window.__H1_LOGIN_AUDIT__ = {
      getSessionCalls: 0,
      signInCalls: 0,
    };
    Object.defineProperty(window, "VantageBrowserRuntime", {
      configurable: true,
      get() {
        return runtimeValue;
      },
      set(value) {
        const session = { user: { id: "opening-autoplay-sound-runtime" } };
        value.getSession = async () => {
          window.__H1_LOGIN_AUDIT__.getSessionCalls += 1;
          return session;
        };
        value.signIn = async () => {
          window.__H1_LOGIN_AUDIT__.signInCalls += 1;
          await new Promise((resolve) => setTimeout(resolve, 240));
          return session;
        };
        runtimeValue = value;
      },
    });
  });

  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=opening-autoplay-sound`,
    { waitUntil: "domcontentloaded" },
  );

  const openingVideo = page.locator("#openingVideo");

  await page.waitForTimeout(400);
  assert.equal(
    await page.locator("#loginGate").isVisible(),
    true,
    "a stored session must not automatically dismiss the login gate",
  );
  assert.equal(
    await page.evaluate(() => window.__H1_LOGIN_AUDIT__.getSessionCalls),
    0,
    "the shell must not query a stored session to bypass manual login",
  );
  assert.equal(
    await page.locator("#openingStartGate, #openingStartButton").count(),
    0,
    "the opening film must not add a sound-enable button or blocking gate",
  );

  const waitingState = await openingVideo.evaluate((video) => ({
    muted: video.muted,
    paused: video.paused,
  }));
  assert.equal(
    waitingState.muted,
    true,
    "the opening film must stay muted until the user clicks Sign In",
  );
  assert.equal(
    waitingState.paused,
    true,
    "preloading must not start playback behind the login gate",
  );

  await page.locator("#loginSubmit").click();
  await page.locator("#loginGate").waitFor({ state: "hidden" });
  await page.waitForFunction(() => {
    const video = document.querySelector("#openingVideo");
    return video && !video.paused && !video.muted && video.currentTime > 0;
  });

  const audibleState = await openingVideo.evaluate((video) => ({
    muted: video.muted,
    paused: video.paused,
    volume: video.volume,
    currentTime: video.currentTime,
  }));
  assert.equal(audibleState.muted, false);
  assert.equal(audibleState.paused, false);
  assert.equal(audibleState.volume, 1);
  assert.ok(
    audibleState.currentTime < 2.5,
    "the audible opening film must enter near the beginning after authentication",
  );
  assert.equal(
    await page.evaluate(() => window.__H1_LOGIN_AUDIT__.signInCalls),
    1,
    "manual entry must perform exactly one credential sign-in",
  );

  assert.equal(
    await page.locator("#soundButton").getAttribute("aria-label"),
    "关闭声音",
    "the sound control must reflect the actual audible state",
  );
} finally {
  await browser.close();
}

console.log("H1 manual login and audible opening lifecycle passed.");
