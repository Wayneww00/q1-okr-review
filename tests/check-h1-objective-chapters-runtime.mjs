import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl =
  process.env.H1_OBJECTIVE_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const runtimeStub = `
  (() => {
    const session = { user: { id: "objective-chapter-test" } };
    const hasSession = () => localStorage.getItem("vantage-objective-test-auth") === "1";
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
        localStorage.setItem("vantage-objective-test-auth", "1");
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
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=objective-chapters`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginUsername").fill("vantage");
  await page.locator("#loginPassword").fill("vantage");
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
  assert.equal(await reportPages.count(), 94);
  assert.equal(
    await reportFrame
      .locator('[data-report-section="okr"] [data-report-page]')
      .count(),
    31,
  );
  assert.equal(
    await reportFrame
      .locator('[data-report-section="o2"] [data-report-page]')
      .count(),
    25,
  );
  assert.equal(
    await reportFrame
      .locator('[data-report-section="o3"] [data-report-page]')
      .count(),
    17,
  );

  const chapters = [
    {
      id: "o1-chapter",
      title: "O1 将 Vantage 建设成全球一线品牌",
      number: "01 / 31",
      backgroundSelector: ".h1-okr-fixed-stage-background",
      backgroundNeedle: "p68-trophy-background.png",
    },
    {
      id: "o2-chapter",
      title: "O2 以全面增长为核心，持续放大优势",
      number: "01 / 25",
      backgroundSelector: "[data-o2-desert-stage]",
      backgroundNeedle: "figma-desert-vantage-bg.png",
    },
    {
      id: "o3-chapter",
      title: "O3 关键区域打造 · 越南",
      number: "01 / 17",
      backgroundSelector: "[data-o3-trophy-stage]",
      backgroundNeedle: "figma-vantage-trophy-bg.png",
    },
  ];

  const layoutStates = [];
  for (const chapter of chapters) {
    const root = reportFrame.locator(`[data-page-id="${chapter.id}"]`);
    await root.evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(120);
    assert.equal(
      (
        await root.locator(".h1-objective-chapter-heading").innerText()
      )
        .replace(/\s+/g, " ")
        .trim(),
      chapter.title,
    );
    assert.equal(
      (
        await root
          .locator(
            chapter.id === "o1-chapter"
              ? ".h1-okr-page-number"
              : chapter.id === "o2-chapter"
                ? ".h1-o2-page-number"
                : ".h1-o3-page-number",
          )
          .innerText()
      )
        .replace(/\s+/g, " ")
        .trim(),
      chapter.number,
    );
    const state = await root.evaluate((node) => {
      const layout = node.querySelector(".h1-objective-chapter");
      const title = node.querySelector(".h1-objective-chapter-title");
      const path = node.querySelector(".h1-objective-chapter-path");
      const pageNumber = node.querySelector(
        ".h1-okr-page-number,.h1-o2-page-number,.h1-o3-page-number",
      );
      const layoutStyle = getComputedStyle(layout);
      const titleStyle = getComputedStyle(title);
      const pathStyle = getComputedStyle(path);
      const pageNumberStyle = getComputedStyle(pageNumber);
      return {
        pageTop: node.getBoundingClientRect().top,
        layoutLeft: layoutStyle.left,
        layoutRight: layoutStyle.right,
        layoutTop: layoutStyle.top,
        layoutWidth: layoutStyle.width,
        titleSize: titleStyle.fontSize,
        titleLineHeight: titleStyle.lineHeight,
        pathHeight: pathStyle.height,
        pageNumberRight: pageNumberStyle.right,
        pageNumberBottom: pageNumberStyle.bottom,
        pageNumberSize: pageNumberStyle.fontSize,
        titleOverflow: title.scrollWidth - title.clientWidth,
        layoutOverflow: layout.scrollHeight - layout.clientHeight,
      };
    });
    assert.ok(Math.abs(state.pageTop) <= 2);
    assert.ok(state.titleOverflow <= 2);
    assert.ok(state.layoutOverflow <= 2);
    layoutStates.push(state);

    const background = reportFrame.locator(chapter.backgroundSelector);
    if (chapter.id === "o1-chapter") {
      assert.match(
        (await background.getAttribute("src")) || "",
        new RegExp(`${chapter.backgroundNeedle}$`),
      );
    } else {
      assert.ok(
        (
          await background.evaluate(
            (node) => getComputedStyle(node).backgroundImage,
          )
        ).includes(chapter.backgroundNeedle),
      );
    }
  }

  for (const state of layoutStates.slice(1, 2)) {
    assert.deepEqual(
      {
        layoutLeft: state.layoutLeft,
        layoutTop: state.layoutTop,
        layoutWidth: state.layoutWidth,
        titleSize: state.titleSize,
        titleLineHeight: state.titleLineHeight,
        pathHeight: state.pathHeight,
        pageNumberRight: state.pageNumberRight,
        pageNumberBottom: state.pageNumberBottom,
        pageNumberSize: state.pageNumberSize,
      },
      {
        layoutLeft: layoutStates[0].layoutLeft,
        layoutTop: layoutStates[0].layoutTop,
        layoutWidth: layoutStates[0].layoutWidth,
        titleSize: layoutStates[0].titleSize,
        titleLineHeight: layoutStates[0].titleLineHeight,
        pathHeight: layoutStates[0].pathHeight,
        pageNumberRight: layoutStates[0].pageNumberRight,
        pageNumberBottom: layoutStates[0].pageNumberBottom,
        pageNumberSize: layoutStates[0].pageNumberSize,
      },
      "O1 and O2 chapter geometry and typography must match",
    );
  }
  assert.deepEqual(
    {
      layoutRight: layoutStates[2].layoutRight,
      layoutWidth: layoutStates[2].layoutWidth,
      titleSize: layoutStates[2].titleSize,
      pathHeight: layoutStates[2].pathHeight,
    },
    {
      layoutRight: "120px",
      layoutWidth: "720px",
      titleSize: "68px",
      pathHeight: "74px",
    },
    "O3 must use the dedicated right-side copy column that preserves the trophy",
  );

  assert.equal(
    await reportFrame
      .locator('[data-report-section="okr"] [data-report-page]')
      .nth(1)
      .getAttribute("data-page-id"),
    "okr-review",
  );
  assert.equal(
    (
      await reportFrame
        .locator('[data-page-id="okr-review"] .h1-okr-page-number')
        .innerText()
    )
      .replace(/\s+/g, " ")
      .trim(),
    "02 / 31",
  );
  assert.equal(
    (
      await reportFrame
        .locator(
          '[data-page-id="okr-premium-unlimited"] .h1-okr-page-number',
        )
        .innerText()
    )
      .replace(/\s+/g, " ")
      .trim(),
    "31 / 31",
  );

  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.waitForTimeout(180);
  const wideScales = [];
  for (const chapter of chapters) {
    const root = reportFrame.locator(`[data-page-id="${chapter.id}"]`);
    await root.evaluate((target) =>
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(120);
    wideScales.push(
      await root.evaluate((node) => {
        const layout = node.querySelector(".h1-objective-chapter");
        return layout.getBoundingClientRect().width / layout.offsetWidth;
      }),
    );
  }
  wideScales.forEach((scale) =>
    assert.ok(
      Math.abs(scale - 1) <= 0.01,
      `chapter title scale must stay at 1× on wide screens; received ${scale}`,
    ),
  );

  console.log(
    "H1 O1/O2/O3 shared chapter geometry, wide-screen scale, backgrounds, counts and numbering passed.",
  );
} finally {
  await browser.close();
}
