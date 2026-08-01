import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_ND_TEST_URL || "http://127.0.0.1:4292";
for (const [browserName, browserType] of [
  ["Chromium", chromium],
  ["WebKit", webkit],
]) {
  const browser = await browserType.launch({ headless: true });
  try {
    for (const viewport of [
      { width: 1366, height: 768 },
      { width: 1600, height: 800 },
      { width: 2048, height: 1152 },
    ]) {
      const page = await browser.newPage({ viewport });
      page.setDefaultTimeout(15_000);
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await page.goto(
        `${baseUrl}/previews/vantage-h1-immersive.html?audit=mib-bottom-${viewport.width}`,
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
      await reportFrame
        .locator('body[data-h1-prepared="true"]')
        .waitFor({ state: "attached" });

      const target = reportFrame.locator('[data-page-id="data-19"]');
      await target.waitFor({ state: "attached" });
      await target.evaluate((element) =>
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY,
          behavior: "instant",
        }),
      );

      const geometry = await target.evaluate((root) => {
        const rect = (element) => {
          const bounds = element.getBoundingClientRect();
          return {
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom,
            left: bounds.left,
          };
        };
        return [
          ...root.querySelectorAll(".h1-retail-growth-factor-panel"),
        ].map((panel) => {
          const panelRect = rect(panel);
          const plotRect = rect(
            panel.querySelector(".h1-retail-growth-mib-plot"),
          );
          const svgRect = rect(panel.querySelector("svg"));
          const caption = panel.querySelector(
            ".h1-retail-growth-mib-caption",
          );
          const captionRect = rect(caption);
          const categories = [
            ...panel.querySelectorAll(".h1-retail-growth-mib-category"),
          ].map(rect);
          return {
            caption: caption.textContent.trim(),
            plotInsidePanel:
              plotRect.top >= panelRect.top &&
              plotRect.bottom <= panelRect.bottom,
            svgInsidePlot:
              svgRect.top >= plotRect.top - 1 &&
              svgRect.bottom <= plotRect.bottom + 1,
            categoriesInsidePlot: categories.every(
              (category) =>
                category.top >= plotRect.top &&
                category.bottom <= plotRect.bottom - 8,
            ),
            plotBeforeCaption: plotRect.bottom <= captionRect.top + 1,
            captionInsidePanel: captionRect.bottom <= panelRect.bottom - 8,
          };
        });
      });

      assert.deepEqual(
        geometry.map((panel) => panel.caption),
        [
          "Q2 MIB 用户类型人数及其贡献ND占比",
          "2026-Q2 Retail 转IB 用户 注册到IB转化日间隔和 ND 影响分布",
        ],
        `${browserName} ${viewport.width}×${viewport.height} must retain both source captions`,
      );
      for (const panel of geometry) {
        assert.equal(panel.plotInsidePanel, true);
        assert.equal(panel.svgInsidePlot, true);
        assert.equal(panel.categoriesInsidePlot, true);
        assert.equal(panel.plotBeforeCaption, true);
        assert.equal(panel.captionInsidePanel, true);
      }
      assert.deepEqual(pageErrors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

console.log("MIB bottom-caption compatibility runtime contract passes.");
