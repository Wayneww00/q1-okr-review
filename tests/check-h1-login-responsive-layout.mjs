import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const loginPage = await readFile(
  resolve("previews/vantage-h1-immersive.html"),
  "utf8",
);

assert.match(
  loginPage,
  /--login-scale:\s*max\(\s*calc\(100vw\s*\/\s*1920px\),\s*calc\(100svh\s*\/\s*1080px\)\s*\)/,
  "the desktop login overlay must scale with the cover-sized Figma frame",
);

assert.match(
  loginPage,
  /\.login-card\s*\{[\s\S]*?left:\s*calc\([\s\S]*?1060px\s*\*\s*var\(--login-scale\)[\s\S]*?transform:\s*translateY\(-50%\)\s*scale\(var\(--login-scale\)\);[\s\S]*?transform-origin:\s*left center;/,
  "the live desktop form must stay registered to the Figma card at non-1920 desktop sizes",
);

assert.match(
  loginPage,
  /@media\s*\(max-width:\s*1279px\),\s*\(max-aspect-ratio:\s*7\s*\/\s*6\)/,
  "narrow desktop panels must switch to the contained responsive login card",
);

for (const selector of [
  ".login-card > .login-brand",
  ".login-card > .login-error",
  ".login-card > .login-fields",
  ".login-card > .login-submit",
  ".login-card > .login-preload",
]) {
  assert.match(
    loginPage,
    new RegExp(
      selector
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\ /g, "\\s*") +
        String.raw`\s*\{[\s\S]*?position:\s*static;[\s\S]*?(?:inset:\s*auto;|top:\s*auto;[\s\S]*?left:\s*auto;)`,
    ),
    `${selector} must explicitly clear its desktop positioning in the responsive layout`,
  );
}

console.log("H1 responsive login layout contract passed.");
