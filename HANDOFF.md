# Vantage H1 Review 2026 — 研发交接

最后更新：2026-07-31

GitHub 仓库：<https://github.com/songchunhui513-bit/q1-okr-review>

协作分支：`codex/h1-review-handoff`

Draft PR：<https://github.com/songchunhui513-bit/q1-okr-review/pull/1>

原始开发机路径：`/Users/julian/Q1汇报`。该绝对路径只用于定位原始工作区，不是运行要求。

正式预览：

```text
http://127.0.0.1:4180/previews/vantage-h1-immersive.html
```

## 新协作者快速开始

```bash
git clone https://github.com/songchunhui513-bit/q1-okr-review.git
cd q1-okr-review
git switch codex/h1-review-handoff
git lfs install
git lfs pull
npm ci
VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build
python3 -m http.server 4180 --bind 127.0.0.1
```

浏览器打开上面的正式预览地址。本地环境固定用户名和密码均为 `vantage`；localhost 会使用浏览器本地存储模拟登录与正文编辑，不会写入 Supabase。

协作约定：

- 不直接在 `main` 上开发；从最新协作分支创建 `codex/<主题>` 分支，通过 PR 合并。
- 开工前执行 `git pull --ff-only`，提交前至少执行 `npm test` 和与改动页面对应的专项测试。
- `index.html` 同时承担页面注册、内容和渲染，是最容易冲突的文件；多人修改时按 O1、O2、O3 或运行时拆分负责人。
- 不提交 `runtime-config.js`、真实 Supabase 配置、`.env*.local`、`config/video-manifest.json` 或 `dist/`。
- 图片进入对应章节目录；大型视频不要直接 `git add -f`，按“视频资源交付”一节处理。
- Commit 使用 `feat:`、`fix:`、`test:`、`docs:` 等简短前缀，PR 正文写清影响页面和实际执行的测试。

## 本次交接增量

- 登录页同时预加载开场和第二屏视频，并展示真实的成功/失败进度；历史 session 不再绕过手动登录。
- 点击 Sign In 时在用户手势内申请开场有声播放，认证失败会停止并复位视频。
- 登录后按固定顺序、单文件串行预热 8 个 O1 TVC；节省流量模式和 2G 网络自动跳过，退出时可中止。
- O2“SEO 技术基础”页按 PPT 重做截图裁切、品牌标识、VS 徽章和四列指标区，页面被排除在 Supabase 文本编辑之外。
- O2 ASO 第 18–19 页恢复为可持久化正文编辑，PPT 构图和四列证据结构保持不变。
- O2 第 21 页保留三列 LTV/CAC 文本槽，第 25 页保留“荷兰市场验证”标签，避免编辑器槽位因生成式数组或独立证明卡发生漂移。
- 生产构建现在会复制完整 `previews/ai-data-products/` 模块。
- 媒体清单解析会忽略 URL 查询参数，带缓存版本的本地路径仍能命中 CDN manifest。

## 当前版本

当前版本已合入完整 O1、独立 AI 数据产品场景，以及 `/Users/julian/Downloads/ND_H1_Retail_v3_兼容版本.pptx` 的 8 张 ND Retail 页面。新增页面位于“关注者增长趋势对比”之后、O1 章节标题之前；原稿文案和显示数据保持不变，水印未保留。

统一报告现在共 95 页，顺序固定为：

```text
数据 22 页（原 14 页 + ND Retail 8 页）
→ O1 31 页（章节标题页 + 30 页内容）
→ O2 25 页
→ O3 17 页（包含现有“越南关键洞察”页）
```

关键边界：

```text
data-14（关注者增长趋势对比）
→ data-15 … data-22（ND Retail）
→ o1-chapter（O1 01 / 31）
→ okr-review（O1 02 / 31）
→ …
→ okr-premium-unlimited（O1 31 / 31）
→ o2-chapter（O2 以全面增长为核心）
→ o2-seo-chapter（2026 H1 SEO）
→ …
→ o2-ib-loop（O2 最后一页）
→ o3-chapter（O3 越南标题页）
→ o3-retail-ftd（O3 第一页数据）
```

### AI 数据产品外层场景

AI 数据产品位于：

