import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_OKR_TEST_URL || "http://127.0.0.1:4180";
const expectedThemeVersion = "20260730-okr-o2-boundary-v1";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=okr-o2-boundary`,
    { waitUntil: "domcontentloaded" },
  );
  assert.match(
    await page.locator("#h1-figma-racing-shell").getAttribute("href"),
    new RegExp(`${expectedThemeVersion}$`),
    "the immersive shell must cache-bust the O1-to-O2 boundary fix",
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
  assert.match(
    await reportFrame
      .locator("#h1-standalone-racing-theme")
      .getAttribute("href"),
    new RegExp(`${expectedThemeVersion}$`),
    "the embedded report must cache-bust the O1-to-O2 boundary fix",
  );

  const chapter = reportFrame.locator('[data-page-id="o2-chapter"]');
  await chapter.evaluate((target) =>
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await page.waitForFunction(() =>
    document
      .querySelector("#reportFrame")
      ?.contentDocument?.querySelector('[data-page-id="o2-chapter"]')
      ?.classList.contains("is-active"),
  );

  const boundary = await chapter.evaluate((root) => {
    const heading = root.querySelector(".h1-objective-chapter-heading");
    const backdrop = document.querySelector(".h1-okr-shared-backdrop");
    const okrReport = document.querySelector("main.h1-okr-report");
    const headingRect = heading.getBoundingClientRect();
    const x = headingRect.left + headingRect.width / 2;
    const y = headingRect.top + headingRect.height / 2;
    const previousPointerEvents = backdrop.style.pointerEvents;

    backdrop.style.pointerEvents = "auto";
    const stack = document.elementsFromPoint(x, y).map((node) => ({
      className:
        typeof node.className === "string" ? node.className : node.tagName,
      pageId: node.closest("[data-page-id]")?.dataset.pageId || "",
    }));
    backdrop.style.pointerEvents = previousPointerEvents;

    return {
      heading: heading.innerText.replace(/\s+/g, " ").trim(),
      pageNumber: root
        .querySelector(".h1-o2-page-number")
        .textContent.replace(/\s+/g, " ")
        .trim(),
      chapterTop: root.getBoundingClientRect().top,
      okrBottom: okrReport.getBoundingClientRect().bottom,
      backdropTop: backdrop.getBoundingClientRect().top,
      backdropBottom: backdrop.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
      topPaintedPageId: stack[0]?.pageId || "",
      topPaintedClass: stack[0]?.className || "",
    };
  });

  assert.equal(
    boundary.heading,
    "O2 以全面增长为核心，持续放大优势",
    "the approved O2 chapter must remain present",
  );
  assert.equal(boundary.pageNumber, "01 / 25");
  assert.ok(Math.abs(boundary.chapterTop) <= 2);
  assert.ok(Math.abs(boundary.okrBottom) <= 2);
  assert.ok(
    boundary.backdropTop < boundary.viewportHeight &&
      boundary.backdropBottom > 0,
    "the regression probe must reproduce the outgoing sticky trophy layer",
  );
  assert.equal(
    boundary.topPaintedPageId,
    "o2-chapter",
    `the O2 chapter must paint above the outgoing trophy layer; top layer was ${boundary.topPaintedClass}`,
  );

  console.log("H1 O1-to-O2 visual boundary check passed.");
} finally {
  await browser.close();
}
