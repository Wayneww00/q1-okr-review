import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O1_TEST_URL || "http://127.0.0.1:4180";
const runtimeStub = `
  (() => {
    const session = { user: { id: "o1-awards-noninteractive-test" } };
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
      progressivelyWarmPresentationMedia: async () => ({
        completed: 0,
        failed: 0,
        skipped: false,
        total: 0,
      }),
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
  const page = await browser.newPage({ viewport: { width: 1706, height: 878 } });
  await page.route("**/vendor/vantage-runtime.js*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );
  await page.route("**/*.mp4*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "video/mp4",
      body: "",
    }),
  );
  await page.goto(`${baseUrl}/index.html?report=h1&embedded=1`, {
    waitUntil: "domcontentloaded",
  });

  const o1 = page.locator('main[data-report-section="okr"]');
  await o1.waitFor();
  const awardsPage = o1.locator('[data-page-id="okr-awards"]');
  await awardsPage.waitFor();

  assert.equal(
    await awardsPage.locator(".h1-okr-image-hotspot").count(),
    0,
    "the awards thumbnails must not have zoom-in hotspots",
  );
  assert.equal(
    await awardsPage.locator('button[aria-label^="放大查看："]').count(),
    0,
    "the awards thumbnails must not expose image-preview buttons",
  );
  assert.equal(
    await awardsPage.evaluate((node) =>
      [...node.querySelectorAll("*")].filter(
        (element) => getComputedStyle(element).cursor === "zoom-in",
      ).length,
    ),
    0,
    "the awards page must not show a zoom-in cursor",
  );
  assert.ok(
    (await o1.locator(".h1-okr-image-hotspot").count()) > 0,
    "other O1 image previews must remain available",
  );

  console.log("H1 O1 awards noninteractive runtime check passed.");
} finally {
  await browser.close();
}
