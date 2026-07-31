import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");

const pageBlock = (pageId, nextPageId) => {
  const start = app.indexOf(`id:'${pageId}'`);
  const end = app.indexOf(`id:'${nextPageId}'`, start);
  assert.ok(start >= 0 && end > start, `${pageId} registry block must exist`);
  return app.slice(start, end);
};

const audit = pageBlock("okr-brand-experience-audit", "okr-brand-results");
const awards = pageBlock("okr-awards", "okr-offline-event-01");

for (const [label, block] of [
  ["brand-experience audit", audit],
  ["awards", awards],
]) {
  assert.doesNotMatch(
    block,
    /imageSlots|figma-lightbox|modalSrc/,
    `${label} must remain a static, non-enlargeable page`,
  );
}

assert.match(
  app,
  /id:'okr-ai-recommendation'[\s\S]*?imageSlots:\[[\s\S]*?ai-claude-broker-list/,
  "the AI recommendation page must retain its nine-image lightbox",
);

console.log("Static brand-audit and awards page contract passed.");
