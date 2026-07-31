import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import * as VantageBrowserRuntime from "../src/vantage-browser-runtime.mjs";

const {
  applyTextRevision,
  collectTextEntries,
  createLocalDevelopmentClient,
  discoverEditableText,
  isLocalDevelopmentHost,
  listPresentationMedia,
  ReportContentController,
  resolveMediaUrl,
  setEntriesEditing,
  warmPresentationMedia,
} = VantageBrowserRuntime;

assert.equal(isLocalDevelopmentHost("127.0.0.1"), true);
assert.equal(isLocalDevelopmentHost("localhost"), true);
assert.equal(isLocalDevelopmentHost("vantage-h1.vercel.app"), false);

const localStorageValues = new Map();
const localStorage = {
  getItem: (key) => localStorageValues.get(key) || null,
  setItem: (key, value) => localStorageValues.set(key, value),
};
const localClient = createLocalDevelopmentClient({
  storage: localStorage,
  expectedPassword: "vantage",
});
assert.equal((await localClient.auth.getSession()).data.session, null);
assert.ok(
  (await localClient.auth.signInWithPassword({ password: "wrong" })).error,
  "local development must still reject an incorrect default password",
);
const localLogin = await localClient.auth.signInWithPassword({
  password: "vantage",
});
assert.equal(localLogin.error, null);
assert.equal(localLogin.data.session.user.id, "vantage-local-user");
assert.equal(
  (await localClient.auth.getSession()).data.session.user.id,
  "vantage-local-user",
  "local development session should persist without Supabase configuration",
);

const dom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-01">
      <h2>经营数据</h2>
      <p>第一行<br>第二行</p>
      <button>不编辑按钮</button>
      <svg><text>不编辑 SVG</text></svg>
    </section>
  </main>
  <main data-report-section="okr">
    <section data-report-page data-page-id="okr-01"><h2>O1 不支持编辑</h2></section>
  </main>
  <main data-report-section="o2">
    <section data-report-page data-page-id="o2-01" data-editor-revision="retail-nd-ppt-v4"><p>增长正文</p></section>
  </main>
  <main data-report-section="o3">
    <section data-report-page data-page-id="o3-01"><span>突破正文</span></section>
  </main>
  <footer><p>页脚不编辑</p></footer>
</body>`);

const entries = discoverEditableText(dom.window.document);

assert.deepEqual(
  entries.map((entry) => entry.id),
  [
    "data:data-01:0",
    "data:data-01:1",
    "o2:o2-01@retail-nd-ppt-v4:0",
    "o3:o3-01:0",
  ],
  "only leaf text in data, O2, and O3 report sections should be editable",
);

setEntriesEditing(entries, true);
assert.ok(
  entries.every(
    ({ element }) =>
      element.getAttribute("contenteditable") === "plaintext-only" &&
      element.classList.contains("vantage-editable-text"),
  ),
  "editing mode must enable plaintext-only fields",
);

entries[0].element.textContent = "已编辑标题";
entries[1].element.innerHTML = "第一行<div>第二行</div><div>第三行</div>";
assert.deepEqual(collectTextEntries(entries).slice(0, 2), [
  { id: "data:data-01:0", text: "已编辑标题" },
  { id: "data:data-01:1", text: "第一行\n第二行\n第三行" },
]);

applyTextRevision(entries, {
  texts: {
    "data:data-01:0": "远端标题",
    "o3:o3-01:0": "远端\n第二行",
  },
});
assert.equal(entries[0].element.textContent, "远端标题");
assert.equal(entries[3].element.textContent, "远端\n第二行");

setEntriesEditing(entries, false);
assert.ok(
  entries.every(({ element }) => !element.hasAttribute("contenteditable")),
  "leaving editing mode must restore read-only text",
);
assert.ok(
  entries.every(({ element }) =>
    element.classList.contains("vantage-managed-text"),
  ),
  "saved line breaks must remain visible after the report returns to read-only mode",
);

const titleDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-title">
      <header><h2><span>经营数据</span></h2></header>
    </section>
  </main>
</body>`);
const [titleEntry] = discoverEditableText(titleDom.window.document);
assert.ok(
  titleEntry.element.classList.contains("vantage-title-text"),
  "editable text inside a heading must be identified as a title field",
);
setEntriesEditing([titleEntry], true);
titleEntry.element.textContent = "经营数据\n2026 H1 核心表现";
assert.deepEqual(collectTextEntries([titleEntry]), [
  {
    id: "data:data-title:0",
    text: "经营数据\n2026 H1 核心表现",
  },
]);
setEntriesEditing([titleEntry], false);
assert.equal(
  titleEntry.element.querySelector(".vantage-title-primary")?.textContent,
  "经营数据",
  "the first line must remain the primary title after editing",
);
assert.equal(
  titleEntry.element.querySelector(".vantage-title-subtitle")?.textContent,
  "2026 H1 核心表现",
  "pressing Enter in a title must create a persisted subtitle line",
);
assert.deepEqual(
  collectTextEntries(discoverEditableText(titleDom.window.document)),
  [
    {
      id: "data:data-title:0",
      text: "经营数据\n2026 H1 核心表现",
    },
  ],
  "a structured title and subtitle must round-trip through rediscovery",
);
setEntriesEditing(discoverEditableText(titleDom.window.document), true);
assert.equal(
  titleEntry.element.textContent,
  "经营数据\n2026 H1 核心表现",
  "re-entering edit mode must restore title and subtitle as plain multiline text",
);

const richPasteDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-rich-paste">
      <p>第一段</p>
      <p>第二段</p>
    </section>
  </main>
</body>`);
const richPasteEntries = discoverEditableText(richPasteDom.window.document);
setEntriesEditing(richPasteEntries, true);
richPasteEntries[0].element.innerHTML =
  '更新 <b>加粗</b><span style="color:red">内容</span>';
const rediscoveredRichPasteEntries = discoverEditableText(
  richPasteDom.window.document,
);
assert.deepEqual(
  rediscoveredRichPasteEntries.map(({ id }) => id),
  ["data:data-rich-paste:0", "data:data-rich-paste:1"],
  "unexpected browser or paste wrappers must not shift managed text IDs",
);
assert.deepEqual(collectTextEntries(rediscoveredRichPasteEntries), [
  { id: "data:data-rich-paste:0", text: "更新 加粗内容" },
  { id: "data:data-rich-paste:1", text: "第二段" },
]);
richPasteEntries[0].element.textContent = "";
const rediscoveredEmptyManagedEntries = discoverEditableText(
  richPasteDom.window.document,
);
assert.deepEqual(
  rediscoveredEmptyManagedEntries.map(({ id }) => id),
  ["data:data-rich-paste:0", "data:data-rich-paste:1"],
  "clearing a managed field must preserve its text slot and following IDs",
);
assert.deepEqual(collectTextEntries(rediscoveredEmptyManagedEntries), [
  { id: "data:data-rich-paste:0", text: "" },
  { id: "data:data-rich-paste:1", text: "第二段" },
]);

globalThis.__VANTAGE_VIDEO_MANIFEST__ = {
  "previews/assets/video.mp4": {
    url: "https://blob.example/video.mp4",
    bytes: 6,
  },
  "previews/assets/video-2.mp4": {
    url: "https://blob.example/video-2.mp4",
    bytes: 4,
  },
};
assert.equal(
  resolveMediaUrl("/previews/assets/video.mp4"),
  "https://blob.example/video.mp4",
  "video paths must resolve through the public Vercel Blob manifest",
);
assert.equal(
  resolveMediaUrl(
    "/previews/assets/video.mp4?v=ppt-mapping-verified-20260730#opening",
  ),
  "https://blob.example/video.mp4",
  "cache-busting query strings and fragments must not prevent production video manifest lookup",
);
assert.equal(
  resolveMediaUrl("previews/assets/video.mp4", {
    hostname: "127.0.0.1",
  }),
  "/previews/assets/video.mp4",
  "local development must bypass a stale remote manifest and use the local video",
);
assert.equal(
  resolveMediaUrl("/previews/assets/video.mp4", {
    hostname: "localhost",
  }),
  "/previews/assets/video.mp4",
  "local video URLs must stay root-absolute from both shell and report pages",
);
assert.equal(
  resolveMediaUrl("previews/assets/missing.mp4"),
  "previews/assets/missing.mp4",
  "local development must keep an unmapped media path unchanged",
);

assert.deepEqual(listPresentationMedia(), [
  {
    path: "previews/assets/video.mp4",
    url: "https://blob.example/video.mp4",
    bytes: 6,
  },
  {
    path: "previews/assets/video-2.mp4",
    url: "https://blob.example/video-2.mp4",
    bytes: 4,
  },
]);

assert.equal(
  typeof VantageBrowserRuntime.progressivelyWarmPresentationMedia,
  "function",
  "the browser runtime must expose a progressive media warm-up queue",
);
if (
  typeof VantageBrowserRuntime.progressivelyWarmPresentationMedia ===
  "function"
) {
  const progressiveLoads = [];
  const progressiveEvents = [];
  let activeProgressiveLoads = 0;
  let peakProgressiveLoads = 0;
  const progressiveResult =
    await VantageBrowserRuntime.progressivelyWarmPresentationMedia({
      paths: [
        "previews/assets/video-2.mp4?v=warmup",
        "/previews/assets/video.mp4#modal",
        "previews/assets/video-2.mp4",
      ],
      connection: { effectiveType: "4g", saveData: false },
      loadMedia: async (entry) => {
        activeProgressiveLoads += 1;
        peakProgressiveLoads = Math.max(
          peakProgressiveLoads,
          activeProgressiveLoads,
        );
        progressiveLoads.push(entry.path);
        await Promise.resolve();
        activeProgressiveLoads -= 1;
        return "ready";
      },
      onProgress: (progress) => progressiveEvents.push(progress),
    });
  assert.deepEqual(progressiveLoads, [
    "previews/assets/video-2.mp4",
    "previews/assets/video.mp4",
  ]);
  assert.equal(
    peakProgressiveLoads,
    1,
    "background video warming must stay sequential to protect playback bandwidth",
  );
  assert.deepEqual(progressiveResult, {
    completed: 2,
    failed: 0,
    skipped: false,
    total: 2,
  });
  assert.equal(progressiveEvents.at(-1)?.status, "complete");

  let saveDataLoadCount = 0;
  const saveDataResult =
    await VantageBrowserRuntime.progressivelyWarmPresentationMedia({
      paths: ["previews/assets/video.mp4"],
      connection: { effectiveType: "4g", saveData: true },
      loadMedia: async () => {
        saveDataLoadCount += 1;
        return "ready";
      },
    });
  assert.equal(saveDataLoadCount, 0);
  assert.deepEqual(saveDataResult, {
    completed: 0,
    failed: 0,
    reason: "save-data",
    skipped: true,
    total: 1,
  });
}

const fetchedUrls = [];
const progressEvents = [];
const responseBodies = new Map([
  ["https://blob.example/video.mp4", new Uint8Array([1, 2, 3, 4, 5, 6])],
  ["https://blob.example/video-2.mp4", new Uint8Array([7, 8, 9, 10])],
]);
const warmResult = await warmPresentationMedia({
  fetchImpl: async (url, options) => {
    fetchedUrls.push({ url, options });
    return new Response(responseBodies.get(url), {
      status: 200,
      headers: { "content-length": String(responseBodies.get(url).byteLength) },
    });
  },
  onProgress: (progress) => progressEvents.push(progress),
});
assert.deepEqual(
  fetchedUrls.map(({ url }) => url),
  [
    "https://blob.example/video.mp4",
    "https://blob.example/video-2.mp4",
  ],
  "presentation warm-up should download every manifest video sequentially",
);
assert.ok(
  fetchedUrls.every(({ options }) => options.cache === "force-cache"),
  "presentation warm-up must prefer the browser's persistent HTTP cache",
);
assert.deepEqual(warmResult, {
  completed: 2,
  total: 2,
  loadedBytes: 10,
  totalBytes: 10,
});
assert.equal(progressEvents.at(-1).percent, 100);
assert.equal(progressEvents.at(-1).completed, 2);

const conflictDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-01"><p>Published text</p></section>
  </main>
</body>`);
const remoteConflictRow = {
  report_id: "vantage-h1",
  content: { texts: { "data:data-01:0": "Another viewer's text" } },
  version: 2,
  updated_at: "2026-07-30T12:00:00.000Z",
};
const conflictClient = {
  from() {
    const query = {
      action: "select",
      update() {
        this.action = "update";
        return this;
      },
      select() {
        return this;
      },
      eq() {
        return this;
      },
      async maybeSingle() {
        return { data: null, error: null };
      },
      async single() {
        return { data: remoteConflictRow, error: null };
      },
    };
    return query;
  },
};
const conflictController = new ReportContentController({
  document: conflictDom.window.document,
  client: conflictClient,
});
conflictController.session = { user: { id: "editor-1" } };
conflictController.ready = true;
conflictController.revision = {
  version: 1,
  texts: { "data:data-01:0": "Published text" },
};
conflictController.beginEditing();
const conflictEntry = conflictController.entries[0].element;
conflictEntry.textContent = "My unsaved draft";
conflictEntry.dispatchEvent(
  new conflictDom.window.InputEvent("input", { bubbles: true }),
);
await assert.rejects(
  conflictController.save(),
  /updated by another viewer/,
);
assert.equal(
  conflictEntry.textContent,
  "My unsaved draft",
  "a version conflict must never overwrite the editor's unsaved draft",
);
assert.equal(
  conflictController.revision.version,
  2,
  "after a conflict the next save should target the latest remote version",
);
assert.equal(conflictController.dirty, true);

const discardDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-01"><p>Original unpublished text</p></section>
  </main>
</body>`);
const discardController = new ReportContentController({
  document: discardDom.window.document,
  client: conflictClient,
});
discardController.ready = true;
discardController.beginEditing();
const discardEntry = discardController.entries[0].element;
discardEntry.textContent = "Unsaved local edit";
discardEntry.dispatchEvent(
  new discardDom.window.InputEvent("input", { bubbles: true }),
);
discardController.discard();
assert.equal(
  discardEntry.textContent,
  "Original unpublished text",
  "discard must restore every field to its pre-edit value, including fields absent from the stored revision",
);

console.log("Vantage browser editor DOM contract passed.");
