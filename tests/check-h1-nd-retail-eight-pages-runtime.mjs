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
  page.setDefaultTimeout(15_000);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=nd-retail-seven-pages`,
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

  const reportPages = reportFrame.locator("[data-report-page]");
  const dataPages = reportFrame.locator(
    '[data-report-section="data"] [data-report-page]',
  );
  assert.equal(await dataPages.count(), 21);
  assert.equal(await reportPages.count(), 96);
  assert.equal(
    await reportFrame.locator(".h1-figma-fixed-stage").count(),
    1,
    "all data pages must share one fixed data-module background stage",
  );

  const waitForActivePage = (pageId) =>
    page.waitForFunction(
      (targetPageId) =>
        document
          .querySelector("#reportFrame")
          ?.contentDocument?.querySelector(`[data-page-id="${targetPageId}"]`)
          ?.classList.contains("is-active"),
      pageId,
    );
  const scrollFrameToPage = async (pageId) => {
    await reportFrame.locator(`[data-page-id="${pageId}"]`).evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await waitForActivePage(pageId);
  };
  const pageNumberText = async (pageId) =>
    (
      await reportFrame
        .locator(
          `[data-page-id="${pageId}"] .h1-extended-editorial-page-number`,
        )
        .innerText()
    )
      .replace(/\s+/g, " ")
      .trim();

  for (let id = 15; id <= 21; id += 1) {
    const pageId = `data-${id}`;
    await scrollFrameToPage(pageId);
    assert.match(await pageNumberText(pageId), new RegExp(`^${id} / 21$`));
    assert.equal(
      await reportFrame
        .locator(`[data-page-id="${pageId}"] .h1-extended-editorial-canvas`)
        .count(),
      1,
      `${pageId} must use the shared data-module canvas`,
    );
  }

  const sharedVisualSystem = await reportFrame
    .locator('[data-page-id="data-15"]')
    .evaluate((page15) => {
      const page14 = document.querySelector('[data-page-id="data-14"]');
      const page14Root = page14.querySelector(".h1-extended-editorial-page");
      const page15Root = page15.querySelector(".h1-extended-editorial-page");
      const page14Surface = page14.querySelector(".h1-editorial-chart-surface");
      const page15Surface = page15.querySelector(".h1-editorial-chart-surface");
      const page14Canvas = page14.querySelector(".h1-extended-editorial-canvas");
      const page15Canvas = page15.querySelector(".h1-extended-editorial-canvas");
      const pickSurface = (element) => {
        const style = getComputedStyle(element);
        return {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
        };
      };
      const pickPage = (element) => {
        const style = getComputedStyle(element);
        return {
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
        };
      };
      return {
        accent: getComputedStyle(document.documentElement)
          .getPropertyValue("--h1-data-accent")
          .trim(),
        page14: pickPage(page14Root),
        page15: pickPage(page15Root),
        surface14: pickSurface(page14Surface),
        surface15: pickSurface(page15Surface),
        canvas14: {
          width: page14Canvas.getBoundingClientRect().width,
          height: page14Canvas.getBoundingClientRect().height,
        },
        canvas15: {
          width: page15Canvas.getBoundingClientRect().width,
          height: page15Canvas.getBoundingClientRect().height,
        },
      };
    });
  assert.equal(sharedVisualSystem.accent, "#ff5b11");
  assert.deepEqual(sharedVisualSystem.page15, sharedVisualSystem.page14);
  assert.deepEqual(sharedVisualSystem.surface15, sharedVisualSystem.surface14);
  assert.deepEqual(sharedVisualSystem.canvas15, sharedVisualSystem.canvas14);

  for (const id of [15, 16, 18, 20, 21]) {
    assert.ok(
      (await reportFrame.locator(`[data-page-id="data-${id}"] svg`).count()) > 0,
      `data-${id} must render a native SVG chart`,
    );
  }

  assert.match(
    await reportFrame.locator('[data-page-id="data-17"]').innerText(),
    /为什么APAC下降？我们做得不够吗？/,
  );
  assert.match(
    await reportFrame.locator('[data-page-id="data-19"]').innerText(),
    /Marketing价值未充分体现？[\s\S]*or[\s\S]*还有哪些关键原因？/,
  );
  assert.match(
    await reportFrame.locator('[data-page-id="data-21"]').innerText(),
    /H2 Retail ND占比迈向32\.0%！[\s\S]*\$137\.6M/,
  );
  assert.match(
    await reportFrame.locator('[data-page-id="data-18"]').innerText(),
    /−\$0\.4[\s\S]*\$1\.2[\s\S]*-5\.0%[\s\S]*30\.0%/,
    "the Vietnam chart must expose both source axes",
  );
  assert.match(
    await reportFrame.locator('[data-page-id="data-20"]').innerText(),
    /\.0 K[\s\S]*8\.0 K[\s\S]*-\$1\.00M[\s\S]*\$4\.00M[\s\S]*\$0\.01M[\s\S]*\$3\.70M[\s\S]*\$2\.20M[\s\S]*-\$0\.31M/,
    "the MIB chart must retain its user columns, ND line, and source axes",
  );
  assert.match(
    await reportFrame.locator('[data-page-id="data-20"]').innerText(),
    /0K[\s\S]*14K[\s\S]*0M[\s\S]*8M[\s\S]*9\.1M[\s\S]*3\.9M[\s\S]*6\.2M[\s\S]*2\.3M/,
    "the interval chart must retain its user columns, ND line, and source axes",
  );
  const page20Geometry = await reportFrame
    .locator('[data-page-id="data-20"]')
    .evaluate((root) => {
      const bottom = (element) => element.getBoundingClientRect().bottom;
      const top = (element) => element.getBoundingClientRect().top;
      const leftPanel = root.querySelector(".h1-retail-growth-mib-panel");
      const rightPanel = root.querySelector(".h1-retail-growth-interval-panel");
      return {
        chartHeight: Number.parseFloat(
          getComputedStyle(root.querySelector(".h1-retail-growth-chart"))
            .height,
        ),
        leftTitleBottom: bottom(leftPanel.querySelector("h2")),
        leftSvgTop: top(leftPanel.querySelector("svg")),
        rightTitleBottom: bottom(rightPanel.querySelector("h2")),
        rightSvgTop: top(rightPanel.querySelector("svg")),
      };
    });
  assert.ok(
    page20Geometry.chartHeight >= 620,
    "page 20 chart must retain a presentation-scale plotting area",
  );
  assert.ok(
    page20Geometry.leftSvgTop > page20Geometry.leftTitleBottom + 4,
    "page 20 left plot must not overlap its heading",
  );
  assert.ok(
    page20Geometry.rightSvgTop > page20Geometry.rightTitleBottom + 4,
    "page 20 right plot must not overlap its heading",
  );
  assert.ok(
    Number.parseFloat(
      await reportFrame
        .locator('[data-page-id="data-17"] h1')
        .evaluate((element) => getComputedStyle(element).fontSize),
    ) >= 74,
    "text transition headings must retain their presentation-scale type",
  );

  const editButton = page.locator("#editorButton");
  await editButton.waitFor();
  await page.waitForFunction(
    () => !document.querySelector("#editorButton")?.disabled,
  );
  await editButton.click();
  await page.waitForFunction(() => {
    const doc = document.querySelector("#reportFrame")?.contentDocument;
    return Array.from({ length: 7 }, (_, index) => index + 15).every(
      (id) =>
        doc
          ?.querySelector(`[data-page-id="data-${id}"] h1`)
          ?.getAttribute("contenteditable") === "plaintext-only",
    );
  });
  for (let id = 15; id <= 21; id += 1) {
    assert.equal(
      await reportFrame
        .locator(
          `[data-page-id="data-${id}"] .h1-extended-editorial-page-number`,
        )
        .getAttribute("contenteditable"),
      null,
      `data-${id} page number must not be editable`,
    );
  }
  for (const id of [15, 16, 18, 20, 21]) {
    assert.equal(
      await reportFrame
        .locator(`[data-page-id="data-${id}"] .h1-retail-growth-chart`)
        .locator("[contenteditable]")
        .count(),
      0,
      `data-${id} chart text must stay protected from正文 editing`,
    );
  }

  await page.locator("#editorExitButton").click();
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() =>
    document
      .querySelector('.scene[data-label="Full Report"]')
      ?.classList.contains("active"),
  );
  await scrollFrameToPage("data-21");
  await page.locator("body").press("PageDown");
  await waitForActivePage("o1-chapter");
  await page.locator("body").press("PageUp");
  await waitForActivePage("data-21");

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedMotionState = await reportFrame
    .locator('[data-page-id="data-21"]')
    .evaluate((root) => {
      const stage = root.querySelector(".h1-extended-editorial-canvas");
      const stageRect = stage.getBoundingClientRect();
      const transition = document.querySelector('[data-page-id="data-17"]');
      return {
        stageTransform: getComputedStyle(stage).transform,
        stageLeft: stageRect.left,
        stageRight: stageRect.right,
        viewportWidth: innerWidth,
        barAnimation: getComputedStyle(
          root.querySelector(".h1-retail-growth-bar"),
        ).animationName,
        transitionAnimation: getComputedStyle(
          transition.querySelector(".h1-retail-growth-transition > h1"),
        ).animationName,
        scanOpacity: getComputedStyle(
          transition.querySelector(".h1-retail-growth-scan i"),
        ).opacity,
      };
    });
  assert.notEqual(
    reducedMotionState.stageTransform,
    "none",
    "reduced motion must preserve the scaled 16:9 stage transform",
  );
  assert.ok(reducedMotionState.stageLeft >= -2);
  assert.ok(
    reducedMotionState.stageRight <= reducedMotionState.viewportWidth + 2,
  );
  assert.equal(reducedMotionState.barAnimation, "none");
  assert.equal(reducedMotionState.transitionAnimation, "none");
  assert.equal(reducedMotionState.scanOpacity, "0");

  const unexpectedErrors = pageErrors.filter(
    (message) =>
      !message.includes("Vantage Supabase configuration is missing"),
  );
  assert.deepEqual(unexpectedErrors, []);
} finally {
  await browser.close();
}

console.log("H1 ND Retail seven-page runtime contract passed.");