```text
previews/ai-data-products/
```

该目录从已确认源目录原样复制，共 1 个独立 HTML 和 28 个图片资源，约 32 MB。模块保留：

- 驾驶舱 Dashboard、眼脑手 Dashboard、工具百宝箱 3 个主产品；
- 工具百宝箱中的 8 个 AI 工具；
- 横向浏览、卡片翻转、工具弹窗、键盘和触控交互；
- 10 个使用新窗口打开的外部产品 Demo 链接。

外层顺序和页码为：

```text
Opening Film（01 / 06，开场不显示页码）
→ H1 Review（02 / 06）
→ Full Report（03 / 06）
→ AI Data Products（04 / 06）
→ Q3 Outlook（05 / 06）
→ Closing Film（06 / 06）
```

AI 模块通过同源 iframe 隔离，不增加或改写 Full Report 的 95 页，也不接入 Supabase 文本编辑。iframe 在进入 `AI Data Products` 场景前不加载，避免开场阶段提前请求约 15.5 MB 的 AI 图片。垂直滚轮、PageUp/PageDown 和上下方向键负责离开 AI 场景；横向滚轮与横向触摸继续由模块内部产品卡片使用。卡片聚焦时的空格键仍只负责翻转卡片，工具百宝箱弹窗打开时外层翻页会暂停。

当前关键缓存版本：

```text
报告运行时：20260731-progressive-video-cache-v1
沉浸式壳运行时：20260731-editor-hud-v6-media
正式主题：20260731-seo-technical-ppt-v3
报告 iframe：20260731-o1-new-merge-v1
```

### ND Retail 8 页

新增页码与内容：

```text
15 H1 Retail ND 占比整体表现
16 Sales 端 IB 数据表现
17 APAC 下降问题过渡
18 越南 Retail ND
19 Marketing 价值归因问题过渡
20 MIB 口径变化与 Retail 转 IB
21 H2 印度过渡
22 H2 Retail ND 32% 目标
```

5 张数据页均使用原生 HTML/SVG 重绘；3 张纯文字页使用一次性入场、扫描线与页序动效，并支持 `prefers-reduced-motion`。正文标题、说明与问题文案接入现有 Supabase“编辑正文”；SVG 图表、图表内部数据标签和页码通过 `data-editor-ignore` / 编辑器排除规则保护。

### 媒体黑屏修复

完整 O1 首次合入后，单个标签会立即解码约 370 MB 图片，其中 O1 约 300 MB；外层还会同时解码 3 个 4K 视频的帧缓冲。内置浏览器打开两个报告标签时，媒体/GPU占用会超过 1 GB，浏览器可能丢弃图片和视频纹理，只留下导航、页码和黑色背景。

当前修复：

- O1 大图只在当前页及相邻页保留 `src`，离开较远页面后释放；
- 登录页只预加载开场和第二屏视频，且不在登录遮罩后静默播放；
- 片尾视频进入片尾时才加载；
- 登录成功 6 秒后串行预热 8 个 O1 TVC，不会并行抢占开场和第二屏带宽；
- O1 初始解码图片由约 299.5 MiB 降到 15.8 MiB；
- O1 第 26 页激活时，O1 解码图片约 36.5 MiB。

对应回归测试：

```bash
node tests/check-h1-media-memory-budget-runtime.mjs
```

修改媒体加载策略后必须同时验证开场、第二屏有声播放、片尾、O1 首张内容页和 O1 第 26 张内容页。不要把 O1 图片重新改回全量 `loading="eager"`，也不要让三个 4K 视频同时使用 `preload="auto"`。

线上部署时继续保持“关键资源先行、图片窗口化、视频分阶段加载”。生产 CDN 必须支持 MP4 Range 请求、正确的 `video/mp4` MIME 和版本化长期缓存。当前片尾 4K 文件约 82 MB，尚无 poster；弱网首次进入片尾可能短暂等待首帧。正式上线前建议补片尾 poster，并在进入 Executive Snapshot 时开始预热片尾视频，而不是在登录页加载全部 4K 媒体。

## O1 合入范围

`O1ChapterPage` 是独立的 O1 章节标题页；`index.html` 中的 `OKR_FIGMA_PAGES` 继续管理后续 30 页内容：

