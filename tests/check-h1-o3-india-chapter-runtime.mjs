import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const root = path.resolve(import.meta.dirname, "..");
const baseUrl = process.env.H1_O3_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-india-chapter`, { waitUntil: "domcontentloaded" });
  await page.locator("#loginSubmit").click();
  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) => scene.scrollIntoView({ behavior: "instant", block: "start" }));
  await page.waitForFunction(() => document.querySelector('.scene[data-label="Full Report"]')?.classList.contains("active"));

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  const o3Pages = reportFrame.locator('[data-report-section="o3"] [data-report-page]');
  assert.equal(await o3Pages.count(), 18);
  assert.deepEqual(
    await o3Pages.evaluateAll((pages) => pages.slice(-2).map((node) => node.dataset.pageId)),
    ["o3-vn-key-insight", "o3-india-chapter"],
  );

  const indiaPage = reportFrame.locator('[data-page-id="o3-india-chapter"]');
  await indiaPage.evaluate((target) => window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY,
    behavior: "instant",
  }));
  await indiaPage.locator(".h1-o3-india-background").evaluate((image) => {
    if (image.complete && image.naturalWidth > 0) return;
    return new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", reject, { once: true });
    });
  });

  const state = await indiaPage.evaluate((node) => {
    const artboard = node.querySelector(".h1-o3-artboard").getBoundingClientRect();
    const image = node.querySelector(".h1-o3-india-background");
    const copy = node.querySelector(".h1-o3-india-copy").getBoundingClientRect();
    return {
      pageTop: node.getBoundingClientRect().top,
      overflowX: node.scrollWidth - node.clientWidth,
      overflowY: node.scrollHeight - node.clientHeight,
      artboard: { left: artboard.left, top: artboard.top, right: artboard.right, bottom: artboard.bottom },
      copy: { left: copy.left, top: copy.top, right: copy.right, bottom: copy.bottom },
      image: { naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
      text: node.innerText.replace(/\s+/g, " ").trim(),
    };
  });
  assert.ok(Math.abs(state.pageTop) <= 2);
  assert.ok(state.overflowX <= 1 && state.overflowY <= 1);
  assert.ok(state.image.naturalWidth >= 1600 && state.image.naturalHeight >= 900);
  assert.ok(state.copy.left >= state.artboard.left + 900);
  assert.ok(state.copy.right <= state.artboard.right + 1);
  assert.ok(state.copy.top >= state.artboard.top);
  assert.ok(state.copy.bottom <= state.artboard.bottom + 1);
  assert.match(state.text, /印度 2026年H2 SSS级项目 18 \/ 18/);

  const screenshotDir = path.join(root, ".tmp");
  fs.mkdirSync(screenshotDir, { recursive: true });
  await indiaPage.locator(".h1-o3-artboard").screenshot({ path: path.join(screenshotDir, "o3-india-chapter-final.png") });
  console.log("H1 O3 India chapter runtime and visual bounds passed.");
} finally {
  await browser.close();
}
