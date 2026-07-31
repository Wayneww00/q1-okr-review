import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_COVER_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
    { width: 2560, height: 1080 },
  ]) {
    const page = await browser.newPage({ viewport });
    page.setDefaultTimeout(20_000);
    await page.route("**/*.mp4", (route) =>
      route.fulfill({ status: 204, contentType: "video/mp4", body: "" }),
    );
    await page.goto(
      `${baseUrl}/previews/vantage-h1-immersive.html?audit=cover-${viewport.width}`,
      { waitUntil: "domcontentloaded" },
    );
    if (await page.locator("#loginGate").isVisible()) {
      await page.locator("#loginSubmit").click();
      await page.waitForFunction(() =>
        document.querySelector("#loginGate")?.classList.contains("is-hidden"),
      );
    }

    const reportScene = page.locator('.scene[data-label="Full Report"]');
    await reportScene.evaluate((scene) =>
      scene.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    const reportFrame = page.locator("#reportFrame").contentFrame();
    await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

    assert.equal(
      await reportFrame
        .locator('[data-report-section="data"] [data-report-page]')
        .count(),
      20,
    );
    assert.equal(
      await reportFrame.locator('[data-page-id="data-21"]').count(),
      0,
    );
    assert.equal(
      await reportFrame.locator('.h1-retail-growth-transition').filter({ hasText: "印度" }).count(),
      0,
    );
    assert.match(
      (await reportFrame
        .locator('[data-page-id="data-20"] .h1-extended-editorial-page-number')
        .innerText())
        .replace(/\s+/g, " ")
        .trim(),
      /^20 \/ 20$/,
    );
    const scaleState = await reportFrame.locator("html").evaluate((root) => ({
      contain: Number(root.style.getPropertyValue("--h1-figma-scale")),
      cover: Number(root.style.getPropertyValue("--h1-artboard-cover-scale")),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    }));
    assert.ok(
      Math.abs(
        scaleState.contain -
          Math.min(
            scaleState.viewportWidth / 1920,
            scaleState.viewportHeight / 1080,
            1,
          ),
      ) <= 0.0001,
      "data pages must keep their proportional contain scale",
    );
    assert.ok(
      Math.abs(
        scaleState.cover -
          Math.max(
            scaleState.viewportWidth / 1920,
            scaleState.viewportHeight / 1080,
          ),
      ) <= 0.0001,
      "O1/O2 artboards must receive a separate proportional cover scale",
    );

    for (const [pageId, artboardSelector] of [
      ["okr-elite-client-identity", ".h1-okr-canvas"],
      ["okr-client-experience-model", ".h1-okr-canvas"],
      ["okr-client-experience-cases", ".h1-okr-canvas"],
      ["okr-elite-client-no1-experience", ".h1-okr-canvas"],
      ["okr-elite-endorsement-resources", ".h1-okr-canvas"],
      ["okr-elite-ferrari-experience", ".h1-okr-canvas"],
      ["okr-elite-black-label", ".h1-okr-canvas"],
      ["okr-elite-business-enablement", ".h1-okr-canvas"],
      ["o2-aso-leadership", ".h1-o2-artboard"],
      ["o2-aso-evidence", ".h1-o2-artboard"],
    ]) {
      const reportPage = reportFrame.locator(`[data-page-id="${pageId}"]`);
      await reportPage.evaluate((target) =>
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY,
          behavior: "instant",
        }),
      );
      const geometry = await reportPage.locator(artboardSelector).evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      });
      assert.ok(
        geometry.width >= geometry.viewportWidth - 1 &&
          geometry.height >= geometry.viewportHeight - 1,
        `${pageId} must cover the ${viewport.width}×${viewport.height} report viewport`,
      );
      assert.ok(
        Math.abs(geometry.width / geometry.height - 16 / 9) <= 0.002,
        `${pageId} must stay proportional at 16:9`,
      );
      assert.ok(
        Math.abs(
          geometry.left + (geometry.width - geometry.viewportWidth) / 2,
        ) <= 1.5 &&
          Math.abs(
            geometry.top + (geometry.height - geometry.viewportHeight) / 2,
          ) <= 1.5,
        `${pageId} cover crop must remain centered`,
      );
    }

    for (const [pageId, artboardSelector] of [
      ["okr-review", ".h1-okr-canvas"],
      ["o2-chapter", ".h1-o2-artboard"],
    ]) {
      const reportPage = reportFrame.locator(`[data-page-id="${pageId}"]`);
      await reportPage.evaluate((target) =>
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY,
          behavior: "instant",
        }),
      );
      const geometry = await reportPage.locator(artboardSelector).evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      });
      assert.ok(
        geometry.width <= geometry.viewportWidth + 1 &&
          geometry.height <= geometry.viewportHeight + 1,
        `${pageId} is outside the reported scope and must retain contain scaling`,
      );
    }

    await page.close();
  }
} finally {
  await browser.close();
}

console.log("H1 fullscreen cover and India-page removal runtime contract passed.");
