import assert from "node:assert/strict";

import {
  buildTextId,
  createSavePayload,
  mergeRemoteRevision,
  normalizePlainText,
} from "../src/vantage-content-model.mjs";

assert.equal(
  normalizePlainText("第一行\r\n第二行\r第三行\u0000"),
  "第一行\n第二行\n第三行",
  "saved report text must contain only plain text with normalized line breaks",
);

assert.equal(
  buildTextId({ sectionId: "data", pageId: "data-01", index: 3 }),
  "data:data-01:3",
  "editable text IDs must be deterministic across viewers",
);

assert.deepEqual(
  createSavePayload({
    reportId: "vantage-h1",
    version: 4,
    userId: "user-1",
    entries: [
      { id: "data:data-01:0", text: "标题\r\n第二行" },
      { id: "o2:o2-overview:2", text: "  保留首尾空格  " },
      { id: "", text: "invalid" },
    ],
  }),
  {
    report_id: "vantage-h1",
    content: {
      texts: {
        "data:data-01:0": "标题\n第二行",
        "o2:o2-overview:2": "  保留首尾空格  ",
      },
    },
    version: 5,
    updated_by: "user-1",
  },
  "save payloads must preserve plain text and increment the optimistic version",
);

assert.deepEqual(
  mergeRemoteRevision({
    current: { version: 4, texts: { a: "本地草稿" } },
    incoming: { version: 5, texts: { a: "远端已发布" } },
    localDirty: true,
  }),
  {
    applied: { version: 4, texts: { a: "本地草稿" } },
    pending: { version: 5, texts: { a: "远端已发布" } },
    hasConflict: true,
  },
  "a realtime update must not overwrite an unsaved local draft",
);

assert.deepEqual(
  mergeRemoteRevision({
    current: { version: 4, texts: { a: "旧内容" } },
    incoming: { version: 5, texts: { a: "新内容" } },
    localDirty: false,
  }),
  {
    applied: { version: 5, texts: { a: "新内容" } },
    pending: null,
    hasConflict: false,
  },
  "viewers without local edits must immediately apply realtime updates",
);

console.log("Vantage content model contract passed.");
