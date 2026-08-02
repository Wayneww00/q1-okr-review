import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O1_TEST_URL || "http://127.0.0.1:4180";
const runtimeStub = `
  (() => {
    const session = { user: { id: "o1-full-folder-runtime-test" } };
    const client = {
      auth: {
        getSession: async () => ({ data: { session }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    };
    window.VantageBrowserRuntime = {
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
const expectedO1Ids = [
  "okr-review",
  "okr-brand-results",
  "okr-brand-build-transition",
  "okr-brand-upgrade-transition",
  "okr-brand-refresh",
  "okr-brand-operating-system",
  "okr-tvc-matrix",
  "okr-tvc-framework",
  "okr-tvc-library",
  "okr-brand-experience-audit",
  "okr-application-roadmap",
  "okr-high-value-actions",
  "okr-awards-transition",
  "okr-awards",
  "okr-offline-events-transition",
  "okr-offline-event-01",
  "okr-offline-event-02",
  "okr-elite-client-service-transition",
  "okr-elite-client-identity",
  "okr-client-experience-model",
  "okr-client-experience-cases",
  "okr-elite-client-no1-experience",
  "okr-elite-endorsement-resources",
  "okr-elite-ferrari-experience",
  "okr-elite-black-label",
  "okr-elite-business-enablement",
  "okr-merchandise-transition",
  "okr-merchandise",
  "okr-public-good-transition",
  "okr-cfd-public-good-story",
  "okr-cfd-public-good",
  "okr-public-good-video",
  "okr-un-ngo-engagement",
  "okr-integrated-marketing-transition",
  "okr-omnichannel-amplification",
  "okr-ai-recommendation",
  "okr-tvc-localization",
  "okr-q3-24-7-mindshare",
  "okr-superapp-activation",
  "okr-premium-unlimited",
];

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ]) {
  const page = await browser.newPage({ viewport });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.route("**/vendor/vantage-runtime.js*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );

  await page.goto(`${baseUrl}/index.html?report=h1&embedded=1`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator('main[data-report-section="okr"]').waitFor();

  const sections = page.locator("[data-report-section]");
  assert.equal(await sections.nth(0).getAttribute("data-report-section"), "data");
  assert.equal(await sections.nth(1).getAttribute("data-report-section"), "okr");
  assert.equal(await sections.nth(2).getAttribute("data-report-section"), "o2");
  assert.equal(await sections.nth(3).getAttribute("data-report-section"), "o3");

  assert.equal(
    await page.locator('[data-report-section="data"] [data-report-page]').count(),
    20,
  );
  assert.equal(
    await page.locator('[data-report-section="o2"] [data-report-page]').count(),
    27,
  );
  assert.equal(
    await page.locator('[data-report-section="o3"] [data-report-page]').count(),
    17,
  );

  const o1Pages = page.locator(
    'main[data-report-section="okr"] > [data-report-page]',
  );
  assert.equal(await o1Pages.count(), 40);
  assert.deepEqual(
    await o1Pages.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-page-id")),
    ),
    expectedO1Ids,
  );

  assert.deepEqual(
    await page
      .locator('[data-report-section="o2"] [data-report-page]')
      .evaluateAll((nodes) =>
        nodes.slice(0, 2).map((node) => node.getAttribute("data-page-id")),
      ),
    ["o2-chapter", "o2-seo-chapter"],
  );

  for (const pageId of expectedO1Ids) {
    await page
      .locator(`[data-report-section="okr"] [data-page-id="${pageId}"]`)
      .scrollIntoViewIfNeeded();
    await page.waitForFunction((targetPageId) => {
      const target = document.querySelector(
        `[data-report-section="okr"] [data-page-id="${targetPageId}"]`,
      );
      const images = [...(target?.querySelectorAll("img[data-deferred-src]") || [])];
      return images.every(
        (image) =>
          image.hasAttribute("src") &&
          image.complete &&
          image.naturalWidth > 0 &&
          image.naturalHeight > 0,
      );
    }, pageId);
  }

  const visualHealth = await page
    .locator('main[data-report-section="okr"]')
    .evaluate((root) => ({
      viewportHeight: window.innerHeight,
      shortPages: [...root.querySelectorAll(":scope > [data-report-page]")]
        .filter((node) => node.getBoundingClientRect().height < window.innerHeight - 1)
        .map((node) => node.getAttribute("data-page-id")),
      brokenImages: [...root.querySelectorAll("img")]
        .filter(
          (image) =>
            image.hasAttribute("src") &&
            (image.naturalWidth === 0 || image.naturalHeight === 0),
        )
        .map((image) => image.getAttribute("src")),
      firstNumber: root
        .querySelector('[data-page-id="okr-review"] .h1-okr-page-number')
        ?.textContent.replace(/\s+/g, " ")
        .trim(),
      lastNumber: root
        .querySelector('[data-page-id="okr-premium-unlimited"] .h1-okr-page-number')
        ?.textContent.replace(/\s+/g, " ")
        .trim(),
    }));

  assert.deepEqual(visualHealth.shortPages, []);
  assert.deepEqual(visualHealth.brokenImages, []);
  assert.match(visualHealth.firstNumber || "", /01\s*\/\s*40/);
  assert.match(visualHealth.lastNumber || "", /40\s*\/\s*40/);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
  }
} finally {
  await browser.close();
}

console.log(
  "H1 O1 40-page source package, asset health, and O1 → O2 boundary contract passed.",
);