1. `okr-review`
2. `okr-brand-experience-audit`
3. `okr-brand-results`
4. `okr-brand-refresh`
5. `okr-brand-operating-system`
6. `okr-tvc-matrix`
7. `okr-tvc-framework`
8. `okr-tvc-library`
9. `okr-application-roadmap`
10. `okr-high-value-actions`
11. `okr-awards`
12. `okr-offline-event-01`
13. `okr-offline-event-02`
14. `okr-elite-client-identity`
15. `okr-client-experience-model`
16. `okr-client-experience-cases`
17. `okr-elite-client-no1-experience`
18. `okr-elite-endorsement-resources`
19. `okr-elite-ferrari-experience`
20. `okr-elite-black-label`
21. `okr-elite-business-enablement`
22. `okr-merchandise`
23. `okr-cfd-public-good`
24. `okr-public-good-video`
25. `okr-un-ngo-engagement`
26. `okr-ai-recommendation`
27. `okr-omnichannel-amplification`
28. `okr-tvc-localization`
29. `okr-superapp-activation`
30. `okr-premium-unlimited`

O1 专属样式：

```text
previews/h1-o1-complete-theme.css
```

O1 专属图片资源：

```text
previews/assets/o1-complete/figma-untitled/
previews/assets/o1-complete/figma-exact/
```

共 117 个文件，约 142 MB。资源使用独立目录，没有覆盖当前数据、O2 或 O3 资源。

O1 页面当前引用 15 个本地 TVC，路径为：

```text
previews/assets/o1-complete/tvc-library/
```

其中 8 个视频用于 TVC 弹窗，另外 7 个用于独立内容页和本地化矩阵。弹窗保留自动播放、原生控制、关闭清理与全屏能力。该目录约 1.5 GB，不随普通 Git 提交分发，具体交付方式见下一节。

## 视频资源交付

GitHub 只通过 Git LFS 保存沉浸式壳的 3 个主视频：

```text
previews/assets/vantage-h1-opening-final-4k.mp4
previews/assets/vantage-h1-second-screen-july28-sound-4k.mp4
previews/assets/vantage-h1-closing-sp-4k.mp4
```

O1 的 `tvc-library/*.mp4` 默认受 `.gitignore` 排除。新协作者若要完整本地播放，需要从项目共享素材包取得该目录，并保持文件名和相对路径不变。生产环境建议通过被忽略的 `config/video-manifest.json` 将相对路径映射到 CDN，例如：

```json
{
  "previews/assets/o1-complete/tvc-library/usp.mp4": {
    "url": "https://cdn.example.com/vantage/usp.mp4"
  }
}
```

Manifest 的 key 不带查询参数；运行时会自动去掉 `?v=...` 后匹配。不要把真实 CDN 地址、签名参数或内部凭据提交到仓库。生产 CDN 必须支持 Range 请求并返回正确的 `video/mp4` MIME。

## 文件职责

