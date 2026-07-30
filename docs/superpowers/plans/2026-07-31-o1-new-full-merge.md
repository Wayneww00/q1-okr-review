# O1 New Full Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven development and execute this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current O1 section with the 31-page O1 implementation from `/Users/julian/Downloads/H1 汇报 New.zip`, preserving every source interaction while leaving Data, O2, O3, AI Data Products, and the shared immersive shell unchanged.

**Architecture:** Keep the current unified site and render the imported O1 pages directly inside the existing `data-report-section="okr"` boundary. Copy all O1-only artwork, lightbox media, and video assets into `previews/assets/o1-complete/`, use only that isolated asset root from O1 code, and extend `previews/h1-o1-complete-theme.css` with O1-only interaction styles. Do not import the source package’s login, top navigation, Vercel configuration, Git metadata, temporary files, or global shell.

**Tech Stack:** Static HTML, React 18 JSX compiled in-browser by Babel, CSS, Playwright runtime tests, Node.js contract tests, FFmpeg media validation.

---

### Task 1: Freeze the Source Contract

**Files:**
- Create: `tests/check-h1-o1-new-full-merge.mjs`
- Create: `tests/check-h1-o1-new-interactions-runtime.mjs`
- Modify: none

- [ ] **Step 1: Encode the exact 31-page source order**

Assert that O1 contains exactly these IDs, with no extra `o1-chapter` page:

```js
[
  "okr-review",
  "okr-brand-experience-audit",
  "okr-brand-results",
  "okr-brand-refresh",
  "okr-brand-operating-system",
  "okr-tvc-matrix",
  "okr-tvc-framework",
  "okr-tvc-library",
  "okr-application-roadmap",
  "okr-high-value-actions",
  "okr-awards",
  "okr-offline-event-01",
  "okr-offline-event-02",
  "okr-elite-client-identity",
  "okr-client-experience-model",
  "okr-client-experience-cases",
  "okr-elite-client-no1-experience",
  "okr-elite-endorsement-resources",
  "okr-elite-ferrari-experience",
  "okr-elite-black-label",
  "okr-elite-business-enablement",
  "okr-merchandise",
  "okr-cfd-public-good-story",
  "okr-cfd-public-good",
  "okr-public-good-video",
  "okr-un-ngo-engagement",
  "okr-ai-recommendation",
  "okr-omnichannel-amplification",
  "okr-tvc-localization",
  "okr-superapp-activation",
  "okr-premium-unlimited",
]
```

- [ ] **Step 2: Encode the interaction contract**

Assert the source-equivalent registry exposes 30 image hotspots, one external merchandise link, eight modal video hotspots, seven inline videos, and the reusable helpers `OkrInlineVideo`, `OkrExternalLinks`, and `OkrImageHotspots`.

- [ ] **Step 3: Encode isolation**

Assert O1 references only `previews/assets/o1-complete/`; assert Data remains 22 pages, O2 remains 25 pages, O3 remains 17 pages, and the report order remains Data → O1 → O2 → O3.

- [ ] **Step 4: Run both tests and confirm RED**

Run:

```bash
node tests/check-h1-o1-new-full-merge.mjs
node tests/check-h1-o1-new-interactions-runtime.mjs
```

Expected: failures because the current O1 registry has 30 content entries plus a custom chapter and does not expose the source image, external-link, and inline-video interactions.

### Task 2: Import Isolated O1 Assets

**Files:**
- Create/update: `previews/assets/o1-complete/figma-lightbox/**`
- Create/update: `previews/assets/o1-complete/figma-untitled/**`
- Create/update: `previews/assets/o1-complete/figma-exact/**`
- Create/update: `previews/assets/o1-complete/tvc-library/**`
- Modify: none outside `previews/assets/o1-complete/`

- [ ] **Step 1: Copy the source artwork and original lightbox images**

Mechanically copy `figma-exact`, `figma-untitled`, and `figma-lightbox` from the extracted source into the isolated O1 asset root without deleting unrelated current assets.

- [ ] **Step 2: Copy all 15 source video files**

Mechanically copy the complete `tvc-library` folder so local playback uses the colleague’s exact updated video binaries.

- [ ] **Step 3: Validate assets**

Run SHA-256 and file existence checks from `tests/check-h1-o1-new-full-merge.mjs`, then run `ffprobe` on every imported MP4. Expected: all assets exist, all hashes match the source contract, and every MP4 reports a readable duration.

