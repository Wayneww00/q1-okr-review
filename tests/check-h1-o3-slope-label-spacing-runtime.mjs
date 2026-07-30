import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O3_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const runtimeStub = `
  (() => {
    const session = { user: { id: "o3-slope-spacing-test" } };
    const hasSession = () => localStorage.getItem("vantage-o3-slope-spacing-auth") === "1";
    const client = {
      auth: {
        getSession: async () => ({ data: { session: hasSession() ? session : null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    };
    window.VantageBrowserRuntime = {
      getClient: () => client,
      getSession: async () => (hasSession() ? session : null),
      signIn: async () => {
        localStorage.setItem("vantage-o3-slope-spacing-auth", "1");
        return session;
      },
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

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.route("**/vendor/vantage-runtime.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-slope-spacing`,
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

  const seoPage = reportFrame.locator('[data-page-id="o3-seo"]');
  await seoPage.evaluate((node) =>
    window.scrollTo({
      top: node.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );

  const metrics = await seoPage.locator(".h1-o3-slope-chart").evaluate((chart) => {
    const selectors = [
      ".h1-o3-slope-from",
      ".h1-o3-slope-to",
      ".h1-o3-slope-vantage",
      ".h1-o3-slope-rivals",
    ];
    const rect = (node) => {
      const value = node.getBoundingClientRect();
      return {
        left: value.left,
        right: value.right,
        top: value.top,
        bottom: value.bottom,
      };
    };
    return {
      chart: rect(chart),
      labels: Object.fromEntries(
        selectors.map((selector) => [
          selector,
          rect(chart.querySelector(selector)),
        ]),
      ),
    };
  });

  const overlapsWithGap = (a, b, gap = 8) =>
    !(
      a.right + gap <= b.left ||
      b.right + gap <= a.left ||
      a.bottom + gap <= b.top ||
      b.bottom + gap <= a.top
    );

  const currentValue = metrics.labels[".h1-o3-slope-to"];
  const seriesName = metrics.labels[".h1-o3-slope-vantage"];
  if (process.env.H1_O3_DEBUG) {
    console.log(JSON.stringify(metrics, null, 2));
  }
  assert.equal(
    overlapsWithGap(currentValue, seriesName, 8),
    false,
    'the current rank "25" and "Vantage" label must retain at least 8px spacing',
  );

  for (const label of Object.values(metrics.labels)) {
    assert.ok(
      label.left >= metrics.chart.left - 36 &&
        label.right <= metrics.chart.right + 36,
      "slope-chart annotations must stay close to the chart instead of leaking into the table",
    );
  }

  if (process.env.H1_O3_SCREENSHOT) {
    await seoPage.screenshot({ path: process.env.H1_O3_SCREENSHOT });
  }

  console.log("H1 O3 slope label spacing contract passed.");
} finally {
  await browser.close();
}
