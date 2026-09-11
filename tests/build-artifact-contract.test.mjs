import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [vercelConfig, buildScript, authFunction, runtime, report, immersive] =
  await Promise.all([
    readFile("vercel.json", "utf8").then(JSON.parse),
    readFile("scripts/build-production.mjs", "utf8"),
    readFile("api/auth.js", "utf8"),
    readFile("src/vantage-browser-runtime.mjs", "utf8"),
    readFile("index.html", "utf8"),
    readFile("previews/vantage-h1-immersive.html", "utf8"),
  ]);

assert.equal(
  vercelConfig.outputDirectory,
  "dist",
  "Vercel must deploy a dedicated build artifact rather than the 3.8GB workspace",
);
assert.equal(
  vercelConfig.functions?.["api/auth.js"]?.maxDuration,
  5,
  "Vercel must package the same-origin authentication function",
);
assert.ok(
  buildScript.includes('process.env.VANTAGE_AUTH_MODE || "server-session"'),
  "production builds must use server-side sessions when no auth mode is specified",
);
assert.ok(
  !buildScript.includes("loginPassword"),
  "the build must not place a password field in browser runtime configuration",
);
assert.match(
  buildScript,
  /authMode === "supabase"[\s\S]*?\? \{ authMode, \.\.\.supabaseConfig \}[\s\S]*?: \{ authMode \}/,
  "server-session builds must omit unused Supabase settings from browser configuration",
);
assert.ok(
  authFunction.includes("process.env.VANTAGE_LOGIN_PASSWORD") &&
    authFunction.includes("HttpOnly") &&
    authFunction.includes("timingSafeEqual"),
  "the server function must validate environment credentials and issue a hardened cookie",
);
assert.ok(
  runtime.includes('endpoint = "/api/auth"'),
  "the browser runtime must authenticate through the same-origin function",
);
assert.match(
  immersive,
  /id="loginUsername"[^>]+value=""[\s\S]*?id="loginPassword"[^>]+value=""/,
  "the production shell must ship with blank credential fields",
);
assert.match(
  report,
  /const \[user,setUser\]=useState\(''\);[\s\S]*?const \[pass,setPass\]=useState\(''\);/,
  "the fallback report login must also ship with blank credential fields",
);

const productionRoutes = vercelConfig.routes || [];
const rootShellRewriteIndex = productionRoutes.findIndex(
  (route) =>
    route.src === "^/$" &&
    route.dest === "/previews/vantage-h1-immersive.html",
);
const rootShellRedirectIndex = productionRoutes.findIndex(
  (route) =>
    route.src === "^/$" &&
    route.status === 307 &&
    route.headers?.Location === "/previews/vantage-h1-immersive.html",
);
const filesystemRouteIndex = productionRoutes.findIndex(
  (route) => route.handle === "filesystem",
);

assert.ok(
  rootShellRedirectIndex >= 0,
  "the production root must redirect to the immersive shell so relative media paths keep the /previews/ base URL",
);
assert.ok(
  filesystemRouteIndex < 0 || rootShellRedirectIndex < filesystemRouteIndex,
  "the root redirect must run before the filesystem serves index.html",
);
assert.equal(
  rootShellRewriteIndex,
  -1,
  "the production root must not rewrite the shell at / because that resolves preview-relative videos and iframes from the wrong directory",
);

assert.ok(
  buildScript.includes('extension === ".mp4"'),
  "the production artifact must exclude every local MP4",
);
assert.ok(
  buildScript.includes('"previews/assets"'),
  "the production artifact must still include report images and posters",
);
assert.ok(
  buildScript.includes('"previews/h1-mib-attribution-preview.css"'),
  "the production artifact must include the MIB source-preview stylesheet",
);
assert.match(
  buildScript,
  /cp\(\s*resolve\(root,\s*"previews\/ai-data-products"\),\s*resolve\(distDir,\s*"previews\/ai-data-products"\)/s,
  "the production artifact must include the complete AI Data Products iframe module",
);

console.log("Vantage production artifact contract passed.");
