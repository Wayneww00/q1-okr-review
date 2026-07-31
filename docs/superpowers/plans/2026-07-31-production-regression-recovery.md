# Production Regression Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore every feature present in the last known-good production commit `1b36959` while retaining all SOV chronology and AI interaction fixes in current production commit `3718734`, then deploy the integrated result to `https://vantage-h1.vercel.app/`.

**Architecture:** Create an integration branch from the current AI/SOV production branch and merge `codex/pages-a`, whose two commits contain the last known-good production refresh and responsive login. Resolve conflicts by keeping the refreshed login, Safari video delivery, O2 lifecycle proof, editor/runtime updates, and improved AI wheel state machine from `pages-a`, while preserving the corrected H2→H1 chronology, WebKit card-face visibility, one-key vertical paging, and early AI navigation preparation from the current branch.

**Tech Stack:** Static HTML/CSS, browser JavaScript, React 18, Vantage browser runtime, Node.js contract tests, Playwright Chromium/WebKit, Vercel prebuilt deployments.

---

### Task 1: Add a production-baseline regression contract

**Files:**
- Create: `tests/check-h1-production-regression-recovery.mjs`
- Read: `previews/vantage-h1-immersive.html`
- Read: `previews/ai-data-products/index.html`
- Read: `index.html`
- Read: `src/vantage-browser-runtime.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const immersive = readFileSync(
  resolve(root, "previews/vantage-h1-immersive.html"),
  "utf8",
);
const report = readFileSync(resolve(root, "index.html"), "utf8");
const runtime = readFileSync(
  resolve(root, "src/vantage-browser-runtime.mjs"),
  "utf8",
);
const aiModule = readFileSync(
  resolve(root, "previews/ai-data-products/index.html"),
  "utf8",
);

assert.ok(
  existsSync(resolve(root, "previews/assets/vantage-h1-login-figma.png")),
  "the refreshed desktop login artwork must be present",
);
assert.ok(
  existsSync(resolve(root, "previews/assets/vantage-h1-login-background.png")),
  "the responsive login background must be present",
);
assert.match(immersive, /--login-scale:/);
assert.match(immersive, /class="login-fields"/);
assert.match(immersive, /vantage-h1-login-figma\.png/);
assert.match(immersive, /<source src="assets\/vantage-h1-opening-final-4k\.mp4" type="video\/mp4"/);
assert.match(runtime, /export function setVideoSource/);
assert.match(report, /className="h1-o2-lifecycle-proof"/);
assert.match(report, /2025 H2 vs 2026 H1/);
assert.match(immersive, /moveDeckFromAiProducts\(direction\);/);
assert.match(immersive, /doc\.URL === 'about:blank'/);
assert.match(aiModule, /\.cockpit-card\.is-flipped \.cockpit-front \{ visibility:hidden; \}/);

console.log("H1 production regression recovery contract passed.");
```

- [ ] **Step 2: Run the contract and verify it fails before integration**

Run:

```bash
node tests/check-h1-production-regression-recovery.mjs
```

Expected: FAIL because the current production branch does not contain the refreshed login assets and markup.

- [ ] **Step 3: Commit the failing regression contract**

```bash
git add tests/check-h1-production-regression-recovery.mjs
git commit -m "test: cover production regression recovery"
```

### Task 2: Merge the last known-good production branch

**Files:**
- Modify through merge: `index.html`
- Modify through merge: `package.json`
- Modify through merge: `previews/h1-figma-racing-theme.css`
- Modify through merge: `previews/vantage-h1-immersive.html`
- Modify through merge: `src/vantage-browser-runtime.mjs`
- Add through merge: `previews/assets/vantage-h1-login-background.png`
- Add through merge: `previews/assets/vantage-h1-login-figma.png`
- Add/modify through merge: login, Safari video, editor, O2, AI, and browser-runtime tests under `tests/`

- [ ] **Step 1: Create the integration branch**

```bash
git switch -c codex/restore-production-updates
```

Expected: the new branch starts from the current production fixes.

- [ ] **Step 2: Merge `codex/pages-a` without auto-committing**

```bash
git merge --no-commit --no-ff codex/pages-a
```

Expected: Git stages non-overlapping refreshed-production files and reports conflicts only in files changed independently by both branches.

- [ ] **Step 3: Resolve `index.html`**

Keep all of the following in the resolved file:

```text
Safari runtime cache key: 20260731-safari-video-v1
O2 lifecycle proof: h1-o2-lifecycle-proof and +157% India remarketing evidence
SOV chronology: 2025 H2 followed by 2026 H1
Structured data header/editor fields from a1b345b
```

- [ ] **Step 4: Resolve `previews/vantage-h1-immersive.html`**

Keep all of the following in the resolved file:

```text
Refreshed login artwork and responsive --login-scale layout
MP4 <source type="video/mp4"> elements
pages-a AI wheel gesture state machine
Direct moveDeckFromAiProducts(direction) for PageUp/PageDown and ArrowUp/ArrowDown
about:blank guard and finite early AI navigation preparation retries
WebKit-compatible AI card module URL and existing report scene order
```

