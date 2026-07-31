import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl =
  process.env.H1_EDITOR_TEST_URL || "http://127.0.0.1:4180";
assert.ok(
  ["127.0.0.1", "localhost", "::1"].includes(new URL(baseUrl).hostname),
  "the mutating editor runtime test must run only against isolated local storage",
);
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=editor-keyboard`,
    { waitUntil: "domcontentloaded" },
  );

  const loginGate = page.locator("#loginGate");
  if (await loginGate.isVisible()) {
    await page.locator("#loginSubmit").click();
    await loginGate.waitFor({ state: "hidden" });
  }

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  await page.waitForFunction(
    () => !document.querySelector("#editorButton")?.disabled,
  );
  await page.locator("#editorButton").click();
  await reportFrame
    .locator('[data-page-id="data-01"] [contenteditable="plaintext-only"]')
    .first()
    .waitFor();

  const title = reportFrame.locator(
    '[data-page-id="data-01"] .h1-figma-module-title [data-vantage-text-id]',
  );
  await title.evaluate((element) => {
    const reportWindow = element.ownerDocument.defaultView;
    const pageElement = element.closest("[data-report-page]");
    reportWindow.scrollTo({
      top: pageElement.getBoundingClientRect().top + reportWindow.scrollY,
      behavior: "instant",
    });
    element.focus();
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = reportWindow.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });

  const pageIdBeforeTyping = await reportFrame
    .locator("[data-report-page].is-active")
    .getAttribute("data-page-id");
  const titleBeforeTyping = await title.textContent();

  await title.press("Space");
  await page.waitForTimeout(120);
  assert.equal(
    await reportFrame
      .locator("[data-report-page].is-active")
      .getAttribute("data-page-id"),
    pageIdBeforeTyping,
    "Space inside an editable title must not turn the report page",
  );
  assert.match(
    await title.textContent(),
    new RegExp(`^${titleBeforeTyping}[ \\u00a0]$`),
    "Space inside an editable title must be inserted as text",
  );

  await title.press("Enter");
  await title.pressSequentially("新增副标题");
  assert.match(
    await title.innerText(),
    /\n新增副标题\n?$/,
    "Enter inside a title must create a second editable line",
  );

  await page.waitForFunction(
    () => !document.querySelector("#editorSaveButton")?.disabled,
  );
  await page.locator("#editorSaveButton").click();
  await reportFrame
    .locator(
      '[data-page-id="data-01"] .h1-figma-module-title .vantage-title-subtitle',
    )
    .waitFor();
  assert.equal(
    await reportFrame
      .locator(
        '[data-page-id="data-01"] .h1-figma-module-title .vantage-title-subtitle',
      )
      .textContent(),
    "新增副标题",
    "the new subtitle must remain structured after publishing",
  );
  const publishedTitleScale = await reportFrame
    .locator('[data-page-id="data-01"] .h1-figma-module-title')
    .evaluate((element) => ({
      primary: Number.parseFloat(
        getComputedStyle(
          element.querySelector(".vantage-title-primary"),
        ).fontSize,
      ),
      subtitle: Number.parseFloat(
        getComputedStyle(
          element.querySelector(".vantage-title-subtitle"),
        ).fontSize,
      ),
    }));
  assert.ok(
    publishedTitleScale.subtitle < publishedTitleScale.primary,
    "the published subtitle must use a smaller visual hierarchy than the primary title",
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  if (await page.locator("#loginGate").isVisible()) {
    await page.locator("#loginSubmit").click();
    await page.locator("#loginGate").waitFor({ state: "hidden" });
  }
  const reloadedReportFrame = page.locator("#reportFrame").contentFrame();
  await reloadedReportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  await reloadedReportFrame
    .locator(
      '[data-page-id="data-01"] .h1-figma-module-title .vantage-title-subtitle',
    )
    .waitFor();
  assert.equal(
    await reloadedReportFrame
      .locator(
        '[data-page-id="data-01"] .h1-figma-module-title .vantage-title-subtitle',
      )
      .textContent(),
    "新增副标题",
    "the published subtitle must survive a full report reload",
  );
} finally {
  await browser.close();
}

console.log(
  "H1 editor keyboard routing and Enter-to-subtitle runtime checks passed.",
);
