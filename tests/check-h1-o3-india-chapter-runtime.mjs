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
  const consoleErrors = [];
  const missingResources = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() === 404) missingResources.push(response.url());
  });
  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-india-chapter`, { waitUntil: "domcontentloaded" });
  await page.locator("#loginSubmit").click();
  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) => scene.scrollIntoView({ behavior: "instant", block: "start" }));
  await page.waitForFunction(() => document.querySelector('.scene[data-label="Full Report"]')?.classList.contains("active"));

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  const o3Pages = reportFrame.locator('[data-report-section="o3"] [data-report-page]');
  assert.equal(await o3Pages.count(), 17);
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
    const wait = node.querySelector(".h1-o3-india-wait").getBoundingClientRect();
    const ghost = node.querySelector(".h1-o3-india-wait-ghost");
    const number = node.querySelector(".h1-o3-india-wait p strong");
    const label = node.querySelector(".h1-o3-india-wait p span");
    const imageBounds = image.getBoundingClientRect();
    const imageStyle = getComputedStyle(image);
    const waitStyle = getComputedStyle(node.querySelector(".h1-o3-india-wait"));
    const ghostStyle = getComputedStyle(ghost);
    const numberStyle = getComputedStyle(number);
    const labelStyle = getComputedStyle(label);
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      pageTop: node.getBoundingClientRect().top,
      overflowX: node.scrollWidth - node.clientWidth,
      overflowY: node.scrollHeight - node.clientHeight,
      artboard: { left: artboard.left, top: artboard.top, right: artboard.right, bottom: artboard.bottom },
      wait: { left: wait.left, top: wait.top, right: wait.right, bottom: wait.bottom },
      imageBounds: { left: imageBounds.left, top: imageBounds.top, right: imageBounds.right, bottom: imageBounds.bottom },
      objectFit: imageStyle.objectFit,
      pointerEvents: { image: imageStyle.pointerEvents, wait: waitStyle.pointerEvents },
      ghostStroke: ghostStyle.webkitTextStrokeWidth,
      fontSizes: { number: parseFloat(numberStyle.fontSize), label: parseFloat(labelStyle.fontSize) },
      image: { naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight },
      text: node.innerText.replace(/\s+/g, " ").trim(),
    };
  });
  assert.ok(Math.abs(state.pageTop) <= 2);
  assert.ok(state.overflowX <= 1 && state.overflowY <= 1, JSON.stringify(state));
  assert.deepEqual(state.image, { naturalWidth: 2280, naturalHeight: 1346 });
  assert.equal(state.objectFit, "cover");
  assert.deepEqual(state.pointerEvents, { image: "none", wait: "none" });
  assert.ok(Math.abs(state.imageBounds.left - state.artboard.left) <= 1);
  assert.ok(Math.abs(state.imageBounds.top - state.artboard.top) <= 1);
  assert.ok(Math.abs(state.imageBounds.right - state.artboard.right) <= 1);
  assert.ok(Math.abs(state.imageBounds.bottom - state.artboard.bottom) <= 1);
  assert.ok(state.artboard.left <= 1, JSON.stringify(state));
  assert.ok(state.artboard.top <= 1, JSON.stringify(state));
  assert.ok(state.artboard.right >= state.viewport.width - 1, JSON.stringify(state));
  assert.ok(state.artboard.bottom >= state.viewport.height - 1, JSON.stringify(state));
  assert.ok(state.wait.left >= state.artboard.left + 900);
  assert.ok(state.wait.right <= state.artboard.right + 1);
  assert.ok(
    state.wait.top >= state.artboard.top + (state.artboard.bottom - state.artboard.top) * 0.64,
    JSON.stringify(state),
  );
  assert.ok(state.wait.bottom <= state.artboard.bottom + 1);
  assert.notEqual(state.ghostStroke, "0px");
  assert.ok(state.fontSizes.number >= state.fontSizes.label * 2);
  assert.match(state.text, /PROJECT COUNTDOWN 145\s*天的等待 17 \/ 17/);

  const waitForReportPage = (pageId) => page.waitForFunction((targetPageId) => {
    const frame = document.querySelector("#reportFrame");
    const target = frame?.contentDocument?.querySelector(`[data-page-id="${targetPageId}"]`);
    return target
      && target.classList.contains("is-active")
      && Math.abs(target.getBoundingClientRect().top) <= 2;
  }, pageId);
  const reportBody = reportFrame.locator("body");
  await reportBody.press("ArrowUp");
  await waitForReportPage("o3-vn-key-insight");
  await reportBody.press("ArrowDown");
  await waitForReportPage("o3-india-chapter");

  const countdownBox = await indiaPage.locator(".h1-o3-india-wait").boundingBox();
  assert.ok(countdownBox);
  await page.mouse.move(
    countdownBox.x + countdownBox.width / 2,
    countdownBox.y + countdownBox.height / 2,
  );
  await page.mouse.wheel(0, -320);
  await waitForReportPage("o3-vn-key-insight");
  await page.waitForTimeout(240);
  await page.mouse.wheel(0, 320);
  await waitForReportPage("o3-india-chapter");

  const screenshotDir = path.join(root, ".tmp");
  fs.mkdirSync(screenshotDir, { recursive: true });
  await indiaPage.screenshot({ path: path.join(screenshotDir, "o3-india-chapter-final.png") });

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 2560, height: 1440 },
  ]) {
    await page.setViewportSize(viewport);
    await indiaPage.evaluate((target) => window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }));
    await waitForReportPage("o3-india-chapter");
    const responsive = await indiaPage.evaluate((node) => {
      const artboard = node.querySelector(".h1-o3-artboard").getBoundingClientRect();
      const image = node.querySelector(".h1-o3-india-background").getBoundingClientRect();
      const wait = node.querySelector(".h1-o3-india-wait").getBoundingClientRect();
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        artboard: { left: artboard.left, top: artboard.top, right: artboard.right, bottom: artboard.bottom },
        image: { left: image.left, top: image.top, right: image.right, bottom: image.bottom },
        wait: { left: wait.left, top: wait.top, right: wait.right, bottom: wait.bottom },
      };
    });
    assert.ok(Math.abs(responsive.image.left - responsive.artboard.left) <= 1);
    assert.ok(Math.abs(responsive.image.top - responsive.artboard.top) <= 1);
    assert.ok(Math.abs(responsive.image.right - responsive.artboard.right) <= 1);
    assert.ok(Math.abs(responsive.image.bottom - responsive.artboard.bottom) <= 1);
    assert.ok(responsive.artboard.left <= 1, JSON.stringify(responsive));
    assert.ok(responsive.artboard.top <= 1, JSON.stringify(responsive));
    assert.ok(responsive.artboard.right >= responsive.viewport.width - 1, JSON.stringify(responsive));
    assert.ok(responsive.artboard.bottom >= responsive.viewport.height - 1, JSON.stringify(responsive));
    assert.ok(responsive.wait.left >= responsive.artboard.left);
    assert.ok(responsive.wait.right <= responsive.artboard.right + 1);
    assert.ok(responsive.wait.top >= responsive.artboard.top);
    assert.ok(responsive.wait.bottom <= responsive.artboard.bottom + 1);
    await indiaPage.screenshot({
      path: path.join(screenshotDir, `o3-india-${viewport.width}x${viewport.height}.png`),
    });
  }

  assert.deepEqual(missingResources.filter((url) => /india/i.test(url)), []);
  assert.deepEqual(
    consoleErrors.filter((message) => !message.startsWith("Failed to load resource:")),
    [],
  );
  console.log("H1 O3 India fullscreen, keyboard/wheel paging, responsive bounds, and console checks passed.");
} finally {
  await browser.close();
}
