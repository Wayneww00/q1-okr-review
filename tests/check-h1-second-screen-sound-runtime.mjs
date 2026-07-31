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
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=second-screen-sound-runtime`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();
  await page.locator("#loginGate").waitFor({ state: "hidden" });

  const secondScene = page.locator(".scene.second-film");
  const secondVideo = page.locator("#secondScreenVideo");
  await secondScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() =>
    document.querySelector(".scene.second-film")?.classList.contains("active"),
  );
  await secondVideo.evaluate((video) => {
    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      return new Promise((resolve) =>
        video.addEventListener("loadedmetadata", resolve, { once: true }),
      );
    }
  });
  await page.waitForFunction(() => {
    const video = document.querySelector("#secondScreenVideo");
    return video && !video.paused && !video.muted && video.currentTime > 0;
  });

  const playingState = await secondVideo.evaluate((video) => ({
    muted: video.muted,
    paused: video.paused,
    volume: video.volume,
    currentTime: video.currentTime,
    duration: video.duration,
  }));
  assert.equal(playingState.muted, false, "the active second screen must play with sound");
  assert.equal(playingState.paused, false, "the active second screen must be playing");
  assert.equal(playingState.volume, 1, "the active second screen must use full volume");
  assert.ok(playingState.duration >= 8, "the complete supplied film must load");

  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() =>
    document
      .querySelector('.scene[data-label="Full Report"]')
      ?.classList.contains("active"),
  );
  const pausedState = await secondVideo.evaluate((video) => ({
    muted: video.muted,
    paused: video.paused,
    currentTime: video.currentTime,
  }));
  assert.equal(pausedState.muted, true, "the second screen must become silent after leaving");
  assert.equal(pausedState.paused, true, "the second screen must pause after leaving");

  await secondScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() => {
    const scene = document.querySelector(".scene.second-film");
    const video = document.querySelector("#secondScreenVideo");
    return scene?.classList.contains("active") && video && !video.paused && !video.muted;
  });
  const resumedTime = await secondVideo.evaluate((video) => video.currentTime);
  assert.ok(
    resumedTime >= pausedState.currentTime - 0.05,
    "returning to the second screen must resume instead of restarting",
  );

  await secondVideo.evaluate((video) => {
    video.currentTime = Math.max(0, video.duration - 0.15);
    return video.play();
  });
  await page.waitForFunction(() => document.querySelector("#secondScreenVideo")?.ended);
  const endedState = await secondVideo.evaluate((video) => ({
    ended: video.ended,
    paused: video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
  }));
  assert.equal(endedState.ended, true);
  assert.equal(endedState.paused, true);
  assert.ok(
    endedState.currentTime >= endedState.duration - 0.05,
    "the second screen must remain on its final frame",
  );
} finally {
  await browser.close();
}

console.log("H1 second-screen audible playback lifecycle passed.");
