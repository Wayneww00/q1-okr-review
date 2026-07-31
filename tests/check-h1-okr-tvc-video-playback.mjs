import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const theme = fs.readFileSync(
  path.join(root, "previews", "h1-figma-racing-theme.css"),
  "utf8",
);

const expectedVideos = new Map([
  ["co-brand", "ferrari-co-brand.mp4"],
  ["chapter-01", "brand-chapter-think-ahead.mp4"],
  ["chapter-02", "brand-chapter-perform-ahead.mp4"],
  ["public-good", "public-good.mp4"],
  ["usp", "usp.mp4"],
  ["special-festival", "special-festival-world-cup.mp4"],
  ["product-24-7", "product-24-7.mp4"],
  ["product-copy-trade", "product-copy-trade.mp4"],
]);

const libraryStart = app.indexOf("id:'okr-tvc-library'");
const libraryEnd = app.indexOf("id:'okr-application-roadmap'", libraryStart);
assert.ok(libraryStart >= 0 && libraryEnd > libraryStart);
const library = app.slice(libraryStart, libraryEnd);

for (const [slotId, fileName] of expectedVideos) {
  assert.match(
    library,
    new RegExp(
      `id:'${slotId}'[^\\n]*src:'previews/assets/o1-complete/tvc-library/${fileName.replaceAll(
        ".",
        "\\.",
      )}(?:\\?[^']+)?'`,
    ),
    `${slotId} must use the video supplied by the merged O1 package`,
  );

  const videoPath = path.join(
    root,
    "previews",
    "assets",
    "o1-complete",
    "tvc-library",
    fileName,
  );
  assert.ok(fs.existsSync(videoPath), `${fileName} must exist locally`);
  assert.ok(fs.statSync(videoPath).size > 100_000, `${fileName} must not be empty`);
}

const matrixStart = app.indexOf("id:'okr-tvc-matrix'");
const matrixEnd = app.indexOf("id:'okr-tvc-library'", matrixStart);
assert.doesNotMatch(
  app.slice(matrixStart, matrixEnd),
  /src:'previews\/assets\/o1-complete\/tvc-library\//,
  "the PPT does not contain HERO matrix videos, so those slots must stay unbound",
);

assert.match(
  app,
  /function OkrVideoModal\(\{preview,onClose\}\)[\s\S]*?const videoRef=useRef\(null\)/,
  "the video modal must own the active player for playback and fullscreen control",
);
assert.match(
  app,
  /className=\{`h1-okr-video-player\$\{preview\.slot\.fit==='cover' \? ' is-cover' : ''\}`\}[\s\S]*?controls[\s\S]*?autoPlay[\s\S]*?playsInline/,
  "opening a mapped video must autoplay it with native playback controls",
);
assert.doesNotMatch(
  app,
  /className=\{`h1-okr-video-player[\s\S]{0,240}\bmuted\b/,
  "the click-opened video must not be forced silent",
);
assert.match(
  app,
  /video\.requestFullscreen\|\|[\s\S]*?video\.webkitRequestFullscreen[\s\S]*?requestFullscreen\.call\(video\)/,
  "the modal must support standard and WebKit fullscreen playback",
);
assert.match(
  app,
  /className="h1-okr-video-modal-fullscreen"[\s\S]*?onClick=\{handleFullscreen\}/,
  "the video modal must expose a dedicated fullscreen button",
);
assert.match(
  theme,
  /\.h1-okr-video-modal-fullscreen\s*\{[\s\S]*?position:\s*absolute;/,
  "the fullscreen control must have an explicit presentation-safe layout",
);

console.log("H1 OKR TVC video playback and fullscreen contract passed.");
