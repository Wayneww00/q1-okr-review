import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O2_DELIVERY_TEST_URL || "http://127.0.0.1:4288";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.route("**/*.mp4", (route) =>
    route.fulfill({ status: 204, contentType: "video/mp4", body: "" }),
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-delivery-ppt88`,
    { waitUntil: "domcontentloaded" },
  );
  if (await page.locator("#loginGate").isVisible()) {
    await page.locator("#loginSubmit").click();
    await page.waitForFunction(() =>
      document.querySelector("#loginGate")?.classList.contains("is-hidden"),
    );
  }

  await page.locator('.scene[data-label="Full Report"]').evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

  const target = reportFrame.locator('[data-page-id="o2-global-delivery"]');
  await target.evaluate((node) =>
    window.scrollTo({
      top: node.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );

  assert.equal(await target.getAttribute("data-editor-revision"), "delivery-ppt88-v1");
  const text = (await target.innerText()).replace(/\s+/g, " ");
  for (const fact of [
    "外部监管与平台合规约束常态化",
    "看得准【市场 & 竞品监测】",
    "上得快【资产模块化 & 效率升级】",
    "投得进【多层媒体供给 & 受限渠道打通】",
    "放得大【地域验证 & 业务持续增长】",
    "Meta TikTok｜盈利增量跑通",
    "DSP｜高质量增量验证",
    "区域稀缺渠道：Naver ｜ Yandex",
    "AI Ads 布局：ChatGPT Ads｜Gemini Ads",
    "Performance Marketing · 2026 H1 Review",
  ]) {
    assert.ok(text.includes(fact), `rendered PPT page 88 must contain: ${fact}`);
  }

  const geometry = await target.evaluate((node) => {
    const layout = node.querySelector(".h1-o2-delivery-layout").getBoundingClientRect();
    const left = node.querySelector(".h1-o2-delivery-left").getBoundingClientRect();
    const right = node.querySelector(".h1-o2-delivery-right").getBoundingClientRect();
    const footer = node.querySelector(".h1-o2-delivery-source-footer").getBoundingClientRect();
    const pageNumber = node.querySelector(".h1-o2-page-number").getBoundingClientRect();
    const overflow = [
      ...node.querySelectorAll(
        ".h1-o2-delivery-intro,.h1-o2-delivery-step,.h1-o2-delivery-proof,.h1-o2-delivery-metric-card,.h1-o2-delivery-breakthrough",
      ),
    ].filter(
      (item) =>
        item.scrollWidth > item.clientWidth + 1 ||
        item.scrollHeight > item.clientHeight + 1,
    ).length;
    return {
      layoutTop: layout.top,
      layoutBottom: layout.bottom,
      layoutLeft: layout.left,
      layoutRight: layout.right,
      leftTop: left.top,
      leftBottom: left.bottom,
      rightTop: right.top,
      rightBottom: right.bottom,
      footerTop: footer.top,
      footerBottom: footer.bottom,
      footerOverlapsPageNumber: !(
        footer.right < pageNumber.left ||
        footer.left > pageNumber.right ||
        footer.bottom < pageNumber.top ||
        footer.top > pageNumber.bottom
      ),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      overflow,
    };
  });

  assert.equal(geometry.overflow, 0, "PPT page 88 content must not clip or overflow");
  assert.ok(
    geometry.layoutTop >= -1 &&
      geometry.layoutBottom <= geometry.viewportHeight + 1 &&
      geometry.layoutLeft >= -1 &&
      geometry.layoutRight <= geometry.viewportWidth + 1,
    "the rebuilt layout must stay inside the report viewport",
  );
  assert.ok(
    Math.abs(geometry.leftTop - geometry.rightTop) <= 1 &&
      Math.abs(geometry.leftBottom - geometry.rightBottom) <= 1,
    "the two source-layout columns must align vertically",
  );
  assert.ok(
    geometry.footerTop >= -1 && geometry.footerBottom <= geometry.viewportHeight + 1,
    "the source footer must stay inside the report viewport",
  );
  assert.equal(
    geometry.footerOverlapsPageNumber,
    false,
    "the source footer must not collide with the page number",
  );
} finally {
  await browser.close();
}

console.log("H1 O2 delivery PPT page 88 runtime contract passed.");
