import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl =
  process.env.H1_FULLSCREEN_RETENTION_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const windowedViewport = { width: 1858, height: 960 };
const fullscreenViewport = { width: 1884, height: 1045 };

try {
  const page = await browser.newPage({
    viewport: windowedViewport,
  });
  page.setDefaultTimeout(30_000);
  await page.route("**/*.mp4", (route) =>
    route.fulfill({ status: 204, contentType: "video/mp4", body: "" }),
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=fullscreen-page-retention`,
    { waitUntil: "domcontentloaded" },
  );

  if (await page.locator("#loginGate").isVisible()) {
    await page.locator("#loginSubmit").click();
    await page.waitForFunction(() =>
      document.querySelector("#loginGate")?.classList.contains("is-hidden"),
    );
  }

  const sceneLabels = await page.locator(".scene").evaluateAll((scenes) =>
    scenes.filter((scene) => !scene.hidden).map((scene) => scene.dataset.label),
  );
  for (const sceneLabel of sceneLabels) {
    const scene = page.locator(`.scene[data-label="${sceneLabel}"]`);
    await page.setViewportSize(windowedViewport);
    await scene.evaluate((target) =>
      target.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    await page.setViewportSize(fullscreenViewport);
    await page.waitForFunction(
      (targetLabel) =>
        Math.abs(
          document
            .querySelector(`.scene[data-label="${targetLabel}"]`)
            ?.getBoundingClientRect().top || 0,
        ) <= 2,
      sceneLabel,
    );
    await page.setViewportSize(windowedViewport);
    await page.waitForFunction(
      (targetLabel) =>
        Math.abs(
          document
            .querySelector(`.scene[data-label="${targetLabel}"]`)
            ?.getBoundingClientRect().top || 0,
        ) <= 2,
      sceneLabel,
    );
  }

  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

  const scrollToReportPage = async (pageId) => {
    await reportFrame.locator(`[data-page-id="${pageId}"]`).evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForFunction(
      (targetPageId) =>
        document
          .querySelector("#reportFrame")
          ?.contentDocument?.querySelector(`[data-page-id="${targetPageId}"]`)
          ?.classList.contains("is-active"),
      pageId,
    );
  };

  const assertReportPageAligned = async (pageId) => {
    const state = await reportFrame.locator(`[data-page-id="${pageId}"]`).evaluate(
      (target) => {
        const reportPages = [...document.querySelectorAll("[data-report-page]")];
        const nearestPage = reportPages.reduce(
          (nearest, page) => {
            const distance = Math.abs(page.getBoundingClientRect().top);
            return distance < nearest.distance ? { distance, page } : nearest;
          },
          { distance: Number.POSITIVE_INFINITY, page: null },
        );
        return {
          pageId: target.dataset.pageId,
          pageTop: target.getBoundingClientRect().top,
          nearestPageId: nearestPage.page?.dataset.pageId || "",
          viewportHeight: window.innerHeight,
          scrollY: window.scrollY,
        };
      },
    );
    assert.ok(
      Math.abs(state.pageTop) <= 2,
      `${pageId} must remain aligned after fullscreen resize: ${JSON.stringify(state)}`,
    );
    assert.equal(
      state.nearestPageId,
      pageId,
      `${pageId} must remain the visible report page after fullscreen resize`,
    );
  };

  const waitForAlignedReportPage = (pageId) =>
    page.waitForFunction(
      (targetPageId) => {
        const target = document
          .querySelector("#reportFrame")
          ?.contentDocument?.querySelector(`[data-page-id="${targetPageId}"]`);
        return (
          target?.classList.contains("is-active") &&
          Math.abs(target.getBoundingClientRect().top) <= 2
        );
      },
      pageId,
    );

  const reportPageIds = await reportFrame
    .locator("[data-report-page]")
    .evaluateAll((pages) => pages.map((reportPage) => reportPage.dataset.pageId));
  assert.equal(reportPageIds.length, 97, "the complete report must expose 97 pages");
  assert.deepEqual(
    await reportFrame.locator("body").evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll("[data-report-section]")].map((section) => [
          section.dataset.reportSection,
          section.querySelectorAll("[data-report-page]").length,
        ]),
      ),
    ),
    { data: 20, okr: 32, o2: 27, o3: 18 },
    "the fullscreen audit must cover every report section",
  );

  for (const pageId of reportPageIds) {
    await page.setViewportSize(windowedViewport);
    await scrollToReportPage(pageId);
    await assertReportPageAligned(pageId);
    await page.setViewportSize(fullscreenViewport);
    await waitForAlignedReportPage(pageId);
    await assertReportPageAligned(pageId);
    await page.setViewportSize(windowedViewport);
    await waitForAlignedReportPage(pageId);
    await assertReportPageAligned(pageId);
  }

  for (const pageId of ["data-03", "okr-brand-results"]) {
    await page.setViewportSize(windowedViewport);
    await scrollToReportPage(pageId);

    // Entering browser fullscreen changes the report iframe height while keeping
    // its previous pixel scroll offset. A viewport resize reproduces that layout
    // transition in headless Chromium without requiring fullscreen permission.
    await page.setViewportSize(fullscreenViewport);
    await waitForAlignedReportPage(pageId);

    const nextPageId = await reportFrame
      .locator(`[data-page-id="${pageId}"]`)
      .evaluate((target) => target.nextElementSibling?.dataset.pageId || "");
    assert.ok(nextPageId, `${pageId} must have a following page for paging checks`);
    await reportFrame.locator("body").press("PageDown");
    await waitForAlignedReportPage(nextPageId);
    await reportFrame.locator("body").press("PageUp");
    await waitForAlignedReportPage(pageId);

    // Leaving fullscreen must preserve the same logical page as well.
    await page.setViewportSize(windowedViewport);
    await waitForAlignedReportPage(pageId);
    await assertReportPageAligned(pageId);
  }
} finally {
  await browser.close();
}

console.log("H1 fullscreen report page retention runtime contract passed.");
