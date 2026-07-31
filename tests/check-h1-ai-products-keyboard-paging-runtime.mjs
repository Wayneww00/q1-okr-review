import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_AI_TEST_URL || "http://127.0.0.1:4180";
const browserName = process.env.H1_AI_BROWSER || "chromium";
const browserType = { chromium, webkit }[browserName];
assert.ok(browserType, `unsupported H1 AI browser: ${browserName}`);
const runtimeStub = `
  (() => {
    const session = { user: { id: "ai-keyboard-paging-test" } };
    const client = {
      auth: {
        getSession: async () => ({ data: { session }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    };
    window.VantageBrowserRuntime = {
      signIn: async () => session,
      getClient: () => client,
      getSession: async () => session,
      resolveMediaUrl: (path) => path,
      setVideoSource: (video, path) => { video.src = path; },
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
const browser = await browserType.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1114, height: 973 },
  });
  page.setDefaultTimeout(5_000);
  await page.route("**/vendor/vantage-runtime.js*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );

  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#loginGate").evaluate((element) => {
    element.classList.add("is-hidden");
  });

  const aiScene = page.locator('section[data-label="AI Data Products"]');
  const reportScene = page.locator('section[data-label="Full Report"]');
  const closingScene = page.locator('section[data-label="Closing Film"]');
  const frame = page.frameLocator("#aiProductsFrame");
  const reportFrame = page.frameLocator("#reportFrame");
  const productsRail = frame.locator("#products");
  const eyeBrainHandTrigger = frame.getByRole("button", {
    name: "翻转以查看 The Matrix 产品进展与上线计划",
  });
  const placeholderBody = frame.locator("body");
  await placeholderBody.waitFor();
  assert.equal(
    await placeholderBody.getAttribute("data-deck-navigation-prepared"),
    null,
    "the transient about:blank iframe must not claim that deck navigation is ready",
  );
  const scrollToAiScene = async () => {
    await aiScene.evaluate((element) =>
      element.scrollIntoView({ behavior: "instant", block: "start" }),
    );
    await page.waitForFunction(
      () =>
        Math.abs(
          document
            .querySelector('section[data-label="AI Data Products"]')
            .getBoundingClientRect().top,
        ) < 2,
    );
    await frame
      .locator('body[data-deck-navigation-prepared="true"]')
      .waitFor();
  };

  // Reproduce the real transition path: keyboard focus can remain in the
  // report iframe after the outer deck has scrolled to AI Data Products.
  await reportFrame
    .locator('body[data-h1-prepared="true"]')
    .waitFor({ state: "attached", timeout: 30_000 });
  await reportScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await reportFrame.locator("body").evaluate((element) => {
    element.tabIndex = -1;
    element.focus();
  });
  await scrollToAiScene();
  await reportFrame.locator("body").evaluate((element) => element.focus());
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "reportFrame",
    "the regression setup must force focus back into the off-screen report iframe",
  );
  await page.keyboard.press("PageDown");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await reportScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await reportFrame.locator("body").evaluate((element) => {
    element.tabIndex = -1;
    element.focus();
  });
  await scrollToAiScene();
  await reportFrame.locator("body").evaluate((element) => element.focus());
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    "reportFrame",
    "the backward regression setup must force stale report focus",
  );
  await page.keyboard.press("PageUp");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  // Toolbar buttons can retain focus after sound/fullscreen interactions. The
  // vertical arrow keys must still navigate the presentation from the AI scene.
  await scrollToAiScene();
  await page.locator("#soundButton").focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await scrollToAiScene();
  await productsRail.evaluate((element) => {
    element.style.scrollSnapType = "none";
    element.scrollLeft = 0;
  });
  await eyeBrainHandTrigger.focus();
  const forwardStart = await productsRail.evaluate((element) => ({
    scrollLeft: element.scrollLeft,
    maxScrollLeft: element.scrollWidth - element.clientWidth,
  }));
  assert.ok(
    forwardStart.scrollLeft < forwardStart.maxScrollLeft - 4,
    "the regression setup must leave horizontal product content to the right",
  );

  await page.keyboard.press("PageDown");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  assert.equal(
    Math.round(await productsRail.evaluate((element) => element.scrollLeft)),
    Math.round(forwardStart.scrollLeft),
    "PageDown must not consume the first key press by moving the horizontal product rail",
  );

  await scrollToAiScene();
  await productsRail.evaluate((element) => {
    element.scrollLeft = element.scrollWidth - element.clientWidth;
  });
  await eyeBrainHandTrigger.focus();
  const backwardStart = await productsRail.evaluate(
    (element) => element.scrollLeft,
  );
  assert.ok(
    backwardStart > 4,
    "the regression setup must leave horizontal product content to the left",
  );

  await page.keyboard.press("PageUp");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  assert.equal(
    Math.round(await productsRail.evaluate((element) => element.scrollLeft)),
    Math.round(backwardStart),
    "PageUp must not consume the first key press by moving the horizontal product rail",
  );

  assert.ok(
    await closingScene.count(),
    "the AI scene must have a following outer deck scene",
  );
  assert.ok(
    await reportScene.count(),
    "the AI scene must have a preceding outer deck scene",
  );
} finally {
  await browser.close();
}

console.log(
  `H1 AI products keyboard paging runtime contract passed in ${browserName}.`,
);