### Task 3: Replace the O1 Registry and Rendering Contract

**Files:**
- Modify: `index.html`
- Test: `tests/check-h1-o1-new-full-merge.mjs`

- [ ] **Step 1: Replace the O1 registry**

Use the 31 source entries and rewrite every asset path under `previews/assets/o1-complete/`. Preserve all `imageSlots`, `videoSlots`, `videoSlot`, `externalLinks`, `modalCrop`, `inline`, `fit`, and coordinate metadata.

- [ ] **Step 2: Remove the extra current chapter**

Render `okr-review` as page `01 / 31`; do not render `O1ChapterPage`. Render `okr-premium-unlimited` as `31 / 31`.

- [ ] **Step 3: Restore source component routing**

Add the `okr-cfd-public-good-story` route, pass preview callbacks to every page that owns image or video interactions, and remove the accidental nested O3 page list from `OkrReportDeck`.

- [ ] **Step 4: Run the static contract and confirm GREEN**

Run:

```bash
node tests/check-h1-o1-new-full-merge.mjs
```

Expected: pass.

### Task 4: Restore O1 Interactions

**Files:**
- Modify: `index.html`
- Modify: `previews/h1-o1-complete-theme.css`
- Test: `tests/check-h1-o1-new-interactions-runtime.mjs`

- [ ] **Step 1: Restore transparent image hotspots**

Render every `imageSlots` entry as an accessible zoom button and send its original source plus crop metadata to `OkrExactModal`.

- [ ] **Step 2: Restore inline and modal video behavior**

Render `inline:true` entries as positioned `<video controls playsInline preload="metadata">` elements. Render other entries as transparent play hotspots that open the existing video modal. Resolve all video URLs through `VantageBrowserRuntime.resolveMediaUrl`.

- [ ] **Step 3: Restore the merchandise link**

Render the package’s merchandise hotspot as an anchor with `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 4: Restore modal keyboard behavior**

Keep click-outside, close-button, and Escape closure for image and video modals. Keep image content uncropped unless a source `modalCrop` explicitly defines the zoom region.

- [ ] **Step 5: Add isolated interaction CSS**

Add O1-only styles for `.h1-okr-image-hotspot`, `.h1-okr-external-link`, `.h1-okr-inline-video`, and `.h1-okr-image-modal*`. Do not modify O2/O3 selectors.

- [ ] **Step 6: Run the runtime test and confirm GREEN**

Run:

```bash
node tests/check-h1-o1-new-interactions-runtime.mjs
```

Expected: pass at 1920×1080 and 1280×720.

### Task 5: Full Local Regression and Visual Review

**Files:**
- Modify only if a failing regression identifies an O1-scoped defect.
- Test existing Data/O2/O3/AI and shell suites.

- [ ] **Step 1: Validate all 31 O1 pages**

Capture each page at 1920×1080 and generate a contact sheet. Confirm no broken images, clipped pages, stale denominators, duplicate navigation, or missing content.

- [ ] **Step 2: Exercise all interaction families**

Open at least one audit hotspot, award hotspot, event hotspot, client hotspot, crop hotspot, modal video, inline video, and external link. Close each modal by button, backdrop, and Escape.

- [ ] **Step 3: Validate cross-module boundaries**

Use the immersive shell to wheel from the final Data page into O1, through all 31 O1 pages, and from O1 page 31 into O2. Confirm no page skips and no duplicate O3 pages.

- [ ] **Step 4: Run relevant regression suites**

Run:

```bash
node tests/check-h1-o1-new-full-merge.mjs
node tests/check-h1-o1-new-interactions-runtime.mjs
node tests/check-h1-o1-full-folder-runtime.mjs
node tests/check-h1-o2-runtime.mjs
node tests/check-h1-o3-runtime.mjs
node tests/check-h1-ai-data-products-runtime.mjs
VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build
```

Expected: all relevant suites pass, or any pre-existing unrelated failure is documented with evidence.

### Task 6: Local Handoff Only

**Files:**
- No production mutation.

- [ ] **Step 1: Report the local preview**

Provide the local URL and summarize page count, interaction count, media validation, and regressions.

- [ ] **Step 2: Wait for user approval**

Do not run `vercel --prod`, change production aliases, or publish media until the user explicitly approves the local result.