- [ ] **Step 5: Resolve AI and SOV test conflicts**

Keep the newest assertions from both sides:

```text
H2 → H1 chronology and subtitle
WebKit front/back face visibility
AI modal interaction isolation
AI static-rail wheel gesture routing
Single-key vertical paging at an overflowing viewport
Transient about:blank must not report navigation readiness
```

- [ ] **Step 6: Finish the merge**

```bash
git add index.html package.json previews src tests
git commit -m "fix: restore refreshed production without regressions"
```

Expected: one merge commit with both branch parents and no unresolved paths.

### Task 3: Verify every recovered production subsystem

**Files:**
- Test: `tests/check-h1-production-regression-recovery.mjs`
- Test: `tests/check-h1-login-figma-visual.mjs`
- Test: `tests/check-h1-login-responsive-layout.mjs`
- Test: `tests/check-h1-safari-video-contract.mjs`
- Test: `tests/check-h1-social-sov-chronology.mjs`
- Test: `tests/check-h1-ai-data-products-runtime.mjs`
- Test: `tests/check-h1-ai-products-keyboard-paging-runtime.mjs`
- Test: `tests/check-h1-ai-products-wheel-routing-runtime.mjs`

- [ ] **Step 1: Run static recovery, login, video, and chronology contracts**

```bash
node tests/check-h1-production-regression-recovery.mjs
node tests/check-h1-login-figma-visual.mjs
node tests/check-h1-login-responsive-layout.mjs
node tests/check-h1-safari-video-contract.mjs
node tests/check-h1-social-sov-chronology.mjs
```

Expected: every command prints its passing contract message.

- [ ] **Step 2: Serve the integrated source**

```bash
python3 -m http.server 4199 --bind 127.0.0.1
```

Expected: the source is reachable at `http://127.0.0.1:4199`.

- [ ] **Step 3: Run AI interaction tests in Chromium and WebKit**

```bash
H1_AI_TEST_URL=http://127.0.0.1:4199 H1_AI_BROWSER=chromium node tests/check-h1-ai-products-keyboard-paging-runtime.mjs
H1_AI_TEST_URL=http://127.0.0.1:4199 H1_AI_BROWSER=webkit node tests/check-h1-ai-products-keyboard-paging-runtime.mjs
H1_AI_TEST_URL=http://127.0.0.1:4199 H1_AI_BROWSER=chromium node tests/check-h1-ai-data-products-runtime.mjs
H1_AI_TEST_URL=http://127.0.0.1:4199 H1_AI_BROWSER=webkit node tests/check-h1-ai-data-products-runtime.mjs
H1_AI_TEST_URL=http://127.0.0.1:4199 node tests/check-h1-ai-products-wheel-routing-runtime.mjs
```

Expected: keyboard, card flip, modal, and wheel routing contracts pass in both engines.

- [ ] **Step 4: Run the complete project test suite**

```bash
npm test
git diff --check
```

Expected: all project contracts pass and Git reports no whitespace errors.

### Task 4: Build, visually verify, and deploy production

**Files:**
- Build output: `.vercel/output/` (ignored)
- Production URL: `https://vantage-h1.vercel.app/`

- [ ] **Step 1: Build the production artifact**

```bash
vercel build --prod
```

Expected: `Build completed successfully`.

- [ ] **Step 2: Verify the production artifact locally**

Serve `.vercel/output/static` and rerun the responsive login and AI Chromium/WebKit checks against that server.

Expected: the refreshed login is visible at desktop and narrow viewports; AI one-key paging and card flipping pass.

- [ ] **Step 3: Deploy the prebuilt artifact with exact Git metadata**

```bash
recovery_sha="$(git rev-parse HEAD)"
recovery_deploy_json="$(vercel deploy --prebuilt --prod --yes \
  --meta gitCommitSha="$recovery_sha" \
  --meta gitCommitRef=codex/restore-production-updates \
  --meta gitCommitMessage=restore-production-updates \
  --format=json)"
recovery_deployment_url="$(
  node -e 'let value="";process.stdin.on("data",chunk=>value+=chunk).on("end",()=>console.log(JSON.parse(value).deployment.url))' \
  <<<"$recovery_deploy_json"
)"
```

Expected: Vercel returns a production deployment in `READY` state.

- [ ] **Step 4: Bind the canonical production URL**

```bash
vercel alias set "$recovery_deployment_url" vantage-h1.vercel.app
```

Expected: `https://vantage-h1.vercel.app` points to the new deployment.

- [ ] **Step 5: Verify canonical-domain metadata and interactions**

Run `vercel inspect https://vantage-h1.vercel.app --format=json`, fetch deployment metadata, and execute the login and AI Chromium/WebKit tests against the canonical URL.

Expected:

```text
readyState = READY
gitCommitSha = exact final commit SHA
canonical URL resolves to the new deployment ID
refreshed responsive login is present
SOV remains H2 → H1
AI card flip and one-key vertical paging pass in Chromium and WebKit
```

- [ ] **Step 6: Scan production errors**

Query Vercel runtime errors for the last hour and deployment build logs with errors-only filtering.

Expected: no runtime error clusters and no build error events.
