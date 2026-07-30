export function normalizePlainText(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u0000/g, "");
}

export function buildTextId({ sectionId, pageId, index }) {
  return [sectionId, pageId, index].map((part) => String(part)).join(":");
}

export function createSavePayload({
  reportId,
  version,
  userId,
  entries,
}) {
  const texts = {};

  for (const entry of entries) {
    if (!entry?.id) continue;
    texts[String(entry.id)] = normalizePlainText(entry.text);
  }

  return {
    report_id: reportId,
    content: { texts },
    version: Number(version) + 1,
    updated_by: userId,
  };
}

export function mergeRemoteRevision({ current, incoming, localDirty }) {
  if (localDirty) {
    return {
      applied: current,
      pending: incoming,
      hasConflict: true,
    };
  }

  return {
    applied: incoming,
    pending: null,
    hasConflict: false,
  };
}
