import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const [formal, report] = await Promise.all([
  readFile(resolve("previews/vantage-h1-immersive.html"), "utf8"),
  readFile(resolve("index.html"), "utf8"),
]);

assert.ok(
  formal.includes('src="../index.html?report=h1&embedded=1&v=20260731-figma-145-716"'),
  "the formal H1 page must explicitly identify its report iframe as embedded",
);

assert.ok(
  report.includes(
    "const EMBEDDED_REPORT_MODE = new URLSearchParams(window.location.search).get('embedded') === '1';",
  ),
  "the report must recognize the explicit embedded mode",
);

assert.ok(
  report.includes(
    "useState(()=>EMBEDDED_REPORT_MODE || sessionStorage.getItem('vantage-auth')==='ok')",
  ),
  "embedded reports must bypass login without depending on shared session storage",
);

assert.ok(
  report.includes("if(!authed) return <LoginOverlay"),
  "standalone reports must retain their existing login protection",
);

console.log("H1 embedded authentication contract passed.");
