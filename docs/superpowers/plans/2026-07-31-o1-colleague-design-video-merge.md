# O1 Colleague Design and Video Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the colleague's complete O1 design and browser-optimized videos from `/Users/julian/Downloads/H1 汇报 2` into the canonical H1 report without changing O2 or the existing remote-media/Safari compatibility contract.

**Architecture:** Keep `codex/restore-production-updates` as the target and modify only O1-owned code, CSS, tests, posters, ignored local MP4 fixtures, and the production media manifest. Port the colleague's poster-first inline/modal interaction and O1 page compositions, but route every video through `VantageBrowserRuntime.resolveMediaUrl()` and a typed `<source>` element so production can continue using the remote manifest and desktop Safari/Chrome receive H.264/AAC MP4. Because no remote upload is authorized, reuse the colleague repository's existing, commit-pinned Git LFS media URLs for the seven web MP4s and verify Range support before accepting them.

**Tech Stack:** Static HTML, React 18 JSX compiled by Babel, CSS, Node.js contract tests, `ffprobe`, Playwright browser checks.

---

### Task 1: Lock the merge contract with a failing test

**Files:**
- Create: `tests/check-h1-o1-colleague-design-video-merge.mjs`

- [x] **Step 1: Write the failing contract test**

```js
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const css = await readFile("previews/h1-o1-complete-theme.css", "utf8");
const webVideos = [
  "cfd-h1-summary-web.mp4",
  "cfd-public-good-web.mp4",
  "ferrari-personal-moment-web.mp4",
  "tvc-brand-main-web.mp4",
  "tvc-global-web.mp4",
  "tvc-vietnam-web.mp4",
  "tvc-thailand-web.mp4",
];

for (const file of webVideos) {
  assert.match(html, new RegExp(file.replaceAll(".", "\\\\.")));
  const path = `previews/assets/o1-complete/tvc-library/${file}`;
  await access(path);
  assert.ok((await stat(path)).size > 1_000_000, `${file} must be a real local MP4`);
}

for (const poster of [
  "cfd-h1-summary.jpg",
  "cfd-public-good.jpg",
  "ferrari-personal-moment.jpg",
  "tvc-brand-main.jpg",
  "tvc-global.jpg",
  "tvc-vietnam.jpg",
  "tvc-thailand.jpg",
]) {
  await access(`previews/assets/o1-complete/tvc-library/posters/${poster}`);
  assert.match(html, new RegExp(`posters/${poster.replaceAll(".", "\\\\.")}`));
}

assert.match(html, /function OkrModalVideoTrigger\(\{page,slot,onVideoPreview\}\)/);
assert.match(html, /function OkrTvcLocalizationPage\(\{page,onVideoPreview\}\)/);
assert.match(html, /function OkrInlineVideo[\s\S]*?IntersectionObserver[\s\S]*?h1-inline-video-activate/);
assert.match(html, /OkrInlineVideo[\s\S]*?<source[\s\S]*?resolveMediaUrl\(slot\.src\)[\s\S]*?type="video\/mp4"/);
assert.match(html, /function OkrVideoModal[\s\S]*?<source[\s\S]*?resolveMediaUrl\(preview\.slot\.src\)[\s\S]*?type="video\/mp4"/);
assert.match(html, /function OkrVideoModal[\s\S]*?removeAttribute\('src'\)[\s\S]*?video\.load\(\)/);
assert.match(html, /id:'okr-ai-recommendation'[\s\S]*?id:'ai-gpt-best-broker'[\s\S]*?id:'ai-claude-broker-list'/);
assert.match(css, /\.h1-okr-inline-video-trigger/);
assert.match(css, /\.h1-okr-inline-video-play/);
assert.match(css, /\.h1-okr-tvc-localization-page/);
```

- [x] **Step 2: Run the test and verify RED**

Run: `node tests/check-h1-o1-colleague-design-video-merge.mjs`

Expected: FAIL because the canonical O1 still references the original MP4 names and lacks the colleague's poster-first components and local web assets.

### Task 2: Port the colleague's O1 design and browser media wiring

