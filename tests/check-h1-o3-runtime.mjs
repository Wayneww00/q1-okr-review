import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O3_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-runtime-contract`,
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
  assert.ok(
    await reportFrame.locator('[data-report-section="data"] [data-report-page]').count() >=
      14,
    "the existing data deck must not lose pages",
  );
  assert.ok(
    await reportFrame.locator('[data-report-section="okr"] [data-report-page]').count() >=
      31,
    "the existing O1 deck must not lose pages",
  );
  assert.ok(
    await reportFrame.locator('[data-report-section="o2"] [data-report-page]').count() >=
      25,
    "the existing O2 deck must not lose pages",
  );
  const o3Pages = reportFrame.locator(
    '[data-report-section="o3"] [data-report-page]',
  );
  assert.equal(
    await o3Pages.count(),
    17,
    "O3 must render the restored Vietnam title plus 16 substantive pages",
  );
  assert.equal(
    await reportFrame.locator("[data-o3-trophy-stage]").count(),
    1,
    "O3 must expose one shared background stage",
  );
  const o3PageSpacing = await o3Pages.evaluateAll((pages) =>
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
    o3PageSpacing,
    o3PageSpacing.map(() => ({
      marginBottom: 0,
      paddingTop: 0,
      gapAfter: 0,
    })),
    "O3 pages must be continuous without a trophy-only blank interval",
  );

  for (let index = 0; index < 17; index += 1) {
    const pageNode = o3Pages.nth(index);
    assert.equal(
      (await pageNode.locator(".h1-o3-page-number").innerText())
        .replace(/\s+/g, " ")
        .trim(),
      `${String(index + 1).padStart(2, "0")} / 17`,
    );
    assert.equal(
      await pageNode.evaluate((node) => getComputedStyle(node).scrollSnapAlign),
      "start",
    );
  }

  const firstO3 = reportFrame.locator('[data-page-id="o3-chapter"]');
  await firstO3.evaluate((target) =>
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(150);
  assert.ok(
    Math.abs(await firstO3.evaluate((node) => node.getBoundingClientRect().top)) <= 2,
    "O3 first page must snap exactly into the viewport",
  );
  assert.equal(
    (await firstO3.locator("h2").innerText()).replace(/\s+/g, " ").trim(),
    "O3 关键区域打造 · 越南",
    "the restored Vietnam chapter title must render before the O3 data pages",
  );
  assert.equal(
    await o3Pages.nth(1).getAttribute("data-page-id"),
    "o3-retail-ftd",
    "the first O3 data page must follow the restored Vietnam chapter directly",
  );

  const insightPage = reportFrame.locator(
    '[data-page-id="o3-vn-key-insight"]',
  );
  assert.deepEqual(
    await o3Pages.evaluateAll((pages) =>
      pages.slice(-2).map((node) => node.dataset.pageId),
    ),
    ["o3-online-offline", "o3-vn-key-insight"],
    "the new Figma insight page must directly follow online/offline",
  );
  await insightPage.evaluate((target) =>
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(120);
  const insightState = await insightPage.evaluate((node) => {
    const artboard = node
      .querySelector(".h1-o3-artboard")
      .getBoundingClientRect();
    const selectors = [
      ".h1-o3-vn-insight-header",
      ".h1-o3-vn-insight-wheel",
      ".h1-o3-vn-insight-label.is-local",
      ".h1-o3-vn-insight-label.is-collaboration",
      ".h1-o3-vn-insight-label.is-response",
      ".h1-o3-vn-insight-center",
      ".h1-o3-page-number",
    ];
    return {
      pageTop: node.getBoundingClientRect().top,
      pageOverflowX: node.scrollWidth - node.clientWidth,
      pageOverflowY: node.scrollHeight - node.clientHeight,
      artboard: {
        left: artboard.left,
        top: artboard.top,
        right: artboard.right,
        bottom: artboard.bottom,
      },
      bounds: selectors.map((selector) => {
        const rect = node.querySelector(selector).getBoundingClientRect();
        return {
          selector,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
        };
      }),
      pathCount: node.querySelectorAll(
        ".h1-o3-vn-insight-shapes > path",
      ).length,
      copy: node.innerText.trim().replace(/\s+/g, " "),
    };
  });
  assert.ok(Math.abs(insightState.pageTop) <= 2);
  assert.ok(
    insightState.pageOverflowX <= 1 && insightState.pageOverflowY <= 1,
    "the Figma insight page must not create page-level overflow",
  );
  assert.equal(
    insightState.pathCount,
    3,
    "the wheel must keep three separate insight segments",
  );
  assert.match(
    insightState.copy,
    /关键洞察 · 越南 越南关键洞察 同一个团队，以高本地化能力实现快速联动与响应。 本地化程度高 联动快 响应快 同一个 团队 17 \/ 17/,
  );
  for (const bound of insightState.bounds) {
    assert.ok(
      bound.left >= insightState.artboard.left - 1 &&
        bound.top >= insightState.artboard.top - 1 &&
        bound.right <= insightState.artboard.right + 1 &&
        bound.bottom <= insightState.artboard.bottom + 1,
      `${bound.selector} must stay inside the 1920×1080 artboard`,
    );
  }

  const clippedCards = await reportFrame
    .locator(
      '[data-report-section="o3"] .h1-o3-card, [data-report-section="o3"] .h1-o3-figma-card',
    )
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
            card.verticalOverflow > 2 || card.horizontalOverflow > 2,
        ),
    );
  assert.deepEqual(
    clippedCards,
    [],
    "O3 cards must not clip any PPT text or metrics",
  );

  const videoPage = reportFrame.locator('[data-page-id="o3-local-content"]');
  await videoPage.evaluate((target) =>
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await reportFrame.locator('[data-o3-video-card="vn-tvc-park-chess"]').click();
  const dialog = reportFrame.locator('[role="dialog"]');
  await dialog.waitFor();
  const modalVideo = dialog.locator("video");
  await modalVideo.waitFor();
  assert.equal(await modalVideo.getAttribute("autoplay"), "");
  assert.ok(
    (await modalVideo.getAttribute("src"))?.includes("vn-tvc-park-chess.mp4"),
  );
  await dialog.getByRole("button", { name: "关闭视频" }).click();
  assert.equal(await dialog.count(), 0);

  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 2560, height: 1440 },
  ]) {
    const responsivePage = await browser.newPage({ viewport });
    await responsivePage.goto(
      `${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-responsive-${viewport.width}`,
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
    const target = responsiveFrame.locator(
      '[data-page-id="o3-vn-key-insight"]',
    );
    await target.evaluate((node) =>
      window.scrollTo({
        top: node.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await responsivePage.waitForTimeout(150);
    const state = await target.evaluate((root) => {
      const artboard = root.querySelector(".h1-o3-artboard").getBoundingClientRect();
      const stage = root
        .closest("main.h1-o3-report")
        .querySelector("[data-o3-trophy-stage]")
        .getBoundingClientRect();
      return {
        pageTop: root.getBoundingClientRect().top,
        artboardWidth: artboard.width,
        artboardHeight: artboard.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        stageWidth: stage.width,
        stageHeight: stage.height,
        wheelInsideArtboard: (() => {
          const wheel = root
            .querySelector(".h1-o3-vn-insight-wheel")
            .getBoundingClientRect();
          return (
            wheel.left >= artboard.left - 1 &&
            wheel.top >= artboard.top - 1 &&
            wheel.right <= artboard.right + 1 &&
            wheel.bottom <= artboard.bottom + 1
          );
        })(),
      };
    });
    assert.ok(Math.abs(state.pageTop) <= 2);
    assert.ok(
      state.artboardWidth <= state.viewportWidth + 1 &&
        state.artboardHeight <= state.viewportHeight + 1,
    );
    assert.ok(
      Math.abs(state.artboardWidth / state.artboardHeight - 16 / 9) <= 0.002,
      "O3 must preserve the 16:9 canvas",
    );
    assert.ok(
      Math.abs(state.stageWidth - state.viewportWidth) <= 1 &&
        Math.abs(state.stageHeight - state.viewportHeight) <= 2,
    );
    assert.equal(
      state.wheelInsideArtboard,
      true,
      "the Figma insight wheel must remain within the scaled artboard",
    );
    await responsivePage.close();
  }

  console.log("H1 O3 runtime isolation, paging, and video modal checks passed.");
} finally {
  await browser.close();
}
