# ND Retail Eight-Page Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the eight approved `ND_H1_Retail_v3_兼容版本.pptx` slides after `关注者增长趋势对比` and before O1, preserving every supplied word and displayed value while restyling them as animated H1 data pages with Supabase text editing.

**Architecture:** Append pages `15–22` to `H1_DASHBOARDS`, render them with one isolated `H1RetailGrowthPage` component and layout-specific native HTML/SVG chart components, and keep the existing first 14 data pages unchanged. The report controller will reuse the existing `data` section text discovery so headings and narrative copy participate in Supabase editing; charts and page numbers remain editor-excluded. The embedded report remains one dynamic page sequence, changing the actual unified count from 87 to 95 (the current baseline already includes the O3 “越南关键洞察” page).

**Tech Stack:** Static HTML, React 18, Recharts/SVG, CSS animations, Supabase report-content runtime, Node assertion tests, Playwright.

---

## Approved design system

- **Subject / audience / job:** H1 Retail ND diagnosis and H2 growth commitment for the global marketing leadership review; the eight pages must explain the APAC decline, isolate attribution effects, and land the India growth target without changing the source claims.
- **Palette:** Carbon `#050505`, Pit Red `#8f1620`, Vantage Orange `#ff5b11`, Warm Ivory `#fff1e3`, Telemetry Teal `#1d7a82`, India Green `#0b7251`.
- **Typography:** Existing Inter/Noto Sans SC stack; condensed uppercase utility labels, high-weight Chinese headlines, tabular numerals for charts.
- **Signature:** A single telemetry pulse rail connects each page's claim to its chart; on transition pages it becomes the controlled red scan line. The India bumper is the only place with restrained saffron/green light.
- **Motion:** One orchestrated entry per page: headline → telemetry rail → chart marks → labels. No continuous decorative animation after entry. `prefers-reduced-motion` disables transforms and chart drawing.

```text
DATA PAGE                               TRANSITION PAGE
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│ MODULE / PAGE                    │    │ 15 → 16 → 17                    │
│ Takeaway headline                │    │                                  │
│ ─── telemetry pulse ───────────  │    │     Question / chapter           │
│                                  │    │     in kinetic type               │
│ Native chart / evidence          │    │                                  │
│ Source-preserved labels          │    │ ───── red scan line ───────────  │
│                            15/22 │    │                            17/22 │
└──────────────────────────────────┘    └──────────────────────────────────┘
```

### Task 1: Preserve the pre-integration state

**Files:**
- Create: `backups/nd-h1-retail-8-pages-before-20260731-001104/rollback-files.tar.gz`

- [x] **Step 1: Archive the exact current report, shell, theme, handoff, and tests**

```bash
tar -czf backups/nd-h1-retail-8-pages-before-20260731-001104/rollback-files.tar.gz \
  index.html previews/h1-figma-racing-theme.css \
  previews/vantage-h1-immersive.html HANDOFF.md tests
```

- [x] **Step 2: Record the rollback checksum**

```text
77a3fba3ab469a63a71b5494da777902fc9e2069195a3f4f422bc5efd3f59606
```

### Task 2: Define the static content and integration contract

**Files:**
- Create: `tests/check-h1-nd-retail-eight-pages.mjs`
- Test: `index.html`
- Test: `previews/h1-figma-racing-theme.css`
- Test: `previews/vantage-h1-immersive.html`
- Test: `src/vantage-browser-runtime.mjs`

- [x] **Step 1: Write a failing test that requires pages 15–22**

The test must:

```js
assert.deepEqual(ids, Array.from({length:22}, (_, index) => index + 1));
assert.deepEqual(layouts.slice(-8), [
  "retail_nd_share_shift",
  "non_retail_nd_rise",
  "apac_question",
  "vietnam_retail_nd",
  "attribution_question",
  "mib_attribution",
  "india_chapter",
  "h2_retail_nd_target",
]);
assert.equal(22 + 31 + 25 + 17, 95);
assert.match(shell, /'22 MODULES'/);
assert.match(runtime, /"\\.h1-retail-growth-page-number"/);
```

