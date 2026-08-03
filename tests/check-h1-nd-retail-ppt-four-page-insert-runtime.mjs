import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_ND_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=nd-retail-ppt-four-page-insert`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();
  await page.locator('.scene[data-label="Full Report"]').evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor({
    timeout: 30_000,
  });

  const dataPages = reportFrame.locator(
    '[data-report-section="data"] [data-report-page]',
  );
  assert.equal(await dataPages.count(), 23);

  const expectedText = new Map([
    [18, /从越南市场切入[\s\S]*ND \+\$1\.2M[\s\S]*\$221\.6M/],
    [19, /为什么Marketing做得好，反而ND占比低/],
    [20, /越南受 IB 归类口径变化影响最显著[\s\S]*IB James[\s\S]*\$20\.3M[\s\S]*95\.7%[\s\S]*25\.6%/],
    [21, /还原口径影响后[\s\S]*\$2\.4M[\s\S]*\$2\.8M[\s\S]*18\.8%[\s\S]*28\.7%/],
    [22, /可能对Retail ND占比有影响的因素[\s\S]*Q2 ND 5\.9M[\s\S]*Q2 ND 9\.1M/],
    [23, /口径回归后 Retail ND 占比上升[\s\S]*\$145\.4M[\s\S]*\$269\.10M/],
  ]);

  for (let id = 18; id <= 23; id += 1) {
    const root = reportFrame.locator(`[data-page-id="data-${id}"]`);
    await root.evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );

    assert.match(
      (await root.locator(".h1-extended-editorial-page-number").innerText())
        .replace(/\s+/g, " ")
        .trim(),
      new RegExp(`^${id} / 23$`),
    );
    assert.match(await root.innerText(), expectedText.get(id));

    const geometry = await root.evaluate((element) => {
      const main = element.querySelector(".h1-extended-editorial-main");
      const chart = element.querySelector(".h1-retail-growth-chart");
      const fits = (target) =>
        !target ||
        (target.scrollWidth <= target.clientWidth + 2 &&
          target.scrollHeight <= target.clientHeight + 2);
      return { mainFits: fits(main), chartFits: fits(chart) };
    });
    assert.equal(geometry.mainFits, true, `data-${id} main content must fit`);
    assert.equal(geometry.chartFits, true, `data-${id} chart content must fit`);
  }

  const transitionPage = reportFrame.locator('[data-page-id="data-19"]');
  assert.equal(
    await transitionPage.locator(".h1-extended-editorial-canvas").count(),
    0,
    "the PPT transition must not sit inside a second data-module canvas",
  );
  assert.equal(
    await transitionPage.locator('img[src*="nd-retail-transition-vietnam-original"]').count(),
    0,
    "the watermarked PPT export must not be rendered on page 19",
  );
  const transitionCoverage = await transitionPage.evaluate((pageRoot) => {
    const stage = pageRoot.querySelector(".h1-vietnam-marketing-transition");
    const fixedStage = document.querySelector(".h1-figma-fixed-stage");
    const title = stage.querySelector(".h1-vietnam-marketing-transition-title");
    const progress = stage.querySelector(".h1-vietnam-marketing-transition-progress");
    const stageRect = stage.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const progressRect = progress.getBoundingClientRect();
    return {
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
      pageWidth: pageRoot.getBoundingClientRect().width,
      pageHeight: pageRoot.getBoundingClientRect().height,
      background: getComputedStyle(stage).backgroundColor,
      fixedStageBackground: getComputedStyle(fixedStage).backgroundImage,
      titleVisible:
        getComputedStyle(title).visibility !== "hidden" &&
        titleRect.width > 0 &&
        titleRect.height > 0,
      titleFontSize: parseFloat(getComputedStyle(title).fontSize),
      progressVisible:
        getComputedStyle(progress).visibility !== "hidden" &&
        progressRect.width > 0 &&
        progressRect.height > 0,
    };
  });
  assert.equal(transitionCoverage.stageWidth, transitionCoverage.pageWidth);
  assert.equal(transitionCoverage.stageHeight, transitionCoverage.pageHeight);
  assert.equal(transitionCoverage.background, "rgba(0, 0, 0, 0)");
  assert.match(
    transitionCoverage.fixedStageBackground,
    /figma-vantage-wordmark-car-stage-140-36\.png/,
  );
  assert.equal(transitionCoverage.titleVisible, true);
  assert.ok(
    transitionCoverage.titleFontSize >= 60,
    "the live transition title must retain the PPT's hero-title scale",
  );
  assert.equal(transitionCoverage.progressVisible, true);

  const vietnamIbPage = reportFrame.locator('[data-page-id="data-20"]');
  const vietnamIbGeometry = await vietnamIbPage.evaluate((pageRoot) => {
    const chartRect = pageRoot
      .querySelector(".h1-retail-growth-chart.is-vietnam-ib")
      .getBoundingClientRect();
    const pageRect = pageRoot.getBoundingClientRect();
    const panels = [
      pageRoot.querySelector(".h1-vietnam-ib-flow-panel"),
      pageRoot.querySelector(".h1-vietnam-ib-structure-panel"),
    ].map((panel) => panel.getBoundingClientRect());
    return {
      chartWidthRatio: chartRect.width / pageRect.width,
      chartLeftRatio: (chartRect.left - pageRect.left) / pageRect.width,
      panelWidthRatio: panels[0].width / pageRect.width,
      panelWidthDifference: Math.abs(panels[0].width - panels[1].width),
    };
  });
  assert.ok(
    vietnamIbGeometry.chartWidthRatio >= 0.975,
    "page 20 must span the reference image's near-full-width canvas",
  );
  assert.ok(
    vietnamIbGeometry.chartLeftRatio <= 0.03,
    "page 20 must retain the reference image's narrow left safe area",
  );
  assert.ok(
    vietnamIbGeometry.panelWidthRatio >= 0.47,
    "each page-20 panel must retain the reference image's half-canvas proportion",
  );
  assert.ok(
    vietnamIbGeometry.panelWidthDifference <= 2,
    "the structure and attribution panels must remain equal-width",
  );

  assert.equal(
    await vietnamIbPage.locator("[data-vietnam-ib-enlarge]").count(),
    0,
    "page 20 must not render any enlarge actions",
  );
  for (const key of ["flow", "structure"]) {
    const actionGroup = vietnamIbPage.locator(
      `[data-vietnam-ib-source="${key}"]`,
    );
    assert.equal(
      await actionGroup.locator("button").count(),
      1,
      `${key} panel must retain only its original-image action`,
    );
    await actionGroup.locator(".h1-source-image-trigger").waitFor();
  }

  const sourceViewers = [
    { key: "flow", width: 2070 },
    { key: "structure", width: 1388 },
  ];
  for (const viewer of sourceViewers) {
    const trigger = reportFrame.locator(
      `[data-page-id="data-20"] [data-vietnam-ib-source="${viewer.key}"] .h1-source-image-trigger`,
    );
    await trigger.click();
    const modal = reportFrame.locator(".h1-source-image-modal");
    await modal.waitFor();
    const modalImage = modal.locator("img");
    await modalImage.waitFor();
    await modalImage.evaluate((image) => {
      if (image.complete && image.naturalWidth > 0) return;
      return new Promise((resolve, reject) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", reject, { once: true });
      });
    });
    assert.equal(
      await modalImage.evaluate((image) => image.naturalWidth),
      viewer.width,
      `${viewer.key} source viewer must open the supplied original image`,
    );
    await modal.locator(".h1-source-image-modal-close").click();
    await modal.waitFor({ state: "detached" });
  }
  assert.deepEqual(pageErrors, []);
} finally {
  await browser.close();
}

console.log("H1 Retail ND PPT four-page insertion runtime contract passed.");
