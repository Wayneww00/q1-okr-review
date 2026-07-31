import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const formal = readFileSync(
  resolve(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);
const localClosingAsset = resolve(
  root,
  process.env.VANTAGE_CLOSING_VIDEO_PATH
    ?? "previews/assets/vantage-h1-closing-ending-4k.mp4",
);
const manifest = JSON.parse(
  readFileSync(resolve(root, "config/video-manifest.json"), "utf8"),
);
const manifestClosing = manifest["previews/assets/vantage-h1-closing-ending-4k.mp4"];
const closingAsset = existsSync(localClosingAsset)
  ? localClosingAsset
  : manifestClosing?.url;

assert.ok(closingAsset, "the closing film must exist locally or in the media manifest");

const closingScene = formal.match(
  /<section\b[^>]*class="[^"]*\bclosing\b[^"]*"[\s\S]*?<\/section>/,
)?.[0];
assert.ok(closingScene, "the formal deck must retain a closing-film scene");
assert.match(
  closingScene,
  /<video\b(?=[^>]*class="video-bg")(?=[^>]*playsinline)(?=[^>]*preload="none")(?=[^>]*data-src="previews\/assets\/vantage-h1-closing-ending-4k\.mp4\?v=20260801-ending-0731-v1")[^>]*>[\s\S]*?<source\b(?=[^>]*type="video\/mp4")[^>]*>/,
  "the closing scene must defer the supplied compatible film until activation",
);
assert.doesNotMatch(
  closingScene,
  /<video\b[^>]*\bloop\b/,
  "the closing film must stop on its final frame instead of looping",
);
assert.doesNotMatch(
  closingScene,
  /closing-copy|Stay\s*<span>Ahead\.|Vantage\s*·\s*2026|Review the facts/i,
  "the closing scene must remain on the film's final frame without adding a text reveal",
);
assert.doesNotMatch(
  formal,
  /\.closing\.end-reveal::after|\.closing\.end-reveal\s+\.closing-copy/,
  "the ended state must not dim the final frame for a removed copy overlay",
);

assert.match(
  formal,
  /if \(video === closingVideo && video\.ended\) \{[\s\S]*?video\.currentTime = 0/,
  "returning to an already-finished closing scene must restart it",
);
assert.match(
  formal,
  /closingVideo\.addEventListener\('ended', \(\) => closingScene\.classList\.add\('end-reveal'\)\)/,
  "the page must retain the final-frame ended state",
);

const probe = JSON.parse(
  execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration:stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate",
      "-of",
      "json",
      closingAsset,
    ],
    { encoding: "utf8" },
  ),
);
const video = probe.streams.find((stream) => stream.codec_type === "video");
const audio = probe.streams.find((stream) => stream.codec_type === "audio");

assert.equal(video?.codec_name, "h264", "the closing film must use browser-compatible H.264");
assert.equal(video?.width, 3840, "the supplied 4K width must be preserved");
assert.equal(video?.height, 2160, "the supplied 4K height must be preserved");
assert.equal(video?.pix_fmt, "yuv420p", "the closing film must use a compatible pixel format");
assert.equal(video?.r_frame_rate, "30/1", "the supplied 30 fps motion must be preserved");
assert.equal(audio?.codec_name, "aac", "the supplied closing soundtrack must remain AAC");
assert.ok(Number(probe.format.duration) >= 21.6, "the complete supplied closing film must be retained");

const closingBytes = existsSync(localClosingAsset)
  ? readFileSync(localClosingAsset)
  : execFileSync(
      "curl",
      ["-L", "--fail", "--silent", "--show-error", "--range", "0-1048575", closingAsset],
      { maxBuffer: 2 * 1024 * 1024 },
    );
const moovOffset = closingBytes.indexOf(Buffer.from("moov"));
const mdatOffset = closingBytes.indexOf(Buffer.from("mdat"));
assert.ok(moovOffset > 0 && mdatOffset > 0, "the closing MP4 must contain moov and mdat atoms");
assert.ok(moovOffset < mdatOffset, "the closing MP4 must use faststart for reliable web playback");

console.log("H1 closing-video contract passed.");