It must assert every visible source token, including:

```text
27.6%, 28.1%, 22.6%, 20.6%
$334.2M, $322.8M, 74.5%, 75.1%
为什么APAC下降？我们做得不够吗？
SEO、GEO、SOV 等多指标领先，但ND占比仅4.3%，远低于全球平均值25.2%
还有哪些因素导致占比下降，Marketing价值未充分体现？
or
占比下降的背后，还有哪些关键原因？
40%的Q2 MIB用户不符合IB的显著特征
超过一半转入IB的用户在注册两个月后才发生归属迁移
H2
印度
H2 Retail ND占比迈向32%！
（印度新增大盘占比3.6%）
```

- [x] **Step 2: Run the test and verify RED**

```bash
node tests/check-h1-nd-retail-eight-pages.mjs
```

Expected: fail because `H1_DASHBOARDS` currently stops at page 14.

### Task 3: Define runtime rendering, motion, paging, and editing

**Files:**
- Create: `tests/check-h1-nd-retail-eight-pages-runtime.mjs`
- Exercise: `previews/vantage-h1-immersive.html`

- [x] **Step 1: Write the failing Playwright contract**

The runtime test must verify:

```js
assert.equal(await dataPages.count(), 22);
assert.equal(await reportPages.count(), 95);
await scrollFrameToPage("data-15");
assert.match(await pageNumber.innerText(), /^15\s*\/\s*22$/);
assert.equal(await reportFrame.locator('[data-page-id="data-15"] svg').count() > 0, true);
await scrollFrameToPage("data-17");
assert.match(await transition.innerText(), /为什么APAC下降？我们做得不够吗？/);
await scrollFrameToPage("data-22");
assert.match(await targetPage.innerText(), /\$137\.6M/);
await page.locator("#editorButton").click();
assert.equal(await reportFrame.locator('[data-page-id="data-15"] h1').getAttribute("contenteditable"), "plaintext-only");
assert.equal(await reportFrame.locator('[data-page-id="data-22"] h1').getAttribute("contenteditable"), "plaintext-only");
await page.locator("body").press("PageDown");
await waitForActivePage("o1-chapter");
```

- [x] **Step 2: Run the test and verify RED**

```bash
H1_ND_TEST_URL=http://127.0.0.1:4180 \
  node tests/check-h1-nd-retail-eight-pages-runtime.mjs
```

Expected: fail because pages `data-15` through `data-22` do not exist.

### Task 4: Add the exact source data

**Files:**
- Modify: `index.html`

- [x] **Step 1: Append IDs 15–22 without changing IDs 1–14**

Use the exact source strings and displayed values. Do not reconcile or recompute the H2 waterfall:

```js
{
  id:22,
  layoutType:"h2_retail_nd_target",
  headline:"让Marketing真正驱动增长",
  title:"H2 Retail ND占比迈向32%！",
  subtitle:"（印度新增大盘占比3.6%）",
  steps:[
    {label:"当前公司口径",share:"24.9%",value:"$107.2M"},
    {label:"口径归因",share:"3.5%",value:"$15M"},
    {label:"印度增长",share:"3.6%",value:"$15.5M"},
    {label:"H2目标",share:"32%",value:"$137.6M"},
  ]
}
```

- [x] **Step 2: Run the static test and confirm it advances to renderer failures**

```bash
node tests/check-h1-nd-retail-eight-pages.mjs
```

### Task 5: Implement isolated native page renderers

**Files:**
- Modify: `index.html`

- [x] **Step 1: Add one renderer boundary for the eight new layout types**

```js
const H1_RETAIL_GROWTH_LAYOUTS = new Set([
  "retail_nd_share_shift",
  "non_retail_nd_rise",
  "apac_question",
  "vietnam_retail_nd",
  "attribution_question",
  "mib_attribution",
  "india_chapter",
  "h2_retail_nd_target",
]);
```

`H1FigmaDataPage` must delegate these pages to `H1RetailGrowthPage`.

- [x] **Step 2: Implement native HTML/SVG evidence views**

