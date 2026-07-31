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
    const session = { user: { id: "ai-cross-frame-momentum-test" } };
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
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.setDefaultTimeout(10_000);
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
  await page.waitForTimeout(250);
  if (await page.locator("#loginGate").isVisible()) {
    await page.locator("#loginSubmit").evaluate((button) => button.click());
  }

  const aiScene = page.locator('section[data-label="AI Data Products"]');
  const reportScene = page.locator('section[data-label="Full Report"]');
  const closingScene = page.locator('section[data-label="Closing Film"]');

  // Load and prepare the deferred iframe before exercising the scene boundary.
  await aiScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page
    .frameLocator("#aiProductsFrame")
    .locator('body[data-deck-navigation-prepared="true"]')
    .waitFor({ state: "attached" });
  await closingScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await page.mouse.move(960, 540);
  await page.mouse.wheel(320, -24);
  await page.waitForTimeout(500);
  assert.ok(
    await closingScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "a horizontally dominant wheel gesture must remain in the closing scene",
  );
  await page.keyboard.down("Shift");
  await page.mouse.wheel(0, -320);
  await page.keyboard.up("Shift");
  await page.waitForTimeout(500);
  assert.ok(
    await closingScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "Shift+wheel must remain in the closing scene",
  );

  // Model one fast upward trackpad gesture: the leading impulse enters the AI
  // scene and the smaller values are inertia from that same physical gesture.
  await page.mouse.move(960, 540);
  const entryGestureDeltas = [-1000, -260, -160, -100, -60, -30];
  for (const [index, deltaY] of entryGestureDeltas.entries()) {
    await page.mouse.wheel(0, deltaY);
    if (index < entryGestureDeltas.length - 1) {
      // Production asset work can delay delivery of the first inertial tail.
      // Its decaying magnitude must still distinguish it from a new gesture.
      await page.waitForTimeout(index === 0 ? 250 : 90);
    }
  }
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  const aiSceneTop = await aiScene.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  assert.ok(
    Math.abs(aiSceneTop) < 2,
    `one continuous wheel gesture must stop on the newly entered AI scene; got top ${aiSceneTop}`,
  );

  // A deliberate second gesture after 250 ms of silence must not be mistaken
  // for more inertia from the entry gesture.
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, -320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );

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

  await page.mouse.wheel(0, 320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );

  // With no intermediate tail events, a standalone strong second impulse is
  // still a deliberate new gesture and must work before the idle gate expires.
  await page.mouse.wheel(0, -1000);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, -320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );
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
  await page.mouse.wheel(0, 320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );

  // A delayed, low-energy tail must remain absorbed, while a later strong
  // impulse after the shorter fresh-intent gap must count as a new gesture.
  await page.mouse.wheel(0, -1000);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );
  await page.mouse.wheel(0, -24);
  await page.waitForTimeout(80);
  assert.ok(
    await aiScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "a small inertia tail arriving after the outer gate releases must remain on AI",
  );
  await page.mouse.wheel(0, -320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );

  const reportFrame = page.frameLocator("#reportFrame");
  await reportFrame
    .locator('body[data-h1-prepared="true"]')
    .waitFor({ state: "attached", timeout: 30_000 });
  await page.waitForFunction(() => {
    const doc = document.querySelector("#reportFrame")?.contentDocument;
    if (!doc) return false;
    const injectedThemes = [
      ...doc.querySelectorAll('link[rel="stylesheet"]'),
    ];
    const middleTheme = injectedThemes.find((link) =>
      /h1-middle-theme\.css/.test(link.href),
    );
    const racingTheme = doc.querySelector("#h1-figma-racing-report");
    return Boolean(middleTheme?.sheet && racingTheme?.sheet);
  });
  await reportFrame.locator("body").evaluate(async (element) => {
    await element.ownerDocument.fonts?.ready;
  });
  await reportScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await reportFrame.locator("[data-report-page]").last().evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() => {
    const pages = [
      ...document
        .querySelector("#reportFrame")
        .contentDocument.querySelectorAll("[data-report-page]"),
    ];
    return Math.abs(pages.at(-1).getBoundingClientRect().top) < 2;
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await page.mouse.move(960, 540);
  for (const deltaY of [1000, 260, 160, 100, 60, 30]) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(90);
  }
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  const aiSceneTopAfterForwardGesture = await aiScene.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  assert.ok(
    Math.abs(aiSceneTopAfterForwardGesture) < 2,
    `one continuous forward wheel gesture must stop on the newly entered AI scene; got top ${aiSceneTopAfterForwardGesture}`,
  );

  // A single upward gesture may cross from AI back to Full Report, but its
  // inertial tail must not continue paging inside the newly exposed iframe.
  await page.waitForTimeout(380);
  for (const deltaY of [-320, -180, -100, -60, -30]) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(90);
  }
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );
  assert.ok(
    await reportFrame.locator("[data-report-page]").last().evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "the inertial tail from leaving AI must not page backward inside Full Report",
  );

  // If a fresh gesture starts while the AI-to-report entry gate is still
  // active, its own tail must remain attached to that gesture. It may move the
  // report back one page, but it must not queue a second report-page movement.
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
  await page.mouse.wheel(0, -1000);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForTimeout(250);
  await page.mouse.wheel(0, -320);
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );
  await page.mouse.wheel(0, -60);
  await page.waitForTimeout(2200);
  const reportIndexAfterFreshGesture = await reportFrame
    .locator("[data-report-page]")
    .evaluateAll((pages) => {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      pages.forEach((page, index) => {
        const distance = Math.abs(page.getBoundingClientRect().top);
        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      });
      return { nearestIndex, total: pages.length };
    });
  assert.equal(
    reportIndexAfterFreshGesture.nearestIndex,
    reportIndexAfterFreshGesture.total - 2,
    "one fresh wheel gesture and its tail must move Full Report by exactly one page",
  );

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
  await page.mouse.wheel(0, 320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );

  await reportScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await reportFrame.locator("[data-report-page]").last().evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() => {
    const pages = [
      ...document
        .querySelector("#reportFrame")
        .contentDocument.querySelectorAll("[data-report-page]"),
    ];
    return Math.abs(pages.at(-1).getBoundingClientRect().top) < 2;
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  // Even an unusually long continuous trackpad gesture must cross at most one
  // outer scene; the safety timeout must not unlock while wheel input is active.
  await page.mouse.move(960, 540);
  for (const deltaY of [1000, ...Array(24).fill(48)]) {
    await page.mouse.wheel(0, deltaY);
    await page.waitForTimeout(90);
  }
  await page.waitForFunction(
    () => !document.body.classList.contains("deck-wheel-transitioning"),
  );
  assert.ok(
    await aiScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "a continuous long wheel gesture must stop on AI Data Products instead of skipping to Closing Film",
  );

  await reportScene.evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await reportFrame.locator("[data-report-page]").last().evaluate((element) =>
    element.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() => {
    const pages = [
      ...document
        .querySelector("#reportFrame")
        .contentDocument.querySelectorAll("[data-report-page]"),
    ];
    return Math.abs(pages.at(-1).getBoundingClientRect().top) < 2;
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await reportFrame.locator("body").evaluate((element) => {
    element.tabIndex = -1;
    element.focus();
  });
  await page.keyboard.press("ArrowDown");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.mouse.move(960, 540);
  await page.mouse.wheel(0, 320);
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
} finally {
  await browser.close();
}

console.log(
  `H1 AI cross-frame wheel momentum runtime contract passed in ${browserName}.`,
);
