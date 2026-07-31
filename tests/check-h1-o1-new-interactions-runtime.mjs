import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O1_TEST_URL || "http://127.0.0.1:4180";
const browserName = process.env.H1_O1_TEST_BROWSER || "chromium";
const expectedO1Ids = [
  "okr-review",
  "okr-brand-experience-audit",
  "okr-brand-results",
  "okr-brand-refresh",
  "okr-brand-operating-system",
  "okr-tvc-matrix",
  "okr-tvc-framework",
  "okr-tvc-library",
  "okr-application-roadmap",
  "okr-high-value-actions",
  "okr-awards",
  "okr-offline-event-01",
  "okr-offline-event-02",
  "okr-elite-client-identity",
  "okr-client-experience-model",
  "okr-client-experience-cases",
  "okr-elite-client-no1-experience",
  "okr-elite-endorsement-resources",
  "okr-elite-ferrari-experience",
  "okr-elite-black-label",
  "okr-elite-business-enablement",
  "okr-merchandise",
  "okr-cfd-public-good-story",
  "okr-cfd-public-good",
  "okr-public-good-video",
  "okr-un-ngo-engagement",
  "okr-ai-recommendation",
  "okr-omnichannel-amplification",
  "okr-tvc-localization",
  "okr-superapp-activation",
  "okr-premium-unlimited",
];
const runtimeStub = `
  (() => {
    const session = { user: { id: "o1-new-full-merge-test" } };
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

const browserType = { chromium, webkit }[browserName];
assert.ok(browserType, `unsupported H1_O1_TEST_BROWSER: ${browserName}`);
const browser = await browserType.launch({ headless: true });
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
    await page.route("**/*.mp4*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "video/mp4",
        body: "",
      }),
    );
    await page.goto(
      `${baseUrl}/index.html?report=h1&embedded=1&audit=o1-new-full-merge`,
      { waitUntil: "domcontentloaded" },
    );
    const o1 = page.locator('main[data-report-section="okr"]');
    await o1.waitFor();

    const sections = page.locator("[data-report-section]");
    assert.deepEqual(
      await sections.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-report-section")),
      ),
      ["data", "okr", "o2", "o3"],
      "the unified report section order must remain Data → O1 → O2 → O3",
    );
    assert.equal(
      await page
        .locator('[data-report-section="data"] [data-report-page]')
        .count(),
      22,
    );
    assert.equal(
      await page
        .locator('[data-report-section="o2"] [data-report-page]')
        .count(),
      27,
    );
    assert.equal(
      await page
        .locator('[data-report-section="o3"] [data-report-page]')
        .count(),
      17,
    );

    const o1Pages = o1.locator(":scope > [data-report-page]");
    assert.equal(await o1Pages.count(), 31);
    assert.deepEqual(
      await o1Pages.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-page-id")),
      ),
      expectedO1Ids,
      "the package's exact 31-page order must render without an extra chapter",
    );
    assert.equal(
      await o1.locator('[data-page-id="o1-chapter"]').count(),
      0,
      "the current custom O1 chapter must not render",
    );

    const numbers = await o1.evaluate((root) => {
      const read = (id) =>
        root
          .querySelector(`[data-page-id="${id}"] .h1-okr-page-number`)
          ?.textContent.replace(/\s+/g, " ")
          .trim();
      return {
        first: read("okr-review"),
        second: read("okr-brand-experience-audit"),
        last: read("okr-premium-unlimited"),
      };
    });
    assert.match(numbers.first || "", /01\s*\/\s*31/);
    assert.match(numbers.second || "", /02\s*\/\s*31/);
    assert.match(numbers.last || "", /31\s*\/\s*31/);

    assert.equal(
      await o1.locator(".h1-okr-image-hotspot").count(),
      30,
      "the 30 intentional source image hotspots must render",
    );
    assert.equal(
      await o1.locator(".h1-okr-video-hotspot").count(),
      8,
      "all eight source modal-video hotspots must render",
    );
    assert.equal(
      await o1.locator("video.h1-okr-inline-video").count(),
      7,
      "all seven source inline videos must render",
    );
    assert.equal(
      await o1.locator(".h1-okr-external-link").count(),
      1,
      "the merchandise external link must render",
    );
    assert.deepEqual(
      await o1.locator(".h1-okr-external-link").evaluate((link) => ({
        href: link.getAttribute("href"),
        target: link.getAttribute("target"),
        rel: link.getAttribute("rel"),
      })),
      {
        href: "https://vantage-objects-452443727878.asia-southeast1.run.app/",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    );
    assert.equal(
      await o1.locator('[contenteditable="true"]').count(),
      0,
      "the imported O1 section must remain fixed content",
    );

    const imageHotspots = o1.locator(".h1-okr-image-hotspot");
    const imageDialog = page.locator(".h1-okr-image-modal");
    for (let hotspotIndex = 0; hotspotIndex < 30; hotspotIndex += 1) {
      const hotspot = imageHotspots.nth(hotspotIndex);
      await hotspot.scrollIntoViewIfNeeded();
      await hotspot.click();
      await imageDialog.waitFor({ state: "visible" });
      assert.match(
        (await imageDialog.getAttribute("aria-label")) || "",
        /^图片预览：.+/,
      );
      if (hotspotIndex % 3 === 0) {
        await page.keyboard.press("Escape");
      } else if (hotspotIndex % 3 === 1) {
        await imageDialog.locator(".h1-okr-image-modal-close").click();
      } else {
        await imageDialog.evaluate((dialog) => dialog.click());
      }
      await imageDialog.waitFor({ state: "detached" });
    }

    const tvcLibrary = o1.locator('[data-page-id="okr-tvc-library"]');
    await tvcLibrary.scrollIntoViewIfNeeded();
    const videoHotspots = tvcLibrary.locator(".h1-okr-video-hotspot");
    const videoDialog = page.locator(".h1-okr-video-modal");
    for (let hotspotIndex = 0; hotspotIndex < 8; hotspotIndex += 1) {
      await videoHotspots.nth(hotspotIndex).click();
      await videoDialog.waitFor({ state: "visible" });
      assert.match(
        (await videoDialog.locator("video source").getAttribute("src")) || "",
        /o1-complete\/tvc-library\/.+\.mp4/,
      );
      assert.equal(
        await videoDialog.locator("video source").getAttribute("type"),
        "video/mp4",
      );
      if (hotspotIndex % 3 === 0) {
        await page.keyboard.press("Escape");
      } else if (hotspotIndex % 3 === 1) {
        await videoDialog.locator(".h1-okr-video-modal-close").click();
      } else {
        await videoDialog.evaluate((dialog) => dialog.click());
      }
      await videoDialog.waitFor({ state: "detached" });
    }

    const inlineVideos = o1.locator("video.h1-okr-inline-video");
    const inlineVideoSources = await inlineVideos.evaluateAll((videos) =>
      videos.map((video) => {
        const source = video.querySelector("source");
        return {
          src: source?.getAttribute("src"),
          type: source?.getAttribute("type"),
          controls: video.hasAttribute("controls"),
          playsInline: video.hasAttribute("playsinline"),
        };
      }),
    );
    assert.ok(
      inlineVideoSources.every(
        (video) =>
          video.controls && video.playsInline && video.type === "video/mp4",
      ),
    );
    assert.deepEqual(
      inlineVideoSources.map((video) =>
        video.src?.replace(/^.*\/tvc-library\//, ""),
      ),
      [
        "ferrari-personal-moment.mp4",
        "cfd-public-good.mp4",
        "cfd-h1-summary.mp4",
        "tvc-brand-main.mp4",
        "tvc-global.mp4",
        "tvc-vietnam.mp4",
        "tvc-thailand.mp4",
      ],
    );

    assert.deepEqual(runtimeErrors, []);
    await page.close();
  }

  console.log("H1 O1 New 31-page runtime interaction contract passed.");
} finally {
  await browser.close();
}
