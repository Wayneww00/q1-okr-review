import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/julian/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
const baseUrl = process.env.H1_O3_TEST_URL || "http://127.0.0.1:4180";
const browser = await chromium.launch({ headless: true });
const expectedCopy = {
  "o3-retail-ftd": ["RETAIL · 整体表现", "越南 2026-H1 FTD 较2025 H2增长近三倍", "越南整体 FTD 绝对值较2025 H2增长 197.7%，FTD 越南占比提升 2.8 个百分点。"],
  "o3-retail-tv": ["RETAIL · 整体表现", "越南 2026-H1 TV 较2025 H2增长超过三倍", "越南整体 TV 绝对值较2025 H2增长 214%，TV 越南占比提升 1.9 个百分点。"],
  "o3-vn-record": ["越南增长", "越南 H1 增长，达到历史新高", "FTD 与 TV 同步突破；相对于区域其他品牌，越南不仅增速领先，PNL 表现也处于高位。"],
  "o3-seo": ["SEO · 搜索引擎优化", "越南SEO自然流量已经成为行业第一", "核心关键词和特色关键词Copytrading均成为行业第一，是Vantage增速最快的国家"],
  "o3-geo": ["GEO · 生成式引擎优化", "Vantage在越南GEO的品牌可见性是行业第一梯队", "7×24黄金交易相关话题在越南AI平台全面领先其它品牌"],
  "o3-aso": ["ASO · 应用商店优化", "越南ASO构建了无可撼动的行业领先地位", "评分、关键词及品牌可见度全面领先，形成自然增长长期优势"],
  "o3-growth-summary": ["本地增长引擎", "从品牌认知到本地增长引擎 · 越南", "搜索、GEO 与 ASO 共同建立可发现、可信任、可转化的本地增长基础。"],
  "o3-social-sov": ["SOCIAL MEDIA · 越南", "VN社媒声量排名行业第二", "SOV = Brand Total Mentions ÷ Total Mentions of all tracked brands. Ranked by Total-Mentions SOV. Location filter: Vietnam | Period: Jan 1, 12:00 AM – Jun 30, 11:59 PM 2026"],
  "o3-social-overview": ["VN SOCIAL MEDIA", "从品牌认知到本地增长引擎 · 越南", null],
  "o3-brand-sentiment": ["越南社交媒体", "2026 H1 品牌关键词情感", null],
  "o3-highlight-content": ["越南社交媒体", "热门内容亮点", null],
  "o3-local-growth-engine": ["越南社交媒体", "从品牌建设到本地增长引擎——越南", null],
  "o3-copy-trade": ["COPY TRADE · 越南", "全案营销 本地化的成功案例", null],
  "o3-local-content": ["本地化内容", "内容本地化：让本地内容真正走进用户心里", "本地日常场景 × 本地人物 × Master 绑定 × 真实 App 界面，形成低成本、可复制、可规模化的内容公式。"],
  "o3-online-offline": ["线上 × 线下", "越南线上线下联动：从传播到转化", "以城市内容连接线上传播与线下触点，让品牌势能进入真实用户旅程。"],
};
const runtimeStub = `
  (() => {
    const session = { user: { id: "o3-unified-title-test" } };
    const hasSession = () => localStorage.getItem("vantage-o3-title-test-auth") === "1";
    const client = {
      auth: {
        getSession: async () => ({ data: { session: hasSession() ? session : null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe() {} } },
        }),
      },
    };
    window.VantageBrowserRuntime = {
      getClient: () => client,
      getSession: async () => (hasSession() ? session : null),
      signIn: async () => {
        localStorage.setItem("vantage-o3-title-test-auth", "1");
        return session;
      },
      resolveMediaUrl: (path) => path,
      setVideoSource: (video, path) => {
        video.src = path;
      },
      progressivelyWarmPresentationMedia: async () => {},
      createReportController: () => ({
        initialize: async () => true,
        beginEditing() {},
        save: async () => {},
        discard() {},
        destroy() {},
      }),
    };
  })();
`;

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.route("**/vendor/vantage-runtime.js*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: runtimeStub,
    }),
  );
  await page.goto(
    `${baseUrl}/previews/vantage-h1-immersive.html?audit=o3-unified-title`,
    { waitUntil: "domcontentloaded" },
  );
  await page.locator("#loginSubmit").click();
  const reportScene = page.locator('.scene[data-label="Full Report"]');
  await reportScene.evaluate((scene) =>
    scene.scrollIntoView({ behavior: "instant", block: "start" }),
  );
  await page.waitForFunction(() =>
    document
      .querySelector('.scene[data-label="Full Report"]')
      ?.classList.contains("active"),
  );

  const reportFrame = page.locator("#reportFrame").contentFrame();
  await reportFrame.locator('body[data-h1-prepared="true"]').waitFor();
  const contentPages = reportFrame.locator(
    '[data-report-section="o3"] [data-report-page]:not([data-page-id="o3-chapter"]):not([data-page-id="o3-vn-key-insight"]):not([data-page-id="o3-india-chapter"])',
  );
  assert.equal(await contentPages.count(), 15);

  const states = [];
  for (let index = 0; index < 15; index += 1) {
    const contentPage = contentPages.nth(index);
    await contentPage.evaluate((node) =>
      window.scrollTo({
        top: node.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
    await page.waitForTimeout(60);
    assert.equal(
      await contentPage.locator(".h1-o3-page-header").count(),
      1,
      "each Vietnam content page must render exactly one shared title",
    );
    states.push(
      await contentPage.evaluate((node) => {
        const header = node.querySelector(".h1-o3-page-header");
        const eyebrow = header.querySelector(".h1-o3-eyebrow");
        const title = header.querySelector("h2");
        const description = header.querySelector("p");
        const headerStyle = getComputedStyle(header);
        const eyebrowStyle = getComputedStyle(eyebrow);
        const titleStyle = getComputedStyle(title);
        const descriptionStyle = description
          ? getComputedStyle(description)
          : null;
        const normalizedText = (element) =>
          element?.innerText.trim().replace(/\s+/g, " ") || null;
        return {
          pageId: node.dataset.pageId,
          copy: [
            normalizedText(eyebrow),
            normalizedText(title),
            normalizedText(description),
          ],
          top: headerStyle.top,
          left: headerStyle.left,
          width: headerStyle.width,
          borderLeftWidth: headerStyle.borderLeftWidth,
          eyebrowSize: eyebrowStyle.fontSize,
          titleSize: titleStyle.fontSize,
          titleLineHeight: titleStyle.lineHeight,
          descriptionSize: descriptionStyle?.fontSize || null,
          descriptionDescendantSizes: description
            ? [...description.querySelectorAll("*")].map(
                (element) => getComputedStyle(element).fontSize,
              )
            : [],
          titleOverflow: title.scrollWidth - title.clientWidth,
          hasRacingMark: Boolean(
            eyebrow.querySelector(".h1-o3-racing-mark"),
          ),
        };
      }),
    );
  }

  for (const state of states) {
    assert.deepEqual(
      state.copy,
      expectedCopy[state.pageId],
      `${state.pageId} must retain its approved title copy`,
    );
    assert.deepEqual(
      {
        top: state.top,
        left: state.left,
        width: state.width,
        borderLeftWidth: state.borderLeftWidth,
        eyebrowSize: state.eyebrowSize,
        titleSize: state.titleSize,
        titleLineHeight: state.titleLineHeight,
      },
      {
        top: "62px",
        left: "130px",
        width: "1660px",
        borderLeftWidth: "7px",
        eyebrowSize: "17px",
        titleSize: "48px",
        titleLineHeight: "55.2px",
      },
      `${state.pageId} must match the approved Retail title geometry`,
    );
    assert.equal(state.hasRacingMark, true);
    assert.ok(
      state.descriptionSize === null || state.descriptionSize === "19px",
      `${state.pageId} description must use the shared 19px style`,
    );
    assert.ok(
      state.descriptionDescendantSizes.every((size) => size === "19px"),
      `${state.pageId} nested description text must inherit the shared 19px style`,
    );
    assert.ok(
      state.titleOverflow <= 1,
      `${state.pageId} title must not overflow its shared header`,
    );
  }

  console.log(
    "H1 O3 all 15 content pages share the approved Vietnam title system.",
  );
} finally {
  await browser.close();
}
