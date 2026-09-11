import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import * as VantageBrowserRuntime from "../src/vantage-browser-runtime.mjs";

const {
  applyTextRevision,
  collectTextEntries,
  createLocalDevelopmentClient,
  createServerSessionClient,
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

const serverSession = {
  access_token: "cookie-session",
  user: { id: "shared-test-user", email: null },
};
const serverRequests = [];
const serverClient = createServerSessionClient({
  storage: localStorage,
  fetchImpl: async (url, options = {}) => {
    serverRequests.push({ url, options });
    if (options.method === "POST") {
      const credentials = JSON.parse(options.body);
      if (
        credentials.username !== "manual-account" ||
        credentials.password !== "manual-password"
      ) {
        return Response.json(
          { error: "Invalid credentials" },
          { status: 401 },
        );
      }
      return Response.json({ session: serverSession });
    }
    return Response.json({ session: serverSession });
  },
});
assert.equal(
  (
    await serverClient.auth.signInWithPassword({
      username: "manual-account",
      password: "incorrect",
    })
  ).error.message,
  "Invalid credentials",
);
const serverLogin = await serverClient.auth.signInWithPassword({
  username: "manual-account",
  password: "manual-password",
});
assert.equal(serverLogin.error, null);
assert.equal(serverLogin.data.session.user.id, "shared-test-user");
assert.equal(
  (await serverClient.auth.getSession()).data.session.user.id,
  "shared-test-user",
);
assert.equal(serverRequests[0].url, "/api/auth");
assert.equal(serverRequests[0].options.credentials, "same-origin");

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

const dataHeaderDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section
      data-report-page
      data-page-id="data-15"
      data-editor-revision="retail-nd-ppt-v4"
    >
      <header class="h1-extended-editorial-header">
        <div class="h1-extended-editorial-section">
          <span></span>
          <b
            data-vantage-header-field="eyebrow"
            data-vantage-single-line
          >整体数据 · RETAIL ND｜区域占比</b>
        </div>
        <h1
          data-vantage-header-field="title"
          data-vantage-single-line
        >原始大标题</h1>
        <p
          data-vantage-header-field="subtitle"
          data-vantage-text-key="header-subtitle"
          data-vantage-empty-editable
          data-vantage-single-line
        ></p>
      </header>
      <h2>图表标题</h2>
    </section>
  </main>
</body>`);
const dataHeaderEntries = discoverEditableText(dataHeaderDom.window.document);
assert.deepEqual(
  dataHeaderEntries.map(({ id }) => id),
  [
    "data:data-15@retail-nd-ppt-v4:0",
    "data:data-15@retail-nd-ppt-v4:1",
    "data:data-15@retail-nd-ppt-v4:header-subtitle",
    "data:data-15@retail-nd-ppt-v4:2",
  ],
  "an empty keyed subtitle must be editable without shifting existing text IDs",
);

applyTextRevision(dataHeaderEntries, {
  texts: {
    "data:data-15@retail-nd-ppt-v4:1":
      "Retail ND占比分享专题\n\nH1 Retail ND APAC -2.0% GS +0.5%",
  },
});
const dataHeaderTitle = dataHeaderDom.window.document.querySelector(
  '[data-vantage-header-field="title"]',
);
const dataHeaderSubtitle = dataHeaderDom.window.document.querySelector(
  '[data-vantage-header-field="subtitle"]',
);
assert.equal(
  dataHeaderTitle.textContent,
  "Retail ND占比分享专题",
  "legacy multiline data-page titles must keep only the first line as the main title",
);
assert.equal(
  dataHeaderSubtitle.textContent,
  "H1 Retail ND APAC -2.0% GS +0.5%",
  "legacy title continuation must migrate into the dedicated lower subtitle field",
);
assert.equal(
  dataHeaderTitle.classList.contains("vantage-title-with-subtitle"),
  false,
  "a migrated data-page title must no longer render an embedded subtitle",
);

setEntriesEditing(dataHeaderEntries, true);
dataHeaderSubtitle.textContent = "H1 Retail ND\nAPAC -2.0%";
assert.equal(
  collectTextEntries(dataHeaderEntries).find(
    ({ id }) => id.endsWith(":header-subtitle"),
  )?.text,
  "H1 Retail ND APAC -2.0%",
  "dedicated data-page header fields must persist as a single line",
);
dataHeaderSubtitle.textContent = "\n";
assert.equal(
  collectTextEntries(dataHeaderEntries).find(
    ({ id }) => id.endsWith(":header-subtitle"),
  )?.text,
  "",
  "a whitespace-only dedicated header field must persist as empty",
);

const indexedDataHeaderDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-13">
      <header class="h1-extended-editorial-header">
        <div class="h1-extended-editorial-section">
          <span></span>
          <b
            data-vantage-header-field="eyebrow"
            data-vantage-single-line
          >整体数据 GM Social Media</b>
        </div>
        <h1
          data-vantage-header-field="title"
          data-vantage-single-line
        >CFD 行业关注者份额</h1>
        <p
          data-vantage-header-field="subtitle"
          data-vantage-text-key="header-subtitle"
          data-vantage-empty-editable
          data-vantage-single-line
          data-vantage-legacy-indexed
        >VANTAGE MARKETS’ SHARE OF CFD INDUSTRY FOLLOWERS</p>
        <small>原始来源</small>
      </header>
      <h2>原始图表标题</h2>
    </section>
  </main>
</body>`);
const indexedDataHeaderEntries = discoverEditableText(
  indexedDataHeaderDom.window.document,
);
assert.deepEqual(
  indexedDataHeaderEntries.map(({ id, legacyId }) => ({
    id,
    legacyId: legacyId || null,
  })),
  [
    { id: "data:data-13:0", legacyId: null },
    { id: "data:data-13:1", legacyId: null },
    {
      id: "data:data-13:header-subtitle",
      legacyId: "data:data-13:2",
    },
    { id: "data:data-13:3", legacyId: null },
    { id: "data:data-13:4", legacyId: null },
  ],
  "a formerly indexed subtitle must retain its old slot while writing to a stable named key",
);
applyTextRevision(indexedDataHeaderEntries, {
  texts: {
    "data:data-13:1": "CFD 行业关注者份额\n新增下方说明",
    "data:data-13:2": "远端原有下方小标题",
    "data:data-13:3": "远端来源",
    "data:data-13:4": "远端图表标题",
  },
});
assert.equal(
  indexedDataHeaderDom.window.document.querySelector(
    '[data-vantage-header-field="title"]',
  ).textContent,
  "CFD 行业关注者份额",
);
assert.equal(
  indexedDataHeaderDom.window.document.querySelector(
    '[data-vantage-header-field="subtitle"]',
  ).textContent,
  "新增下方说明 · 远端原有下方小标题",
  "legacy title continuation and an existing lower subtitle must both survive migration",
);
assert.equal(
  indexedDataHeaderDom.window.document.querySelector("small").textContent,
  "远端来源",
  "a migrated subtitle must not take over the old source-text ID",
);
assert.equal(
  indexedDataHeaderDom.window.document.querySelector("h2").textContent,
  "远端图表标题",
  "a migrated subtitle must not shift the old chart-title ID",
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

const directMediaUrlCases = [
  {
    label: "https URL on localhost",
    path: "https://media.example/video.mp4?version=1#opening",
    hostname: "localhost",
    expected: "https://media.example/video.mp4?version=1#opening",
  },
  {
    label: "http URL on localhost",
    path: "http://media.example/video.mp4",
    hostname: "localhost",
    expected: "http://media.example/video.mp4",
  },
  {
    label: "protocol-relative URL on localhost",
    path: "//cdn.example/video.mp4",
    hostname: "localhost",
    expected: "//cdn.example/video.mp4",
  },
  {
    label: "data URL on localhost",
    path: "data:video/mp4;base64,AAAA",
    hostname: "localhost",
    expected: "data:video/mp4;base64,AAAA",
  },
  {
    label: "blob URL on localhost",
    path: "blob:https://localhost/video-id",
    hostname: "localhost",
    expected: "blob:https://localhost/video-id",
  },
  ...["", null, undefined].flatMap((path, index) =>
    ["localhost", "vantage-h1.vercel.app"].map((hostname) => ({
      label: `empty media input ${index + 1} on ${hostname}`,
      path,
      hostname,
      expected: "",
    })),
  ),
];
const failedDirectMediaUrlCases = directMediaUrlCases
  .map(({ label, path, hostname, expected }) => ({
    label,
    expected,
    actual: resolveMediaUrl(path, { hostname }),
  }))
  .filter(({ actual, expected }) => actual !== expected);
assert.deepEqual(
  failedDirectMediaUrlCases,
  [],
  `already-resolved and empty media URL cases must be safe:\n${JSON.stringify(
    failedDirectMediaUrlCases,
    null,
    2,
  )}`,
);

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

globalThis.__VANTAGE_VIDEO_MANIFEST__["previews/assets/string-video.mp4"] =
  "https://blob.example/string-video.mp4";
assert.equal(
  resolveMediaUrl("previews/assets/string-video.mp4", {
    hostname: "localhost",
  }),
  "https://blob.example/string-video.mp4",
  "string manifest entries must resolve on localhost",
);
delete globalThis.__VANTAGE_VIDEO_MANIFEST__["previews/assets/string-video.mp4"];

assert.equal(
  resolveMediaUrl("previews/assets/video.mp4", {
    hostname: "127.0.0.1",
  }),
  "https://blob.example/video.mp4",
  "local development must use a manifest mapping when the video is not available locally",
);

globalThis.__VANTAGE_VIDEO_MANIFEST__["previews/assets/relative-video.mp4"] = {
  url: "previews/assets/cdn/relative-video.mp4",
  bytes: 3,
};
assert.equal(
  resolveMediaUrl("/previews/assets/relative-video.mp4", {
    hostname: "localhost",
  }),
  "/previews/assets/cdn/relative-video.mp4",
  "relative manifest URLs must resolve from the site root on localhost",
);
delete globalThis.__VANTAGE_VIDEO_MANIFEST__["previews/assets/relative-video.mp4"];

assert.equal(
  resolveMediaUrl("previews/assets/missing.mp4", { hostname: "localhost" }),
  "/previews/assets/missing.mp4",
  "local development must fall back to a root-absolute path when the manifest has no mapping",
);
assert.equal(
  resolveMediaUrl("previews/assets/missing.mp4?version=1#closing", {
    hostname: "vantage-h1.vercel.app",
  }),
  "previews/assets/missing.mp4?version=1#closing",
  "production must preserve an unmapped relative media path",
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
  typeof VantageBrowserRuntime.setVideoSource,
  "function",
  "the browser runtime must attach an explicit MP4 source for Safari",
);
if (typeof VantageBrowserRuntime.setVideoSource === "function") {
  const mediaDom = new JSDOM("<!doctype html><body><video></video></body>");
  const mediaVideo = mediaDom.window.document.querySelector("video");
  let loadCalls = 0;
  mediaVideo.load = () => {
    loadCalls += 1;
  };
  VantageBrowserRuntime.setVideoSource(
    mediaVideo,
    "https://blob.example/video.mp4",
  );
  const mediaSource = mediaVideo.querySelector("source");
  assert.equal(mediaVideo.hasAttribute("src"), false);
  assert.equal(mediaSource?.getAttribute("src"), "https://blob.example/video.mp4");
  assert.equal(mediaSource?.getAttribute("type"), "video/mp4");
  assert.equal(loadCalls, 1);
}

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

const legacyConflictDom = new JSDOM(`<!doctype html><body>
  <main data-report-section="data">
    <section data-report-page data-page-id="data-13">
      <header class="h1-extended-editorial-header">
        <div class="h1-extended-editorial-section">
          <span></span>
          <b data-vantage-header-field="eyebrow" data-vantage-single-line>
            整体数据 GM Social Media
          </b>
        </div>
        <h1 data-vantage-header-field="title" data-vantage-single-line>
          原始标题
        </h1>
        <p
          data-vantage-header-field="subtitle"
          data-vantage-text-key="header-subtitle"
          data-vantage-empty-editable
          data-vantage-single-line
          data-vantage-legacy-indexed
        >原始下方小标题</p>
      </header>
      <h2>原始图表标题</h2>
    </section>
  </main>
</body>`);
const legacyConflictController = new ReportContentController({
  document: legacyConflictDom.window.document,
  client: conflictClient,
});
legacyConflictController.ready = true;
legacyConflictController.revision = {
  version: 1,
  texts: {
    "data:data-13:1": "旧标题\n旧标题续行",
    "data:data-13:2": "旧下方小标题",
    "data:data-13:3": "旧图表标题",
  },
};
applyTextRevision(
  legacyConflictController.refreshEntries(),
  legacyConflictController.revision,
);
legacyConflictController.beginEditing();
const legacyConflictTitle = legacyConflictDom.window.document.querySelector(
  '[data-vantage-header-field="title"]',
);
legacyConflictTitle.textContent = "未保存的本地标题";
legacyConflictTitle.dispatchEvent(
  new legacyConflictDom.window.InputEvent("input", { bubbles: true }),
);
legacyConflictController.handleRemoteRow({
  report_id: "vantage-h1",
  content: {
    texts: {
      "data:data-13:1": "新远端标题\n新远端标题续行",
      "data:data-13:2": "新远端下方小标题",
      "data:data-13:3": "新远端图表标题",
    },
  },
  version: 2,
  updated_at: "2026-07-31T12:00:00.000Z",
});
legacyConflictController.discard();
assert.equal(
  legacyConflictTitle.textContent,
  "新远端标题",
  "discarding after a conflict must apply the newer legacy-format title",
);
assert.equal(
  legacyConflictDom.window.document.querySelector(
    '[data-vantage-header-field="subtitle"]',
  ).textContent,
  "新远端标题续行 · 新远端下方小标题",
  "discarding after a conflict must rebuild the subtitle from the newer legacy-format revision",
);
assert.equal(
  legacyConflictDom.window.document.querySelector("h2").textContent,
  "新远端图表标题",
  "discarding after a conflict must keep downstream legacy IDs aligned",
);

console.log("Vantage browser editor DOM contract passed.");
