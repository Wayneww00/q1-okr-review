import { createClient } from "@supabase/supabase-js";

import {
  buildTextId,
  createSavePayload,
  mergeRemoteRevision,
  normalizePlainText,
} from "./vantage-content-model.mjs";

const EDITABLE_SECTION_IDS = ["data", "o2", "o3"];
const EDITABLE_TEXT_SELECTOR = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "strong",
  "small",
  "em",
  "b",
  "i",
  "label",
  "li",
  "td",
  "th",
  "div",
].join(",");
const EDITOR_EXCLUSION_SELECTOR = [
  "button",
  "nav",
  "svg",
  "canvas",
  "video",
  "audio",
  "script",
  "style",
  "[aria-hidden='true']",
  "[data-editor-ignore]",
  ".h1-page-number",
  ".h1-o2-page-number",
  ".h1-o3-page-number",
  ".h1-okr-page-number",
  ".h1-extended-editorial-page-number",
].join(",");

let sharedClient = null;

function getRuntimeConfig() {
  return globalThis.__VANTAGE_CONFIG__ || {};
}

export function isLocalDevelopmentHost(hostname) {
  return ["127.0.0.1", "localhost", "::1"].includes(String(hostname || ""));
}

function isLocalDevelopment() {
  return isLocalDevelopmentHost(globalThis.location?.hostname);
}

export function createLocalDevelopmentClient({
  storage = globalThis.localStorage,
  expectedPassword = "vantage",
} = {}) {
  const sessionKey = "vantage-local-auth-session-v1";
  const contentKey = "vantage-local-report-content-v1";
  const authListeners = new Set();
  const reportListeners = new Set();
  const localSession = {
    access_token: "vantage-local-development",
    user: {
      id: "vantage-local-user",
      email: "vantage@localhost",
    },
  };

  const readJson = (key, fallback) => {
    try {
      const value = storage?.getItem?.(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };
  const writeJson = (key, value) => {
    try {
      storage?.setItem?.(key, JSON.stringify(value));
    } catch {
      // Local previews should remain usable when browser storage is unavailable.
    }
  };
  const readRow = () =>
    readJson(contentKey, {
      report_id: "vantage-h1",
      content: { texts: {} },
      version: 0,
      updated_at: null,
      updated_by: null,
    });

  class LocalReportQuery {
    constructor(action, payload = null) {
      this.action = action;
      this.payload = payload;
      this.filters = new Map();
    }

    select() {
      return this;
    }

    update(payload) {
      this.action = "update";
      this.payload = payload;
      return this;
    }

    eq(column, value) {
      this.filters.set(column, value);
      return this;
    }

    async single() {
      const row = readRow();
      if (
        this.filters.has("report_id") &&
        this.filters.get("report_id") !== row.report_id
      ) {
        return { data: null, error: new Error("Local report was not found.") };
      }
      return { data: row, error: null };
    }

    async maybeSingle() {
      const row = readRow();
      if (
        this.filters.has("report_id") &&
        this.filters.get("report_id") !== row.report_id
      ) {
        return { data: null, error: null };
      }
      if (
        this.filters.has("version") &&
        Number(this.filters.get("version")) !== Number(row.version)
      ) {
        return { data: null, error: null };
      }

      const nextRow = {
        ...row,
        ...this.payload,
        updated_at: new Date().toISOString(),
      };
      writeJson(contentKey, nextRow);
      for (const listener of reportListeners) {
        listener({ eventType: "UPDATE", new: nextRow, old: row });
      }
      return { data: nextRow, error: null };
    }
  }

  const client = {
    auth: {
      async signInWithPassword({ password }) {
        if (password !== expectedPassword) {
          return {
            data: { session: null },
            error: new Error("Invalid login credentials"),
          };
        }
        writeJson(sessionKey, localSession);
        for (const listener of authListeners) {
          listener("SIGNED_IN", localSession);
        }
        return { data: { session: localSession }, error: null };
      },
      async getSession() {
        return {
          data: { session: readJson(sessionKey, null) },
          error: null,
        };
      },
      onAuthStateChange(callback) {
        authListeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => authListeners.delete(callback),
            },
          },
        };
      },
    },
    from() {
      return new LocalReportQuery("select");
    },
    channel() {
      const channel = {
        listener: null,
        on(_event, _filter, callback) {
          this.listener = callback;
          return this;
        },
        subscribe(callback) {
          if (this.listener) reportListeners.add(this.listener);
          queueMicrotask(() => callback?.("SUBSCRIBED"));
          return this;
        },
      };
      return channel;
    },
    removeChannel(channel) {
      if (channel?.listener) reportListeners.delete(channel.listener);
    },
  };

  return client;
}

