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

    const okrPage = page.locator('[data-page-id="okr-review"]');
    await okrPage.scrollIntoViewIfNeeded();
    const artboard = okrPage.locator(".h1-okr-exact-artboard");
    const image = okrPage.locator(".h1-okr-exact-frame");
    await artboard.waitFor({ state: "visible" });

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
      const pageStyle = getComputedStyle(root);
      const beforeStyle = getComputedStyle(root, "::before");
      return {
        page: rect(root),
        artboard: rect(artboard),
        image: rect(image),
        imageObjectFit: getComputedStyle(image).objectFit,
        imageNaturalWidth: image.naturalWidth,
        imageNaturalHeight: image.naturalHeight,
        backgroundAsset: pageStyle.getPropertyValue("--h1-okr-page-image"),
        backgroundSize: beforeStyle.backgroundSize,
      };
    });

    const expectedWidth = Math.min(
      geometry.page.width,
      geometry.page.height * (16 / 9),
    );
    const expectedHeight = expectedWidth * (9 / 16);
    closeTo(
      geometry.artboard.width,
      expectedWidth,
      1,
      `${viewport.width}×${viewport.height} artboard width`,
    );
    closeTo(
      geometry.artboard.height,
      expectedHeight,
      1,
      `${viewport.width}×${viewport.height} artboard height`,
    );
    closeTo(
      geometry.artboard.left,
      geometry.page.left + (geometry.page.width - expectedWidth) / 2,
      1,
      `${viewport.width}×${viewport.height} centered artboard`,
    );
    closeTo(
      geometry.artboard.top,
      geometry.page.top + (geometry.page.height - expectedHeight) / 2,
      1,
      `${viewport.width}×${viewport.height} vertically centered artboard`,
    );
    assert.equal(geometry.imageObjectFit, "contain");
    assert.equal(geometry.imageNaturalWidth, 1920);
    assert.equal(geometry.imageNaturalHeight, 1080);
    assert.match(geometry.backgroundAsset, /figma-exact\/p25-source\.png/);
    assert.match(geometry.backgroundSize, /^cover(?:,\s*cover)?$/);

    await page.close();
  }
} finally {
  await browser.close();
}

console.log("H1 exact Figma OKR responsive artboard contract passed.");
