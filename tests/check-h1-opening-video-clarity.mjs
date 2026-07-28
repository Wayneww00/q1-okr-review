import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const formalPath = "previews/vantage-h1-immersive.html";
const videoPath = "previews/assets/vantage-h1-opening-final-4k.mp4";
const formal = fs.readFileSync(formalPath, "utf8");

assert.ok(
  fs.existsSync(videoPath),
  "the local formal deck must include the approved high-resolution opening video",
);
assert.ok(
  formal.includes('src="assets/vantage-h1-opening-final-4k.mp4"'),
  "the opening scene must load the approved high-resolution video",
);
assert.equal(
  (formal.match(/vantage-h1-opening-final-4k\.mp4/g) || []).length,
  1,
  "the high-resolution opening video should be referenced once",
);
assert.ok(
  !formal.includes('src="assets/vantage-h1-opening-july24-4k.mp4"'),
  "the superseded opening film must no longer be referenced",
);

const probe = JSON.parse(
  execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration,size,bit_rate:stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,bit_rate",
      "-of", "json",
      videoPath,
    ],
    { encoding: "utf8" },
  ),
);

const video = probe.streams.find(stream => stream.codec_type === "video");
const audio = probe.streams.find(stream => stream.codec_type === "audio");

assert.equal(video?.codec_name, "h264", "the opening video must remain broadly browser-compatible H.264");
assert.equal(video?.width, 3840, "the opening video must preserve the supplied 4K width");
assert.equal(video?.height, 2160, "the opening video must preserve the supplied 4K height");
assert.equal(video?.pix_fmt, "yuv420p", "the opening video must use a browser-compatible pixel format");
assert.equal(video?.r_frame_rate, "30/1", "the supplied 30 fps motion must be preserved");
assert.ok(Number(video?.bit_rate) >= 20_000_000, "the opening video must retain a high 4K video bitrate");
assert.equal(audio?.codec_name, "aac", "the supplied opening soundtrack must remain AAC");
assert.ok(Number(probe.format.duration) >= 87, "the complete supplied opening film must be retained");

console.log("H1 4K opening-video clarity contract passed.");
