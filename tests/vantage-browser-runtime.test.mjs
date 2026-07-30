import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import {
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
} from "../src/vantage-browser-runtime.mjs";

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
