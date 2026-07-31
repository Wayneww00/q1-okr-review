import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const migrationName = (await readdir(resolve("supabase/migrations"))).find(
  (name) => name.endsWith("_vantage_report_content.sql"),
);
assert.ok(migrationName, "the Supabase report-content migration must exist");

const [report, immersive, runtime, migration] = await Promise.all([
  readFile(resolve("index.html"), "utf8"),
  readFile(resolve("previews/vantage-h1-immersive.html"), "utf8"),
  readFile(resolve("src/vantage-browser-runtime.mjs"), "utf8"),
  readFile(resolve("supabase/migrations", migrationName), "utf8"),
]);

assert.ok(
  !immersive.includes("sessionStorage.setItem('vantage-auth','ok')"),
  "the production shell must not grant authentication through session storage",
);
assert.ok(
  !immersive.includes("username === 'vantage' && password === 'vantage'"),
  "the production shell must authenticate against Supabase rather than compare a public password",
);
assert.match(
  immersive,
  /id="loginUsername"[^>]+value="vantage"/,
  "the shared username should be filled in by default",
);
assert.match(
  immersive,
  /id="loginPassword"[^>]+value="vantage"/,
  "the shared password should be filled in by default",
);
assert.ok(
  runtime.includes("signInWithPassword"),
  "the browser runtime must use Supabase password authentication",
);
assert.ok(
  runtime.includes('["127.0.0.1", "localhost", "::1"]'),
  "missing Supabase settings may fall back only on local development hosts",
);
assert.ok(
  runtime.includes('["data", "o2", "o3"]'),
  "only the real HTML report sections may be edited",
);
assert.ok(
  runtime.includes('contenteditable", "plaintext-only"'),
  "editable report nodes must accept plain text only",
);
assert.ok(
  runtime.includes('"postgres_changes"'),
  "open viewers must receive published changes through Supabase Realtime",
);
assert.ok(
  runtime.includes('.eq("version", this.revision.version)'),
  "saves must use optimistic version matching to prevent silent overwrites",
);
assert.ok(
  report.includes("VantageBrowserRuntime"),
  "the iframe report must initialize the shared editing runtime",
);
assert.ok(
  report.includes("!EMBEDDED_REPORT_MODE&&<SaveBar"),
  "the embedded report must delegate editor controls to the immersive shell",
);
assert.match(
  immersive,
  /<div class="hud-actions">[\s\S]*?<button class="hud-button" id="editorButton"/,
  "the edit entry must live beside the sound and fullscreen controls",
);
assert.match(
  immersive,
  /id="editorButton"[^>]+aria-label="编辑正文"/,
  "the shell edit button must expose a concise accessible label",
);
assert.match(
  immersive,
  /id="editorPanel"[^>]+hidden/,
  "editor actions must remain hidden until editing starts",
);
assert.match(
  immersive,
  /\.hud-editor-panel\b/,
  "the compact editing panel must share the shell HUD styling",
);
assert.match(
  immersive,
  /type:'vantage-editor-command'/,
  "the shell must send explicit editor commands to the report iframe",
);
assert.match(
  report,
  /type:'vantage-editor-state'/,
  "the report iframe must publish editor state to the shell",
);
assert.match(
  report,
  /event\.source!==window\.parent/,
  "the report must accept editor commands only from its own parent shell",
);
assert.ok(
  !report.includes('className="gear-btn"'),
  "the editor entry must describe its action instead of hiding behind a generic gear icon",
);
assert.match(
  report,
  /className=\{`vantage-editor-dock/,
  "the report editor must use the branded editor dock",
);
assert.match(
  report,
  /aria-label="报告正文编辑"/,
  "the editor dock must expose a meaningful accessible label",
);
assert.match(
  report,
  /className="vantage-editor-entry"/,
  "read-only mode must present a direct edit-text entry",
);
assert.match(
  report,
  /\.vantage-editor-entry:focus-visible/,
  "the direct edit entry must have a visible keyboard focus state",
);
assert.match(
  report,
  /\.vantage-editor-primary:focus-visible/,
  "editor action buttons must have visible keyboard focus states",
);
assert.match(
  report,
  /@media \(prefers-reduced-motion:reduce\)[^{]*\{[^}]*\.vantage-editor-dock/s,
  "the editor dock must disable decorative transitions for reduced-motion users",
);
assert.match(
  report,
  /event\.(metaKey|ctrlKey)[\s\S]*event\.(ctrlKey|metaKey)[\s\S]*toLowerCase\(\)==='s'/,
  "editing mode must support Command/Ctrl + S publishing",
);
assert.match(
  report,
  /event\.key==='Escape'/,
  "editing mode must support Escape for cancel or exit",
);
assert.match(
  immersive,
  /const isKeyboardInteractionTarget = target => Boolean\([\s\S]*?\[contenteditable\]:not\(\[contenteditable="false"\]\)/,
  "the immersive shell must recognize plaintext-only contenteditable fields as keyboard interaction targets",
);
assert.match(
  immersive,
  /document\.addEventListener\('keydown', event => \{[\s\S]*?if \(isKeyboardInteractionTarget\(event\.target\)\) \{[\s\S]*?const isTextEntry =[\s\S]*?if \(isTextEntry \|\| !isVerticalNavigationKey\) return;[\s\S]*?scenes\[keyboardSceneIndex\] === reportScene/,
  "outer scene shortcuts must preserve text editing while allowing vertical paging from toolbar controls",
);
assert.match(
  immersive,
  /doc\.addEventListener\('keydown', event => \{\s*if \(!\['ArrowDown','PageDown',' ','ArrowUp','PageUp'\]\.includes\(event\.key\)\) return;\s*if \(isKeyboardInteractionTarget\(event\.target\)\) return;\s*event\.preventDefault\(\);/,
  "embedded report paging must not intercept Space or navigation keys from editable text",
);
assert.match(
  report,
  /role="dialog" aria-modal="true"/,
  "the unsaved-changes confirmation must use dialog semantics",
);
assert.ok(
  !report.includes(
    "useState(()=>EMBEDDED_REPORT_MODE || sessionStorage.getItem('vantage-auth')==='ok')",
  ),
  "embedded mode must not bypass real authentication",
);
assert.ok(
  immersive.includes("preloadLoginVideos"),
  "the production shell must preload the opening film and leave the remaining videos on demand",
);
assert.match(migration, /enable row level security/i);
assert.match(migration, /to authenticated/i);
assert.match(migration, /report_id = 'vantage-h1'/i);
assert.match(migration, /grant select, update/i);
assert.match(migration, /supabase_realtime/i);

console.log("H1 Supabase editor security and realtime contract passed.");
