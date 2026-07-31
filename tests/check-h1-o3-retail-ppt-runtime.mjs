import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const root = path.resolve(import.meta.dirname, "..");
const screenshotDir = path.join(root, ".tmp");
const baseUrl = process.env.H1_O3_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const runtimeStub = `
  (() => {
    const session = { user: { id: "o3-retail-ppt-runtime-test" } };
    const hasSession = () => localStorage.getItem("vantage-o3-retail-ppt-auth") === "1";
    const client = {
      auth: {
        getSession: async () => ({ data: { session: hasSession() ? session : null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      },
    };
    window.VantageBrowserRuntime = {
      getClient: () => client,
      getSession: async () => (hasSession() ? session : null),
      signIn: async () => {
        localStorage.setItem("vantage-o3-retail-ppt-auth", "1");
        return session;
      },
      resolveMediaUrl: (assetPath) => assetPath,
      setVideoSource: (video, assetPath) => { video.src = assetPath; },
      progressivelyWarmPresentationMedia: async () => {},
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

const expected = {
  "o3-retail-ftd": [
    "越南 2026-H1 FTD 较2025 H2增长近三倍",
    "越南整体 FTD 绝对值较2025 H2增长 197.7%，FTD 越南占比提升 2.8 个百分点。",
    "2026 H1 越南 FTD 半年表现及整体占比变化",
    "7,695",
    "22,910",
    "2.7%",
    "5.5%",
    "+197.7%",
    "+2.8%",
    "Retail FTD（绝对值）",
    "FTD 占 Vantage（占比）",
    "越南 FTD",
    "FTD Vantage 大盘占比",
  ],
  "o3-retail-tv": [
    "越南 2026-H1 TV 较2025 H2增长超过三倍",
    "越南整体 TV 绝对值较2025 H2增长 214%，TV 越南占比提升 1.9 个百分点。",
    "2026 H1 越南 TV 半年表现及整体占比变化",
    "210.3 Bn",
    "660.2 Bn",
    "1.5%",
    "3.4%",
    "+214%",
    "+1.9%",
    "Trading Volume (Bn)",
    "TV 占 Vantage（占比）",
    "越南 TV",
    "TV Vantage 大盘占比",
  ],
};

try {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.route("**/vendor/vantage-runtime.js*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-retail-ppt-runtime`,
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

  for (const [pageId, requiredCopy] of Object.entries(expected)) {
    const target = reportFrame.locator(`[data-page-id="${pageId}"]`);
    await target.evaluate((node) =>
      window.scrollTo({
        top: node.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(120);

    assert.equal(
      await target.getAttribute("data-editor-revision"),
      "vn-retail-h1-ppt-update-v1",
      `${pageId} must isolate the approved PPT baseline from legacy stored edits`,
    );
    const text = (await target.innerText()).replace(/\s+/g, " ").trim();
    for (const copy of requiredCopy) {
      assert.ok(text.includes(copy), `${pageId} must render the PPT content: ${copy}`);
    }
    assert.ok(!text.includes("Julian Song"), `${pageId} must not render the PPT watermark`);

    const geometry = await target.evaluate((node) => {
      const artboard = node.querySelector(".h1-o3-artboard").getBoundingClientRect();
      const selectors = [
        ".h1-o3-page-header",
        ".h1-o3-retail-summary",
        ".h1-o3-chart-card",
        ".h1-o3-retail-chart-legend",
        ".h1-o3-bars",
        ".h1-o3-retail-kpis",
        ".h1-o3-page-number",
      ];
      return {
        pageTop: node.getBoundingClientRect().top,
        pageOverflowX: node.scrollWidth - node.clientWidth,
        pageOverflowY: node.scrollHeight - node.clientHeight,
        titleOverflow:
          node.querySelector(".h1-o3-page-header h2").scrollWidth -
          node.querySelector(".h1-o3-page-header h2").clientWidth,
        cardOverflow: [...node.querySelectorAll(".h1-o3-card")].map((card) => ({
          className: card.className,
          x: card.scrollWidth - card.clientWidth,
          y: card.scrollHeight - card.clientHeight,
        })),
        bounds: selectors.map((selector) => {
          const rect = node.querySelector(selector).getBoundingClientRect();
          return {
            selector,
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            inside:
              rect.left >= artboard.left - 1 &&
              rect.top >= artboard.top - 1 &&
              rect.right <= artboard.right + 1 &&
              rect.bottom <= artboard.bottom + 1,
          };
        }),
      };
    });
    assert.ok(Math.abs(geometry.pageTop) <= 2, `${pageId} must align to the viewport`);
    assert.ok(
      geometry.pageOverflowX <= 1 && geometry.pageOverflowY <= 1,
      `${pageId} must not create page-level overflow`,
    );
    assert.ok(geometry.titleOverflow <= 1, `${pageId} title must not clip`);
    assert.deepEqual(
      geometry.cardOverflow.filter((card) => card.x > 2 || card.y > 2),
      [],
      `${pageId} cards must not clip PPT content`,
    );
    assert.deepEqual(
      geometry.bounds.filter((bound) => !bound.inside),
      [],
      `${pageId} content must stay inside the 1920×1080 artboard`,
    );

    await target.screenshot({
      path: path.join(screenshotDir, `${pageId}-ppt-update.png`),
      animations: "disabled",
    });
  }

  console.log("H1 O3 retail PPT runtime content, geometry, and screenshots passed.");
} finally {
  await browser.close();
}
