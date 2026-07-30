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
    viewport: { width: 1440, height: 900 },
  });
  page.setDefaultTimeout(5_000);

  const pageErrors = [];
  const brokenAiResponses = [];
  const aiResponses = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (!response.url().includes("/ai-data-products/")) return;
    aiResponses.push(response.url());
    if (response.status() >= 400) {
      brokenAiResponses.push({
        status: response.status(),
        url: response.url(),
      });
    }
  });

  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html`, {
    waitUntil: "domcontentloaded",
  });

  const aiScene = page.locator('section[data-label="AI Data Products"]');
  await aiScene.waitFor({ state: "attached" });
  assert.equal(await aiScene.count(), 1);
  await page.waitForTimeout(250);
  assert.deepEqual(
    aiResponses,
    [],
    "AI module resources must stay deferred before its scene is entered",
  );

  await page.locator("#loginGate").evaluate((element) => {
    element.classList.add("is-hidden");
  });
  await aiScene.evaluate((element) => element.scrollIntoView());
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('section[data-label="AI Data Products"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  const frame = page.frameLocator("#aiProductsFrame");
  await frame.locator("#products").waitFor();
  assert.equal(await frame.locator("#products > article").count(), 3);
  assert.equal(await frame.locator("#tools > article").count(), 8);
  assert.equal(await frame.locator('a[target="_blank"]').count(), 10);
  assert.ok(
    aiResponses.length > 0,
    "entering the AI scene must activate its deferred iframe",
  );
  const dispatchDeckKey = (key) =>
    frame.locator("body").evaluate(
      (body, pressedKey) =>
        body.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: pressedKey,
            bubbles: true,
            cancelable: true,
          }),
        ),
      key,
    );
  const assertAiSceneIsCurrent = async (message) => {
    assert.ok(
      await aiScene.evaluate(
        (element) => Math.abs(element.getBoundingClientRect().top) < 2,
      ),
      message,
    );
  };
  const dispatchTouch = ({ startX, startY, endX, endY }) =>
    frame.locator("body").evaluate(
      (body, points) => {
        const start = new Event("touchstart", {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(start, "touches", {
          value: [{ clientX: points.startX, clientY: points.startY }],
        });
        body.dispatchEvent(start);

        const end = new Event("touchend", {
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(end, "changedTouches", {
          value: [{ clientX: points.endX, clientY: points.endY }],
        });
        body.dispatchEvent(end);
      },
      { startX, startY, endX, endY },
    );
  const dispatchWheel = ({ deltaX, deltaY }) =>
    frame.locator("body").evaluate(
      (body, deltas) =>
        body.dispatchEvent(
          new WheelEvent("wheel", {
            deltaX: deltas.deltaX,
            deltaY: deltas.deltaY,
            bubbles: true,
            cancelable: true,
          }),
        ),
      { deltaX, deltaY },
    );

  const firstProduct = frame.locator("#products > article.cockpit-card").first();
  const firstFlipTrigger = frame.getByRole("button", {
    name: "翻转以查看驾驶舱 Dashboard 产品进展与上线计划",
  });
  await firstFlipTrigger.press("Space");
  assert.match(
    (await firstProduct.getAttribute("class")) || "",
    /\bis-flipped\b/,
  );
  await assertAiSceneIsCurrent(
    "Space on a focused product card must flip it without leaving the AI scene",
  );
  await frame.getByRole("button", {
    name: "翻转返回驾驶舱 Dashboard 概览",
  }).press("Enter");
  assert.doesNotMatch(
    (await firstProduct.getAttribute("class")) || "",
    /\bis-flipped\b/,
  );

  await frame.locator("#toolbox-launcher").click();
  await frame.locator("#tool-modal").waitFor({ state: "visible" });
  assert.equal(await frame.locator("#tool-modal").getAttribute("hidden"), null);
  await dispatchDeckKey("PageDown");
  assert.ok(
    await aiScene.evaluate(
      (element) => Math.abs(element.getBoundingClientRect().top) < 2,
    ),
    "PageDown must stay inside the AI scene while the toolbox modal is open",
  );
  await frame.getByRole("button", { name: "关闭工具百宝箱" }).press("Escape");
  await frame.locator("#tool-modal").waitFor({ state: "hidden" });

  await dispatchWheel({ deltaX: 120, deltaY: 60 });
  await page.waitForTimeout(550);
  await assertAiSceneIsCurrent(
    "a primarily horizontal wheel gesture must stay inside the AI scene",
  );
  await dispatchWheel({ deltaX: 0, deltaY: 60 });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('[data-label="Q3 Outlook"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await aiScene.evaluate((element) => element.scrollIntoView());
  await dispatchTouch({
    startX: 100,
    startY: 180,
    endX: 260,
    endY: 120,
  });
  await page.waitForTimeout(550);
  await assertAiSceneIsCurrent(
    "a primarily horizontal touch gesture must stay inside the AI scene",
  );
  await dispatchTouch({
    startX: 100,
    startY: 260,
    endX: 112,
    endY: 150,
  });
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('[data-label="Q3 Outlook"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await aiScene.evaluate((element) => element.scrollIntoView());
  await dispatchDeckKey("PageDown");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('[data-label="Q3 Outlook"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  await aiScene.evaluate((element) => element.scrollIntoView());
  await dispatchDeckKey("PageUp");
  await page.waitForFunction(
    () =>
      Math.abs(
        document
          .querySelector('[data-label="Full Report"]')
          .getBoundingClientRect().top,
      ) < 2,
  );

  const unexpectedErrors = pageErrors.filter(
    (message) =>
      !message.includes("Vantage Supabase configuration is missing"),
  );
  assert.deepEqual(unexpectedErrors, []);
  assert.deepEqual(brokenAiResponses, []);

  await page.close();
} finally {
  await browser.close();
}

console.log("H1 AI data products runtime interaction contract passed.");
