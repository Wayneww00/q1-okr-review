import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_AI_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1114, height: 973 },
  });
  page.setDefaultTimeout(5_000);

  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html`, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("#loginGate").evaluate((element) => {
    element.classList.add("is-hidden");
  });

  const aiScene = page.locator('section[data-label="AI Data Products"]');
  await aiScene.evaluate((element) => element.scrollIntoView());
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await page.evaluate(() => {
    window.__aiBoundaryScrollCalls = [];
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoViewWithAudit(options) {
      window.__aiBoundaryScrollCalls.push(this.dataset?.label || this.id || this.tagName);
      return originalScrollIntoView.call(this, options);
    };
  });

  const frame = page.frameLocator("#aiProductsFrame");
  const productsRail = frame.locator("#products");
  const waitForOuterWheelTransitionToClear = () =>
    page.waitForFunction(
      () => !document.body.classList.contains("deck-wheel-transitioning"),
    );
  await productsRail.waitFor();
  await frame
    .locator('body[data-deck-navigation-prepared="true"]')
    .waitFor();
  await waitForOuterWheelTransitionToClear();
  const railMetrics = await productsRail.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  assert.ok(
    railMetrics.scrollWidth > railMetrics.clientWidth,
    "the products rail must overflow horizontally for this regression test",
  );
  await productsRail.evaluate((element) => {
    element.style.scrollSnapType = "none";
    element.scrollLeft = 0;
  });
  await page.waitForTimeout(60);
  assert.ok(
    (await productsRail.evaluate((element) => element.scrollLeft)) <= 1,
    "the regression setup must begin at the true leading boundary",
  );
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: -320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(650);
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: -24,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(120);
  assert.equal(
    await page.evaluate(() =>
      window.__aiBoundaryScrollCalls.includes("Full Report"),
    ),
    false,
    "one upward swipe, including its delayed inertial tail, must not request the previous scene",
  );
  assert.ok(
    await aiScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "the delayed inertial tail of one upward swipe must not leave the AI scene",
  );
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: -320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  await waitForOuterWheelTransitionToClear();
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
  await waitForOuterWheelTransitionToClear();
  await productsRail.evaluate((element) => {
    element.style.scrollSnapType = "";
  });
  await page.evaluate(() => {
    window.__aiBoundaryScrollCalls = [];
  });

  await productsRail.evaluate((element) => {
    element.scrollLeft = 0;
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: 320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(600);

  assert.ok(
    await aiScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "wheel input must stay in AI Data Products while its product rail can still scroll",
  );
  assert.ok(
    (await productsRail.evaluate((element) => element.scrollLeft)) > 0,
    "vertical wheel input must advance the horizontal products rail",
  );

  await productsRail.evaluate((element) => {
    element.scrollLeft = element.scrollWidth - element.clientWidth;
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: 320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(360);
  assert.ok(
    await aiScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "the inertial tail of the gesture that reached the rail boundary must not skip the scene",
  );

  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: 320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(40);
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: 24,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await page.setViewportSize({ width: 1920, height: 1080 });
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
  await waitForOuterWheelTransitionToClear();
  const wideRailMetrics = await productsRail.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  assert.ok(
    wideRailMetrics.scrollWidth <= wideRailMetrics.clientWidth + 2,
    "the wide regression viewport must display all product cards without horizontal overflow",
  );

  await page.evaluate(() => {
    window.__aiBoundaryScrollCalls = [];
  });
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: 320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(220);
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: 24,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Closing Film"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  assert.equal(
    await page.evaluate(
      () =>
        window.__aiBoundaryScrollCalls.filter(
          (label) => label === "Closing Film",
        ).length,
    ),
    1,
    "one downward wheel gesture and its delayed inertial tail must navigate only once",
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
  await waitForOuterWheelTransitionToClear();
  await page.evaluate(() => {
    window.__aiBoundaryScrollCalls = [];
  });
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: -320,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForTimeout(220);
  await productsRail.evaluate((element) => {
    element.dispatchEvent(
      new WheelEvent("wheel", {
        deltaX: 0,
        deltaY: -24,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );
  assert.equal(
    await page.evaluate(
      () =>
        window.__aiBoundaryScrollCalls.filter(
          (label) => label === "Full Report",
        ).length,
    ),
    1,
    "one upward wheel gesture and its delayed inertial tail must navigate only once",
  );
} finally {
  await browser.close();
}

console.log("H1 AI products wheel routing runtime contract passed.");
