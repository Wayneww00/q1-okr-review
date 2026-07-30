import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O2_TEST_URL || "http://127.0.0.1:4180";
const theme = readFileSync(
  new URL("../previews/h1-figma-racing-theme.css", import.meta.url),
  "utf8",
);
const assertOpaqueFallback = (css) => {
  const fallback = css.match(
    /@media\s*\(prefers-reduced-transparency:\s*reduce\)\s*\{\s*\.h1-o2-seo-overview-growth\s*\{([^}]*)\}\s*\}/,
  );
  assert.ok(
    fallback,
    "glass styling must provide a scoped reduced-transparency fallback",
  );
  assert.match(
    fallback[1],
    /background:\s*#[0-9a-f]{6}\s*;/i,
    "reduced-transparency mode must use an opaque solid background",
  );
  assert.match(
    fallback[1],
    /-webkit-backdrop-filter:\s*none\s*;/,
    "reduced-transparency mode must disable the WebKit blur",
  );
  assert.match(
    fallback[1],
    /(?:^|\n)\s*backdrop-filter:\s*none\s*;/,
    "reduced-transparency mode must disable the standard blur",
  );
};
assertOpaqueFallback(theme);
assert.throws(
  () =>
    assertOpaqueFallback(
      theme.replace("background: #251009;", "background: rgba(37,16,9,.8);"),
    ),
  /opaque solid background/,
  "the fallback contract must reject a still-transparent replacement",
);
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o2-overview-glass`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();
  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();

  const panel = reportFrame.locator(
    '[data-page-id="o2-seo-overview"] .h1-o2-seo-overview-growth',
  );
  const state = await panel.evaluate((node) => {
    const style = getComputedStyle(node);
    const bounds = node.getBoundingClientRect();
    const contentNodes = [
      ...node.querySelectorAll("article, span, strong, h3, p, b, small"),
    ].map((child) => {
      const childBounds = child.getBoundingClientRect();
      return {
        label: `${child.tagName.toLowerCase()}.${child.className || ""}`,
        left: childBounds.left,
        right: childBounds.right,
        top: childBounds.top,
        bottom: childBounds.bottom,
      };
    });
    return {
      backdropFilter:
        style.backdropFilter || style.webkitBackdropFilter || "",
      backgroundImage: style.backgroundImage,
      borderRadius: Number.parseFloat(style.borderRadius),
      borderWidth: Number.parseFloat(style.borderTopWidth),
      boxShadow: style.boxShadow,
      overflow: style.overflow,
      marginBottom: Number.parseFloat(style.marginBottom),
      paddingTop: Number.parseFloat(style.paddingTop),
      paddingLeft: Number.parseFloat(style.paddingLeft),
      paddingRight: Number.parseFloat(style.paddingRight),
      offsetHeight: node.offsetHeight,
      parentHeight: node.parentElement.clientHeight,
      bounds: {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        bottom: bounds.bottom,
      },
      contentNodes,
    };
  });

  assert.match(
    state.backdropFilter,
    /blur\((?:1[6-9]|[2-9]\d)px\)/,
    "the right KPI panel must blur the desert image behind it",
  );
  assert.notEqual(
    state.backgroundImage,
    "none",
    "the glass panel must use a tinted translucent gradient",
  );
  assert.ok(
    state.borderRadius >= 24,
    "the glass panel must match the rounded O2 card system",
  );
  assert.equal(state.borderWidth, 1, "the glass panel needs a hairline edge");
  assert.match(
    state.boxShadow,
    /inset/,
    "the glass panel needs an inset highlight for edge refraction",
  );
  assert.equal(state.overflow, "hidden");
  assert.equal(
    state.marginBottom,
    0,
    "legacy report spacing must not add a blank area below the glass panel",
  );
  assert.equal(
    state.paddingTop,
    40,
    "legacy report spacing must not overwrite the glass panel padding",
  );
  assert.equal(
    state.offsetHeight,
    state.parentHeight,
    "the glass panel must fill the complete right column",
  );
  assert.ok(
    state.paddingLeft >= 32 && state.paddingRight >= 32,
    "the KPI copy needs breathing room inside the glass surface",
  );
  for (const child of state.contentNodes) {
    assert.ok(
      child.left >= state.bounds.left - 1 &&
        child.right <= state.bounds.right + 1 &&
        child.top >= state.bounds.top - 1 &&
        child.bottom <= state.bounds.bottom + 1,
      "glass-panel content must remain inside the presentation canvas",
    );
  }

  console.log("H1 O2 overview glass-panel runtime contract passed.");
} finally {
  await browser.close();
}