**Files:**
- Modify: `index.html`
- Modify: `previews/h1-o1-complete-theme.css`
- Copy: `previews/assets/o1-complete/figma-untitled/brand-refresh-*.png`
- Copy: `previews/assets/o1-complete/figma-untitled/p45-elite-endorsement-resources-figma-150-1072.png`
- Copy: `previews/assets/o1-complete/figma-untitled/p58-ai-recommendation-figma-152-1299.png`
- Copy: `previews/assets/o1-complete/figma-untitled/omnichannel-amplification-figma-145-716.png`
- Copy: `previews/assets/o1-complete/figma-lightbox/ai-recommendation/*`
- Copy: `previews/assets/o1-complete/tvc-library/posters/*`
- Copy locally/ignored: O1 MP4 files used by the merged deck

- [x] **Step 1: Port page data and compositions**

Update O1 asset paths to the `o1-complete` namespace, add the colleague's image hotspots, editable overlays, Figma-node compositions, TVC localization composition, `*-web.mp4` sources, posters, and `playback:'modal'` metadata. Keep the O1 page count and O2 boundary unchanged.

- [x] **Step 2: Port poster-first video interaction while keeping the current resolver**

Create media only after a poster/play trigger is activated. Preserve the colleague's inline-versus-modal choices and unload media when it leaves view or the modal closes. Render video sources as:

```jsx
<video ref={videoRef} poster={slot.poster} controls autoPlay playsInline preload="auto">
  <source
    src={window.VantageBrowserRuntime.resolveMediaUrl(slot.src)}
    type="video/mp4"
  />
</video>
```

- [x] **Step 3: Port the colleague's O1 CSS**

Add the poster trigger, central play control, gold merchandise CTA, TVC localization page, editable elite-copy masks, and updated modal styles to `h1-o1-complete-theme.css`. Rewrite source asset URLs to `assets/o1-complete/...` and leave general/O2 CSS untouched.

- [x] **Step 4: Copy only referenced design assets and local media fixtures**

Copy referenced non-video assets into the tracked O1 namespace. Copy the seven recommended H.264/AAC web files and the existing O1 MP4s used by the deck into the ignored local media directory so localhost validation exercises real playback. Do not add PPT MP4s. Add the seven production mappings to the local manifest using the colleague repository's existing Git LFS media endpoints pinned to commit `7fb413aa45fc27919ac1a0e56430c210d364e43d`; do not upload or deploy anything.

- [x] **Step 5: Run the test and verify GREEN**

Run: `node tests/check-h1-o1-colleague-design-video-merge.mjs`

Expected: PASS.

### Task 3: Verify media encoding, build contracts, and regressions

**Files:**
- Test: `tests/check-h1-o1-colleague-design-video-merge.mjs`
- Test: `tests/check-h1-safari-video-contract.mjs`
- Test: `tests/vantage-browser-runtime.test.mjs`
- Test: `tests/check-h1-o1-full-folder-merge.mjs`

- [x] **Step 1: Verify all seven web files are desktop-browser-safe**

Run `ffprobe` for each file and require H.264 video, AAC audio, and `yuv420p` pixel format.

- [x] **Step 2: Run focused O1 and media tests**

Run:

```bash
node tests/check-h1-o1-colleague-design-video-merge.mjs
node tests/check-h1-o1-full-folder-merge.mjs
node tests/check-h1-safari-video-contract.mjs
node tests/vantage-browser-runtime.test.mjs
```

Expected: all PASS.

- [x] **Step 3: Build the production artifact**

Run: `npm run build`

Expected: exit 0; MP4 files other than the explicitly tracked opening asset remain excluded from `dist`, while runtime-config retains the established remote manifest behavior.

### Task 4: Browser-check the O1 flow and protect unrelated work

**Files:**
- Verify: `previews/vantage-h1-immersive.html`
- Verify: `index.html?report=h1&embedded=1`

- [x] **Step 1: Start a local server and run the browser verification skill**

Run `python3 -m http.server 4180`, open the report, confirm meaningful content, no error overlay, and no console errors.

- [x] **Step 2: Exercise O1 media**

Navigate from the O1 title page through the poster-based video pages. Confirm poster rendering, inline activation, modal activation, play/pause, close cleanup, and successful MP4 requests.

- [x] **Step 3: Review the final diff**

Confirm the diff is limited to the plan, O1 test, O1 code/style, and tracked O1 non-video assets. Preserve all pre-existing O2 changes. Do not stage, commit, push, upload media, or deploy.
