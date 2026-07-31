import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const openingPath = path.join(
  root,
  "previews/assets/vantage-h1-opening-final-4k.mp4",
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "config/video-manifest.json"), "utf8"),
);
const releaseTag = "vantage-h1-media-2026-07-31-v2";
const openingKey = "previews/assets/vantage-h1-opening-final-4k.mp4";
const closingKey = "previews/assets/vantage-h1-closing-ending-4k.mp4";
const openingManifest = manifest[openingKey];
const closingManifest = manifest[closingKey];
const closingPath =
  process.env.VANTAGE_CLOSING_VIDEO_PATH || closingManifest?.url;

assert.ok(fs.existsSync(openingPath), "the refreshed opening film must remain local");
assert.match(
  openingManifest?.url || "",
  new RegExp(`/${releaseTag}/vantage-h1-opening-final-4k\\.mp4$`),
  "the opening manifest must point at the refreshed immutable release",
);
assert.match(
  closingManifest?.url || "",
  new RegExp(`/${releaseTag}/vantage-h1-closing-ending-4k\\.mp4$`),
  "the closing manifest must point at the refreshed immutable release",
);
assert.ok(closingPath, "the refreshed closing film must be locally testable or remotely available");

function probe(mediaPath) {
  return JSON.parse(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration,size,bit_rate:stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,bit_rate,sample_rate,channels",
        "-of",
        "json",
        mediaPath,
      ],
      { encoding: "utf8" },
    ),
  );
}

function assertCompatibleMp4(probeResult, label, durationRange) {
  const video = probeResult.streams.find(
    (stream) => stream.codec_type === "video",
  );
  const audio = probeResult.streams.find(
    (stream) => stream.codec_type === "audio",
  );

  assert.equal(video?.codec_name, "h264", `${label} must use H.264`);
  assert.equal(video?.width, 3840, `${label} must retain the supplied 4K width`);
  assert.equal(video?.height, 2160, `${label} must retain the supplied 4K height`);
  assert.equal(video?.pix_fmt, "yuv420p", `${label} must use the broadly compatible pixel format`);
  assert.equal(video?.r_frame_rate, "30/1", `${label} must use the compatibility-focused 30 fps delivery rate`);
  assert.ok(Number(video?.bit_rate) >= 4_500_000, `${label} must retain a clear 4K bitrate`);
  assert.equal(audio?.codec_name, "aac", `${label} must use AAC audio`);
  assert.equal(audio?.sample_rate, "44100", `${label} must retain the supplied 44.1 kHz audio`);
  assert.equal(audio?.channels, 2, `${label} must retain stereo audio`);
  assert.ok(
    Number(probeResult.format.duration) >= durationRange[0] &&
      Number(probeResult.format.duration) <= durationRange[1],
    `${label} must preserve the complete supplied duration`,
  );
  assert.ok(
    Number(probeResult.format.size) < 100_000_000,
    `${label} must stay below the 100 MB deployment and release threshold`,
  );
}

const openingProbe = probe(openingPath);
const closingProbe = probe(closingPath);

assertCompatibleMp4(openingProbe, "opening film", [121.7, 122.0]);
assertCompatibleMp4(closingProbe, "closing film", [21.6, 21.9]);
assert.equal(
  openingManifest.bytes,
  Number(openingProbe.format.size),
  "the opening manifest byte count must match the refreshed asset",
);
assert.equal(
  closingManifest.bytes,
  Number(closingProbe.format.size),
  "the closing manifest byte count must match the refreshed asset",
);

for (const [label, mediaPath] of [
  ["opening film", openingPath],
  ["closing film", closingPath],
]) {
  if (/^https?:\/\//.test(mediaPath)) continue;
  const bytes = fs.readFileSync(mediaPath);
  const moovOffset = bytes.indexOf(Buffer.from("moov"));
  const mdatOffset = bytes.indexOf(Buffer.from("mdat"));
  assert.ok(moovOffset > 0 && mdatOffset > 0, `${label} must contain moov and mdat atoms`);
  assert.ok(moovOffset < mdatOffset, `${label} must use faststart for reliable web playback`);
}

console.log("H1 refreshed opening and closing video contract passed.");
