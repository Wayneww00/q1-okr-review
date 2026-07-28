import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const demos = [
  {
    file: "previews/vantage-h1-figma-racing.html",
    style: "racing",
    required: [
      "vantage-racing-stage-bg.png",
      "2026 H1 Retail FTD",
      "135,103",
      "105,743",
      "32.6%",
      "OKR",
      "将 Vantage 建设成全球一线品牌",
    ],
  },
  {
    file: "previews/vantage-h1-figma-strategy.html",
    style: "strategy",
    required: [
      "vantage-h1-chess-stage.png",
      "2026 H1 Retail FTD",
      "135,103",
      "105,743",
      "32.6%",
      "OKR",
      "将 Vantage 建设成全球一线品牌",
    ],
  },
];

for (const demo of demos) {
  const path = resolve(demo.file);
  const html = await readFile(path, "utf8");

  assert.match(
    html,
    new RegExp(`data-style=["']${demo.style}["']`),
    `${demo.file} should identify its visual direction`,
  );

  const scenes = html.match(/<section\b[^>]*class=["'][^"']*\bscene\b[^"']*["']/g) ?? [];
  assert.equal(scenes.length, 3, `${demo.file} should contain exactly three scenes`);

  for (const text of demo.required) {
    assert.ok(html.includes(text), `${demo.file} should retain "${text}"`);
  }
}

console.log("Figma A/B demo contract passed.");
