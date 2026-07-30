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
    Object.defineProperty(window, "VantageBrowserRuntime", {
      configurable: true,
      get() {
        return runtimeValue;
      },
      set(value) {
        value.getSession = async () => ({
          user: { id: "opening-autoplay-sound-runtime" },
        });
        runtimeValue = value;
      },
    });
  });

  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=opening-autoplay-sound`,
    { waitUntil: "domcontentloaded" },
  );

  const openingVideo = page.locator("#openingVideo");

  await page.waitForFunction(
    () => document.querySelector("#openingVideo")?.paused === false,
  );
  assert.equal(
    await page.locator("#openingStartGate, #openingStartButton").count(),
    0,
    "the opening film must not add a sound-enable button or blocking gate",
  );

  const blockedState = await openingVideo.evaluate((video) => ({
    muted: video.muted,
    paused: video.paused,
  }));
  assert.equal(
    blockedState.muted,
    true,
    "blocked audible autoplay must fall back to muted playback",
  );
  assert.equal(
    blockedState.paused,
    false,
    "the opening film must keep playing while sound permission is pending",
  );

  await page.mouse.click(24, 120);
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
    "the audible opening film must restart near the beginning",
  );

  assert.equal(
    await page.locator("#soundButton").getAttribute("aria-label"),
    "关闭声音",
    "the sound control must reflect the actual audible state",
  );
} finally {
  await browser.close();
}

console.log("H1 opening autoplay sound fallback lifecycle passed.");