| 路径 | 职责 |
| --- | --- |
| `previews/vantage-h1-immersive.html` | 正式入口、登录、开场/第二屏/片尾视频、整页导航、报告 iframe。 |
| `previews/ai-data-products/` | 独立 AI 数据产品场景、28 个本地图片资源及模块内部交互。 |
| `index.html` | 数据、O1、O2、O3 的注册表与页面渲染。 |
| `src/vantage-browser-runtime.mjs` | 登录、Supabase/本地适配、媒体 URL 解析、媒体预热和正文编辑运行时。 |
| `scripts/build-production.mjs` | 生成 `vendor/`、`runtime-config.js` 和 `dist/`，复制生产所需静态资源。 |
| `previews/h1-figma-racing-theme.css` | 当前报告基础主题。 |
| `previews/h1-o1-complete-theme.css` | 本轮完整 O1 的隔离样式。 |
| `previews/h1-o3-theme.css` | O3 样式。 |
| `previews/assets/o1-complete/` | 本轮完整 O1 的隔离图片资源。 |
| `previews/assets/o1-complete/tvc-library/` | O1 实际播放视频；本地素材，不随普通 Git 提交分发。 |
| `config/video-manifest.json` | 可选的生产 CDN 映射；被 Git 忽略，不得包含密钥。 |
| `tests/check-h1-o2-seo-technical-ppt.mjs` | O2 SEO 技术页文案、结构、品牌图和 PPT 几何契约。 |
| `tests/check-h1-o2-aso-ppt-restoration.mjs` | O2 ASO 18–19 页 PPT 构图和正文可编辑契约。 |
| `tests/check-h1-o2-editor-layout-regression.mjs` | O2 第 21/25 页编辑器文本槽与布局回归契约。 |
| `tests/check-h1-video-loading-policy.mjs` | 登录预载、O1 串行预热和全量 manifest 禁用契约。 |
| `tests/check-h1-nd-retail-eight-pages.mjs` | ND Retail 8 页、原稿数据、原生图表、样式、缓存和编辑器排除静态契约。 |
| `tests/check-h1-nd-retail-eight-pages-runtime.mjs` | 22/31/25/17、95 页、Supabase 编辑态、无重叠与 data-22 → O1 边界运行时契约。 |
| `tests/check-h1-o1-full-folder-merge.mjs` | 22/31/25/17、95 页、顺序和资源静态契约。 |
| `tests/check-h1-o1-full-folder-runtime.mjs` | O1 标题页 + 30 页内容的浏览器渲染、图片完整性和边界。 |
| `tests/check-h1-okr-shell-paging-runtime.mjs` | 沉浸式壳中的数据→O1→O2 翻页边界。 |
| `tests/check-h1-ai-data-products-integration.mjs` | AI 模块精确资源清单、延迟加载、场景顺序、页码、外链和导航桥静态契约。 |
| `tests/check-h1-ai-data-products-runtime.mjs` | AI 模块延迟加载、3+8 卡片、聚焦空格翻转、弹窗、横向手势归属与外层前后翻页运行时契约。 |

页面本身是静态 HTML，但全新 clone 需要 `npm ci` 并运行一次构建来生成被忽略的 `vendor/` 和 `runtime-config.js`。若 4180 未启动：

```bash
python3 -m http.server 4180 --bind 127.0.0.1
```

## 验证

本轮交付前通过：

```bash
node tests/check-h1-nd-retail-eight-pages.mjs
node tests/check-h1-nd-retail-eight-pages-runtime.mjs
node tests/check-h1-appended-social-pages.mjs
node tests/check-h1-o4-combined-brand-page.mjs
node tests/check-h1-social-ppt3-pages-11-15.mjs
node tests/check-h1-o1-full-folder-runtime.mjs
node tests/check-h1-objective-chapters.mjs
node tests/check-h1-objective-chapters-runtime.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-shell-paging-runtime.mjs
node tests/check-h1-media-memory-budget-runtime.mjs
node tests/check-h1-okr-tvc-video-playback.mjs
node tests/check-h1-o2-seo-technical-ppt.mjs
node tests/check-h1-o2-aso-ppt-restoration.mjs
node tests/check-h1-o2-editor-layout-regression.mjs
node tests/check-h1-video-loading-policy.mjs
node tests/check-h1-okr-native-card-opacity.mjs
node tests/check-h1-ai-data-products-integration.mjs
node tests/check-h1-ai-data-products-runtime.mjs
npm test
```

正式 `npm run build` 需要注入 `VANTAGE_SUPABASE_URL`、`VANTAGE_SUPABASE_PUBLISHABLE_KEY` 和 `VANTAGE_LOGIN_EMAIL`；本地仅生成依赖和空配置时可使用 `VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build`。

涉及沉浸式壳的浏览器测试要求 4180 端口已有本地服务；涉及 O1 TVC 的测试还要求本地 `tvc-library/` 素材完整。

浏览器抽检页面：

```text
O1 01 / 31（章节标题）
O1 09 / 31（TVC）
O1 31 / 31
O2 01 / 25（O2 以全面增长为核心）
O2 02 / 25（2026 H1 SEO）
AI Data Products 04 / 06（3 个主产品 + 工具百宝箱）
Q3 Outlook 05 / 06
Closing Film 06 / 06
```

