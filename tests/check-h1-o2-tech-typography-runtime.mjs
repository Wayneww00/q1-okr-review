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
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-tech-typography`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();
  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

  const panel = reportFrame.locator(
    '[data-page-id="o2-seo-technical"] .h1-o2-seo-tech-metrics',
  );
  const state = await panel.evaluate((node) => {
    const inspect = (element) => {
      const style = getComputedStyle(element);
      const color = style.color.match(/[\d.]+/g)?.map(Number) || [];
      return {
        color,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number.parseFloat(style.fontWeight),
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    };
    return {
      sections: [...node.querySelectorAll(":scope > section")].map((element) => {
        const style = getComputedStyle(element);
        return {
          marginBottom: Number.parseFloat(style.marginBottom),
          paddingTop: Number.parseFloat(style.paddingTop),
        };
      }),
      headings: [...node.querySelectorAll("h3")].map(inspect),
      labels: [...node.querySelectorAll("span")].map(inspect),
      notes: [...node.querySelectorAll("p")].map(inspect),
      badges: [...node.querySelectorAll(".is-load-time > b")].map(inspect),
      values: [...node.querySelectorAll("strong")].map((element) => ({
        ...inspect(element),
        numericVariant: getComputedStyle(element).fontVariantNumeric,
      })),
    };
  });

  for (const section of state.sections) {
    assert.equal(
      section.marginBottom,
      0,
      "report page spacing must not leak into metric columns",
    );
    assert.equal(
      section.paddingTop,
      26,
      "metric columns must keep their component-level vertical padding",
    );
  }
  for (const heading of state.headings) {
    assert.ok(
      heading.color.slice(0, 3).every((channel) => channel >= 210),
      "metric headings must use a high-contrast light tone on the dark card",
    );
    assert.ok(heading.fontWeight >= 700, "metric headings must retain a clear bold hierarchy");
    assert.ok(heading.fontSize >= 19, "metric headings must remain legible");
  }
  for (const label of state.labels) {
    assert.ok(
      label.color.slice(0, 3).every((channel) => channel >= 180),
      "metric labels must remain readable on the dark card",
    );
    assert.ok(label.fontWeight >= 600, "metric labels must use a stable medium-bold weight");
  }
  for (const note of state.notes) {
    assert.ok(
      note.color.slice(0, 3).every((channel) => channel >= 165),
      "supporting notes must not disappear into the dark background",
    );
    assert.ok(
      note.lineHeight >= note.fontSize * 1.35,
      "supporting notes need comfortable Chinese line spacing",
    );
  }
  for (const badge of state.badges) {
    assert.ok(
      badge.color.slice(0, 3).every((channel) => channel >= 180),
      "performance badges must use a high-contrast light tone on the dark card",
    );
    assert.ok(
      badge.fontWeight >= 700,
      "performance badges must keep a clear emphasis weight",
    );
  }
  for (const value of state.values) {
    assert.match(
      value.numericVariant,
      /tabular-nums/,
      "KPI values must use tabular numerals for consistent alignment",
    );
  }

  console.log("H1 O2 technical metric typography contrast and hierarchy passed.");
} finally {
  await browser.close();
}
