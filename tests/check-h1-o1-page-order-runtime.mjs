import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O1_TEST_URL || "http://127.0.0.1:4180";
const runtimeStub = `
  (() => {
    const session = { user: { id: "o1-page-order-runtime-test" } };
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

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
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

  const o1 = page.locator('main[data-report-section="okr"]');
  await o1.waitFor();
  const pages = o1.locator(":scope > [data-report-page]");

  assert.equal(await pages.count(), 33);
  assert.deepEqual(
    (await pages.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-page-id")),
    )).slice(0, 9),
    [
      "okr-review",
      "okr-brand-results",
      "okr-brand-build-transition",
      "okr-brand-upgrade-transition",
      "okr-brand-refresh",
      "okr-brand-operating-system",
      "okr-tvc-matrix",
      "okr-brand-experience-audit",
      "okr-tvc-framework",
    ],
  );

  for (const [pageId, number] of [
    ["okr-brand-results", "02"],
    ["okr-brand-build-transition", "03"],
    ["okr-brand-upgrade-transition", "04"],
    ["okr-brand-refresh", "05"],
    ["okr-tvc-matrix", "07"],
    ["okr-brand-experience-audit", "08"],
  ]) {
    const pageNumber = (
      await o1.locator(`[data-page-id="${pageId}"] .h1-okr-page-number`).innerText()
    )
      .replace(/\s+/g, " ")
      .trim();
    assert.match(pageNumber, new RegExp(`^${number}\\s*\\/\\s*33$`));
  }

  assert.deepEqual(runtimeErrors, []);
} finally {
  await browser.close();
}

console.log("H1 O1 requested page order runtime contract passed.");