Add:

```text
H1RetailShareShiftChart
H1NonRetailRiseChart
H1VietnamRetailNdChart
H1MibAttributionChart
H1RetailNdTargetChart
H1RetailGrowthTransition
H1RetailGrowthPage
```

Charts use source values as labels. Chart regions use `data-editor-ignore`; visible headings, subtitles, question copy, and narrative statements remain discoverable by the shared Supabase editor.

- [x] **Step 3: Run the static test and verify GREEN**

```bash
node tests/check-h1-nd-retail-eight-pages.mjs
```

### Task 6: Add the data-module styling and motion

**Files:**
- Modify: `previews/h1-figma-racing-theme.css`

- [x] **Step 1: Add isolated page geometry and chart styles**

All selectors must begin with `.h1-retail-growth-` or be scoped under `.h1-retail-growth-page`.

- [x] **Step 2: Add one-shot reveal motion and reduced-motion protection**

```css
.h1-retail-growth-page.is-active .h1-retail-growth-reveal {
  animation:h1RetailReveal .72s cubic-bezier(.16,1,.3,1) both;
}
@media (prefers-reduced-motion:reduce) {
  .h1-retail-growth-page *,
  .h1-retail-growth-page::before,
  .h1-retail-growth-page::after {
    animation:none !important;
    transition:none !important;
  }
}
```

- [x] **Step 3: Run static and runtime tests**

```bash
node tests/check-h1-nd-retail-eight-pages.mjs
H1_ND_TEST_URL=http://127.0.0.1:4180 \
  node tests/check-h1-nd-retail-eight-pages-runtime.mjs
```

### Task 7: Update paging, editor exclusions, cache keys, and existing contracts

**Files:**
- Modify: `previews/vantage-h1-immersive.html`
- Modify: `src/vantage-browser-runtime.mjs`
- Modify: `tests/check-h1-o1-full-folder-merge.mjs`
- Modify: `tests/check-h1-okr-shell-paging-runtime.mjs`
- Modify: `tests/check-h1-objective-chapters-runtime.mjs`
- Modify: `tests/check-h1-appended-social-pages.mjs`
- Modify: `tests/check-h1-social-ppt3-pages-11-15.mjs`

- [x] **Step 1: Update visible module and cache contracts**

```text
Performance Data · 22 MODULES
embedded cache key · 20260731-nd-retail-v1
```

- [x] **Step 2: Protect the new page number from Supabase editing**

Add `.h1-retail-growth-page-number` to `EDITOR_EXCLUSION_SELECTOR`.

- [x] **Step 3: Update page-count and boundary assertions**

```text
data: 22
O1: 31
O2: 25
O3: 17
total: 95
last data page: data-22
```

- [x] **Step 4: Run boundary regressions**

```bash
node tests/check-h1-o1-full-folder-merge.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 \
  node tests/check-h1-okr-shell-paging-runtime.mjs
```

### Task 8: Browser acceptance and documentation

**Files:**
- Modify: `HANDOFF.md`

- [x] **Step 1: Verify every new page at constrained in-app size and 1920×1080 runtime**

Check:

```text
no clipping or overlap
all source labels visible
transition motion plays once
reduced-motion contract present
data-14 → data-15 → … → data-22 → o1-chapter
Edit Text marks narrative text contenteditable
Save/discard controls remain functional
```

- [x] **Step 2: Run full relevant regression**

```bash
node tests/check-h1-nd-retail-eight-pages.mjs
node tests/check-h1-nd-retail-eight-pages-runtime.mjs
node tests/check-h1-o1-full-folder-merge.mjs
node tests/check-h1-objective-chapters.mjs
npm test
git diff --check
```

- [x] **Step 3: Update handoff and rollback instructions**

Document the new 22/31/25/17 structure, 95-page total, source deck, Supabase editing scope, and rollback archive checksum.

- [x] **Step 4: Request independent code review**

The reviewer must inspect content fidelity, editor ownership, reduced motion, paging boundaries, and rendering at both acceptance viewports. Fix all Critical and Important findings before delivery.
