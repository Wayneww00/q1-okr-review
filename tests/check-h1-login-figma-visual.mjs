import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const loginPage = await readFile(
  resolve("previews/vantage-h1-immersive.html"),
  "utf8",
);

assert.match(
  loginPage,
  /\.login-gate\s*\{[\s\S]*?background-image:\s*url\(["']?assets\/vantage-h1-login-figma\.png\?v=20260731-dark-fields-v1["']?\)/,
  "the login gate must use the cache-busted 1920×1080 dark-field frame copied from Figma",
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
  /class="login-field"[\s\S]*?class="login-field-label">Account <em>\*<\/em>[\s\S]*?id="loginUsername"[\s\S]*?value=""[\s\S]*?class="login-field-label">Password <em>\*<\/em>[\s\S]*?id="loginPassword"[\s\S]*?value=""/,
  "the Figma-style inset labels must wrap blank credential inputs",
);

assert.match(
  loginPage,
  /\.login-field\s*\{[\s\S]*?border:\s*1px solid rgba\(227,87,40,\.18\);[\s\S]*?border-radius:\s*9px;[\s\S]*?background:\s*linear-gradient\(100deg,\s*#1c0e09 0%,\s*#15100c 56%,\s*#0b0b0a 100%\);/,
  "the credential fields must use the dark orange-tinted surface from the updated Figma frame",
);

assert.match(
  loginPage,
  /\.login-input\s*\{[\s\S]*?background:\s*transparent;[\s\S]*?color:\s*rgba\(255,255,255,\.88\);/,
  "the live credential text must remain legible on the updated dark fields",
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

const loginFrame = await readFile(
  resolve("previews/assets/vantage-h1-login-figma.png"),
);
assert.equal(
  createHash("sha256").update(loginFrame).digest("hex"),
  "b5257195d951a8b9ac43f780fc37fdd69e9468fd5e3aa6310c4eb2388e0c87e6",
  "the committed login frame must be the latest exact Figma export",
);

console.log("H1 Figma login visual contract passed.");
