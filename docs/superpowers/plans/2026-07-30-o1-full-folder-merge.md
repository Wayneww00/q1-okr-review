# O1 Full Folder Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current 11-page O1 section with the complete 30-page O1 section from `/Users/julian/Downloads/H1 汇报/`, while preserving the current 14 data pages, all 25 O2 pages, all 17 O3 pages, and the existing immersive shell.

**Architecture:** Keep the current report shell and unified `[data-report-page]` registry. Transplant only the downloaded O1 registry, O1 React renderers, O1-scoped CSS, and required media into a new isolated asset root. The report order remains `data-01…data-14 → O1 01/30…30/30 → o2-chapter → o2-seo-chapter… → O3`.

**Tech Stack:** Static HTML, React 18 CDN, Babel standalone, CSS, local PNG/SVG/MP4 assets, Node.js contract tests, Playwright runtime tests.

**Implementation status:** Completed on 2026-07-30. The downloaded image assets were isolated under `previews/assets/o1-complete/`. The 8 downloaded TVC files were mapped to the existing verified equivalents under `previews/assets/okr-videos/` instead of duplicating roughly 435 MB.

---

### Task 1: Protect the current working version

**Files:**
- Create: `/Users/julian/Q1汇报/backups/o1-full-merge-20260730-203458/rollback-files.tar.gz`
- Preserve: `/Users/julian/Q1汇报/index.html`
- Preserve: `/Users/julian/Q1汇报/previews/h1-figma-racing-theme.css`
- Preserve: `/Users/julian/Q1汇报/previews/vantage-h1-immersive.html`
- Preserve: `/Users/julian/Q1汇报/HANDOFF.md`

- [x] **Step 1: Archive only the files this change may modify**

```bash
tar -czf backups/o1-full-merge-20260730-203458/rollback-files.tar.gz \
  index.html \
  previews/h1-figma-racing-theme.css \
  previews/vantage-h1-immersive.html \
  HANDOFF.md \
  tests/check-h1-okr-p29-p34-contract.mjs \
  tests/check-h1-okr-shell-paging-runtime.mjs \
  tests/check-h1-okr-tvc-video-playback.mjs
```

- [x] **Step 2: Verify the archive**

```bash
shasum -a 256 backups/o1-full-merge-20260730-203458/rollback-files.tar.gz
tar -tzf backups/o1-full-merge-20260730-203458/rollback-files.tar.gz
```

Expected SHA-256:

```text
98aacf516d51767212cf40851e1980fc70e865b092d31a98fcdb4d3bc26c0cde
```

### Task 2: Define the O1 replacement contract

**Files:**
- Create: `/Users/julian/Q1汇报/tests/check-h1-o1-full-folder-merge.mjs`

- [x] **Step 1: Write a failing contract test**

The test must assert:

```text
O1 page count: 30
Data page count: 14
O2 page count: 25
O3 page count: 17
Unified report page count: 86
Boundary order: data-14 → okr-review → … → okr-premium-unlimited → o2-chapter → o2-seo-chapter
```

The exact O1 ID sequence must be:

```text
okr-review
okr-brand-experience-audit
okr-brand-results
okr-brand-refresh
okr-brand-operating-system
okr-tvc-matrix
okr-tvc-framework
okr-tvc-library
okr-application-roadmap
okr-high-value-actions
okr-awards
okr-offline-event-01
okr-offline-event-02
okr-elite-client-identity
okr-client-experience-model
okr-client-experience-cases
okr-elite-client-no1-experience
okr-elite-endorsement-resources
okr-elite-ferrari-experience
okr-elite-black-label
okr-elite-business-enablement
okr-merchandise
okr-cfd-public-good
okr-public-good-video
okr-un-ngo-engagement
okr-ai-recommendation
okr-omnichannel-amplification
okr-tvc-localization
okr-superapp-activation
okr-premium-unlimited
```

- [x] **Step 2: Run the test and verify RED**

```bash
node tests/check-h1-o1-full-folder-merge.mjs
```

Expected result: FAIL because the current O1 registry contains 11 pages and does not contain the expanded O1 IDs.

### Task 3: Import O1 assets without overwriting current assets

**Files:**
- Create: `/Users/julian/Q1汇报/previews/assets/o1-complete/figma-untitled/`
- Create: `/Users/julian/Q1汇报/previews/assets/o1-complete/figma-exact/`

- [x] **Step 1: Copy the downloaded O1 binaries into the isolated asset root**

```bash
cp -R "/Users/julian/Downloads/H1 汇报/previews/assets/figma-untitled" \
  "/Users/julian/Q1汇报/previews/assets/o1-complete/"
cp -R "/Users/julian/Downloads/H1 汇报/previews/assets/figma-exact" \
  "/Users/julian/Q1汇报/previews/assets/o1-complete/"
```

- [x] **Step 2: Map and verify all O1 video references**

The downloaded O1 TVC filenames are mapped to the existing, browser-ready equivalents in `previews/assets/okr-videos/`. Six files are stream-identical; the `public-good` and `product-copy-trade` equivalents are browser transcodes with matching duration/frame count and visual SSIM above 0.99.

