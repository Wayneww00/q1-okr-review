import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const loginPage = await readFile(
  resolve("previews/vantage-h1-immersive.html"),
  "utf8",
);

assert.match(
  loginPage,
  /\.login-gate\s*\{[\s\S]*?background-image:\s*url\(["']?assets\/vantage-h1-login-figma\.png["']?\)/,
  "the login gate must use the complete 1920×1080 frame copied from Figma",
);

assert.match(
  loginPage,
  /\.login-card\s*\{[\s\S]*?left:\s*calc\([\s\S]*?1060px\s*\*\s*var\(--login-scale\)[\s\S]*?top:\s*50%;[\s\S]*?width:\s*530px;[\s\S]*?height:\s*680px;[\s\S]*?transform:\s*translateY\(-50%\)\s*scale\(var\(--login-scale\)\)/,
  "the desktop login card must preserve and responsively scale the Figma frame position and 530×680 source dimensions",
);

assert.match(
  loginPage,
  /class="login-logo"[\s\S]*?src="\.\.\/vantage-logo\.svg"[\s\S]*?id="loginTitle">H1 2026 Review<[\s\S]*?Authorized Access Only/,
  "the login header must use the real Vantage logo and Figma title treatment",
);

assert.match(
  loginPage,
  /class="login-field"[\s\S]*?class="login-field-label">Account <em>\*<\/em>[\s\S]*?id="loginUsername"[\s\S]*?value="vantage"[\s\S]*?class="login-field-label">Password <em>\*<\/em>[\s\S]*?id="loginPassword"[\s\S]*?value="vantage"/,
  "the Figma-style inset labels must wrap the existing credential inputs without changing their defaults",
);

assert.match(
  loginPage,
  /\.login-field\s*\{[\s\S]*?border-radius:\s*9px;[\s\S]*?background:\s*#f5f5f5;/,
  "the credential fields must retain the light Figma surface",
);

assert.match(
  loginPage,
  /\.login-submit\s*\{[\s\S]*?border-radius:\s*999px;[\s\S]*?background:\s*#e35728;/,
  "the sign-in action must use the Figma orange pill treatment",
);

await assert.doesNotReject(
  access(resolve("previews/assets/vantage-h1-login-figma.png")),
  "the complete Figma login frame must be committed with the page",
);

console.log("H1 Figma login visual contract passed.");
