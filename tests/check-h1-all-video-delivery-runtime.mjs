import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_VIDEO_TEST_URL || "http://127.0.0.1:4180";
const browserName = process.env.H1_VIDEO_BROWSER || "webkit";
const resolutionHostname =
  process.env.H1_VIDEO_RESOLUTION_HOSTNAME || new URL(baseUrl).hostname;
const activeVideoPaths = [
  "previews/assets/vantage-h1-opening-final-4k.mp4",
  "previews/assets/vantage-h1-second-screen-final-4k.mp4",
  "previews/assets/vantage-h1-closing-ending-4k.mp4",
  "previews/assets/o1-complete/tvc-library/brand-chapter-perform-ahead.mp4",
  "previews/assets/o1-complete/tvc-library/brand-chapter-think-ahead.mp4",
  "previews/assets/o1-complete/tvc-library/cfd-h1-summary.mp4",
  "previews/assets/o1-complete/tvc-library/cfd-public-good.mp4",
  "previews/assets/o1-complete/tvc-library/ferrari-co-brand.mp4",
  "previews/assets/o1-complete/tvc-library/ferrari-personal-moment.mp4",
  "previews/assets/o1-complete/tvc-library/product-24-7.mp4",
  "previews/assets/o1-complete/tvc-library/product-copy-trade.mp4",
  "previews/assets/o1-complete/tvc-library/public-good.mp4",
  "previews/assets/o1-complete/tvc-library/special-festival-world-cup.mp4",
  "previews/assets/o1-complete/tvc-library/tvc-brand-main.mp4",
  "previews/assets/o1-complete/tvc-library/tvc-global.mp4",
  "previews/assets/o1-complete/tvc-library/tvc-thailand.mp4",
  "previews/assets/o1-complete/tvc-library/tvc-vietnam.mp4",
  "previews/assets/o1-complete/tvc-library/usp.mp4",
  "previews/assets/o3/vn-tvc-park-chess.mp4",
  "previews/assets/o3/vn-tvc-banh-mi.mp4",
  "previews/assets/o3/vn-tvc-printer.mp4",
  "previews/assets/o3/vn-online-offline.mp4",
];

const browserType = { chromium, webkit }[browserName];
assert.ok(browserType, `unsupported H1_VIDEO_BROWSER: ${browserName}`);
const browser = await browserType.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(12_000);
  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html`, {
    waitUntil: "domcontentloaded",
  });

  const results = await page.evaluate(async ({ paths, hostname }) => {
    const inspectVideo = (path) =>
      new Promise((resolve) => {
        const video = document.createElement("video");
        const source = document.createElement("source");
        const timeout = window.setTimeout(
          () =>
            finish({
              ok: false,
              reason: "metadata timeout",
            }),
          10_000,
        );
        const finish = (result) => {
          window.clearTimeout(timeout);
          source.removeAttribute("src");
          video.load();
          video.remove();
          resolve({
            path,
            resolved: window.VantageBrowserRuntime.resolveMediaUrl(path, {
              hostname,
            }),
            ...result,
          });
        };
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.addEventListener(
          "loadedmetadata",
          () =>
            finish({
              ok: Number.isFinite(video.duration) && video.duration > 0,
              reason: "",
              duration: video.duration,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
            }),
          { once: true },
        );
        video.addEventListener(
          "error",
          () =>
            finish({
              ok: false,
              reason: `media error ${video.error?.code || "unknown"}`,
            }),
          { once: true },
        );
        document.body.appendChild(video);
        source.type = "video/mp4";
        source.src = window.VantageBrowserRuntime.resolveMediaUrl(path, {
          hostname,
        });
        video.append(source);
        video.load();
      });

    const inspected = [];
    for (const path of paths) inspected.push(await inspectVideo(path));
    return inspected;
  }, { paths: activeVideoPaths, hostname: resolutionHostname });

  assert.deepEqual(
    results.filter((result) => !result.ok),
    [],
    `every active presentation video must expose valid browser metadata:\n${JSON.stringify(
      results,
      null,
      2,
    )}`,
  );
  if (["127.0.0.1", "localhost", "::1"].includes(resolutionHostname)) {
    assert.ok(
      results.every((result) => result.resolved.startsWith("/previews/assets/")),
      "local development must resolve every presentation video to its root-absolute local asset",
    );
  } else {
    assert.ok(
      results.every((result) =>
        result.resolved.includes(
          "github.com/songchunhui513-bit/q1-okr-review/releases/download/",
        ),
      ),
      "production must resolve every presentation video through a public GitHub media release",
    );
  }

  const playbackPaths = [
    "previews/assets/o1-complete/tvc-library/ferrari-personal-moment.mp4",
    "previews/assets/o1-complete/tvc-library/public-good.mp4",
  ];
  const playbackResults = await page.evaluate(async ({ paths, hostname }) => {
    const results = [];
    for (const path of paths) {
      const video = document.createElement("video");
      const source = document.createElement("source");
      source.type = "video/mp4";
      source.src = window.VantageBrowserRuntime.resolveMediaUrl(path, {
        hostname,
      });
      video.append(source);
      video.muted = true;
      video.playsInline = true;
      document.body.append(video);
      let playError = "";
      try {
        await video.play();
      } catch (error) {
        playError = `${error.name}: ${error.message}`;
      }
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      results.push({
        currentTime: video.currentTime,
        errorCode: video.error?.code || 0,
        path,
        playError,
      });
      video.pause();
      video.remove();
    }
    return results;
  }, { paths: playbackPaths, hostname: resolutionHostname });
  assert.deepEqual(
    playbackResults.filter(
      ({ currentTime, errorCode, playError }) =>
        currentTime <= 0 || errorCode || playError,
    ),
    [],
    `Safari-stress video variants must decode and advance:\n${JSON.stringify(
      playbackResults,
      null,
      2,
    )}`,
  );
} finally {
  await browser.close();
}

console.log(
  `All ${activeVideoPaths.length} active H1 presentation videos passed ${browserName} delivery, metadata, and playback checks.`,
);
