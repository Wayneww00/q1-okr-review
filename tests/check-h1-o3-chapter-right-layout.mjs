import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const app = readFileSync(resolve(root, "index.html"), "utf8");
const chapterTheme = readFileSync(
  resolve(root, "previews/h1-objective-chapters.css"),
  "utf8",
);

assert.match(
  chapterTheme,
  /\.h1-objective-chapter\.is-o3\s*\{[^}]*left:\s*auto;[^}]*right:\s*120px;[^}]*width:\s*720px;/,
  "the O3 chapter copy must sit in the right-side negative space instead of covering the trophy",
);
const o3PathRule = chapterTheme.match(
  /\.h1-objective-chapter\.is-o3 \.h1-objective-chapter-path\s*\{([^}]*)\}/,
)?.[1];
assert.ok(
  o3PathRule,
  "the O3 milestone rail must have a dedicated layout rule",
);
assert.match(o3PathRule, /width:\s*100%/);
assert.match(o3PathRule, /box-sizing:\s*border-box/);
assert.match(o3PathRule, /min-width:\s*0/);
assert.ok(
  app.includes(
    "h1-objective-chapters.css?v=20260731-o3-chapter-right-layout-v1",
  ),
  "the O3 chapter layout stylesheet must use a fresh cache key",
);

console.log("H1 O3 right-side chapter layout contract passed.");
