import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O2_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-runtime-contract`,
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

  const dataPages = reportFrame.locator(
    '[data-report-section="data"] [data-report-page]',
  );
  const okrPages = reportFrame.locator(
    '[data-report-section="okr"] [data-report-page]',
  );
  const o2Pages = reportFrame.locator(
    '[data-report-section="o2"] [data-report-page]',
  );
  assert.equal(
    await dataPages.count(),
    21,
    "the data section must retain all pages except the removed India chapter",
  );
  assert.equal(
    await okrPages.count(),
    32,
    "the complete 32-page O1 package must stay intact",
  );
  assert.equal(await o2Pages.count(), 27, "the O2 section must render all 27 pages");
  assert.equal(
    await reportFrame.locator("[data-o2-desert-stage]").count(),
    1,
    "the O2 section must expose one shared background stage",
  );

  const expectedIds = [
    "o2-chapter",
    "o2-seo-chapter",
    "o2-seo-overview",
    "o2-seo-organic",
    "o2-seo-top10",
    "o2-seo-five-markets",
    "o2-seo-philippines",
    "o2-seo-south-africa",
    "o2-seo-thailand",
    "o2-seo-india",
    "o2-seo-vietnam",
    "o2-seo-technical",
    "o2-seo-engines",
    "o2-seo-h2-layouts",
    "o2-geo-chapter",
    "o2-geo-baseline",
    "o2-geo-roadmap",
    "o2-aso-chapter",
    "o2-aso-leadership",
    "o2-aso-evidence",
    "o2-paid-ads-chapter",
    "o2-profit-scale",
    "o2-regional-engines",
    "o2-global-delivery",
    "o2-brand-methodology",
    "o2-brand-barrier",
    "o2-ib-loop",
  ];
  assert.deepEqual(
    await o2Pages.evaluateAll((pages) => pages.map((node) => node.dataset.pageId)),
    expectedIds,
  );
  const o2PageSpacing = await o2Pages.evaluateAll((pages) =>
    pages.map((node, index) => {
      const style = getComputedStyle(node);
      const next = pages[index + 1];
      return {
        marginBottom: Number.parseFloat(style.marginBottom),
        paddingTop: Number.parseFloat(style.paddingTop),
        gapAfter: next
          ? next.offsetTop - (node.offsetTop + node.offsetHeight)
          : 0,
      };
    }),
  );
  assert.deepEqual(
    o2PageSpacing,
    o2PageSpacing.map(() => ({
      marginBottom: 0,
      paddingTop: 0,
      gapAfter: 0,
    })),
    "O2 pages must be continuous without a theme-generated blank interval",
  );

  const firstO2 = reportFrame.locator('[data-page-id="o2-chapter"]');
  await firstO2.evaluate((target) =>
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(120);
  assert.ok(
    Math.abs(await firstO2.evaluate((node) => node.getBoundingClientRect().top)) <= 2,
    "the O2 chapter must land exactly on the viewport",
  );

  for (let index = 0; index < expectedIds.length; index += 1) {
    const target = reportFrame.locator(`[data-page-id="${expectedIds[index]}"]`);
    assert.equal(
      (await target.locator(".h1-o2-page-number").innerText())
        .replace(/\s+/g, " ")
        .trim(),
      `${String(index + 1).padStart(2, "0")} / ${String(expectedIds.length).padStart(2, "0")}`,
    );
    assert.equal(
      await target.evaluate((node) => getComputedStyle(node).scrollSnapAlign),
      "start",
    );
    if (index < expectedIds.length - 1) {
      await reportFrame.locator("body").press("PageDown");
      await page.waitForTimeout(1100);
      const next = reportFrame.locator(
        `[data-page-id="${expectedIds[index + 1]}"]`,
      );
      assert.ok(
        Math.abs(await next.evaluate((node) => node.getBoundingClientRect().top)) <= 2,
        `${expectedIds[index + 1]} must snap exactly into the viewport`,
      );
    }
  }

  const background = reportFrame.locator("[data-o2-desert-stage]");
  const backgroundState = await background.evaluate((node) => ({
    image: getComputedStyle(node).backgroundImage,
    position: getComputedStyle(node).position,
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  }));
  assert.match(
    backgroundState.image,
    /figma-desert-vantage-bg\.png/,
  );
  assert.equal(backgroundState.position, "sticky");
  assert.ok(
    Math.abs(backgroundState.width - backgroundState.viewportWidth) <= 1,
  );
  assert.ok(
    Math.abs(backgroundState.height - backgroundState.viewportHeight) <= 2,
  );

  const artboard = reportFrame.locator(
    '[data-page-id="o2-aso-leadership"] .h1-o2-artboard',
  );
  const artboardState = await artboard.evaluate((node) => ({
    width: node.offsetWidth,
    height: node.offsetHeight,
    overflow: getComputedStyle(node).overflow,
  }));
  assert.deepEqual(artboardState, {
    width: 1920,
    height: 1080,
    overflow: "hidden",
  });
  const clippedCards = await reportFrame
    .locator('[data-report-section="o2"] .h1-o2-card')
    .evaluateAll((cards) =>
      cards
        .map((card) => ({
          pageId: card.closest("[data-page-id]")?.dataset.pageId,
          className: card.className,
          verticalOverflow: card.scrollHeight - card.clientHeight,
          horizontalOverflow: card.scrollWidth - card.clientWidth,
        }))
        .filter(
          (card) =>
            card.verticalOverflow > 1 || card.horizontalOverflow > 1,
        ),
    );
  assert.deepEqual(
    clippedCards,
    [],
    "O2 cards must not clip any PPT text or metrics",
  );

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 2560, height: 1440 },
  ]) {
    const responsivePage = await browser.newPage({ viewport });
    await responsivePage.goto(
      `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-responsive-${viewport.width}`,
      { waitUntil: "domcontentloaded" },
    );
    await responsivePage.locator("#loginSubmit").click();
    const responsiveScene = responsivePage.locator('.scene[data-label="Full Report"]');
    await responsiveScene.evaluate((scene) =>
      scene.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    await responsivePage.waitForFunction(() =>
      document
        .querySelector('.scene[data-label="Full Report"]')
        ?.classList.contains("active"),
    );
    const responsiveFrame = responsivePage.locator("#reportFrame").contentFrame();
    await responsiveFrame.locator('body[data-h1-prepared="true"]').waitFor();
    const responsiveO2 = responsiveFrame.locator('[data-page-id="o2-aso-evidence"]');
    await responsiveO2.evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await responsivePage.waitForTimeout(150);
    const responsiveState = await responsiveO2.evaluate((root) => {
      const artboardNode = root.querySelector(".h1-o2-artboard");
      const backgroundNode = root
        .closest("main.h1-o2-report")
        .querySelector("[data-o2-desert-stage]");
      const artboardRect = artboardNode.getBoundingClientRect();
      const backgroundRect = backgroundNode.getBoundingClientRect();
      return {
        pageTop: root.getBoundingClientRect().top,
        artboardWidth: artboardRect.width,
        artboardHeight: artboardRect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        backgroundWidth: backgroundRect.width,
        backgroundHeight: backgroundRect.height,
      };
    });
    assert.ok(Math.abs(responsiveState.pageTop) <= 2);
    assert.ok(
      responsiveState.artboardWidth >= responsiveState.viewportWidth - 1 &&
        responsiveState.artboardHeight >= responsiveState.viewportHeight - 1,
      `the 1920×1080 O2 artboard must cover ${viewport.width}×${viewport.height}`,
    );
    assert.ok(
      Math.abs(
        responsiveState.artboardWidth / responsiveState.artboardHeight - 16 / 9,
      ) <= 0.002,
      "responsive O2 scaling must preserve the 16:9 canvas ratio",
    );
    assert.ok(
      Math.abs(
        responsiveState.backgroundWidth - responsiveState.viewportWidth,
      ) <= 1 &&
        Math.abs(
          responsiveState.backgroundHeight - responsiveState.viewportHeight,
        ) <= 2,
      "the shared O2 background must keep filling the viewport",
    );
    await responsivePage.close();
  }

  await reportFrame.locator("body").press("PageDown");
  const nextSection = reportFrame.locator('[data-page-id="o3-chapter"]');
  await page.waitForTimeout(1100);
  assert.ok(
    Math.abs(await nextSection.evaluate((node) => node.getBoundingClientRect().top)) <= 2,
    "the O3 Vietnam chapter title must follow O2 before the closing scene",
  );

  console.log("H1 O2 runtime paging, background, and isolation checks passed.");
} finally {
  await browser.close();
}
