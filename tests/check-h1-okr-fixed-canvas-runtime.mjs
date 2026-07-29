import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_PACKAGE ||
    "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_OKR_TEST_URL || "http://127.0.0.1:4192";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
});

try {
  for (const viewport of [
    { width: 1920, height: 966 },
    { width: 1366, height: 654 },
    { width: 1024, height: 900 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${baseUrl}/index.html?report=h1&embedded=1`, {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate(() => document.body.classList.add("h1-embedded-report"));

    assert.equal(
      await page.locator(".h1-okr-fixed-trophy-stage").count(),
      1,
      "the OKR chapter must have one shared trophy stage",
    );
    assert.equal(
      await page.locator(".h1-okr-racing-stage").count(),
      0,
      "a trophy background must not be duplicated on every page",
    );

    const firstPage = page.locator('[data-page-id="okr-review"]');
    await firstPage.scrollIntoViewIfNeeded();
    await firstPage.locator(".h1-okr-canvas").waitFor({ state: "visible" });
    const firstPageState = await firstPage.evaluate((root) => {
      const stage = document.querySelector(".h1-okr-fixed-trophy-stage");
      const stageCanvas = stage.querySelector(".h1-okr-fixed-stage-canvas");
      const stageImage = stage.querySelector(".h1-okr-fixed-stage-background");
      const canvas = root.querySelector(".h1-okr-canvas");
      const foreground = root.querySelector(".h1-okr-figma-foreground-layer");
      const pageRect = root.getBoundingClientRect();
      const stageCanvasRect = stageCanvas.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      return {
        foregroundImage: foreground?.getAttribute("src"),
        foregroundWidth: foreground?.getAttribute("width"),
        foregroundHeight: foreground?.getAttribute("height"),
        pageNumber: root.querySelector(".h1-okr-page-number")?.textContent?.replace(/\s+/g, "").trim(),
        hasExactScreenshot: Boolean(root.querySelector(".h1-okr-exact-frame")),
        stagePosition: getComputedStyle(stage).position,
        stageImage: stageImage.getAttribute("src"),
        stageTop: stage.getBoundingClientRect().top,
        pageHeight: pageRect.height,
        stageCanvasLeft: stageCanvasRect.left,
        stageCanvasTop: stageCanvasRect.top,
        stageCanvasWidth: stageCanvasRect.width,
        stageCanvasHeight: stageCanvasRect.height,
        canvasLeft: canvasRect.left,
        canvasTop: canvasRect.top,
        canvasWidth: canvasRect.width,
        canvasHeight: canvasRect.height,
      };
    });
    assert.match(firstPageState.foregroundImage, /figma-untitled\/p25-foreground\.png/);
    assert.equal(firstPageState.foregroundWidth, "1920");
    assert.equal(firstPageState.foregroundHeight, "1080");
    assert.equal(firstPageState.pageNumber, "01/19");
    assert.equal(firstPageState.hasExactScreenshot, false);
    assert.equal(firstPageState.stagePosition, "sticky");
    assert.match(firstPageState.stageImage, /figma-untitled\/p25-background\.png/);
    assert.ok(Math.abs(firstPageState.stageTop) < 1, "the trophy stage must be pinned to the viewport");
    assert.ok(Math.abs(firstPageState.pageHeight - viewport.height) < 1);
    assert.ok(Math.abs(firstPageState.stageCanvasLeft - firstPageState.canvasLeft) < 1, "background and p25 foreground must share one horizontal Figma origin");
    assert.ok(Math.abs(firstPageState.stageCanvasTop - firstPageState.canvasTop) < 1, "background and p25 foreground must share one vertical Figma origin");
    assert.ok(Math.abs(firstPageState.stageCanvasWidth - firstPageState.canvasWidth) < 1, "background and p25 foreground must share one scale");
    assert.ok(Math.abs(firstPageState.stageCanvasHeight - firstPageState.canvasHeight) < 1, "background and p25 foreground must share one scale");
    assert.ok(firstPageState.canvasWidth <= viewport.width + 1);
    assert.ok(firstPageState.canvasHeight <= viewport.height + 1);

    const laterPage = page.locator('[data-page-id="okr-brand-refresh"]');
    await laterPage.scrollIntoViewIfNeeded();
    const laterPageState = await laterPage.evaluate((root) => {
      const stage = document.querySelector(".h1-okr-fixed-trophy-stage");
      const foreground = root.querySelector(".h1-okr-brand-refresh-foreground");
      return {
        stageTop: stage.getBoundingClientRect().top,
        foregroundImages: [...root.querySelectorAll(".h1-okr-figma-foreground-layer")].map((layer) => layer.getAttribute("src")),
        foregroundPosition: foreground ? {
          left: foreground.style.left,
          top: foreground.style.top,
          width: foreground.getAttribute("width"),
          height: foreground.getAttribute("height"),
        } : null,
        brandRefreshModuleCount: root.querySelectorAll(".h1-brand-refresh-title, .h1-brand-refresh-summary, .h1-brand-refresh-map").length,
        exactFrameCount: root.querySelectorAll(".h1-okr-exact-frame").length,
      };
    });
    assert.ok(Math.abs(laterPageState.stageTop) < 1, "the same trophy stage must remain pinned after a page turn");
    assert.deepEqual(laterPageState.foregroundImages, ["previews/assets/figma-untitled/brand-refresh-foreground.png"]);
    assert.deepEqual(laterPageState.foregroundPosition, { left: "160px", top: "67px", width: "1619", height: "950" });
    assert.equal(laterPageState.brandRefreshModuleCount, 0);
    assert.equal(laterPageState.exactFrameCount, 0, "the Brand Refresh foreground must not stack a full Figma screenshot over the shared trophy");
    await page.close();
  }
} finally {
  await browser.close();
}

console.log("H1 OKR shared fixed-trophy and p25-foreground contract passed.");
