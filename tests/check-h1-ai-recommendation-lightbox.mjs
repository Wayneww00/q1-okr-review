import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const registry = app.slice(
  app.indexOf("id:'okr-ai-recommendation'"),
  app.indexOf("id:'okr-omnichannel-amplification'"),
);

const slots = [
  ["ai-gpt-best-broker", "gpt-best-broker.png", 184, 279, 472, 184],
  ["ai-gpt-weekend-trading", "gpt-weekend-trading.png", 184, 559, 472, 154],
  ["ai-gpt-broker-list", "gpt-broker-list.png", 184, 809, 472, 189],
  ["ai-gemini-best-broker", "gemini-best-broker.png", 728, 279, 472, 160],
  ["ai-gemini-weekend-trading", "gemini-weekend-trading.png", 728, 546, 472, 173],
  ["ai-gemini-broker-list", "gemini-broker-list.png", 728, 826, 472, 171],
  ["ai-claude-best-broker", "claude-best-broker.png", 1272, 279, 472, 181],
  ["ai-claude-weekend-trading", "claude-weekend-trading.png", 1272, 561, 472, 157],
  ["ai-claude-broker-list", "claude-broker-list.png", 1272, 819, 472, 169],
];

for (const [id, fileName, left, top, width, height] of slots) {
  assert.ok(registry.includes(`id:'${id}'`), `${id} must be registered`);
  assert.ok(
    registry.includes(
      `figma-lightbox/ai-recommendation/${fileName}',unit:'px',left:${left},top:${top},width:${width},height:${height}`,
    ),
    `${id} must preserve its Figma image bounds`,
  );
  const source = path.join(
    root,
    "previews",
    "assets",
    "figma-lightbox",
    "ai-recommendation",
    fileName,
  );
  assert.ok(
    fs.existsSync(source) && fs.statSync(source).size > 100_000,
    `${fileName} must retain the high-resolution Figma source`,
  );
}

assert.match(
  app,
  /page\.id==='okr-ai-recommendation'[\s\S]*?OkrPositionedFigmaForegroundPage[\s\S]*?onPreview=\{setPreview\}/,
  "the AI recommendation page must connect all nine hotspots to the shared image lightbox",
);
assert.match(
  app,
  /function OkrImageHotspots[\s\S]*?aria-label=\{`放大查看：\$\{slot\.label\}`\}[\s\S]*?onClick=\{\(\)=>onPreview\?\./,
  "AI answer screenshots must reuse the existing accessible image-hotspot interaction",
);
assert.match(
  app,
  /function OkrExactModal[\s\S]*?event\.key==='Escape'[\s\S]*?className="h1-okr-image-modal"[\s\S]*?onClick=\{onClose\}[\s\S]*?h1-okr-image-modal-close/,
  "the shared lightbox must retain Escape, backdrop, and close-button dismissal",
);

console.log("H1 AI recommendation nine-image lightbox contract passed.");
