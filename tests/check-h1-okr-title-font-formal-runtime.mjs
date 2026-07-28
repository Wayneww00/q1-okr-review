import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_OKR_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=okr-exact-figma-frame`,
    { waitUntil: "domcontentloaded" },
  );

  const frame = page.frameLocator("#reportFrame");
  const exactFrame = frame.locator(
    '[data-page-id="okr-review"] .h1-okr-exact-frame',
  );
  await exactFrame.waitFor({ state: "attached" });
  const reportTheme = frame.locator("link#h1-figma-racing-report");
  await reportTheme.waitFor({ state: "attached" });

  const image = await exactFrame.evaluate((element) => ({
    src: element.getAttribute("src"),
    alt: element.getAttribute("alt"),
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  }));

  assert.match(image.src, /previews\/assets\/figma-exact\/p25-source\.png$/);
  assert.equal(image.alt, "将 Vantage 建设成全球一线品牌");
  assert.equal(image.naturalWidth, 1920);
  assert.equal(image.naturalHeight, 1080);
  assert.equal(
    await frame.locator(".save-bar").evaluate(
      (element) => getComputedStyle(element).display,
    ),
    "none",
    "embedded presentation mode must not overlay editor controls on the Figma artwork",
  );

  console.log("H1 exact Figma OKR typography artwork contract passed.");
} finally {
  await browser.close();
}