```bash
node tests/check-h1-o1-full-folder-merge.mjs
```

Expected result: the test still fails on the 11-page implementation, but reports no missing copied asset.

### Task 4: Transplant the 30-page O1 implementation

**Files:**
- Modify: `/Users/julian/Q1汇报/index.html`
- Create: `/Users/julian/Q1汇报/previews/h1-o1-complete-theme.css`

- [x] **Step 1: Replace the current O1 component block**

Replace the current O1 implementation beginning at `function OkrInsightIcon` and ending after `function OkrReportDeck` with the downloaded implementation. Rewrite O1 asset references from:

```text
previews/assets/figma-untitled/
previews/assets/figma-exact/
previews/assets/tvc-library/
```

to:

```text
previews/assets/o1-complete/figma-untitled/
previews/assets/o1-complete/figma-exact/
previews/assets/okr-videos/
```

- [x] **Step 2: Create the O1-only stylesheet**

Extract the downloaded O1 CSS beginning at the `--h1-okr-design-width` declaration and keep only O1-scoped selectors. Rewrite its asset URLs to `/previews/assets/o1-complete/`.

- [x] **Step 3: Load the O1 stylesheet after the current report themes**

Add:

```html
<link id="h1-o1-complete-theme" rel="stylesheet" href="previews/h1-o1-complete-theme.css?v=20260730-media-windowing-v1">
```

after the existing H1/O3 theme links in `index.html`.

- [x] **Step 4: Run the contract test and verify GREEN**

```bash
node tests/check-h1-o1-full-folder-merge.mjs
```

Expected result: PASS.

### Task 5: Preserve report boundaries and current sections

**Files:**
- Modify: `/Users/julian/Q1汇报/index.html`
- Modify: `/Users/julian/Q1汇报/previews/vantage-h1-immersive.html`

- [x] **Step 1: Keep all current section registrations**

The application render order must remain:

```jsx
<DashboardSection editMode={editMode}/>
<OkrReportDeck/>
<O2ReportDeck/>
<O3ReportDeck/>
```

- [x] **Step 2: Keep `o2-chapter`**

The `O2_REPORT_PAGES` registry must still begin:

```js
{ id:"o2-chapter", ... }
{ id:"o2-seo-chapter", ... }
```

- [x] **Step 3: Update one cache revision consistently**

Use `20260730-media-windowing-v1` for the report iframe and all H1/O1 theme references so the media-memory fix invalidates stale browser resources.

- [x] **Step 4: Run boundary tests**

```bash
node tests/check-h1-o1-full-folder-merge.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-shell-paging-runtime.mjs
```

Expected result: O1 last page hands off to `o2-chapter`, and reverse navigation returns to `okr-premium-unlimited`.

### Task 6: Verify media and visual behavior

**Files:**
- Test: `/Users/julian/Q1汇报/tests/check-h1-o1-full-folder-merge.mjs`
- Test: `/Users/julian/Q1汇报/tests/check-h1-okr-tvc-video-playback.mjs`

- [x] **Step 1: Run O1 media contracts**

```bash
node tests/check-h1-okr-tvc-video-playback.mjs
node tests/check-h1-o1-full-folder-merge.mjs
```

- [x] **Step 2: Verify browser rendering**

Open:

```text
http://127.0.0.1:4180/previews/vantage-h1-immersive.html
```

Verify at 1280×720 and 1920×1080:

```text
data-14 → O1 page 01
O1 page 01 → page 30 with no missing artwork
O1 page 30 → o2-chapter
o2-chapter → o2-seo-chapter
TVC video modal opens and closes
Image/lightbox interactions close with Escape
Reverse paging works at both O1 boundaries
```

### Task 7: Document the completed state

**Files:**
- Modify: `/Users/julian/Q1汇报/HANDOFF.md`

- [x] **Step 1: Record the new page counts and asset root**

Document:

```text
14 data pages
30 O1 pages
25 O2 pages
17 O3 pages
86 unified report pages
O1 assets: previews/assets/o1-complete/
```

- [x] **Step 2: Record the rollback archive**

Document:

```text
backups/o1-full-merge-20260730-203458/rollback-files.tar.gz
SHA-256 98aacf516d51767212cf40851e1980fc70e865b092d31a98fcdb4d3bc26c0cde
```

- [x] **Step 3: Run final targeted tests**

```bash
node tests/check-h1-o1-full-folder-merge.mjs
node tests/check-h1-o1-full-folder-runtime.mjs
node tests/check-h1-okr-shell-paging-runtime.mjs
node tests/check-h1-okr-tvc-video-playback.mjs
node tests/check-h1-okr-native-card-opacity.mjs
```

Completed result:

```text
14 data pages
30 O1 pages
25 O2 pages
17 O3 pages
86 unified report pages
O1 → o2-chapter → o2-seo-chapter
```

```bash
node tests/check-h1-o1-full-folder-merge.mjs
node tests/check-h1-okr-tvc-video-playback.mjs
node tests/check-h1-wheel-paging-stability.mjs
```

Expected result: all targeted tests pass.
