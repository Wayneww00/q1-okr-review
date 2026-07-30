import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const shell = fs.readFileSync(
  path.join(root, "previews", "vantage-h1-immersive.html"),
  "utf8",
);
const p26ForegroundPath = path.join(
  root,
  "previews",
  "assets",
  "figma-untitled",
  "p26-foreground-clean.png",
);

const p25Index = app.indexOf("id:'okr-review'");
const auditIndex = app.indexOf("id:'okr-brand-experience-audit'");
const p27Index = app.indexOf("id:'okr-brand-results'");
assert.ok(p25Index >= 0, "p25 must remain registered");
assert.ok(auditIndex > p25Index, "the brand-experience audit must follow p25");
assert.ok(p27Index > auditIndex, "p27 must follow the brand-experience audit");
assert.ok(fs.existsSync(p26ForegroundPath), "the direct Untitled p26 foreground export must exist");
assert.ok(fs.statSync(p26ForegroundPath).size > 200_000, "p26 must retain full presentation detail");
assert.match(
  app.slice(app.indexOf("function OkrReportDeck()"), app.indexOf("// ═══ App ═══")),
  /page\.id==='okr-brand-results'[\s\S]*?OkrDirectFigmaForegroundPage[\s\S]*?figma-untitled\/p26-foreground-clean\.png/,
  "the third OKR page must use the matte-free Untitled foreground rather than a reconstructed matrix",
);
assert.match(
  shell,
  /const reportPages = \[\.\.\.doc\.querySelectorAll\('\[data-report-page\]'\)\];/,
  "p27 must inherit the existing dynamic PPT page registry",
);
assert.ok(
  shell.includes(
    'src="../index.html?report=h1&embedded=1&v=20260730-black-label-v28"',
  ),
  "the formal shell must invalidate the embedded report after the p27 update",
);

console.log("H1 exact Figma p27 contract passed.");
