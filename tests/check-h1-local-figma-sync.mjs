import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const formalFile = "previews/vantage-h1-immersive.html";
const themeFile = "previews/h1-figma-racing-theme.css";
const reportFile = "index.html";

const [formal, theme, report] = await Promise.all(
  [formalFile, themeFile, reportFile].map(file => readFile(resolve(file), "utf8")),
);

assert.ok(
  formal.includes('src="../index.html?report=h1&embedded=1&v=20260729-figma-source-okr-v2"'),
  "the formal H1 report should explicitly request the login-free embedded report mode",
);
assert.ok(
  report.includes("const EMBEDDED_REPORT_MODE = new URLSearchParams(window.location.search).get('embedded') === '1';"),
  "the source report should recognize the explicit embedded mode",
);
assert.ok(
  report.includes("useState(()=>EMBEDDED_REPORT_MODE || sessionStorage.getItem('vantage-auth')==='ok')"),
  "embedded reports should bypass login while standalone reports retain session authentication",
);
assert.ok(
  formal.includes("h1-figma-racing-theme.css") && formal.includes("h1-figma-racing-report"),
  "the local formal report should apply the approved Figma racing visual language",
);
assert.ok(
  report.includes("function H1FigmaDataPage") && report.includes("<H1FigmaDataPage"),
  "the ten H1 pages should use the shared Figma data-page implementation",
);
assert.ok(
  report.includes("h1-figma-fixed-stage") && theme.includes("source-04.png"),
  "the H1 data sequence should use one fixed Figma racing-stage asset",
);
assert.match(
  theme,
  /\.h1-figma-racing-report \.dash-page\s*\{[\s\S]*?height:\s*100vh/,
  "each data page should occupy one embedded report viewport",
);
assert.ok(
  theme.includes("scroll-snap-align: start") && theme.includes("scroll-snap-stop: always"),
  "the data sequence should retain vertical presentation-style paging",
);
assert.ok(
  report.includes("const OKR_FIGMA_PAGES=") &&
    report.includes("previews/assets/figma-exact/p25-source.png"),
  "the authenticated exact Figma OKR deck must replace the old long-form OKR report",
);
assert.ok(
  formal.includes("Q3 Outlook"),
  "the existing outlook section must remain in the local formal report",
);
for (const preservedContent of ["Opening Film", "H1 Review", "Full Report", "Closing Film"]) {
  assert.ok(
    formal.includes(preservedContent),
    `the formal report must preserve its existing ${preservedContent} content`,
  );
}
for (const preservedContent of [
  "<HeroSection",
  "<TopNav",
  "section-image.jpg",
  "<OkrExactFigmaPage",
  "thankyou-image.jpg",
  "<FooterVideo />",
]) {
  assert.ok(
    report.includes(preservedContent),
    `the embedded report must preserve its existing ${preservedContent} content`,
  );
}

console.log("Local H1 Figma data sync contract passed.");
