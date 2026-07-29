import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_OKR_TEST_URL || "http://127.0.0.1:4192";
const closeTo = (actual, expected, tolerance, label) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected} ± ${tolerance}, got ${actual}`,
  );
};

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 1920, height: 966 },
    { width: 1920, height: 800 },
    { width: 1366, height: 654 },
    { width: 1024, height: 900 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${baseUrl}/index.html?report=h1&embedded=1`, {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate(() => {
      document.documentElement.classList.add("h1-figma-racing-report");
      document.body.classList.add("h1-embedded-report");
    });

    assert.equal(
      await page.locator(".h1-okr-fixed-stage").count(),
      0,
      "the rejected shared OKR stage must not alter data content or backgrounds",
    );

    const okrPage = page.locator('[data-page-id="okr-review"]');
    await okrPage.scrollIntoViewIfNeeded();
    const artboard = okrPage.locator(".h1-okr-exact-artboard");
    await artboard.waitFor({ state: "visible" });
    await okrPage.locator(".h1-okr-exact-frame").evaluate((image) => {
      if (!image.complete) {
        return new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        });
      }
    });

    const geometry = await okrPage.evaluate((root) => {
      const rect = (element) => {
        const value = element.getBoundingClientRect();
        return {
          left: value.left,
          top: value.top,
          width: value.width,
          height: value.height,
          right: value.right,
          bottom: value.bottom,
        };
      };
      const artboard = root.querySelector(".h1-okr-exact-artboard");
      const image = root.querySelector(".h1-okr-exact-frame");
      const pageBackground = getComputedStyle(root, "::before");
      return {
        page: rect(root),
        artboard: rect(artboard),
        image: rect(image),
        artboardPosition: getComputedStyle(artboard).position,
        imageObjectFit: getComputedStyle(image).objectFit,
        imageNaturalWidth: image.naturalWidth,
        imageNaturalHeight: image.naturalHeight,
        backgroundAsset: pageBackground.backgroundImage,
        backgroundSize: pageBackground.backgroundSize,
        pageImageVariable: getComputedStyle(root)
          .getPropertyValue("--h1-okr-page-image")
          .trim(),
      };
    });

    const expectedWidth = Math.min(
      geometry.page.width,
      geometry.page.height * (16 / 9),
    );
    const expectedHeight = expectedWidth * (9 / 16);
    closeTo(geometry.artboard.width, expectedWidth, 1, `${viewport.width}×${viewport.height} artboard width`);
    closeTo(geometry.artboard.height, expectedHeight, 1, `${viewport.width}×${viewport.height} artboard height`);
    closeTo(
      geometry.artboard.left,
      geometry.page.left + (geometry.page.width - expectedWidth) / 2,
      1,
      `${viewport.width}×${viewport.height} page-owned artboard left`,
    );
    closeTo(
      geometry.artboard.top,
      geometry.page.top + (geometry.page.height - expectedHeight) / 2,
      1,
      `${viewport.width}×${viewport.height} page-owned artboard top`,
    );
    assert.equal(geometry.imageObjectFit, "contain");
    assert.equal(geometry.imageNaturalWidth, 1920);
    assert.equal(geometry.imageNaturalHeight, 1080);
    assert.equal(geometry.artboardPosition, "absolute");
    assert.match(geometry.backgroundAsset, /h1-review-bg-320-194-2280x1346\.png/);
    assert.match(geometry.backgroundSize, /^cover(?:,\s*cover)?$/);
    assert.match(geometry.pageImageVariable, /p25-source\.png/);

    const nextPageBackground = await page
      .locator('[data-page-id="okr-brand-refresh"]')
      .evaluate((root) => ({
        ownBackground: getComputedStyle(root, "::before").backgroundImage,
        ownVariable: getComputedStyle(root)
          .getPropertyValue("--h1-okr-page-image")
          .trim(),
        artboardPosition: getComputedStyle(
          root.querySelector(".h1-okr-exact-artboard"),
        ).position,
      }));
    assert.match(nextPageBackground.ownBackground, /h1-review-bg-320-194-2280x1346\.png/);
    assert.match(nextPageBackground.ownVariable, /okr-p29-source\.png/);
    assert.notEqual(
      nextPageBackground.ownBackground,
      geometry.backgroundAsset,
      "each OKR page must share the approved trophy background",
    );
    assert.equal(nextPageBackground.artboardPosition, "absolute");

    await page.close();
  }
} finally {
  await browser.close();
}

console.log("H1 exact Figma OKR independent responsive-page contract passed.");
