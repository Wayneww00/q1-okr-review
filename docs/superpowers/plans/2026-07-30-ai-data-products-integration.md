# AI Data Products Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Insert the existing AI data products showcase between Full Report and Q3 Outlook as outer scene `04 / 06`, without changing the 86-page report, Supabase integration, or current video behavior.

**Architecture:** Copy the self-contained AI module and all of its image assets into `previews/ai-data-products/`, then embed it in a deferred, same-origin iframe inside the immersive shell. Reuse the source version's iframe navigation bridge so vertical wheel, keyboard, and touch gestures move between outer scenes while focused controls, horizontal gestures, and the toolbox modal remain owned by the AI module.

**Tech Stack:** Static HTML/CSS/JavaScript, same-origin iframe integration, Node.js assertion tests, Playwright runtime verification.

---

### Task 1: Preserve the exact pre-integration state

**Files:**
- Create: `backups/ai-data-products-before-20260730-232119/rollback-files.tar.gz`
- Preserve: `previews/vantage-h1-immersive.html`
- Preserve: `HANDOFF.md`
- Preserve: `tests/`

- [x] **Step 1: Create the rollback archive**

```bash
mkdir -p backups/ai-data-products-before-20260730-232119
tar -czf backups/ai-data-products-before-20260730-232119/rollback-files.tar.gz \
  previews/vantage-h1-immersive.html HANDOFF.md tests
```

- [x] **Step 2: Record and verify its checksum**

```bash
shasum -a 256 backups/ai-data-products-before-20260730-232119/rollback-files.tar.gz
```

Expected:

```text
e91e6477736964bcfe90063e5d5292e862ff93e2f3d337ceec7566fbeb7d43e1
```

### Task 2: Define the static integration contract first

**Files:**
- Create: `tests/check-h1-ai-data-products-integration.mjs`
- Read: `previews/vantage-h1-immersive.html`
- Read: `previews/ai-data-products/index.html`

- [x] **Step 1: Add the failing static test**

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const shellPath = resolve(root, "previews/vantage-h1-immersive.html");
const modulePath = resolve(root, "previews/ai-data-products/index.html");
const assetDir = resolve(root, "previews/ai-data-products/assets");
const shell = readFileSync(shellPath, "utf8");

assert.ok(existsSync(modulePath), "the complete AI data products module must be copied");
assert.ok(existsSync(assetDir), "the AI module asset directory must be copied");
assert.equal(readdirSync(assetDir).length, 28, "all 28 source assets must be preserved");

