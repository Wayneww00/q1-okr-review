import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const css = await readFile("previews/h1-o1-complete-theme.css", "utf8");
const videoManifest = JSON.parse(
  await readFile("config/video-manifest.json", "utf8"),
);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const webVideos = [
  "cfd-h1-summary-web.mp4",
  "cfd-public-good-web.mp4",
  "ferrari-personal-moment-web.mp4",
  "tvc-brand-main-web.mp4",
  "tvc-global-web.mp4",
  "tvc-vietnam-web.mp4",
  "tvc-thailand-web.mp4",
];

for (const file of webVideos) {
  assert.match(
    html,
    new RegExp(escapeRegex(file)),
    `${file} must be wired into the O1 report`,
  );
  const path = `previews/assets/o1-complete/tvc-library/${file}`;
  let localBytes = null;
  try {
    localBytes = (await stat(path)).size;
    assert.ok(localBytes > 1_000_000, `${file} must be a real local MP4`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const remoteEntry = videoManifest[path];
  assert.match(
    remoteEntry?.url || "",
    /^https:\/\/media\.githubusercontent\.com\/media\/Wayneww00\/q1-okr-review\/7fb413aa45fc27919ac1a0e56430c210d364e43d\//,
    `${file} must retain a pinned remote source for production builds`,
  );
  assert.ok(remoteEntry.bytes > 1_000_000, `${file} manifest bytes must be real`);
  if (localBytes !== null) {
    assert.equal(
      remoteEntry.bytes,
      localBytes,
      `${file} manifest bytes must match the verified local asset`,
    );
  }
}

for (const poster of [
  "cfd-h1-summary.jpg",
  "cfd-public-good.jpg",
  "ferrari-personal-moment.jpg",
  "tvc-brand-main.jpg",
  "tvc-global.jpg",
  "tvc-vietnam.jpg",
  "tvc-thailand.jpg",
]) {
  await access(`previews/assets/o1-complete/tvc-library/posters/${poster}`);
  assert.match(
    html,
    new RegExp(`posters/${escapeRegex(poster)}`),
    `${poster} must be rendered by its matching video trigger`,
  );
}

assert.match(
  html,
  /function OkrModalVideoTrigger\(\{page,slot,onVideoPreview\}\)/,
  "the colleague modal-trigger design must be present",
);
assert.match(
  html,
  /function OkrTvcLocalizationPage\(\{page,index,count,onVideoPreview\}\)/,
  "the colleague four-video TVC page must be present",
);
assert.match(
  html,
  /function OkrTvcLocalizationPage[\s\S]*?String\(index\+1\)\.padStart\(2,'0'\)[\s\S]*?String\(count\)\.padStart\(2,'0'\)/,
  "the colleague TVC page number must follow the live O1 page count",
);
assert.match(
  html,
  /function OkrInlineVideo[\s\S]*?IntersectionObserver[\s\S]*?h1-inline-video-activate/,
  "inline players must activate from their poster and stop after leaving view",
);
assert.match(
  html,
  /function OkrInlineVideo[\s\S]*?<source[\s\S]*?resolveMediaUrl\(slot\.src\)[\s\S]*?type="video\/mp4"/,
  "inline players must retain remote-manifest resolution and a typed MP4 source",
);
assert.match(
  html,
  /function OkrVideoModal[\s\S]*?<source[\s\S]*?resolveMediaUrl\(preview\.slot\.src\)[\s\S]*?type="video\/mp4"/,
  "modal players must retain remote-manifest resolution and a typed MP4 source",
);
assert.match(
  html,
  /function OkrVideoModal[\s\S]*?removeAttribute\('src'\)[\s\S]*?video\.load\(\)/,
  "modal players must release their remote source when closed",
);
assert.match(
  html,
  /id:'okr-ai-recommendation'[\s\S]*?id:'ai-gpt-best-broker'[\s\S]*?id:'ai-claude-broker-list'/,
  "the colleague AI recommendation evidence hotspots must be present",
);

assert.match(css, /\.h1-okr-inline-video-trigger/);
assert.match(css, /\.h1-okr-inline-video-play/);
assert.match(css, /\.h1-okr-tvc-localization-page/);

console.log(
  "O1 colleague design, web-video, CDN resolution, and Safari source contracts are present.",
);
