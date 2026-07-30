import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "index.html"), "utf8");
const chapterThemePath = path.join(
  root,
  "previews",
  "h1-objective-chapters.css",
);
const chapterTheme = fs.existsSync(chapterThemePath)
  ? fs.readFileSync(chapterThemePath, "utf8")
  : "";

assert.match(
  app,
  /function ObjectiveChapterLayout\(\{code,eyebrow,title,description,milestones\}\)/,
  "O1, O2 and O3 must share one chapter layout component",
);
assert.match(
  app,
  /data-page-id="o1-chapter"[\s\S]*?<ObjectiveChapterLayout[\s\S]*?code="O1"[\s\S]*?title="将 Vantage 建设成全球一线品牌"/,
  "O1 must expose a dedicated title page with the approved title",
);
assert.match(
  app,
  /function O1ChapterPage\(\{index,count\}\)\{[\s\S]*?useOkrCanvasScale\(\{maxScale:1\}\)/,
  "the O1 chapter must use the same 1× maximum scale as the O2/O3 artboards",
);
assert.match(
  app,
  /<OkrFixedBackdrop\/>\s*<O1ChapterPage[\s\S]*?<OkrBrandSystemPage/,
  "the O1 title must render before the existing O1 content pages",
);
assert.match(
  app,
  /function O2ChapterPage\(\{page\}\)\{[\s\S]*?<ObjectiveChapterLayout[\s\S]*?code="O2"/,
  "O2 must use the shared chapter layout",
);
assert.match(
  app,
  /function O3Chapter\(\{page\}\)\{[\s\S]*?<ObjectiveChapterLayout[\s\S]*?code="O3"/,
  "O3 must use the shared chapter layout",
);

for (const className of [
  ".h1-objective-chapter",
  ".h1-objective-chapter-kicker",
  ".h1-objective-chapter-title",
  ".h1-objective-chapter-path",
  ".h1-objective-chapter.is-o1",
  ".h1-objective-chapter.is-o2",
  ".h1-objective-chapter.is-o3",
]) {
  assert.ok(
    chapterTheme.includes(className),
    `${className} must be defined by the shared chapter theme`,
  );
}

assert.match(
  chapterTheme,
  /\.h1-objective-chapter::before\s*\{[\s\S]*?content:\s*attr\(data-watermark\)/,
  "all three chapters must share one objective-number watermark treatment",
);
assert.match(
  chapterTheme,
  /\.h1-objective-chapter-title\s*\{[\s\S]*?font-size:\s*82px;[\s\S]*?line-height:\s*1\.08;/,
  "all three chapter titles must share the same readable type scale",
);

for (const [section, background] of [
  ["O1", "p68-trophy-background.png"],
  ["O2", "figma-desert-vantage-bg.png"],
  ["O3", "figma-vantage-trophy-bg.png"],
]) {
  assert.ok(
    app.includes(background) ||
      fs
        .readFileSync(
          path.join(
            root,
            "previews",
            section === "O3"
              ? "h1-o3-theme.css"
              : section === "O2"
                ? "h1-figma-racing-theme.css"
                : "h1-o1-complete-theme.css",
          ),
          "utf8",
        )
        .includes(background),
    `${section} must keep its own approved chapter background`,
  );
}

assert.match(
  app,
  /<div className="h1-okr-page-number"[^>]*>\s*\{String\(index\+1\)\.padStart\(2,'0'\)\}\s*<span>\/ \{String\(count\)\.padStart\(2,'0'\)\}<\/span>/,
  "the former O1 first page must use dynamic numbering after the new title",
);

console.log(
  "H1 shared O1/O2/O3 objective chapter structure and background contract passed.",
);
