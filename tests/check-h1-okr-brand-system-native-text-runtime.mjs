import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_BRAND_TEXT_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.setDefaultTimeout(15_000);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=brand-system-native-text`,
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
  const target = reportFrame.locator('[data-page-id="okr-review"]');
  await target.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );

  assert.equal(
    await target.locator(".h1-okr-figma-foreground-layer").count(),
    0,
    "the rasterized foreground must be removed",
  );
  assert.equal(
    await target.locator(".h1-okr-card-art").count(),
    3,
    "the three original non-text card shapes must remain",
  );
  assert.equal(
    await target.locator(".h1-okr-icon-medallion").count(),
    3,
    "the three original icons must remain",
  );
  assert.equal(
    (
      await target.locator(".h1-okr-outline-title").innerText()
    ).trim(),
    "ONE BRAND ONE SYSTEM",
  );
  assert.equal(
    (await target.locator("h1").innerText()).replace(/\s+/g, ""),
    "将Vantage建设成全球一线品牌",
  );
  assert.deepEqual(
    await target.locator(".h1-okr-insight-card h2").allInnerTexts(),
    [
      "从分散表达,走向统一品牌资产",
      "从单点传播,走向线上线下一体化体验",
      "从一次性项目,走向全球可复制的品牌经营系统",
    ],
  );
  assert.deepEqual(
    await target.locator(".h1-okr-insight-card p").allInnerTexts(),
    [
      "Build a premium and consistent visual-verbal system across every market.",
      "Connect campaigns, products and touchpoints into one coherent experience.",
      "Turn isolated execution into a scalable brand operating model for global growth.",
    ],
  );

  const visualGeometry = await target.evaluate((root) => {
    const canvas = root.querySelector(".h1-okr-canvas");
    const canvasRect = canvas.getBoundingClientRect();
    const box = (selector) => {
      const rect = root.querySelector(selector).getBoundingClientRect();
      return {
        left: rect.left - canvasRect.left,
        top: rect.top - canvasRect.top,
        width: rect.width,
        height: rect.height,
      };
    };
    const outlineStyle = getComputedStyle(
      root.querySelector(".h1-okr-outline-title"),
    );
    return {
      scale: canvasRect.width / 1920,
      outline: box(".h1-okr-outline-title"),
      headline: box("h1"),
      cards: [...root.querySelectorAll(".h1-okr-insight-card")].map(
        (card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left - canvasRect.left,
            top: rect.top - canvasRect.top,
            width: rect.width,
            height: rect.height,
          };
        },
      ),
      outlineStroke: outlineStyle.webkitTextStrokeWidth,
      outlineBackgroundImage: outlineStyle.backgroundImage,
      pageNumber: root
        .querySelector(".h1-okr-page-number")
        ?.textContent.replace(/\s+/g, " ")
        .trim(),
    };
  });
  const normalize = (value) => value / visualGeometry.scale;
  const closeTo = (actual, expected, tolerance = 1.5) =>
    Math.abs(actual - expected) <= tolerance;
  assert.ok(closeTo(normalize(visualGeometry.outline.left), 242));
  assert.ok(closeTo(normalize(visualGeometry.outline.top), 79));
  assert.ok(closeTo(normalize(visualGeometry.headline.left), 344.5));
  assert.ok(closeTo(normalize(visualGeometry.headline.top), 173));
  assert.ok(
    visualGeometry.cards.every(({ left }) => {
      const normalizedLeft = normalize(left);
      return normalizedLeft >= 1280 && normalizedLeft <= 1310;
    }),
    "the card rail must stay aligned to its original right-side column",
  );
  assert.deepEqual(
    visualGeometry.cards.map(({ top }) => Math.round(normalize(top))),
    [128, 423, 718],
  );
  assert.ok(
    visualGeometry.cards.every(
      ({ width, height }) =>
        closeTo(normalize(width), 377.612, 2) &&
        closeTo(normalize(height), 233.575, 2),
    ),
    "the non-text card artwork must retain its original dimensions",
  );
  assert.notEqual(visualGeometry.outlineStroke, "0px");
  assert.equal(visualGeometry.outlineBackgroundImage, "none");
  assert.match(visualGeometry.pageNumber || "", /^02\s*\/\s*32$/);

  const editorButton = page.locator("#editorButton");
  await page.waitForFunction(
    () => !document.querySelector("#editorButton")?.disabled,
  );
  await editorButton.click();
  await page.waitForTimeout(250);
  assert.equal(
    await target.locator("[contenteditable]").count(),
    0,
    "source-only brand-system text must not enter Supabase正文 editing",
  );

  assert.deepEqual(pageErrors, []);
} finally {
  await browser.close();
}

console.log("H1 O1 brand-system native text runtime contract passed.");
