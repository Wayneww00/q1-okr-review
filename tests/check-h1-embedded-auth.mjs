import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const [formal, report] = await Promise.all([
  readFile(resolve("previews/vantage-h1-immersive.html"), "utf8"),
  readFile(resolve("index.html"), "utf8"),
]);

assert.ok(
  formal.includes('src="../index.html?report=h1&embedded=1&v=20260731-nd-retail-v1"'),
  "the formal H1 page must explicitly identify its report iframe as embedded",
);

assert.ok(
  report.includes(
    "const EMBEDDED_REPORT_MODE = new URLSearchParams(window.location.search).get('embedded') === '1';",
  ),
  "the report must recognize the explicit embedded mode",
);

assert.ok(
  formal.includes("window.VantageBrowserRuntime.signIn({username,password})"),
  "the formal shell must authenticate with the shared Supabase runtime",
);

assert.ok(
  !formal.includes("sessionStorage.setItem('vantage-auth','ok')"),
  "the formal shell must not grant access through session storage",
);

assert.ok(
  report.includes("window.VantageBrowserRuntime.getSession()"),
  "embedded and standalone reports must both restore a real Supabase session",
);

assert.ok(
  report.includes("if(!authed) return <LoginOverlay"),
  "reports without a Supabase session must retain login protection",
);

console.log("H1 embedded Supabase authentication contract passed.");
