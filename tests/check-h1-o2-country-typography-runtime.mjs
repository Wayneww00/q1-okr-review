import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O2_TEST_URL || "http://127.0.0.1:4180";
const expectedThemeVersion = "20260730-okr-o2-boundary-v1";
const countryPageIds = [
  "o2-seo-philippines",
  "o2-seo-south-africa",
  "o2-seo-thailand",
  "o2-seo-india",
  "o2-seo-vietnam",
];

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-country-typography`,
    { waitUntil: "domcontentloaded" },
  );
  assert.match(
    await page.locator("#h1-figma-racing-shell").getAttribute("href"),
    new RegExp(`${expectedThemeVersion}$`),
    "the immersive shell must cache-bust the country typography stylesheet",
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
    "the embedded report must cache-bust the country typography stylesheet",
  );
  assert.deepEqual(
    await reportFrame
      .locator(".h1-o2-seo-country")
      .evaluateAll((layouts) =>
        layouts.map((layout) => layout.closest("[data-page-id]")?.dataset.pageId),
      ),
    countryPageIds,
    "the shared country layout must remain isolated to the five intended pages",
  );

  for (const pageId of countryPageIds) {
    const countryPage = reportFrame.locator(`[data-page-id="${pageId}"]`);
    assert.equal(await countryPage.count(), 1, `${pageId} must render exactly once`);
    assert.equal(
      await countryPage.locator(".h1-o2-seo-keywords section").count(),
      12,
      `${pageId} must retain all 12 keyword cards`,
    );

    const typography = await countryPage.evaluate((root) => {
      const size = (selector) =>
        Number.parseFloat(getComputedStyle(root.querySelector(selector)).fontSize);
      const alpha = (selector) => {
        const color = getComputedStyle(root.querySelector(selector)).color;
        const parts = color.match(/[\d.]+/g).map(Number);
        return parts.length === 4 ? parts[3] : 1;
      };
      return {
        marketMeta: size(".h1-o2-seo-country-badge span"),
        competitor: size(".h1-o2-seo-country-badge small"),
        trendHeading: size(".h1-o2-seo-trend > div:first-child span"),
        trendComparison: size(".h1-o2-seo-trend > div:first-child strong"),
        trendValue: size(".h1-o2-seo-trend-scale b"),
        period: size(".h1-o2-seo-trend > small"),
        panelTitle: size(".h1-o2-panel-title span"),
        panelMeta: size(".h1-o2-panel-title strong"),
        keywordRank: size(".h1-o2-seo-keywords section > span"),
        keyword: size(".h1-o2-seo-keywords section b"),
        volume: size(".h1-o2-seo-keywords section small"),
        status: size(".h1-o2-seo-keywords section em"),
        source: size(".h1-o2-seo-keywords > footer"),
        marketMetaAlpha: alpha(".h1-o2-seo-country-badge span"),
        competitorAlpha: alpha(".h1-o2-seo-country-badge small"),
        periodAlpha: alpha(".h1-o2-seo-trend > small"),
        statusAlpha: alpha(".h1-o2-seo-keywords section em"),
        sourceAlpha: alpha(".h1-o2-seo-keywords > footer"),
      };
    });

    const minimums = {
      marketMeta: 15,
      competitor: 15,
      trendHeading: 21,
      trendComparison: 17,
      trendValue: 16,
      period: 14,
      panelTitle: 26,
      panelMeta: 20,
      keywordRank: 16,
      keyword: 20,
      volume: 15,
      status: 14,
      source: 14,
    };
    for (const [name, minimum] of Object.entries(minimums)) {
      assert.ok(
        typography[name] >= minimum,
        `${pageId} ${name} must be at least ${minimum}px; received ${typography[name]}px`,
      );
    }
    const minimumAlphas = {
      marketMetaAlpha: 0.65,
      competitorAlpha: 0.65,
      periodAlpha: 0.55,
      statusAlpha: 0.62,
      sourceAlpha: 0.55,
    };
    for (const [name, minimum] of Object.entries(minimumAlphas)) {
      assert.ok(
        typography[name] >= minimum,
        `${pageId} ${name} must be at least ${minimum}; received ${typography[name]}`,
      );
    }

    const overflow = await countryPage.evaluate((root) => {
      const cardOverflows = [...root.querySelectorAll(".h1-o2-card")]
        .map((card) => ({
          className: card.className,
          horizontal: card.scrollWidth - card.clientWidth,
          vertical: card.scrollHeight - card.clientHeight,
        }))
        .filter(({ horizontal, vertical }) => horizontal > 1 || vertical > 1);

      const keywordTextOverflows = [
        ...root.querySelectorAll(".h1-o2-seo-keywords section b"),
      ]
        .map((label) => ({
          text: label.textContent.trim(),
          horizontal: label.scrollWidth - label.clientWidth,
          vertical: label.scrollHeight - label.clientHeight,
        }))
        .filter(({ horizontal, vertical }) => horizontal > 1 || vertical > 1);

      const keywordBounds = [
        ...root.querySelectorAll(".h1-o2-seo-keywords section"),
      ]
        .map((card) => {
          const cardRect = card.getBoundingClientRect();
          return [...card.children]
            .map((child) => {
              const rect = child.getBoundingClientRect();
              return {
                text: child.textContent.trim(),
                inside:
                  rect.left >= cardRect.left - 1 &&
                  rect.right <= cardRect.right + 1 &&
                  rect.top >= cardRect.top - 1 &&
                  rect.bottom <= cardRect.bottom + 1,
              };
            })
            .filter(({ inside }) => !inside);
        })
        .flat();

      return { cardOverflows, keywordTextOverflows, keywordBounds };
    });
    assert.deepEqual(
      overflow,
      { cardOverflows: [], keywordTextOverflows: [], keywordBounds: [] },
      `${pageId} must remain unclipped after the readability increase`,
    );
  }

  console.log("H1 O2 country typography runtime check passed.");
} finally {
  await browser.close();
}
