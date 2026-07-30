import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_MEDIA_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=media-memory-budget`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForFunction(
    () =>
      document.querySelector("#openingVideo")?.readyState >=
      HTMLMediaElement.HAVE_FUTURE_DATA,
  );
  assert.equal(
    await page.locator("#loginPreloadStatus").innerText(),
    "开场视频已就绪，其余资源按需加载",
  );
  await page.locator("#loginSubmit").click();

  const report = page.locator("#reportFrame").contentFrame();
  await report.locator('body[data-h1-prepared="true"]').waitFor();

  const initialO1Budget = await report
    .locator('main[data-report-section="okr"]')
    .evaluate((root) => {
      const loaded = [...root.querySelectorAll("img")].filter(
        (image) => image.complete && image.naturalWidth > 0,
      );
      return {
        loadedCount: loaded.length,
        decodedBytes: loaded.reduce(
          (total, image) =>
            total + image.naturalWidth * image.naturalHeight * 4,
          0,
        ),
      };
    });
  assert.ok(
    initialO1Budget.decodedBytes <= 64 * 1024 * 1024,
    `inactive O1 must stay within a 64 MiB decoded-image budget; got ${(
      initialO1Budget.decodedBytes /
      1024 /
      1024
    ).toFixed(1)} MiB across ${initialO1Budget.loadedCount} images`,
  );

  const firstPage = report.locator('[data-page-id="okr-review"]');
  await report.locator('[data-page-id="okr-review"]').evaluate((target) =>
    target.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  assert.equal(
    await firstPage.locator(".h1-okr-figma-foreground-layer").count(),
    0,
    "the native brand-system page must not load its former rasterized text layer",
  );
  assert.equal(
    await firstPage.locator(".h1-okr-card-art").count(),
    3,
    "the native page must retain its three lightweight card-shape assets",
  );
  await page.waitForFunction(() => {
    const frame = document.querySelector("#reportFrame");
    const images = [
      ...(frame?.contentDocument?.querySelectorAll(
        '[data-page-id="okr-review"] .h1-okr-card-art',
      ) || []),
    ];
    return (
      images.length === 3 &&
      images.every(
        (image) =>
          image.complete && image.naturalWidth > 0 && image.naturalHeight > 0,
      )
    );
  });

  const page26Image = report.locator(
    '[data-page-id="okr-ai-recommendation"] .h1-okr-figma-foreground-layer',
  );
  await report
    .locator('[data-page-id="okr-ai-recommendation"]')
    .evaluate((target) =>
      target.scrollIntoView({ behavior: "instant", block: "start" }),
    );
  await page.waitForFunction(() => {
    const frame = document.querySelector("#reportFrame");
    const image = frame?.contentDocument?.querySelector(
      '[data-page-id="okr-ai-recommendation"] .h1-okr-figma-foreground-layer',
    );
    return image?.complete && image.naturalWidth > 0;
  });
  assert.match(
    (await page26Image.getAttribute("src")) || "",
    /p58-foreground\.png$/,
  );
  assert.equal(
    await report
      .locator('[data-page-id="okr-review"] .h1-okr-figma-foreground-layer')
      .count(),
    0,
  );
  assert.equal(
    await report.locator("body").evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("p25-foreground-clean.png")),
    ),
    false,
    "the removed rasterized text layer must not consume network or decoded-image memory",
  );

  const deferredVideos = await page.locator("video").evaluateAll((videos) =>
    videos.map((video) => ({
      id: video.id || "closingVideo",
      preload: video.preload,
      readyState: video.readyState,
    })),
  );
  const second = deferredVideos.find(
    (video) => video.id === "secondScreenVideo",
  );
  const closing = deferredVideos.find(
    (video) => video.id === "closingVideo",
  );
  assert.equal(second?.preload, "metadata");
  assert.equal(closing?.preload, "none");
  assert.ok((second?.readyState || 0) <= 1);
  assert.ok((closing?.readyState || 0) <= 1);
} finally {
  await browser.close();
}

console.log(
  "H1 media memory budget passed: native O1 text avoids its former raster layer and inactive 4K videos stay deferred.",
);
