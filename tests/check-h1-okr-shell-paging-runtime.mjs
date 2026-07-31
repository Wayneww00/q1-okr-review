import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_OKR_TEST_URL || "http://127.0.0.1:4180";
const runtimeStub = `
  (() => {
    const session = { user: { id: "o1-shell-paging-test" } };
    const client = {
      auth: {
        getSession: async () => ({ data: { session }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    };
    window.VantageBrowserRuntime = {
      signIn: async () => session,
      getClient: () => client,
      getSession: async () => session,
      resolveMediaUrl: (path) => path,
      createReportController: () => ({
        initialize: async () => true,
        beginEditing() {},
        save: async () => {},
        discard() {},
        destroy() {},
      }),
    };
  })();
`;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.route("**/vendor/vantage-runtime.js*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o1-full-shell-runtime`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForTimeout(250);
  if (await page.locator("#loginGate").isVisible()) {
    await page.locator("#loginSubmit").evaluate((button) => button.click());
  }

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
  assert.equal(await reportPages.count(), 94);

  assert.equal(
    await reportFrame
      .locator('[data-report-section="data"] [data-report-page]')
      .count(),
    21,
  );
  assert.equal(
    await reportFrame
      .locator('[data-report-section="okr"] [data-report-page]')
      .count(),
    31,
  );
  assert.equal(
    await reportFrame
      .locator('[data-report-section="o2"] [data-report-page]')
      .count(),
    25,
  );
  assert.equal(
    await reportFrame
      .locator('[data-report-section="o3"] [data-report-page]')
      .count(),
    17,
  );

  const waitForActivePage = (pageId) =>
    page.waitForFunction(
      (targetPageId) =>
        document
          .querySelector("#reportFrame")
          ?.contentDocument?.querySelector(
            `[data-page-id="${targetPageId}"]`,
          )
          ?.classList.contains("is-active"),
      pageId,
    );

  const scrollFrameToPage = async (pageId) => {
    await reportFrame.locator(`[data-page-id="${pageId}"]`).evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await waitForActivePage(pageId);
  };

  await scrollFrameToPage("data-21");
  await page.locator("body").press("PageDown");
  await waitForActivePage("okr-review");
  assert.match(
    (
      await reportFrame
        .locator('[data-page-id="okr-review"] .h1-okr-page-number')
        .innerText()
    )
      .replace(/\s+/g, " ")
      .trim(),
    /^01\s*\/\s*31$/,
  );
  await page.locator("body").press("PageDown");
  await waitForActivePage("okr-brand-experience-audit");
  assert.match(
    (
      await reportFrame
        .locator(
          '[data-page-id="okr-brand-experience-audit"] .h1-okr-page-number',
        )
        .innerText()
    )
      .replace(/\s+/g, " ")
      .trim(),
    /^02\s*\/\s*31$/,
  );

  await scrollFrameToPage("okr-premium-unlimited");
  assert.match(
    (
      await reportFrame
        .locator(
          '[data-page-id="okr-premium-unlimited"] .h1-okr-page-number',
        )
        .innerText()
    )
      .replace(/\s+/g, " ")
      .trim(),
    /^31\s*\/\s*31$/,
  );

  await page.locator("body").press("PageDown");
  await waitForActivePage("o2-chapter");
  await page.locator("body").press("PageDown");
  await waitForActivePage("o2-seo-chapter");

  await scrollFrameToPage("o2-ib-loop");
  await page.locator("body").press("PageDown");
  await waitForActivePage("o3-chapter");
  await page.locator("body").press("PageDown");
  await waitForActivePage("o3-retail-ftd");

  await page.locator("body").press("PageUp");
  await waitForActivePage("o3-chapter");
  await page.locator("body").press("PageUp");
  await waitForActivePage("o2-ib-loop");

  await page.locator("body").press("PageUp");
  await waitForActivePage("o2-brand-barrier");
  await scrollFrameToPage("o2-chapter");
  await page.locator("body").press("PageUp");
  await waitForActivePage("okr-premium-unlimited");

  await scrollFrameToPage("okr-review");
  await page.locator("body").press("PageUp");
  await waitForActivePage("data-21");
} finally {
  await browser.close();
}

console.log(
  "H1 immersive paging passed through the 31-page O1 package, O2 and O3.",
);
