import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl =
  process.env.H1_DATA_HEADER_TEST_URL || "http://127.0.0.1:4180";
assert.ok(
  ["127.0.0.1", "localhost", "::1"].includes(new URL(baseUrl).hostname),
  "the mutating data-header test must run only against isolated local storage",
);

const legacyTitle =
  "RetailND占比分享专题\n\nH1 Retail ND APAC -2.0% GS +0.5%";
const migratedSubtitle = "H1 Retail ND APAC -2.0% GS +0.5%";
const newSubtitle = "H1 Retail ND整体占比";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  await page.addInitScript(
    ({ legacyText }) => {
      if (localStorage.getItem("vantage-local-report-content-v1")) return;
      localStorage.setItem(
        "vantage-local-report-content-v1",
        JSON.stringify({
          report_id: "vantage-h1",
          content: {
            texts: {
              "data:data-15@retail-nd-ppt-v4:1": legacyText,
              "data:data-13:1": "CFD 行业关注者份额\n新增下方说明",
              "data:data-13:2": "原有下方小标题",
              "data:data-13:3": "保留的图表标题",
            },
          },
          version: 7,
          updated_at: null,
          updated_by: null,
        }),
      );
    },
    { legacyText: legacyTitle },
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=data-header-editor`,
    { waitUntil: "domcontentloaded" },
  );

  const loginGate = page.locator("#loginGate");
  if (await loginGate.isVisible()) {
    await page.locator("#loginSubmit").click();
    await loginGate.waitFor({ state: "hidden" });
  }

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  const page15 = reportFrame.locator('[data-page-id="data-15"]');
  const page16 = reportFrame.locator('[data-page-id="data-16"]');
  const page13 = reportFrame.locator('[data-page-id="data-13"]');
  await page15
    .locator('[data-vantage-header-field="subtitle"]')
    .waitFor({ state: "attached" });

  assert.equal(
    await page15.locator("[data-vantage-header-field]").count(),
    3,
    "data pages with an editorial header must expose exactly three header fields",
  );
  assert.equal(
    await page15
      .locator('[data-vantage-header-field="title"]')
      .textContent(),
    "RetailND占比分享专题",
    "the legacy title must be reduced to one main-title line",
  );
  assert.equal(
    await page15
      .locator('[data-vantage-header-field="subtitle"]')
      .textContent(),
    migratedSubtitle,
    "the legacy continuation must appear in the lower subtitle field",
  );
  assert.equal(
    await page13
      .locator('[data-vantage-header-field="subtitle"]')
      .textContent(),
    "新增下方说明 · 原有下方小标题",
    "a legacy continuation must merge without losing an existing lower subtitle",
  );
  assert.equal(
    await page13
      .locator('[data-vantage-text-id="data:data-13:3"]')
      .textContent(),
    "保留的图表标题",
    "a formerly indexed subtitle must not shift the following chart text ID",
  );

  const geometry = await page15
    .locator(".h1-extended-editorial-header")
    .evaluate((header) => {
      const rect = (selector) => {
        const box = header.querySelector(selector).getBoundingClientRect();
        return { bottom: box.bottom, top: box.top };
      };
      return {
        eyebrow: rect('[data-vantage-header-field="eyebrow"]'),
        title: rect('[data-vantage-header-field="title"]'),
        subtitle: rect('[data-vantage-header-field="subtitle"]'),
      };
    });
  assert.ok(
    geometry.title.top > geometry.eyebrow.bottom,
    `main title must not overlap the upper subtitle: ${JSON.stringify(geometry)}`,
  );
  assert.ok(
    geometry.subtitle.top > geometry.title.bottom,
    `lower subtitle must not overlap the main title: ${JSON.stringify(geometry)}`,
  );

  const emptySubtitle = page16.locator(
    '[data-vantage-header-field="subtitle"]',
  );
  assert.equal(
    await emptySubtitle.evaluate(
      (element) => getComputedStyle(element).visibility,
    ),
    "hidden",
    "an empty lower subtitle must be hidden outside edit mode",
  );

  await page.waitForFunction(
    () => !document.querySelector("#editorButton")?.disabled,
  );
  await page.locator("#editorButton").click();
  await emptySubtitle.waitFor({ state: "visible" });
  assert.equal(
    await emptySubtitle.getAttribute("contenteditable"),
    "plaintext-only",
    "the empty lower subtitle must become editable",
  );
  assert.equal(
    await emptySubtitle.getAttribute("data-vantage-placeholder"),
    "点击添加下方小标题",
    "the empty lower subtitle must explain what can be added",
  );

  const page15Title = page15.locator(
    '[data-vantage-header-field="title"]',
  );
  await page15Title.focus();
  const titleBeforeEnter = await page15Title.textContent();
  await page15Title.press("Enter");
  assert.equal(
    await page15Title.textContent(),
    titleBeforeEnter,
    "Enter must not add another line inside a dedicated header field",
  );

  await emptySubtitle.fill(newSubtitle);
  await page.waitForFunction(
    () => !document.querySelector("#editorSaveButton")?.disabled,
  );
  await page.locator("#editorSaveButton").click();
  await page.locator("#editorPanel").waitFor({ state: "hidden" });
  await page.waitForFunction(() => {
    const element = document
      .querySelector("#reportFrame")
      ?.contentDocument?.querySelector(
        '[data-page-id="data-16"] [data-vantage-header-field="subtitle"]',
      );
    return element && !element.hasAttribute("contenteditable");
  });
  assert.equal(
    await emptySubtitle.textContent(),
    newSubtitle,
    "a newly added lower subtitle must remain visible after publishing",
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  if (await page.locator("#loginGate").isVisible()) {
    await page.locator("#loginSubmit").click();
    await page.locator("#loginGate").waitFor({ state: "hidden" });
  }
  const reloadedReportFrame = page.locator("#reportFrame").contentFrame();
  await reloadedReportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  assert.equal(
    await reloadedReportFrame
      .locator(
        '[data-page-id="data-16"] [data-vantage-header-field="subtitle"]',
      )
      .textContent(),
    newSubtitle,
    "a newly added lower subtitle must survive a full reload",
  );
} finally {
  await browser.close();
}

console.log("Data-page three-field header editor checks passed.");