const sceneLabels = [...shell.matchAll(/<section\b[^>]*class="[^"]*\bscene\b[^"]*"[^>]*data-label="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((label) => !["Executive Snapshot", "Retail Performance", "Paid Ads Efficiency"].includes(label));

assert.deepEqual(sceneLabels, [
  "Opening Film",
  "H1 Review",
  "Full Report",
  "AI Data Products",
  "Q3 Outlook",
  "Closing Film",
]);

const aiScene = shell.match(
  /<section\b[^>]*class="[^"]*\bai-products-scene\b[^"]*"[\s\S]*?<\/section>/,
)?.[0];
assert.ok(aiScene, "the shell must contain one isolated AI products scene");
assert.match(aiScene, /src="ai-data-products\/index\.html"/);
assert.match(aiScene, /04 <small>\/ 06<\/small>/);
assert.match(shell, /05 <small>\/ 06<\/small>/);
assert.match(shell, /06 <small>\/ 06<\/small>/);
assert.match(shell, /function prepareAiProductsNavigation\(\)/);
assert.match(shell, /moveDeckFromAiProducts\(wheelDelta > 0 \? 1 : -1\)/);
assert.match(shell, /moveDeckFromAiProducts\(\['ArrowDown','PageDown',' '\]\.includes\(event\.key\) \? 1 : -1\)/);
assert.match(shell, /if \(Math\.abs\(distance\) >= 48\) moveDeckFromAiProducts\(distance > 0 \? 1 : -1\)/);

const moduleSource = readFileSync(modulePath, "utf8");
assert.match(moduleSource, /id="products"/);
assert.match(moduleSource, /id="tool-modal"/);
assert.equal((moduleSource.match(/target="_blank"/g) || []).length, 10);

console.log("H1 AI data products static integration contract passed.");
```

- [x] **Step 2: Run it and verify RED**

```bash
node tests/check-h1-ai-data-products-integration.mjs
```

Expected: FAIL because `previews/ai-data-products/index.html` does not exist.

### Task 3: Define the runtime interaction contract

**Files:**
- Create: `tests/check-h1-ai-data-products-runtime.mjs`
- Exercise: `previews/vantage-h1-immersive.html`

- [x] **Step 1: Add the failing runtime test**

```js
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const baseUrl = process.env.H1_AI_TEST_URL || "http://127.0.0.1:4194";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/previews/vantage-h1-immersive.html`, {
    waitUntil: "domcontentloaded",
  });

  const aiScene = page.locator('[data-label="AI Data Products"]');
  await aiScene.waitFor({ state: "attached" });
  assert.equal(await aiScene.count(), 1);

  const frame = page.frameLocator("#aiProductsFrame");
  await frame.locator("#products").waitFor();
  assert.equal(await frame.locator("#products > article").count(), 3);
  assert.equal(await frame.locator("#tools > article").count(), 8);
  assert.equal(await frame.locator('a[target="_blank"]').count(), 10);

  await aiScene.evaluate((element) => element.scrollIntoView());
  await frame.locator("#toolbox-launcher").click();
  await frame.locator("#tool-modal").waitFor({ state: "visible" });
  assert.equal(await frame.locator("#tool-modal").getAttribute("hidden"), null);
  await frame.getByRole("button", { name: "关闭工具百宝箱" }).click();
  await frame.locator("#tool-modal").waitFor({ state: "hidden" });

  assert.deepEqual(errors, []);
  await page.close();
} finally {
  await browser.close();
}

console.log("H1 AI data products runtime interaction contract passed.");
```

- [x] **Step 2: Run it and verify RED**

```bash
python3 -m http.server 4194 --bind 127.0.0.1
node tests/check-h1-ai-data-products-runtime.mjs
```

Expected: FAIL because the AI scene and iframe are not yet present.

### Task 4: Copy the source module without redesigning it

**Files:**
- Copy: `/Users/julian/Downloads/H1 汇报/previews/ai-data-products/`
- Create: `previews/ai-data-products/`

- [x] **Step 1: Copy the complete clean source directory**

```bash
cp -R "/Users/julian/Downloads/H1 汇报/previews/ai-data-products" previews/ai-data-products
```

- [x] **Step 2: Confirm source and destination contents are byte-identical**

```bash
diff -qr \
  "/Users/julian/Downloads/H1 汇报/previews/ai-data-products" \
  previews/ai-data-products
```

Expected: no output and exit code 0.

### Task 5: Add the isolated outer scene and navigation bridge

**Files:**
- Modify: `previews/vantage-h1-immersive.html`

- [x] **Step 1: Add the iframe isolation styles**

Insert before the legacy hidden-scene selectors:

```css
.ai-products-scene { background:#060606; }
.ai-products-scene::before { display:none; }
.ai-products-frame-wrap {
  position:absolute;
  inset:0;
  overflow:hidden;
  background:#060606;
}
.ai-products-frame {
  display:block;
  width:100%;
  height:100%;
  border:0;
  background:#060606;
}
```

- [x] **Step 2: Add the scene after Full Report and before Q3 Outlook**

```html
<section class="scene ai-products-scene" data-label="AI Data Products" aria-label="Marketing AI 数据产品展示">
  <div class="ai-products-frame-wrap">
    <iframe
      id="aiProductsFrame"
      class="ai-products-frame"
      data-src="ai-data-products/index.html"
      title="Marketing AI 数据产品展示"
    ></iframe>
  </div>
  <div class="chapter-no">04 <small>/ 06</small></div>
</section>
```

- [x] **Step 3: Renumber the existing outer scenes**

```html
<div class="chapter-no">02 <small>/ 06</small></div>
<div class="chapter-no">03 <small>/ 06</small></div>
<div class="chapter-no">05 <small>/ 06</small></div>
<div class="chapter-no">06 <small>/ 06</small></div>
```

- [x] **Step 4: Add the same-origin gesture bridge**

```js
const aiProductsScene = scenes.find(
  scene => scene.dataset.label === 'AI Data Products',
);

const moveDeckFromAiProducts = direction => {
  if (direction !== 1 && direction !== -1) return;
  const aiProductsIndex = scenes.indexOf(aiProductsScene);
  const nextSceneIndex = Math.max(
    0,
    Math.min(scenes.length - 1, aiProductsIndex + direction),
  );
  scenes[nextSceneIndex]?.scrollIntoView({behavior:'smooth'});
};

function prepareAiProductsNavigation() {
  const frame = document.getElementById('aiProductsFrame');
  const doc = frame.contentDocument;
  if (!doc || doc.body?.dataset.deckNavigationPrepared === 'true') return;
  doc.body.dataset.deckNavigationPrepared = 'true';

  const isProductInteraction = () => !doc.getElementById('tool-modal')?.hidden;
  const AI_PRODUCTS_WHEEL_THRESHOLD = 12;
  let wheelDelta = 0;
  let wheelConsumed = false;
  let wheelTimer = 0;

  doc.addEventListener('wheel', event => {
    if (
      isProductInteraction()
      || event.shiftKey
      || Math.abs(event.deltaX) >= Math.abs(event.deltaY)
    ) return;
    event.preventDefault();
    event.stopPropagation();
    if (wheelConsumed) return;
    wheelDelta += event.deltaY;
    if (Math.abs(wheelDelta) < AI_PRODUCTS_WHEEL_THRESHOLD) return;
    wheelConsumed = true;
    moveDeckFromAiProducts(wheelDelta > 0 ? 1 : -1);
    wheelDelta = 0;
    doc.defaultView.clearTimeout(wheelTimer);
    wheelTimer = doc.defaultView.setTimeout(() => {
      wheelConsumed = false;
    }, 420);
  }, {capture:true, passive:false});

  doc.addEventListener('keydown', event => {
    if (!['ArrowDown','PageDown',' ','ArrowUp','PageUp'].includes(event.key)) return;
    if (isProductInteraction()) return;
    event.preventDefault();
    moveDeckFromAiProducts(
      ['ArrowDown','PageDown',' '].includes(event.key) ? 1 : -1,
    );
  });

  let touchStart = null;
  doc.addEventListener('touchstart', event => {
    if (isProductInteraction() || !event.touches[0]) {
      touchStart = null;
      return;
    }
    touchStart = event.touches[0].clientY;
  }, {passive:true});

  doc.addEventListener('touchend', event => {
    if (touchStart === null || !event.changedTouches[0]) return;
    const distance = touchStart - event.changedTouches[0].clientY;
    touchStart = null;
    if (Math.abs(distance) >= 48) {
      moveDeckFromAiProducts(distance > 0 ? 1 : -1);
    }
  }, {passive:true});
}

const aiProductsFrame = document.getElementById('aiProductsFrame');
aiProductsFrame.addEventListener('load', prepareAiProductsNavigation);
if (aiProductsFrame.contentDocument?.readyState === 'complete') {
  prepareAiProductsNavigation();
}
```

- [x] **Step 5: Run the static test and verify GREEN**

```bash
node tests/check-h1-ai-data-products-integration.mjs
```

Expected: `H1 AI data products static integration contract passed.`

### Task 6: Verify the feature and update handoff documentation

**Files:**
- Modify: `HANDOFF.md`
- Verify: `tests/check-h1-ai-data-products-integration.mjs`
- Verify: `tests/check-h1-ai-data-products-runtime.mjs`
- Verify: `tests/check-h1-o1-full-folder-merge.mjs`

- [x] **Step 1: Run the focused runtime test**

```bash
node tests/check-h1-ai-data-products-runtime.mjs
```

Expected: `H1 AI data products runtime interaction contract passed.`

- [x] **Step 2: Run the report preservation test**

```bash
node tests/check-h1-o1-full-folder-merge.mjs
```

Expected: the existing 14/31/25/16 and 86-page contract remains green.

- [x] **Step 3: Document the new outer order and module ownership**

Add to `HANDOFF.md`:

```markdown
### AI 数据产品外层场景

`previews/ai-data-products/` 是从已确认源目录原样复制的独立静态模块。
外层顺序为 `Full Report → AI Data Products → Q3 Outlook → Closing Film`。
它是外层 `04 / 06` 场景，不增加或改写 Full Report 的 86 页。
模块保留 3 个产品入口、工具百宝箱的 8 个工具、卡片翻转、弹窗及
10 个新窗口 Demo 链接，不接入 Supabase 文本编辑。
```

- [x] **Step 4: Browser acceptance**

Verify at 1440×900 and 1920×1080:

```text
Full Report → AI Data Products → Q3 Outlook → Closing Film
AI page shows three complete product cards
vertical wheel/PageDown leaves AI for Q3
vertical PageUp returns to Full Report
horizontal wheel remains inside the product rail
toolbox opens, displays eight cards, and closes
all ten demo links retain target="_blank"
no new browser console errors originate from the AI module
```

- [x] **Step 5: Confirm only intended files changed**

```bash
git status --short -- \
  previews/vantage-h1-immersive.html \
  previews/ai-data-products \
  tests/check-h1-ai-data-products-integration.mjs \
  tests/check-h1-ai-data-products-runtime.mjs \
  HANDOFF.md \
  docs/superpowers/plans/2026-07-30-ai-data-products-integration.md
```

Expected: only the approved integration, tests, plan, and handoff documentation are listed.

### Post-review hardening completed

- The iframe source is assigned only when the AI scene is entered; opening/login no longer downloads AI images.
- Space on a focused card remains an in-module flip action and does not move the outer deck.
- Touch navigation compares both axes, so a primarily horizontal swipe stays inside the product rail.
- Runtime coverage exercises deferred loading, focused Space, horizontal/vertical wheel, horizontal/vertical touch, modal ownership, PageUp, and PageDown.
