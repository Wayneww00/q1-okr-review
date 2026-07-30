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
    const session = { user: { id: "o3-highlight-lightbox-test" } };
    const hasSession = () => localStorage.getItem("vantage-o3-highlight-lightbox-auth") === "1";
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
        localStorage.setItem("vantage-o3-highlight-lightbox-auth", "1");
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
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-highlight-lightbox`,
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

  const highlightPage = reportFrame.locator(
    '[data-page-id="o3-highlight-content"]',
  );
  await highlightPage.evaluate((node) =>
    window.scrollTo({
      top: node.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );

  const triggers = highlightPage.locator(
    ".h1-o3-101-facebook-proof .h1-source-image-trigger",
  );
  if (process.env.H1_O3_SCREENSHOT) {
    await highlightPage.screenshot({ path: process.env.H1_O3_SCREENSHOT });
  }
  assert.equal(
    await triggers.count(),
    3,
    "the highlight page must expose all three source images as zoom controls",
  );
  const zoomOpacity = await triggers
    .first()
    .locator(".h1-source-image-zoom")
    .evaluate((node) => Number.parseFloat(getComputedStyle(node).opacity));
  assert.ok(
    zoomOpacity >= 0.7,
    "the highlight images must show a visible zoom affordance",
  );

  const expectedFullSources = [
    "facebook-highlights.png",
    "facebook-feed.png",
    "youtube-highlights.png",
  ];
  for (let index = 0; index < expectedFullSources.length; index += 1) {
    await triggers.nth(index).click();
    const dialog = reportFrame.locator(".h1-source-image-modal");
    await dialog.waitFor({ state: "visible" });
    const fullImage = dialog.locator("img");
    await fullImage.evaluate(
      (image) =>
        image.complete ||
        new Promise((resolve, reject) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        }),
    );
    const imageMetrics = await fullImage.evaluate((image) => ({
      src: image.getAttribute("src"),
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      objectFit: getComputedStyle(image).objectFit,
    }));
    assert.ok(
      imageMetrics.src.endsWith(expectedFullSources[index]),
      `image ${index + 1} must open its original high-resolution source`,
    );
    assert.ok(
      imageMetrics.naturalWidth >= 2300 && imageMetrics.naturalHeight >= 1400,
      `image ${index + 1} must retain high-resolution source dimensions`,
    );
    assert.equal(
      imageMetrics.objectFit,
      "contain",
      "the enlarged source image must remain uncropped",
    );
    if (index === 0 && process.env.H1_O3_MODAL_SCREENSHOT) {
      await dialog.screenshot({ path: process.env.H1_O3_MODAL_SCREENSHOT });
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
  }

  console.log("H1 O3 highlight high-resolution lightbox contract passed.");
} finally {
  await browser.close();
}
