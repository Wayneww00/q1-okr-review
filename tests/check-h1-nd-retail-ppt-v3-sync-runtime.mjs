import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_ND_TEST_URL || "http://127.0.0.1:4292";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.setDefaultTimeout(15_000);
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=retail-nd-ppt-v3`,
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
  assert.equal(
    await reportFrame.locator('[data-report-section="data"] [data-report-page]').count(),
    20,
  );
  assert.equal(await reportFrame.locator("[data-report-page]").count(), 104);
  assert.equal(await reportFrame.locator('[data-page-id="data-21"]').count(), 0);

  const waitForActivePage = (pageId) =>
    page.waitForFunction(
      (targetPageId) =>
        document
          .querySelector("#reportFrame")
          ?.contentDocument?.querySelector(`[data-page-id="${targetPageId}"]`)
          ?.classList.contains("is-active"),
      pageId,
    );
  const scrollToPage = async (pageId) => {
    await reportFrame.locator(`[data-page-id="${pageId}"]`).evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await waitForActivePage(pageId);
  };

  const assertContained = async (pageId) => {
    const geometry = await reportFrame
      .locator(`[data-page-id="${pageId}"]`)
      .evaluate((root) => {
        const canvas = root.querySelector(".h1-extended-editorial-canvas");
        const pageRect = root.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const contentRects = [...canvas.querySelectorAll("h1, h2, p, svg")]
          .filter((element) => getComputedStyle(element).visibility !== "hidden")
          .map((element) => element.getBoundingClientRect());
        return {
          rootOverflowX: root.scrollWidth - root.clientWidth,
          rootOverflowY: root.scrollHeight - root.clientHeight,
          canvasOverflowX: canvas.scrollWidth - canvas.clientWidth,
          canvasOverflowY: canvas.scrollHeight - canvas.clientHeight,
          outside: contentRects.filter(
            (rect) =>
              rect.left < pageRect.left - 1 ||
              rect.right > pageRect.right + 1 ||
              rect.top < canvasRect.top - 1 ||
              rect.bottom > canvasRect.bottom + 1,
          ).length,
        };
      });
    assert.ok(geometry.rootOverflowX <= 1, `${pageId} must not overflow horizontally`);
    assert.ok(geometry.rootOverflowY <= 1, `${pageId} must not overflow vertically`);
    assert.ok(geometry.canvasOverflowX <= 1, `${pageId} canvas must not overflow horizontally`);
    assert.ok(geometry.canvasOverflowY <= 1, `${pageId} canvas must not overflow vertically`);
    assert.equal(geometry.outside, 0, `${pageId} visible content must remain in its canvas`);
  };

  await scrollToPage("data-15");
  assert.match(
    await reportFrame.locator('[data-page-id="data-15"]').innerText(),
    /GS Retail ND Q2 较 Q1 占比上涨: \+0\.5%[\s\S]*APAC Retail ND Q2 较 Q1 占比下降: -2\.0%/,
  );
  assert.equal(
    await reportFrame.locator('[data-page-id="data-15"] .h1-retail-growth-chart-notes p').count(),
    2,
  );
  await assertContained("data-15");

  await scrollToPage("data-16");
  assert.match(
    await reportFrame.locator('[data-page-id="data-16"]').innerText(),
    /Q2 APAC数据拆解：Sales端逆势上扬，一枝独秀[\s\S]*Sales端Non-Retail数据表现亮眼，成为4大类型中唯一绝对值上涨大类[\s\S]*133\.1M[\s\S]*143\.1M[\s\S]*10\.0M[\s\S]*7\.5%[\s\S]*38\.8M[\s\S]*37\.2M[\s\S]*-1\.6M[\s\S]*-4\.0%[\s\S]*195\.6M[\s\S]*177\.4M[\s\S]*-18\.2M[\s\S]*-9\.3%[\s\S]*74\.7M[\s\S]*69\.3M[\s\S]*-5\.4M[\s\S]*-7\.3%/,
  );
  assert.equal(
    await reportFrame.locator('[data-page-id="data-16"] .h1-retail-growth-region-group').count(),
    4,
  );
  await assertContained("data-16");

  await scrollToPage("data-19");
  assert.match(
    await reportFrame.locator('[data-page-id="data-19"]').innerText(),
    /可能对Retail ND占比有影响的因素[\s\S]*1\.MIB口径变化导致数据影响[\s\S]*40%的Q2 MIB用户不符合IB的显著特征[\s\S]*Q2 ND 5\.9M \(占比大盘1\.4%\)[\s\S]*2\.Retail 转 IB导致下降（长期）[\s\S]*超过一半转入IB的用户在注册两个月后才发生归属迁移[\s\S]*Q2 ND 9\.1M \(占比大盘2\.1%\)/,
  );
  assert.equal(
    await reportFrame.locator('[data-page-id="data-19"] .h1-retail-growth-factor-panel').count(),
    2,
  );
  const factorOrder = await reportFrame
    .locator('[data-page-id="data-19"] .h1-retail-growth-factor-panel')
    .evaluateAll((panels) =>
      panels.map((panel) => {
        const title = panel.querySelector("h2").getBoundingClientRect();
        const summary = panel
          .querySelector(".h1-retail-growth-factor-summary")
          .getBoundingClientRect();
        const chart = panel.querySelector("svg").getBoundingClientRect();
        return {
          titleBeforeSummary: title.bottom <= summary.top + 1,
          summaryBeforeChart: summary.bottom <= chart.top + 1,
        };
      }),
    );
  for (const order of factorOrder) {
    assert.equal(order.titleBeforeSummary, true);
    assert.equal(order.summaryBeforeChart, true);
  }

  const sourcePreview = reportFrame.locator(
    '[data-page-id="data-19"] .h1-retail-growth-factor-preview',
  );
  assert.equal(await sourcePreview.count(), 1);
  const previewContract = await sourcePreview.evaluate((button) => {
    const title = button
      .closest(".h1-retail-growth-factor-heading")
      .querySelector("h2")
      .getBoundingClientRect();
    const preview = button.getBoundingClientRect();
    const image = button.querySelector("img");
    const style = getComputedStyle(button);
    return {
      titleCenter: title.top + title.height / 2,
      previewCenter: preview.top + preview.height / 2,
      width: style.width,
      height: style.height,
      objectFit: getComputedStyle(image).objectFit,
    };
  });
  assert.ok(Math.abs(previewContract.titleCenter - previewContract.previewCenter) <= 2);
  assert.equal(previewContract.width, "120px");
  assert.equal(previewContract.height, "68px");
  assert.equal(previewContract.objectFit, "contain");

  await sourcePreview.click();
  const sourceModal = reportFrame.locator(".h1-source-image-modal");
  await sourceModal.waitFor();
  assert.equal(await sourceModal.locator(".h1-source-image-modal-caption").count(), 0);
  assert.deepEqual(
    await sourceModal.locator("img").evaluate((image) => ({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })),
    { naturalWidth: 2264, naturalHeight: 1436 },
  );
  await reportFrame.locator("body").press("Escape");
  assert.equal(await sourceModal.count(), 0);

  await sourcePreview.click();
  await sourceModal.waitFor();
  await sourceModal.click({ position: { x: 8, y: 8 } });
  assert.equal(await sourceModal.count(), 0);
  await assertContained("data-19");

  assert.match(
    (await reportFrame
      .locator('[data-page-id="data-19"] .h1-extended-editorial-page-number')
      .innerText())
      .replace(/\s+/g, " ")
      .trim(),
    /^19 \/ 20$/,
  );
  assert.deepEqual(pageErrors, []);
  console.log("Retail ND PPT v3 runtime contract passes.");
} finally {
  await browser.close();
}
