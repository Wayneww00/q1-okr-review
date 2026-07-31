import assert from "node:assert/strict";
import fs from "node:fs";

const formal = fs.readFileSync("previews/vantage-h1-immersive.html", "utf8");
const report = fs.readFileSync("index.html", "utf8");
const themePath = "previews/h1-figma-racing-theme.css";
const stagePath = "previews/assets/figma-racing/source-04.png";

assert.ok(fs.existsSync(stagePath), "the exact fixed Figma racing-stage asset must exist locally");
assert.ok(formal.includes("h1-figma-racing-shell"), "the local formal deck must use the Figma racing shell");
assert.ok(formal.includes("h1-figma-racing-theme.css"), "the local formal deck must load the new theme");
assert.ok(formal.includes("h1-figma-racing-report"), "the embedded report must receive the Figma racing theme");
assert.ok(fs.existsSync(themePath), "the shared Figma racing theme must exist");

const theme = fs.readFileSync(themePath, "utf8");
assert.ok(theme.includes("assets/figma-racing/source-04.png"), "the theme must use the exact Figma fixed background");
assert.equal(theme.split("assets/figma-racing/source-04.png").length - 1, 1, "the fixed car background should be declared once");
assert.ok(theme.includes("position: fixed"), "the racing-stage background must stay fixed while data pages turn");

assert.ok(report.includes("function H1FigmaDataPage"), "the report must provide a shared Figma data-page component");
assert.ok(report.includes("h1-figma-data-page"), "all H1 data screens must use the shared Figma page class");
assert.ok(report.includes("REPORT_MODE === 'h1'"), "the Figma redesign must be scoped to the H1 report");
assert.ok(report.includes('label:"2025 H2"') && report.includes('label:"2026 H1"'), "the H1 comparison periods must remain unchanged");
assert.equal((report.match(/periodLabel:"Half"/g) || []).length, 10, "the formal H1 report must retain all ten data screens");
assert.ok(report.includes("scrollSnapAlign"), "the data pages must retain vertical one-screen page turns");

for (const preserved of ["Opening Film", "H1 Review", "Full Report", "Q3 Outlook", "Closing Film"]) {
  assert.ok(formal.includes(preserved), `the formal structure must preserve ${preserved}`);
}

assert.ok(formal.includes('src="../index.html?report=h1&embedded=1&v=20260801-vietnam-share-labels-v1"'), "the formal report must keep login-free embedded mode");

console.log("H1 Figma formal redesign contract passed.");
