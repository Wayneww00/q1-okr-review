import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(
  await readFile("config/video-manifest.json", "utf8"),
);

const results = [];
for (const [path, entry] of Object.entries(manifest)) {
  try {
    const response = await fetch(entry.url, {
      headers: { Range: "bytes=0-1" },
      redirect: "follow",
    });
    results.push({
      path,
      url: entry.url,
      status: response.status,
      type: response.headers.get("content-type") || "",
      ok:
        [200, 206].includes(response.status) &&
        ["application/octet-stream", "video/mp4"].includes(
          (response.headers.get("content-type") || "").split(";")[0],
        ),
    });
    await response.body?.cancel();
  } catch (error) {
    results.push({
      path,
      url: entry.url,
      status: 0,
      type: "",
      ok: false,
      error: error.message,
    });
  }
}

assert.deepEqual(
  results.filter((result) => !result.ok),
  [],
  `every production video URL must support public byte-range delivery:\n${JSON.stringify(
    results,
    null,
    2,
  )}`,
);

console.log("All production video manifest URLs support public byte-range delivery.");