O1 兼容测试中，旧版 11 页专属测试文件保留原文件名，但转接到新的 30 页静态或浏览器契约，避免继续断言已经删除的旧结构。合入前版本可从下述备份恢复。

## 回退

ND Retail 8 页合入前回退包：

```text
backups/nd-h1-retail-8-pages-before-20260731-001104/rollback-files.tar.gz
SHA-256 77a3fba3ab469a63a71b5494da777902fc9e2069195a3f4f422bc5efd3f59606
```

该包保存了合入前的 `index.html`、正式主题、沉浸式壳、交接文档和测试目录。恢复前确认项目路径后执行：

```bash
cd "/Users/julian/Q1汇报"
tar -xzf backups/nd-h1-retail-8-pages-before-20260731-001104/rollback-files.tar.gz
```

AI 数据产品合入前回退包：

```text
backups/ai-data-products-before-20260730-232119/rollback-files.tar.gz
SHA-256 e91e6477736964bcfe90063e5d5292e862ff93e2f3d337ceec7566fbeb7d43e1
```

该包保存了合入前的沉浸式壳、交接文档和全部测试。若需要完整回退，同时保留新模块以便复查：

```bash
cd "/Users/julian/Q1汇报"
mv previews/ai-data-products \
  backups/ai-data-products-before-20260730-232119/rolled-back-ai-data-products
tar -xzf backups/ai-data-products-before-20260730-232119/rollback-files.tar.gz
```

本轮合入前主回退包：

```text
backups/o1-full-merge-20260730-203458/rollback-files.tar.gz
SHA-256 98aacf516d51767212cf40851e1980fc70e865b092d31a98fcdb4d3bc26c0cde
```

该包保存了合入前的 `index.html`、正式主题、沉浸式壳、交接文档和关键 O1 测试。恢复前先停止修改，确认项目路径，再执行：

```bash
cd "/Users/julian/Q1汇报"
tar -xzf backups/o1-full-merge-20260730-203458/rollback-files.tar.gz
```

旧 O1 兼容测试的更完整备份：

```text
backups/confirmed-scope-before-20260730-184516.tar.gz
SHA-256 a67ad48ad94cecc8e08b4429e36e8eb2c6f88019a95b92e8719a49581208788c
```

如需恢复全部旧 O1 测试原文，可在主回退后选择性执行：

```bash
tar -xzf backups/confirmed-scope-before-20260730-184516.tar.gz \
  tests/check-h1-okr-awards-events.mjs \
  tests/check-h1-okr-background-320-194.mjs \
  tests/check-h1-okr-brand-refresh-contrast.mjs \
  tests/check-h1-okr-fixed-canvas-runtime.mjs \
  tests/check-h1-okr-p25-340-210.mjs \
  tests/check-h1-okr-p27-brand-results.mjs \
  tests/check-h1-okr-p29-p34-contract.mjs \
  tests/check-h1-okr-shared-figma-bg.mjs \
  tests/check-h1-okr-shell-paging-runtime.mjs \
  tests/check-h1-okr-title-font-formal-runtime.mjs
```

主回退后，`previews/assets/o1-complete/` 和 `previews/h1-o1-complete-theme.css` 可以暂时保留；旧 `index.html` 不再引用它们，不影响运行。需要清理时应先再次确认，不要直接递归删除。

## 后续维护注意

- ND Retail 页面必须继续保持 `data-15` 至 `data-22` 的顺序和 `22 MODULES` 页码。
- 原稿显示数据不可在维护时自动重算，尤其是第 22 页瀑布图。
- 修改 Supabase 文本发现逻辑时，必须继续排除 SVG、图表内部标签和 `.h1-retail-growth-page-number`。
- AI 数据产品仍是独立外层场景，不属于 Full Report 页数。
- 登录页必须保留手动登录；不要恢复用历史 session 自动跳过登录遮罩的逻辑。
- 预热队列必须保持串行，并继续尊重 `saveData`、`slow-2g` 和 `2g`；`public-good.mp4` 体积最大，应放在队列最后。
- O2 SEO 技术页的 PPT 文案、品牌 logo、截图裁切和指标网格由专项测试保护，修改前先确认原稿。
- 任何新视频都必须同时更新页面引用、CDN manifest、缓存策略和对应媒体测试。
