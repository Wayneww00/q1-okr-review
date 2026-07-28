(function () {
  "use strict";

  const theme = window.PREVIEW_THEME;
  const frame = document.getElementById("preview-frame");
  const loader = document.getElementById("preview-loader");
  const nameNode = document.getElementById("scheme-name");
  const descriptionNode = document.getElementById("scheme-description");

  if (!theme || !frame || !loader) {
    throw new Error("Preview theme configuration is incomplete.");
  }

  document.title = `${theme.name} · Vantage Q1 配色评审`;
  document.documentElement.style.setProperty("--scheme-primary", theme.primary);
  document.documentElement.style.setProperty("--scheme-secondary", theme.secondary);
  nameNode.textContent = theme.name;
  descriptionNode.textContent = theme.description;

  function replaceEverywhere(source, from, to) {
    return source.split(from).join(to);
  }

  function showError(error) {
    loader.innerHTML = `<div class="preview-error">预览加载失败：${String(error.message || error)}<br>请确认通过本地 HTTP 服务打开本文件。</div>`;
  }

  async function bootPreview() {
    const projectRoot = new URL("../", window.location.href);
    const sourceUrl = new URL("index.html", projectRoot);
    const response = await fetch(sourceUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`无法读取 index.html（HTTP ${response.status}）`);
    }

    let source = await response.text();
    for (const [from, to] of theme.replacements) {
      source = replaceEverywhere(source, from, to);
    }

    const previewHead = [
      `<base href="${projectRoot.href}">`,
      `<meta name="color-scheme" content="dark">`,
      `<style id="preview-theme-overrides">${theme.css}</style>`
    ].join("");

    source = source.replace("<head>", `<head>${previewHead}`);
    frame.addEventListener("load", function handleLoad() {
      loader.classList.add("is-hidden");
      window.__previewReady = true;
    }, { once: true });
    frame.srcdoc = source;
  }

  bootPreview().catch(showError);
}());