function requireRuntimeConfig() {
  const config = getRuntimeConfig();
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error("Vantage Supabase configuration is missing.");
  }
  return config;
}

export function getSupabaseClient() {
  if (sharedClient) return sharedClient;
  const runtimeConfig = getRuntimeConfig();
  if (
    isLocalDevelopment() &&
    (!runtimeConfig.supabaseUrl || !runtimeConfig.supabasePublishableKey)
  ) {
    sharedClient = createLocalDevelopmentClient({
      expectedPassword: runtimeConfig.loginPassword || "vantage",
    });
    return sharedClient;
  }
  const config = requireRuntimeConfig();
  sharedClient = createClient(
    config.supabaseUrl,
    config.supabasePublishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    },
  );
  return sharedClient;
}

export async function signInWithSharedCredentials({ username, password }) {
  const config = getRuntimeConfig();
  const expectedUsername = config.loginUsername || "vantage";
  if (normalizePlainText(username).trim() !== expectedUsername) {
    throw new Error("Invalid login credentials");
  }

  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email: config.loginEmail || "vantage@localhost",
    password,
  });
  if (error) throw error;
  return data.session;
}

export async function getCurrentSession() {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session;
}

export function resolveMediaUrl(
  path,
  { hostname = globalThis.location?.hostname || "" } = {},
) {
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  if (isLocalDevelopmentHost(hostname)) return `/${normalizedPath}`;
  const manifest = globalThis.__VANTAGE_VIDEO_MANIFEST__ || {};
  const manifestPath = normalizedPath.split(/[?#]/, 1)[0];
  const entry = manifest[manifestPath];
  if (typeof entry === "string") return entry;
  return entry?.url || path;
}

export function listPresentationMedia() {
  const manifest = globalThis.__VANTAGE_VIDEO_MANIFEST__ || {};
  const seenUrls = new Set();
  const media = [];

  for (const [path, value] of Object.entries(manifest)) {
    const entry =
      typeof value === "string"
        ? { url: value, bytes: 0 }
        : { url: value?.url, bytes: Number(value?.bytes || 0) };
    if (!entry.url || seenUrls.has(entry.url)) continue;
    seenUrls.add(entry.url);
    media.push({
      path,
      url: entry.url,
      bytes: entry.bytes,
    });
  }

  return media;
}

export async function warmPresentationMedia({
  fetchImpl = globalThis.fetch,
  onProgress = () => {},
  signal,
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("Browser fetch is unavailable.");
  }

  const media = listPresentationMedia();
  const total = media.length;
  const totalBytes = media.reduce((sum, entry) => sum + entry.bytes, 0);
  let completed = 0;
  let loadedBytes = 0;

  const emitProgress = (entry, fileBytes, status) => {
    const percent = totalBytes
      ? Math.min(100, (loadedBytes / totalBytes) * 100)
      : total
        ? (completed / total) * 100
        : 100;
    onProgress({
      completed,
      total,
      loadedBytes,
      totalBytes,
      fileBytes,
      path: entry?.path || "",
      url: entry?.url || "",
      percent,
      status,
    });
  };

  emitProgress(null, 0, total ? "starting" : "complete");

  for (const entry of media) {
    let fileBytes = 0;
    emitProgress(entry, fileBytes, "downloading");

    try {
      const response = await fetchImpl(entry.url, {
        cache: "force-cache",
        credentials: "omit",
        mode: "cors",
        signal,
      });
      if (!response.ok) {
        throw new Error(`Video request failed with HTTP ${response.status}.`);
      }

      if (response.body?.getReader) {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkBytes = value?.byteLength || 0;
          fileBytes += chunkBytes;
          loadedBytes += chunkBytes;
          emitProgress(entry, fileBytes, "downloading");
        }
      } else {
        const buffer = await response.arrayBuffer();
        fileBytes = buffer.byteLength;
        loadedBytes += fileBytes;
      }
    } catch (error) {
      error.mediaPath = entry.path;
      emitProgress(entry, fileBytes, "error");
      throw error;
    }

    completed += 1;
    emitProgress(entry, fileBytes, "ready");
  }

  return {
    completed,
    total,
    loadedBytes,
    totalBytes,
  };
}

function preloadMediaIntoBrowserCache(
  entry,
  {
    documentRef = globalThis.document,
    signal,
    timeoutMs = 45_000,
  } = {},
) {
  return new Promise((resolve) => {
    if (!documentRef?.body || signal?.aborted) {
      resolve(signal?.aborted ? "aborted" : "unavailable");
      return;
    }

    const video = documentRef.createElement("video");
    let settled = false;
    let timer;
    const finish = (status) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("error", onError);
      signal?.removeEventListener("abort", onAbort);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.remove();
      resolve(status);
    };
    const onReady = () => finish("ready");
    const onError = () => finish("error");
    const onAbort = () => finish("aborted");

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("aria-hidden", "true");
    video.style.cssText =
      "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9999px;bottom:0";
    video.addEventListener("canplaythrough", onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
    signal?.addEventListener("abort", onAbort, { once: true });
    timer = setTimeout(
      () => finish(video.readyState >= 2 ? "partial" : "timeout"),
      timeoutMs,
    );
    video.src = entry.url;
    documentRef.body.append(video);
    video.load();
  });
}

export async function progressivelyWarmPresentationMedia({
  paths = [],
  connection =
    globalThis.navigator?.connection ||
    globalThis.navigator?.mozConnection ||
    globalThis.navigator?.webkitConnection,
  loadMedia = preloadMediaIntoBrowserCache,
  onProgress = () => {},
  signal,
} = {}) {
  const mediaByPath = new Map(
    listPresentationMedia().map((entry) => [entry.path, entry]),
  );
  const seenPaths = new Set();
  const media = [];

  for (const path of paths) {
    const manifestPath = String(path || "")
      .replace(/^\/+/, "")
      .split(/[?#]/, 1)[0];
    const entry = mediaByPath.get(manifestPath);
    if (!entry || seenPaths.has(entry.path)) continue;
    seenPaths.add(entry.path);
    media.push(entry);
  }

  const total = media.length;
  const skipReason = connection?.saveData
    ? "save-data"
    : ["slow-2g", "2g"].includes(connection?.effectiveType)
      ? "slow-network"
      : "";
  if (skipReason) {
    return {
      completed: 0,
      failed: 0,
      reason: skipReason,
      skipped: true,
      total,
    };
  }

  let completed = 0;
  let failed = 0;
  onProgress({ completed, failed, status: "starting", total });

  for (const entry of media) {
    if (signal?.aborted) break;
    onProgress({
      completed,
      failed,
      path: entry.path,
      status: "downloading",
      total,
    });
    let status = "error";
    try {
      status = await loadMedia(entry, { signal });
    } catch (error) {
      if (signal?.aborted || error?.name === "AbortError") break;
    }
    if (status === "aborted") break;
    if (status === "error" || status === "timeout") failed += 1;
    else completed += 1;
    onProgress({
      completed,
      failed,
      path: entry.path,
      status,
      total,
    });
  }

  const result = { completed, failed, skipped: false, total };
  onProgress({ ...result, status: signal?.aborted ? "aborted" : "complete" });
  return result;
}

function elementHasOnlyTextAndBreaks(element) {
  if (element.hasAttribute("data-vantage-text-id")) return true;

  if ([...element.children].every((child) => child.tagName === "BR")) {
    return true;
  }
  return false;
}

function isExcludedElement(element) {
  return Boolean(element.closest(EDITOR_EXCLUSION_SELECTOR));
}

function elementPlainText(element) {
  const titlePrimary = [...element.children].find((child) =>
    child.classList.contains("vantage-title-primary"),
  );
  const titleSubtitle = [...element.children].find((child) =>
    child.classList.contains("vantage-title-subtitle"),
  );
  if (titlePrimary && titleSubtitle) {
    return normalizePlainText(
      `${elementPlainText(titlePrimary)}\n${elementPlainText(titleSubtitle)}`,
    );
  }

  const blockTags = new Set(["DIV", "P", "LI"]);
  let result = "";

  [...element.childNodes].forEach((node, index, nodes) => {
    if (node.nodeType === 3) result += node.nodeValue || "";
    if (node.nodeType !== 1) return;
    if (node.tagName === "BR") {
      result += "\n";
      return;
    }

    const isBlock = blockTags.has(node.tagName);
    if (isBlock && result && !result.endsWith("\n")) result += "\n";
    result += elementPlainText(node);
    if (isBlock && index < nodes.length - 1 && !result.endsWith("\n")) {
      result += "\n";
    }
  });

  return normalizePlainText(result);
}

function singleLinePlainText(value) {
  return normalizePlainText(value)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]*\n+[ \t]*/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function isTitleTextElement(element) {
  return Boolean(
    element.matches("h1,h2,h3,h4,h5,h6") ||
      element.closest("h1,h2,h3,h4,h5,h6"),
  );
}

function renderReadOnlyTitle(element, text) {
  const normalized = normalizePlainText(text)
    .replace(/\u00a0/g, " ")
    .replace(/\n+$/g, "");
  const [primaryText, ...subtitleLines] = normalized.split("\n");
  const subtitleText = subtitleLines.join("\n");

  if (!subtitleText.trim()) {
    element.textContent = normalized;
    element.classList.remove("vantage-title-with-subtitle");
    return;
  }

  const primary = element.ownerDocument.createElement("span");
  primary.className = "vantage-title-primary";
  primary.textContent = primaryText;
  const subtitle = element.ownerDocument.createElement("span");
  subtitle.className = "vantage-title-subtitle";
  subtitle.textContent = subtitleText;

  element.replaceChildren(primary, subtitle);
  element.classList.add("vantage-title-with-subtitle");
}

function setElementPlainText(element, text) {
  if (element.hasAttribute("data-vantage-single-line")) {
    element.textContent = singleLinePlainText(text);
    element.classList.remove("vantage-title-with-subtitle");
    return;
  }
  if (
    element.classList.contains("vantage-title-text") &&
    !element.hasAttribute("contenteditable")
  ) {
    renderReadOnlyTitle(element, text);
    return;
  }
  element.textContent = normalizePlainText(text);
}

export function discoverEditableText(document) {
  const entries = [];

  for (const sectionId of EDITABLE_SECTION_IDS) {
    const section = document.querySelector(
      `[data-report-section="${sectionId}"]`,
    );
    if (!section) continue;

    const pages = [...section.querySelectorAll("[data-report-page]")];
    const scopes = pages.length ? pages : [section];

    scopes.forEach((scope, scopeIndex) => {
      const pageId =
        scope.dataset.pageId || `${sectionId}-${String(scopeIndex + 1)}`;
      const pageRevision = scope.dataset.editorRevision;
      const versionedPageId = pageRevision
        ? `${pageId}@${pageRevision}`
        : pageId;
      let textIndex = 0;

      for (const element of scope.querySelectorAll(EDITABLE_TEXT_SELECTOR)) {
        if (element.parentElement?.closest("[data-vantage-text-id]")) continue;
        const isManaged = element.hasAttribute("data-vantage-text-id");
        const textKey = element.dataset.vantageTextKey?.trim();
        const acceptsEmpty = element.hasAttribute(
          "data-vantage-empty-editable",
        );
        if (!elementHasOnlyTextAndBreaks(element)) continue;
        if (isExcludedElement(element)) continue;
        if (
          !isManaged &&
          !acceptsEmpty &&
          !elementPlainText(element).trim()
        ) {
          continue;
        }

        const id = buildTextId({
          sectionId,
          pageId: versionedPageId,
          index: textKey || textIndex,
        });
        let legacyId = null;
        if (
          textKey &&
          element.hasAttribute("data-vantage-legacy-indexed")
        ) {
          legacyId = buildTextId({
            sectionId,
            pageId: versionedPageId,
            index: textIndex,
          });
          textIndex += 1;
        } else if (!textKey) {
          textIndex += 1;
        }
        element.dataset.vantageTextId = id;
        element.classList.add("vantage-managed-text");
        if (isTitleTextElement(element)) {
          element.classList.add("vantage-title-text");
        }
        entries.push({ id, legacyId, element });
      }
    });
  }

  return entries;
}

export function setEntriesEditing(entries, editing) {
  for (const { element } of entries) {
    const isTitle = element.classList.contains("vantage-title-text");
    const isSingleLine = element.hasAttribute("data-vantage-single-line");
    const currentText =
      isTitle || isSingleLine ? elementPlainText(element) : "";
    if (editing) {
      if (isTitle || isSingleLine) {
        element.textContent = isSingleLine
          ? singleLinePlainText(currentText)
          : currentText;
        element.classList.remove("vantage-title-with-subtitle");
      }
      element.setAttribute("contenteditable", "plaintext-only");
      element.setAttribute("spellcheck", "false");
      element.classList.add("vantage-editable-text");
    } else {
      element.removeAttribute("contenteditable");
      element.removeAttribute("spellcheck");
      element.classList.remove("vantage-editable-text");
      if (isSingleLine) {
        setElementPlainText(element, currentText);
      } else if (isTitle) {
        renderReadOnlyTitle(element, currentText);
      }
    }
  }
}

export function collectTextEntries(entries) {
  return entries.map(({ id, element }) => {
    let text = elementPlainText(element);
    if (element.hasAttribute("data-vantage-single-line")) {
      text = singleLinePlainText(text);
    } else if (element.classList.contains("vantage-title-text")) {
      text = text.replace(/\u00a0/g, " ").replace(/\n+$/g, "");
    }
    return { id, text };
  });
}

export function applyTextRevision(entries, content) {
  const texts = content?.texts || {};
  const resolvedTexts = new Map();

  for (const entry of entries) {
    if (Object.hasOwn(texts, entry.id)) {
      resolvedTexts.set(entry.id, texts[entry.id]);
    } else if (entry.legacyId && Object.hasOwn(texts, entry.legacyId)) {
      resolvedTexts.set(entry.id, texts[entry.legacyId]);
    }
  }

  for (const titleEntry of entries) {
    if (
      titleEntry.element.dataset.vantageHeaderField !== "title" ||
      !Object.hasOwn(texts, titleEntry.id)
    ) {
      continue;
    }

    const lines = normalizePlainText(texts[titleEntry.id])
      .replace(/\u00a0/g, " ")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) continue;

    const header = titleEntry.element.closest(
      ".h1-extended-editorial-header",
    );
    const subtitleEntry = entries.find(
      ({ element }) =>
        element.dataset.vantageHeaderField === "subtitle" &&
        element.closest(".h1-extended-editorial-header") === header,
    );
    resolvedTexts.set(titleEntry.id, lines[0]);
    if (subtitleEntry && !Object.hasOwn(texts, subtitleEntry.id)) {
      const continuation = lines.slice(1).join(" ");
      const existingSubtitle = singleLinePlainText(
        resolvedTexts.has(subtitleEntry.id)
          ? resolvedTexts.get(subtitleEntry.id)
          : elementPlainText(subtitleEntry.element),
      );
      resolvedTexts.set(
        subtitleEntry.id,
        existingSubtitle && existingSubtitle !== continuation
          ? `${continuation} · ${existingSubtitle}`
          : continuation,
      );
    }
  }

  for (const { id, element } of entries) {
    if (resolvedTexts.has(id)) {
      setElementPlainText(element, resolvedTexts.get(id));
    }
  }
}

function revisionFromRow(row) {
  return {
    version: Number(row?.version || 0),
    texts: row?.content?.texts || {},
  };
}

export class ReportContentController {
  constructor({
    document,
    reportId = "vantage-h1",
    client = getSupabaseClient(),
  }) {
    this.document = document;
    this.reportId = reportId;
    this.client = client;
    this.entries = [];
    this.session = null;
    this.channel = null;
    this.revision = { version: 0, texts: {} };
    this.pendingRevision = null;
    this.editingSnapshot = null;
    this.editing = false;
    this.dirty = false;
    this.ready = false;
    this.inputHandler = (event) => {
      const element = event.target?.closest?.("[data-vantage-text-id]");
      if (!element) return;
      if (element.hasAttribute("data-vantage-single-line")) {
        const currentText = elementPlainText(element);
        const normalizedText = singleLinePlainText(currentText);
        if (normalizedText !== currentText) {
          element.textContent = normalizedText;
          const selection = element.ownerDocument.defaultView?.getSelection();
          const range = element.ownerDocument.createRange();
          range.selectNodeContents(element);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        element.classList.remove("vantage-title-with-subtitle");
      } else if (element.classList.contains("vantage-title-text")) {
        element.classList.toggle(
          "vantage-title-with-subtitle",
          elementPlainText(element).includes("\n"),
        );
      }
      this.dirty = true;
      this.emit("editing", { dirty: true });
    };
    this.beforeInputHandler = (event) => {
      const element = event.target?.closest?.(
        "[data-vantage-text-id][data-vantage-single-line]",
      );
      if (
        element &&
        ["insertParagraph", "insertLineBreak"].includes(event.inputType)
      ) {
        event.preventDefault();
      }
    };
    this.keydownHandler = (event) => {
      const element = event.target?.closest?.(
        "[data-vantage-text-id][data-vantage-single-line]",
      );
      if (element && event.key === "Enter") event.preventDefault();
    };
  }

  emit(status, extra = {}) {
    const view = this.document.defaultView;
    view?.dispatchEvent(
      new view.CustomEvent("vantage-editor-status", {
        detail: {
          status,
          ready: this.ready,
          editing: this.editing,
          dirty: this.dirty,
          version: this.revision.version,
          ...extra,
        },
      }),
    );
  }

  refreshEntries() {
    this.entries = discoverEditableText(this.document);
    return this.entries;
  }

  async initialize() {
    this.emit("connecting");
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      this.emit("awaiting-auth");
      return false;
    }
    await this.activateSession(data.session);
    return true;
  }

  async activateSession(session) {
    this.session = session;
    await this.loadLatest();
    this.subscribe();
    this.ready = true;
    this.emit("ready");
  }

  async fetchLatestRevision() {
    const { data, error } = await this.client
      .from("report_content")
      .select("report_id, content, version, updated_at")
      .eq("report_id", this.reportId)
      .single();
    if (error) throw error;
    return revisionFromRow(data);
  }

  async loadLatest() {
    this.revision = await this.fetchLatestRevision();
    this.pendingRevision = null;
    applyTextRevision(this.refreshEntries(), this.revision);
    return this.revision;
  }

  subscribe() {
    if (this.channel) this.client.removeChannel(this.channel);
    this.channel = this.client
      .channel(`report-content-${this.reportId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "report_content",
          filter: `report_id=eq.${this.reportId}`,
        },
        (payload) => this.handleRemoteRow(payload.new),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") this.emit("live");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          this.emit("reconnecting");
        }
      });
  }

  handleRemoteRow(row) {
    const incoming = revisionFromRow(row);
    if (incoming.version <= this.revision.version) return;

    const result = mergeRemoteRevision({
      current: this.revision,
      incoming,
      localDirty: this.dirty,
    });
    this.revision = result.applied;
    this.pendingRevision = result.pending;

    if (result.hasConflict) {
      this.emit("remote-conflict", { pendingVersion: incoming.version });
      return;
    }

    applyTextRevision(this.refreshEntries(), this.revision);
    this.emit("updated");
  }

  beginEditing() {
    if (!this.ready) throw new Error("Report content is not ready.");
    this.editing = true;
    this.dirty = false;
    const entries = this.refreshEntries();
    this.editingSnapshot = Object.fromEntries(
      collectTextEntries(entries).map(({ id, text }) => [id, text]),
    );
    setEntriesEditing(entries, true);
    this.document.addEventListener("input", this.inputHandler, true);
    this.document.addEventListener(
      "beforeinput",
      this.beforeInputHandler,
      true,
    );
    this.document.addEventListener("keydown", this.keydownHandler, true);
    this.emit("editing");
  }

  async save() {
    if (!this.session?.user?.id) throw new Error("Authentication required.");
    this.emit("saving");

    const payload = createSavePayload({
      reportId: this.reportId,
      version: this.revision.version,
      userId: this.session.user.id,
      entries: collectTextEntries(this.refreshEntries()),
    });

    const { data, error } = await this.client
      .from("report_content")
      .update(payload)
      .eq("report_id", this.reportId)
      .eq("version", this.revision.version)
      .select("report_id, content, version, updated_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      this.revision = await this.fetchLatestRevision();
      this.pendingRevision = null;
      this.dirty = true;
      this.emit("save-conflict");
      throw new Error("The report was updated by another viewer.");
    }

    this.revision = revisionFromRow(data);
    this.pendingRevision = null;
    this.dirty = false;
    this.finishEditing();
    applyTextRevision(this.refreshEntries(), this.revision);
    this.emit("saved");
    return this.revision;
  }

  discard() {
    const editingSnapshot = this.editingSnapshot || {};
    this.dirty = false;
    if (this.pendingRevision) {
      this.revision = this.pendingRevision;
      this.pendingRevision = null;
    }
    const restoredTexts = {
      ...editingSnapshot,
      ...this.revision.texts,
    };
    const entries = this.refreshEntries();
    for (const entry of entries) {
      if (
        !entry.element.dataset.vantageTextKey ||
        Object.hasOwn(this.revision.texts, entry.id)
      ) {
        continue;
      }
      const header = entry.element.closest(
        ".h1-extended-editorial-header",
      );
      const titleEntry = entries.find(
        ({ element }) =>
          element.dataset.vantageHeaderField === "title" &&
          element.closest(".h1-extended-editorial-header") === header,
      );
      const remoteTitleLines = titleEntry
        ? normalizePlainText(this.revision.texts[titleEntry.id])
            .split("\n")
            .filter((line) => line.trim())
        : [];
      const hasLegacyValue =
        entry.legacyId &&
        Object.hasOwn(this.revision.texts, entry.legacyId);
      if (hasLegacyValue || remoteTitleLines.length > 1) {
        delete restoredTexts[entry.id];
      }
    }
    this.finishEditing();
    applyTextRevision(this.refreshEntries(), {
      texts: restoredTexts,
    });
    this.emit("discarded");
  }

  finishEditing() {
    this.editing = false;
    this.editingSnapshot = null;
    this.document.removeEventListener("input", this.inputHandler, true);
    this.document.removeEventListener(
      "beforeinput",
      this.beforeInputHandler,
      true,
    );
    this.document.removeEventListener("keydown", this.keydownHandler, true);
    setEntriesEditing(this.refreshEntries(), false);
  }

  destroy() {
    this.finishEditing();
    if (this.channel) this.client.removeChannel(this.channel);
    this.channel = null;
  }
}

export const VantageBrowserRuntime = {
  createReportController(options) {
    return new ReportContentController(options);
  },
  getClient: getSupabaseClient,
  getSession: getCurrentSession,
  listPresentationMedia,
  progressivelyWarmPresentationMedia,
  resolveMediaUrl,
  signIn: signInWithSharedCredentials,
  warmPresentationMedia,
};

if (typeof window !== "undefined") {
  window.VantageBrowserRuntime = VantageBrowserRuntime;
}
