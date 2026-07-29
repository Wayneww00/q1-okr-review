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
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=figma-okr-shell-runtime`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();

  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() =>
    document
      .querySelector('.scene[data-label="Full Report"]')
      ?.classList.contains("active"),
  );

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  const reportPages = reportFrame.locator("[data-report-page]");
  const pageCount = await reportPages.count();
  const okrPageIds = [
    "okr-review",
    "okr-brand-experience-audit",
    "okr-brand-results",
    "okr-brand-refresh",
    "okr-brand-operating-system",
    "okr-tvc-matrix",
    "okr-tvc-library",
    "okr-application-roadmap",
    "okr-high-value-actions",
    "okr-awards",
    "okr-offline-event-01",
    "okr-offline-event-02",
    "okr-merchandise",
    "okr-ai-recommendation",
    "okr-omnichannel-amplification",
    "okr-tvc-localization",
    "okr-superapp-activation",
    "okr-premium-unlimited",
  ];
  assert.ok(
    pageCount >= okrPageIds.length + 1,
    "the embedded report must contain data pages and all exact Figma OKR pages",
  );
  const waitForReportPageIndex = (index) =>
    page.waitForFunction(
      (targetIndex) =>
        document
          .querySelector("#reportFrame")
          ?.contentDocument?.querySelectorAll("[data-report-page]")
          [targetIndex]?.classList.contains("is-active"),
      index,
    );

  const lastDataIndex = pageCount - okrPageIds.length - 1;
  const lastDataPage = reportPages.nth(lastDataIndex);
  await lastDataPage.evaluate((target) =>
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await waitForReportPageIndex(lastDataIndex);

  for (let offset = 0; offset < okrPageIds.length; offset += 1) {
    await page.locator("body").press("PageDown");
    const targetIndex = lastDataIndex + offset + 1;
    await waitForReportPageIndex(targetIndex);
    const pageId = okrPageIds[offset];
    const okrPage = reportFrame.locator(`[data-page-id="${pageId}"]`);
    assert.equal(
      await okrPage.evaluate((root) => root.classList.contains("is-active")),
      true,
      `${pageId} must become active in sequence`,
    );
    const directForegrounds = {
      "okr-review": {
        source: /previews\/assets\/figma-untitled\/p25-foreground\.png$/,
        pageNumber: "01/18",
      },
      "okr-brand-experience-audit": {
        source: /previews\/assets\/figma-untitled\/p63-foreground\.png$/,
        pageNumber: "02/18",
      },
      "okr-brand-results": {
        source: /previews\/assets\/figma-untitled\/p26-foreground\.png$/,
        pageNumber: "03/18",
      },
      "okr-tvc-matrix": {
        source: /previews\/assets\/figma-untitled\/p28-foreground\.png$/,
        pageNumber: "06/18",
      },
      "okr-tvc-library": {
        source: /previews\/assets\/figma-untitled\/p28-2-foreground\.png$/,
        pageNumber: "07/18",
      },
      "okr-high-value-actions": {
        source: /previews\/assets\/figma-untitled\/p31-foreground\.png$/,
        pageNumber: "09/18",
      },
      "okr-offline-event-01": {
        source: /previews\/assets\/figma-untitled\/p33-34-foreground\.png$/,
        pageNumber: "11/18",
      },
      "okr-offline-event-02": {
        source: /previews\/assets\/figma-untitled\/p36-1-foreground\.png$/,
        pageNumber: "12/18",
      },
      "okr-merchandise": {
        source: /previews\/assets\/figma-untitled\/p52-foreground\.png$/,
        pageNumber: "13/18",
      },
      "okr-ai-recommendation": {
        source: /previews\/assets\/figma-untitled\/p58-foreground\.png$/,
        pageNumber: "14/18",
      },
      "okr-omnichannel-amplification": {
        source: /previews\/assets\/figma-untitled\/p59-foreground\.png$/,
        pageNumber: "15/18",
      },
      "okr-tvc-localization": {
        source: /previews\/assets\/figma-untitled\/p60-foreground\.png$/,
        pageNumber: "16/18",
      },
      "okr-superapp-activation": {
        source: /previews\/assets\/figma-untitled\/p61-foreground\.png$/,
        pageNumber: "17/18",
      },
      "okr-premium-unlimited": {
        source: /previews\/assets\/figma-untitled\/p62-foreground\.png$/,
        pageNumber: "18/18",
      },
    };
    const directForeground = directForegrounds[pageId];
    if (pageId === "okr-brand-refresh") {
      assert.equal(await okrPage.locator(".h1-okr-figma-foreground-layer").count(), 0);
      assert.equal(await okrPage.locator(".h1-okr-exact-frame").count(), 0);
      assert.equal(await okrPage.locator(".h1-brand-refresh-title").count(), 1);
      assert.equal(await okrPage.locator(".h1-brand-refresh-summary").count(), 1);
      assert.equal(await okrPage.locator(".h1-brand-refresh-map").count(), 1);
      assert.equal(
        (await okrPage.locator(".h1-okr-page-number").textContent()).replace(/\s+/g, ""),
        "04/18",
      );
    } else if (directForeground) {
      assert.equal(await okrPage.locator(".h1-okr-figma-foreground-layer").count(), 1);
      assert.equal(await okrPage.locator(".h1-okr-exact-frame").count(), 0);
      assert.match(
        await okrPage.locator(".h1-okr-figma-foreground-layer").getAttribute("src"),
        directForeground.source,
        `${pageId} must use its direct Untitled Figma foreground export`,
      );
      assert.equal(
        (await okrPage.locator(".h1-okr-page-number").textContent()).replace(/\s+/g, ""),
        directForeground.pageNumber,
        `${pageId} must keep its page number`,
      );
    } else {
      assert.match(
        await okrPage.locator(".h1-okr-exact-frame").getAttribute("src"),
        /previews\/assets\/figma-exact\/(?:.+-source\.(?:png|jpg)|salon\.jpg|expo\.jpg)$/,
        `${pageId} must retain its exact Figma export for later foreground rebuilding`,
      );
      assert.equal(
        await okrPage.locator(".h1-okr-exact-artboard").evaluate(
          (artboard) => getComputedStyle(artboard).position,
        ),
        "absolute",
        `${pageId} must retain an independent presentation surface`,
      );
      assert.deepEqual(
        await okrPage.locator(".h1-okr-exact-artboard").evaluate(
          (artboard) => ({
            opacity: getComputedStyle(artboard).opacity,
            pointerEvents: getComputedStyle(artboard).pointerEvents,
          }),
        ),
        { opacity: "0", pointerEvents: "none" },
        `${pageId} must not stack its full Figma screenshot over the shared trophy`,
      );
    }
    const pageBackground = await okrPage.evaluate((root) => ({
      stageCount: document.querySelectorAll(".h1-okr-fixed-trophy-stage").length,
      stageImage: document.querySelector(".h1-okr-fixed-stage-background")?.getAttribute("src"),
      stagePosition: getComputedStyle(
        document.querySelector(".h1-okr-fixed-trophy-stage"),
      ).position,
    }));
    assert.ok(
      pageBackground.stageCount === 1 &&
        pageBackground.stagePosition === "sticky" &&
        pageBackground.stageImage.includes("figma-untitled/p25-background.png"),
      `${pageId} must use the one shared Untitled Figma trophy background`,
    );

  }

  const finalOkrPage = reportFrame.locator('[data-page-id="okr-premium-unlimited"]');
  await page.locator("body").press("PageUp");
  await waitForReportPageIndex(pageCount - 2);
  assert.equal(
    await finalOkrPage.evaluate((root) => root.classList.contains("is-active")),
    false,
  );

  await page.locator("body").press("PageDown");
  await waitForReportPageIndex(pageCount - 1);
  assert.equal(
    await finalOkrPage.evaluate((root) => root.classList.contains("is-active")),
    true,
  );

  await page.locator("body").press("PageDown");
  await page.waitForFunction(() =>
    document
      .querySelector('.scene[data-label="Q3 Outlook"]')
      ?.classList.contains("active"),
  );
} finally {
  await browser.close();
}

console.log("H1 pending-content OKR shell paging and trophy-background contract passed.");
