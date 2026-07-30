import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O3_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const runtimeStub = `
  (() => {
    const session = { user: { id: "o3-copytrade-layout-test" } };
    const hasSession = () => localStorage.getItem("vantage-o3-copytrade-test-auth") === "1";
    const client = {
      auth: {
        getSession: async () => ({ data: { session: hasSession() ? session : null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    };
    window.VantageBrowserRuntime = {
      getClient: () => client,
      getSession: async () => (hasSession() ? session : null),
      signIn: async () => {
        localStorage.setItem("vantage-o3-copytrade-test-auth", "1");
        return session;
      },
      resolveMediaUrl: (path) => path,
      createReportController: () => ({
        initialize: async () => true,
        beginEditing() {},
        save: async () => {},
        discard() {},
        destroy() {},
      }),
    };
  })();
`;

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.route("**/vendor/vantage-runtime.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );
  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-copytrade-layout`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#loginSubmit").click();
  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() =>
    document.querySelector('.scene[data-label="Full Report"]')?.classList.contains("active"),
  );
  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

  const copyTrade = reportFrame.locator('[data-page-id="o3-copy-trade"]');
  await copyTrade.evaluate((node) =>
    window.scrollTo({
      top: node.getBoundingClientRect().top + window.scrollY,
      behavior: "instant",
    }),
  );
  await page.waitForTimeout(100);

  const overflow = await copyTrade.evaluate((pageNode) => {
    const within = (inner, outer) => {
      const a = inner.getBoundingClientRect();
      const b = outer.getBoundingClientRect();
      return a.top >= b.top - 1 && a.bottom <= b.bottom + 1 && a.left >= b.left - 1 && a.right <= b.right + 1;
    };
    const stage = pageNode.querySelector('.h1-o3-artboard');
    const root = pageNode.querySelector('.h1-o3-copytrade-figma107');
    const strategy = root.querySelector('.h1-o3-copytrade-strategy');
    const evidence = root.querySelector('.h1-o3-copytrade-evidence');
    const rows = [...root.querySelectorAll('.h1-o3-copytrade-evidence-row')];
    return {
      rootWithinStage: within(root, stage),
      strategyWithinRoot: within(strategy, root),
      evidenceWithinRoot: within(evidence, root),
      rowsWithinEvidence: rows.map((row) => within(row, evidence)),
      mediaItemsWithinRows: rows.map((row) =>
        [...row.querySelectorAll(".h1-source-image-trigger")].every((item) =>
          within(item, row),
        ),
      ),
      mediaItemCounts: rows.map(
        (row) => row.querySelectorAll(".h1-source-image-trigger").length,
      ),
      mediaItemRects: rows.map((row) =>
        [...row.querySelectorAll(".h1-source-image-trigger")].map((item) => {
          const rect = item.getBoundingClientRect();
          return {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          };
        }),
      ),
      mediaFitStyles: rows.map((row) =>
        [...row.querySelectorAll(".h1-source-image-trigger img")].map(
          (image) => {
            const style = getComputedStyle(image);
            return {
              objectFit: style.objectFit,
              objectPosition: style.objectPosition,
            };
          },
        ),
      ),
      labelAccentStyles: rows.map((row) => {
        const label = row.querySelector(":scope > div:first-child");
        const style = getComputedStyle(label);
        const accent = getComputedStyle(label, "::before");
        return {
          borderLeftWidth: style.borderLeftWidth,
          accentPosition: accent.position,
          accentTop: Number.parseFloat(accent.top),
          accentBottom: Number.parseFloat(accent.bottom),
        };
      }),
      rowHeights: rows.map((row) => row.getBoundingClientRect().height),
      nestedSectionSpacing: [
        ...root.querySelectorAll(
          ".h1-o3-copytrade-metrics section, .h1-o3-copytrade-evidence-row",
        ),
      ].map((section) => {
        const style = getComputedStyle(section);
        return {
          marginBottom: Number.parseFloat(style.marginBottom),
          paddingTop: Number.parseFloat(style.paddingTop),
          isEvidenceRow: section.classList.contains(
            "h1-o3-copytrade-evidence-row",
          ),
        };
      }),
    };
  });

  assert.equal(overflow.rootWithinStage, true, "Copy Trade composition must stay within the 1920×1080 artboard");
  assert.equal(overflow.strategyWithinRoot, true, "left strategy panel must stay within the Figma composition");
  assert.equal(overflow.evidenceWithinRoot, true, "right evidence panel must stay within the Figma composition");
  assert.deepEqual(overflow.rowsWithinEvidence, [true, true, true], "all three evidence rows must fit inside their panel without clipping or overflow");
  assert.deepEqual(
    overflow.mediaItemsWithinRows,
    [true, true, true],
    "every KOL, PR, and UGC image must stay inside its own evidence row",
  );
  assert.deepEqual(
    overflow.mediaItemCounts,
    [8, 7, 4],
    "Copy Trade must retain all 8 KOL, 7 PR, and 4 UGC evidence images",
  );
  const prRects = overflow.mediaItemRects[1];
  const prWidths = prRects.map((rect) => rect.width);
  assert.ok(
    Math.max(...prWidths) - Math.min(...prWidths) <= 1,
    "all seven PR evidence images must use the same card width",
  );
  const sixthPr = prRects.at(-2);
  const seventhPr = prRects.at(-1);
  assert.ok(
    seventhPr.top > sixthPr.top + 1 || seventhPr.left > sixthPr.left + 1,
    "the seventh PR image must follow the sixth in visual reading order",
  );
  assert.equal(
    overflow.mediaFitStyles.flat().every((style) => style.objectFit === "cover"),
    true,
    "Copy Trade evidence images must fill their bounded cells without leaking",
  );
  assert.equal(
    overflow.mediaFitStyles[1].every((style) =>
      ["top", "50% 0%"].includes(style.objectPosition),
    ),
    true,
    "PR evidence must keep its top-aligned crop",
  );
  for (const accent of overflow.labelAccentStyles) {
    assert.equal(
      accent.borderLeftWidth,
      "0px",
      "row labels must not use a full-height border that visually joins adjacent modules",
    );
    assert.equal(accent.accentPosition, "absolute");
    assert.ok(
      accent.accentTop >= 20 && accent.accentBottom >= 20,
      "each module must use its own inset accent line",
    );
  }
  assert.ok(
    Math.max(...overflow.rowHeights) - Math.min(...overflow.rowHeights) <= 1,
    "KOL, PR, and UGC must retain equal-height evidence tracks",
  );
  for (const spacing of overflow.nestedSectionSpacing) {
    assert.equal(
      spacing.marginBottom,
      0,
      "embedded report page spacing must not leak into nested Copy Trade sections",
    );
    assert.equal(
      spacing.paddingTop,
      spacing.isEvidenceRow ? 16 : 0,
      "nested Copy Trade sections must keep their component-level padding",
    );
  }

  if (process.env.H1_O3_SCREENSHOT) {
    await copyTrade.screenshot({
      path: process.env.H1_O3_SCREENSHOT,
    });
  }

  console.log("H1 O3 Copy Trade runtime layout contract passed.");
} finally {
  await browser.close();
}
