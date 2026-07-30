import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-o1-complete-theme.css"),
  "utf8",
);

function constantBlock(source, declaration) {
  const start = source.indexOf(declaration);
  assert.ok(start >= 0, `${declaration} must exist`);
  const end = source.indexOf("\n];", start);
  assert.ok(end > start, `${declaration} must have a closing array`);
  return source.slice(start, end + 3);
}

function topLevelStringIds(block) {
  return [
    ...block.matchAll(/^  \{(?:\n    )?id:["']([^"']+)["']/gm),
  ].map((match) => match[1]);
}

function topLevelNumericIds(block) {
  return [...block.matchAll(/^  \{\s*id:(\d+),/gm)].map((match) =>
    Number(match[1]),
  );
}

const expectedO1Ids = [
  "okr-review",
  "okr-brand-experience-audit",
  "okr-brand-results",
  "okr-brand-refresh",
  "okr-brand-operating-system",
  "okr-tvc-matrix",
  "okr-tvc-framework",
  "okr-tvc-library",
  "okr-application-roadmap",
  "okr-high-value-actions",
  "okr-awards",
  "okr-offline-event-01",
  "okr-offline-event-02",
  "okr-elite-client-identity",
  "okr-client-experience-model",
  "okr-client-experience-cases",
  "okr-elite-client-no1-experience",
  "okr-elite-endorsement-resources",
  "okr-elite-ferrari-experience",
  "okr-elite-black-label",
  "okr-elite-business-enablement",
  "okr-merchandise",
  "okr-cfd-public-good-story",
  "okr-cfd-public-good",
  "okr-public-good-video",
  "okr-un-ngo-engagement",
  "okr-ai-recommendation",
  "okr-omnichannel-amplification",
  "okr-tvc-localization",
  "okr-superapp-activation",
  "okr-premium-unlimited",
];

const o1Block = constantBlock(app, "const OKR_FIGMA_PAGES=[");
assert.deepEqual(
  topLevelStringIds(o1Block),
  expectedO1Ids,
  "O1 must use the downloaded package's exact 31-page order",
);
assert.doesNotMatch(
  app.slice(
    app.indexOf("function OkrReportDeck()"),
    app.indexOf("// ═══ O2 growth review"),
  ),
  /<O1ChapterPage\b/,
  "the package's 31 pages already include page 01; no extra O1 chapter may render",
);
assert.match(
  app,
  /const reportPageCount=OKR_FIGMA_PAGES\.length;/,
  "the package page count must remain 31",
);

assert.deepEqual(
  topLevelNumericIds(constantBlock(app, "const H1_DASHBOARDS = [")),
  Array.from({ length: 22 }, (_, index) => index + 1),
  "the 22 Data pages must remain untouched",
);
assert.equal(
  topLevelStringIds(constantBlock(app, "const O2_REPORT_PAGES=[")).length,
  25,
  "the 25 O2 pages must remain untouched",
);
assert.equal(
  topLevelStringIds(constantBlock(app, "const O3_REPORT_PAGES=[")).length,
  17,
  "the 17 O3 pages must remain untouched",
);

for (const helper of [
  "function OkrInlineVideo(",
  "function OkrExternalLinks(",
  "function OkrImageHotspots(",
]) {
  assert.ok(app.includes(helper), `${helper} must be restored from the package`);
}
for (const selector of [
  ".h1-okr-image-hotspot",
  ".h1-okr-external-link",
  ".h1-okr-inline-video",
  ".h1-okr-image-modal",
]) {
  assert.ok(theme.includes(selector), `${selector} must remain O1-scoped`);
}

assert.match(
  o1Block,
  /href:'https:\/\/vantage-objects-452443727878\.asia-southeast1\.run\.app\/'/,
  "the package's merchandise link must remain exact",
);
assert.match(
  app,
  /target="_blank"[\s\S]*?rel="noopener noreferrer"/,
  "external O1 links must open safely in a new tab",
);
assert.equal(
  (o1Block.match(/previews\/assets\/o1-complete\/tvc-library\/[^"'?]+\.mp4/g) ||
    []).length,
  15,
  "all 15 package video references must use the isolated O1 video root",
);
assert.ok(
  (o1Block.match(/\bimageSlots:\[/g) || []).length >= 7,
  "all package image-hotspot groups must be retained",
);
assert.match(
  o1Block,
  /id:'cfd-public-good-story'[\s\S]*?inline:true/,
  "the new CFD public-good story page and inline video must remain",
);
assert.match(
  o1Block,
  /id:'tvc-brand-main'[\s\S]*?id:'tvc-global'[\s\S]*?id:'tvc-vietnam'[\s\S]*?id:'tvc-thailand'/,
  "the four localized inline TVCs must remain",
);
assert.doesNotMatch(
  o1Block,
  /previews\/assets\/(?!o1-complete\/)/,
  "O1 must not depend on shared O2/O3 asset roots",
);

const expectedVideoHashes = {
  "brand-chapter-perform-ahead.mp4":
    "c33e59b7a3ccbed34de3f54d15d5febf70ab47b85ce743bbd03418522c107457",
  "brand-chapter-think-ahead.mp4":
    "3a03bf72c70a270caabc2fae2064a6b3b800938b2e34a569806c0755418659f6",
  "cfd-h1-summary.mp4":
    "0cb6d53eea584f8cfec13ccd6f67ff5dbf309db4d523edd261c74f6cd08c0603",
  "cfd-public-good.mp4":
    "192457bec637086b623becfadf8208ac2b46239abad9f9f2fa1751871af03cfa",
  "ferrari-co-brand.mp4":
    "6b4d91ce5c179c8a5a25f724decfc7da26757efcc667a663903cd1a453da7d31",
  "ferrari-personal-moment.mp4":
    "6f1ae7a783f49231891b53a079505845f41f4c5c436ce90377e63456e120abcc",
  "product-24-7.mp4":
    "97e5709a311c5b93804c1f19df4b306fa8419d4264523e8b6cd91e0eb0a4d481",
  "product-copy-trade.mp4":
    "8a3a57225591a08a6d0bd27fc1d3a3ccf91519ded32e5d4d5c85c5a9aa798bb0",
  "public-good.mp4":
    "f113c7ad35805f5409b078e077d287e95a1dd5c601d2b2a37c852931202d6927",
  "special-festival-world-cup.mp4":
    "b859f600e427612a5feb82857276af415bf6c62b42ea6e059f1cbfb0b091b065",
  "tvc-brand-main.mp4":
    "5144726ec6dc1eabf7e5616700f9a263cf34e759acbdb74ff02296507b639764",
  "tvc-global.mp4":
    "87786007bcaa7ba5e66d893ac14e43c976f05772fe53879febb37ac1d75641ec",
  "tvc-thailand.mp4":
    "4911589a684e8386e69d422e96d9eb6c74a715aa2bb9efe68867bad24b4dfd85",
  "tvc-vietnam.mp4":
    "6183ea62edebdb053b62f505867fa8c51400e1b9a6bbf22f5a511697b82de6c7",
  "usp.mp4":
    "a77dad3bd6d35a92d8ee9a55f9c7c077acba056a114b7d6fa50c27d6c81ea308",
};

for (const [fileName, expectedHash] of Object.entries(expectedVideoHashes)) {
  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "o1-complete",
    "tvc-library",
    fileName,
  );
  assert.ok(fs.existsSync(assetPath), `${fileName} must be imported`);
  const actualHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(assetPath))
    .digest("hex");
  assert.equal(actualHash, expectedHash, `${fileName} must match the package`);
}

for (const [relativePath, expectedHash] of [
  [
    "figma-untitled/p59-foreground-safe.png",
    "410f199fe51d79babc478e57a0ad739beac4855b098a0a3ae8a5b99e6ef774c6",
  ],
  [
    "figma-untitled/p73-cfd-public-good-video-foreground.png",
    "70149bc7f5332bb258ade8a9a8d334b6897ea81f3fde730baf17dfb71952d9ee",
  ],
]) {
  const assetPath = path.join(
    root,
    "previews",
    "assets",
    "o1-complete",
    relativePath,
  );
  assert.ok(fs.existsSync(assetPath), `${relativePath} must be imported`);
  const actualHash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(assetPath))
    .digest("hex");
  assert.equal(actualHash, expectedHash, `${relativePath} must match the package`);
}

console.log("H1 O1 New 31-page isolated full-merge contract passed.");
