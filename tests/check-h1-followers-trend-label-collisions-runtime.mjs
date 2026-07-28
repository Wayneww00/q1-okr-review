import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_PREVIEW_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(
    `${baseUrl}/index.html?report=h1&embedded=1&audit=followers-label-collisions`,
    { waitUntil: "domcontentloaded" },
  );
  const chart = page.locator(
    '[data-page-id="data-15"] .h1-followers-trend-surface',
  );
  await chart.scrollIntoViewIfNeeded();
  await page.evaluate(async () => document.fonts.ready);
  await chart.locator(".recharts-line-curve").first().waitFor();

  const collisions = await chart.evaluate((root) => {
    const rectOf = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        text: element.textContent?.trim() || "",
      };
    };
    const intersects = (a, b, clearance = 0) =>
      Math.min(a.right, b.right) - Math.max(a.left, b.left) > -clearance &&
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > -clearance;

    const barLabels = [
      ...root.querySelectorAll(".h1-extended-bar-label"),
    ].map(rectOf);
    const growthPills = [
      ...root.querySelectorAll(".h1-extended-growth-pill"),
    ].map(rectOf);
    const lineDots = [
      ...root.querySelectorAll(".recharts-line-dot"),
    ].map(rectOf);
    const pillVsBar = [];
    growthPills.forEach((pill, pillIndex) => {
      barLabels.forEach((bar) => {
        if (intersects(pill, bar, 1)) {
          pillVsBar.push({ pillIndex, bar: bar.text });
        }
      });
    });

    const pillVsPill = [];
    growthPills.forEach((pill, pillIndex) => {
      growthPills.slice(pillIndex + 1).forEach((other, offset) => {
        if (intersects(pill, other, 2)) {
          pillVsPill.push({ pillIndex, otherIndex: pillIndex + offset + 1 });
        }
      });
    });

    const pillVsDot = [];
    growthPills.forEach((pill, pillIndex) => {
      lineDots.forEach((dot, dotIndex) => {
        if (intersects(pill, dot, 2)) {
          pillVsDot.push({ pillIndex, dotIndex });
        }
      });
    });

    const pathVsBar = [];
    const pathVsPill = [];
    root.querySelectorAll(".recharts-line-curve").forEach((path) => {
      const matrix = path.getScreenCTM();
      const length = path.getTotalLength();
      barLabels.forEach((bar) => {
        let hit = false;
        for (let distance = 0; distance <= length; distance += 1) {
          const point = path.getPointAtLength(distance);
          const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
          if (
            screenPoint.x >= bar.left - 3 &&
            screenPoint.x <= bar.right + 3 &&
            screenPoint.y >= bar.top - 3 &&
            screenPoint.y <= bar.bottom + 3
          ) {
            hit = true;
            break;
          }
        }
        if (hit) {
          pathVsBar.push({
            bar: bar.text,
            stroke: path.getAttribute("stroke"),
          });
        }
      });
      growthPills.forEach((pill, pillIndex) => {
        let hit = false;
        for (let distance = 0; distance <= length; distance += 1) {
          const point = path.getPointAtLength(distance);
          const screenPoint = new DOMPoint(point.x, point.y).matrixTransform(matrix);
          if (
            screenPoint.x >= pill.left - 3 &&
            screenPoint.x <= pill.right + 3 &&
            screenPoint.y >= pill.top - 3 &&
            screenPoint.y <= pill.bottom + 3
          ) {
            hit = true;
            break;
          }
        }
        if (hit) {
          pathVsPill.push({
            pillIndex,
            stroke: path.getAttribute("stroke"),
          });
        }
      });
    });

    return {
      pillVsBar,
      pillVsPill,
      pillVsDot,
      pathVsBar,
      pathVsPill,
    };
  });

  assert.deepEqual(
    collisions.pillVsBar,
    [],
    `growth labels must not cover bar values: ${JSON.stringify(collisions.pillVsBar)}`,
  );
  assert.deepEqual(
    collisions.pathVsBar,
    [],
    `growth lines must not cross bar values: ${JSON.stringify(collisions.pathVsBar)}`,
  );
  assert.deepEqual(
    collisions.pillVsPill,
    [],
    `growth labels must not overlap each other: ${JSON.stringify(collisions.pillVsPill)}`,
  );
  assert.deepEqual(
    collisions.pillVsDot,
    [],
    `growth labels must not cover line nodes: ${JSON.stringify(collisions.pillVsDot)}`,
  );
  assert.deepEqual(
    collisions.pathVsPill,
    [],
    `growth lines must not cross growth labels: ${JSON.stringify(collisions.pathVsPill)}`,
  );
} finally {
  await browser.close();
}

console.log("H1 followers trend labels remain collision-free.");
