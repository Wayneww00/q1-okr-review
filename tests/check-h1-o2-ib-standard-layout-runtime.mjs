import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_O2_IB_LAYOUT_TEST_URL || "http://127.0.0.1:4288";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=ib-standard`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();
  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 2048, height: 1188 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const target = reportFrame.locator('[data-page-id="o2-ib-loop"]');
    await target.evaluate((node) =>
      window.scrollTo({
        top: node.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(180);

    const state = await target.evaluate((root) => {
      const artboard = root.querySelector(".h1-o2-artboard");
      const header = root.querySelector(".h1-o2-page-header");
      const layout = root.querySelector(".h1-o2-ib-layout");
      const kpis = root.querySelector(".h1-o2-ib-kpis");
      const pageNumber = root.querySelector(".h1-o2-page-number");
      const lastCard = [...root.querySelectorAll(".h1-o2-ib-kpis .h1-o2-metric")].at(-1);
      const artboardRect = artboard.getBoundingClientRect();
      const pageNumberRect = pageNumber.getBoundingClientRect();
      const lastCardRect = lastCard.getBoundingClientRect();
      const pageNumberOverlapsLastCard = !(
        pageNumberRect.right < lastCardRect.left ||
        pageNumberRect.left > lastCardRect.right ||
        pageNumberRect.bottom < lastCardRect.top ||
        pageNumberRect.top > lastCardRect.bottom
      );
      const textIds = [...root.querySelectorAll("[data-vantage-text-id]")].map(
        (node) => node.dataset.vantageTextId,
      );
      return {
        pageTop: root.getBoundingClientRect().top,
        revision: root.dataset.editorRevision,
        headerClass: header?.className || "",
        headerOffset: header ? [header.offsetLeft, header.offsetTop, header.offsetWidth] : [],
        layoutOffset: [layout.offsetLeft, layout.offsetTop, layout.offsetWidth, layout.offsetHeight],
        layoutOverflow: [layout.scrollWidth - layout.clientWidth, layout.scrollHeight - layout.clientHeight],
        kpiOverflow: [kpis.scrollWidth - kpis.clientWidth, kpis.scrollHeight - kpis.clientHeight],
        pageNumberOverlapsLastCard,
        pageNumberBottomInset: Number.parseFloat(getComputedStyle(pageNumber).bottom),
        contentInsideArtboard:
          lastCardRect.bottom <= artboardRect.bottom + 0.5 &&
          lastCardRect.right <= artboardRect.right + 0.5,
        allKeysVersioned:
          textIds.length === 27 &&
          textIds.every((id) => id.startsWith("o2:o2-ib-loop@ib-loop-standard-layout-v3:")),
      };
    });

    assert.ok(Math.abs(state.pageTop) <= 2, `${viewport.width}: page must snap to the viewport`);
    assert.match(state.headerClass, /h1-o2-page-header/, `${viewport.width}: use common header`);
    assert.deepEqual(state.headerOffset, [154, 68, 1612]);
    assert.deepEqual(state.layoutOffset, [154, 244, 1612, 704]);
    assert.deepEqual(state.layoutOverflow, [0, 0], `${viewport.width}: layout must not overflow`);
    assert.deepEqual(state.kpiOverflow, [0, 0], `${viewport.width}: KPI row must not overflow`);
    assert.equal(state.pageNumberOverlapsLastCard, false, `${viewport.width}: page number must stay clear`);
    assert.ok(state.pageNumberBottomInset >= 60, `${viewport.width}: keep the standard page-number inset`);
    assert.equal(state.contentInsideArtboard, true, `${viewport.width}: all content must remain inside`);
    assert.equal(state.revision, "ib-loop-standard-layout-v3");
    assert.equal(state.allKeysVersioned, true);
  }

  await page.close();
  console.log("H1 O2 IB standard-layout runtime contract passed.");
} finally {
  await browser.close();
}
