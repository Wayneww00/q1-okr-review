import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O2_LTV_TEST_URL || "http://127.0.0.1:4391";
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 1756, height: 871 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(
      `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-ltv-label-spacing`,
      { waitUntil: "domcontentloaded" },
    );
    await page.locator("#loginSubmit").click();
    const reportFrame = page.locator("#reportFrame").contentFrame();
    await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

    const target = reportFrame.locator('[data-page-id="o2-regional-engines"]');
    await target.evaluate((node) =>
      window.scrollTo({
        top: node.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(120);

    const geometry = await target.evaluate((root) => {
      const artboard = root.querySelector(".h1-o2-artboard");
      const scale = artboard.getBoundingClientRect().width / 1920;
      const entries = [...root.querySelectorAll(".h1-o2-ltv-bars > div")].map(
        (entry) => {
          const value = entry.querySelector("b").getBoundingClientRect();
          const bar = entry.querySelector("i").getBoundingClientRect();
          return {
            market: entry.querySelector("span").textContent.trim(),
            gap: bar.top - value.bottom,
          };
        },
      );
      return { scale, entries };
    });

    for (const entry of geometry.entries) {
      assert.ok(
        entry.gap >= 8 * geometry.scale - 0.5,
        `${viewport.width}×${viewport.height}: ${entry.market} value must stay at least 8px above its bar; received ${entry.gap.toFixed(2)}px`,
      );
    }

    await page.close();
  }

  console.log("H1 O2 LTV value-label spacing runtime contract passed.");
} finally {
  await browser.close();
}
