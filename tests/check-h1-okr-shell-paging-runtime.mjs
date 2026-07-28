import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_OKR_TEST_URL || "http://127.0.0.1:4192";
const browser = await chromium.launch({ headless: true });

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
    "okr-brand-results",
    "okr-awards",
    "okr-offline-event-01",
    "okr-offline-event-02",
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
    assert.match(
      await okrPage.locator(".h1-okr-exact-frame").getAttribute("src"),
      /previews\/assets\/figma-exact\/.+\.(?:jpg|png)$/,
      `${pageId} must use an exact Figma image`,
    );

    if (pageId === "okr-offline-event-01") {
      await okrPage.locator(".h1-okr-exact-hotspot").click();
      const modal = reportFrame.locator(".h1-okr-exact-modal");
      await modal.waitFor();
      assert.match(
        await modal.locator(".h1-okr-exact-modal-frame").getAttribute("src"),
        /salon-modal-source\.png$/,
      );
      await modal.locator(".h1-okr-exact-modal-close").click();
      await modal.waitFor({ state: "detached" });
    }

    if (pageId === "okr-offline-event-02") {
      await okrPage.locator(".h1-okr-exact-hotspot").click();
      const modal = reportFrame.locator(".h1-okr-exact-modal");
      await modal.waitFor();
      assert.match(
        await modal.locator(".h1-okr-exact-modal-frame").getAttribute("src"),
        /expo-modal-source\.png$/,
      );
      await modal.locator(".h1-okr-exact-modal-close").click();
      await modal.waitFor({ state: "detached" });
    }
  }

  const finalOkrPage = reportFrame.locator('[data-page-id="okr-offline-event-02"]');
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

console.log("H1 exact Figma OKR shell paging and modal contract passed.");
