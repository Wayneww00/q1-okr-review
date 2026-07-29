# Vantage H1 Review 2026 — 研发交接文档

最后更新：2026-07-29

维护语言：HTML / CSS / JavaScript / React CDN / Recharts

仓库：[songchunhui513-bit/q1-okr-review](https://github.com/songchunhui513-bit/q1-okr-review)

线上正式版：[vantage-h1-review-2026.vercel.app](https://vantage-h1-review-2026.vercel.app/previews/vantage-h1-immersive.html)

本机正式项目：`/Users/julian/Q1汇报`

当前工作分支：`codex/h1-review-handoff`
当前基线提交：`dcb35cb`（`feat: hand off H1 review presentation`）

> 先读这里：本机存在多个同名目录和 Codex worktree。当前 `4180` 端口实际服务、用户正在评审的项目是 `/Users/julian/Q1汇报`。不要直接在 `/Users/julian/.codex/worktrees/.../Q1汇报` 中修改正式页面，否则会出现“代码改了但预览没变化”或误覆盖旧版本的问题。

## 1. 一分钟了解项目

这是 Vantage 2026 H1 Review 的沉浸式桌面会议汇报网页，核心体验是 16:9、逐屏、类似 PPT 的上下翻页。完整链路为：

1. 登录与视频预加载；
2. 首屏开场视频；
3. 第二屏视频；
4. Full Report：15 页经营与社媒数据；
5. OKR：11 页 Figma 原画；
6. Q3 Outlook；
7. 片尾视频。

页面目前面向桌面会议汇报和全屏展示，不以移动端网站为目标。设计主色为 Vantage 橙、红、黑，数据页使用红色赛车与聚光灯背景，OKR 使用金色奖杯视觉。

登录页只是演示门禁，不是生产级认证。当前前端账号、密码均为 `vantage`，不能承载真实受保护信息。

## 2. 当前版本状态

### 2.1 已完成

- 15 页经营与社媒数据，统一使用 `2025 H2 vs 2026 H1` 对比周期。
- 数据表格、柱线组合图、标签、单位、图例与关键结论的清晰度优化。
- 触摸板、滚轮、键盘的 PPT 式整页定位与快速滑动响应。
- 登录页预加载视频并显示进度。
- 开场、第二屏和片尾视频的播放、暂停、声音及最后一帧状态。
- 11 页 OKR Figma 原画及连续上下翻页。
- 线下活动图片点击放大。
- OKR 第 5、6 页的视频热区与播放器骨架，等待后续视频资源。
- 数据区与 OKR 区互不共用背景，避免相互污染。

### 2.2 已上线，但本地尚未提交

当前本地正式目录的以下改动已于 2026-07-29 部署到 H1 正式站点，但**尚未提交和推送 Git**：

- OKR 从 5 页扩展到 11 页；
- 新增 p29、p30、p32×2、p33、p34 六张 Figma 原画；
- OKR 改为“每页拥有独立背景”，不再共用一张固定背景；
- OKR 页码统一为 `01 / 11` 到 `11 / 11`；
- 相应契约测试和多分辨率运行时测试已更新。

本次生产部署 ID：

```text
dpl_4mxckhNsnoqzxHvs3R1ae4UFmceQ
```

接手后应先确认本地与线上一致，再将当前有效改动提交并推送到交接分支。不要假设只 clone GitHub 就能获得线上最新版本。

当前关键预览：

```text
http://127.0.0.1:4180/previews/vantage-h1-immersive.html
http://127.0.0.1:4180/previews/vantage-h1-immersive.html?audit=okr-independent-bg-v1
```

当前资源缓存版本：

```text
20260729-okr-independent-bg-v1
```

它同时出现在 `index.html`、外层壳 CSS、iframe URL 和 iframe 注入主题 URL 中。改 CSS/结构后如浏览器仍显示旧效果，应同步更新这些引用，而不是只在 URL 后随意加参数。

## 3. 正确启动方式

项目为静态 HTML，无需 `npm install`。

```bash
cd /Users/julian/Q1汇报
lsof -nP -iTCP:4180 -sTCP:LISTEN
python3 -m http.server 4180 --bind 127.0.0.1
```

如果端口已被占用，不要再启动第二个服务。先确认服务根目录：

```bash
pid=$(lsof -tiTCP:4180 -sTCP:LISTEN)
ps -p "$pid" -o command=
```

正式入口：

```text
http://127.0.0.1:4180/previews/vantage-h1-immersive.html
```

iframe 内部报告入口：

```text
http://127.0.0.1:4180/index.html?report=h1&embedded=1
```

推荐 Chrome 或 Codex 内置浏览器，以 16:9 和全屏模式验收。非 16:9 屏幕仍需测试，尤其是 1366×768、1440×900、1920×1080 和超宽屏。

## 4. 文件职责

| 路径 | 职责 |
| --- | --- |
| `previews/vantage-h1-immersive.html` | 正式入口、登录页、场景状态机、视频/声音、外层导航、iframe 协调。 |
| `index.html` | Full Report 内容、15 页数据、OKR 注册表、OKR 渲染、图片和视频模态窗。 |
| `previews/h1-figma-racing-theme.css` | 正式版主题、数据页视觉、OKR 画布、背景延展、页码、模态窗和响应式规则。 |
| `previews/assets/figma-exact/` | OKR 的 1920×1080 Figma 整页原画和活动放大图。 |
| `previews/assets/` | 视频、视频海报、赛车背景及其他正式资源。 |
| `tests/` | 静态契约和浏览器运行时回归测试。 |
| `HANDOFF.md` | 本文档。每次结构性变更后应同步更新。 |
| `Q1 OKR Review.html` | 历史 Q1 编辑型内容，不是当前 H1 正式入口。 |

`design-qa.md` 是本地未跟踪文件，除非负责人明确要求，否则不要编辑或删除。

## 5. 外层场景与视频状态机

外层壳是 `previews/vantage-h1-immersive.html`。

### 5.1 登录页

- 预加载开场与第二屏视频；
- 显示加载数量和进度条；
- 用户点击 `Sign In` 后获得浏览器用户手势，便于后续有声播放。

### 5.2 首屏视频

资源：

```text
previews/assets/vantage-h1-opening-final-4k.mp4
```

逻辑：

- 进入后优先尝试有声播放；
- 浏览器阻止时再降级处理；
- 播放中途滑走：暂停并保存时间，返回后继续；
- 播放完成：停留最后一帧；
- 已完整播放后滑走再返回：从头重新播放。

### 5.3 第二屏视频

资源：

```text
previews/assets/vantage-h1-second-screen-july28-sound-4k.mp4
```

逻辑：

- 进入第二屏自动播放并尝试开启声音；
- 滑走暂停；
- 返回从暂停位置继续；
- 播放完成停留在最后一帧；
- 不叠加 `H1 REVIEW` 等额外文案。

### 5.4 片尾视频

资源：

```text
previews/assets/vantage-h1-closing-sp-4k.mp4
```

逻辑：

- 滑到片尾后自动播放；
- 播放完停在视频原始最后一帧；
- 不再出现 `Stay Ahead` 或其他 HTML 结束文案。

### 5.5 浏览器声音限制

浏览器可能阻止“无用户手势的自动有声播放”。当前流程通过登录点击尽量获取授权，但不能承诺所有浏览器策略下都无条件有声。修改视频逻辑时，不要删除静音回退和声音图标。

## 6. Full Report 数据维护

经营数据的主入口为 `index.html` 中的 `H1_DASHBOARDS`。

数据页顺序：

1. Retail FTD；
2. Retail ND；
3. Retail TV；
4. Paid Ads FTD；
5. Paid Ads ND；
6. Paid Ads TV；
7. Paid Ads 利润；
8. Paid Ads 各区域 ROI；
9. SEO 日均曝光；
10. SEO 日均点击；
11. 品牌声量；
12. 品牌搜索与口碑；
13. GM Social Media SOV；
14. CFD 行业关注者份额；
15. 关注者增长趋势对比。

更新 PPT 数据时必须同时核对：

- 表格值；
- 柱状图和折线图的数据数组；
- 轴范围、刻度、单位和格式化；
- 柱顶标签、占比标签和折线点是否碰撞；
- KPI 卡片和关键结论；
- 页码与顺序；
- 所有同比/环比计算方向。

区域 ROI 表当前按用户要求：

- `Conv. Cost` 列隐藏；
- APAC 指定数值以当前 HTML 和测试为准；
- 表格需要宽松排版，不要为了套模板压缩或省略内容。

数据页固定使用自己的赛车背景。修改 OKR 时不得改动数据页的背景、数据和翻页。

## 7. OKR 当前结构

`index.html` 中的 `OKR_FIGMA_PAGES` 是 OKR 顺序的单一入口。当前共 11 页：

| 页码 | ID | 内容 | 原画资源 |
| --- | --- | --- | --- |
| 01 / 11 | `okr-review` | 将 Vantage 建设成全球一线品牌 | `p25-source.png` |
| 02 / 11 | `okr-brand-results` | 什么是全球一线品牌 | `p27-source.png` |
| 03 / 11 | `okr-brand-refresh` | 品牌升级 | `okr-p29-source.png` |
| 04 / 11 | `okr-brand-operating-system` | 品牌经营系统 | `okr-p30-source.png` |
| 05 / 11 | `okr-tvc-matrix` | Vantage TVC 矩阵 | `okr-p32-matrix-source.jpg` |
| 06 / 11 | `okr-tvc-library` | 常态化与场景化 TVC | `okr-p32-tvc-source.jpg` |
| 07 / 11 | `okr-application-roadmap` | H2 V1 Application Rollout Roadmap | `okr-p33-source.png` |
| 08 / 11 | `okr-high-value-actions` | 六个高价值抓手 | `okr-p34-source.png` |
| 09 / 11 | `okr-awards` | 奖项 | `awards-source.png` |
| 10 / 11 | `okr-offline-event-01` | 线下活动：沙龙 | `salon-source.png` |
| 11 / 11 | `okr-offline-event-02` | 线下活动：展会 | `expo-source.png` |

上述文件都位于：

```text
previews/assets/figma-exact/
```

活动放大图：

```text
salon-modal-source.png
expo-modal-source.png
```

### 7.1 当前 OKR 背景规则

用户已明确否决“11 页共用一张固定背景”。当前规则是：

- 每页用自己的 Figma 原画作为独立背景来源；
- 页面背景与 16:9 原画同源；
- 原画完整等比显示，不拉伸；
- 外围用同页图片的 cover 延展和柔和遮罩填满屏幕；
- 允许裁切外围少量背景，但不能裁掉核心 1920×1080 内容；
- 翻页时设计与背景一起切换；
- 数据页背景完全不受影响。

对应 CSS 主要在：

```text
.h1-okr-page
.h1-okr-exact-page
.h1-okr-exact-page::before
.h1-okr-exact-artboard
.h1-okr-exact-frame
```

每页通过内联变量绑定自己的资源：

```jsx
style={{'--h1-okr-page-image': `url("/${page.src}")`}}
```

不要重新引入单独的 fixed stage，也不要使用上一轮生成的透明 overlay。

### 7.2 Figma 原画原则

参考文件：

- [H1 Review](https://www.figma.com/design/VWXAscA9ei4JWJGaH0HuZ1/H1-Review)
- [H1（P7 P14）](https://www.figma.com/design/kF7d42oENhWzA0oANM58J8/H1-%EF%BC%88P7-P14%EF%BC%89)
- [Untitled 资源文件](https://www.figma.com/design/fdc3bNBy49w5lLH0KeSFpM/Untitled)

用户对 OKR 的核心要求是“1:1 完整还原，不要自行重绘”。后续更新优先从 Figma 导出整页 1920×1080 原画并替换资源，不要在浏览器中凭截图重做字体、卡片、透明度和图形。

2026-07-29 已解决原始 Figma Draft 无法被 Codex 连接器读取的问题：组织 `WUKONG` 只有 View 席位，因此把全部 11 个 OKR 画板和 `BG` 原层级复制到个人 Starter Draft，原文件不改动。后续需要读取图层、字体、颜色或重新导出时，使用下面的可编辑副本：

```text
https://www.figma.com/design/XP4WQM998Lox5fkNTde8Cb/H1-Review-%E2%80%94-Codex-Editable-Source-Backup-2026-07-29
```

本地正式版在本轮 Figma 工作开始前的完整可回滚快照：

```text
/Users/julian/.codex/backups/q1-h1-before-figma-code-20260729-111040
```

该快照已通过 `rsync -ani --delete` 校验，无差异。若新方案不满意，可从此目录恢复；不要用 `git reset --hard` 覆盖用户当前未提交内容。

过去生成的透明 overlay 含有旧登录 UI 残影，已移出项目并备份到：

```text
/Users/julian/.codex/backups/q1-h1-okr-overlays-20260729-v2/
```

除非明确做取证，不要把这些 overlay 放回项目。

### 7.3 TVC 视频占位

OKR 第 05、06 页已预留点击热区和统一播放器。当前没有正式视频资源，点击后显示“视频资源待接入”。

后续接入时：

1. 把视频放入正式 assets 目录；
2. 给相应 `videoSlots` 项增加 `src`；
3. 保留已有 `left/top/width/height` 热区；
4. 测试打开、播放、关闭、`Esc` 和翻页后的声音释放；
5. 不要用视频 DOM 覆盖 Figma 原画中的标题、缩略图和文字。

## 8. 翻页交互

数据页和 OKR 页都依赖 `[data-report-page]` 形成一个连续的页面序列。外层壳与 iframe 通过消息协调边界翻页。

必须保留：

- `data-report-page`；
- `data-page-id`；
- 当前滚轮累积、锁定和 idle re-arm 逻辑；
- 键盘 `PageUp` / `PageDown` / 方向键；
- iframe 到外层的边界通知。

不要给 OKR 再增加第二套嵌套滚动容器或独立 wheel listener。这样会造成：

- 触摸板快速滑动偶发无响应；
- 一次滑动跨两页；
- 页面停在半屏；
- 外层场景和 iframe 同时滚动。

新增页面的正确方式是扩展 `OKR_FIGMA_PAGES`，让现有渲染器输出新的 `[data-report-page]`。

## 9. 测试

项目当前有 32 个 `check-h1-*.mjs` 回归文件。最近一次完整回归全部通过。

先启动 `4180` 服务，再运行全套 H1 检查：

```bash
cd /Users/julian/Q1汇报
set -e
for f in $(rg --files tests | rg '^tests/check-h1-.*\.mjs$' | sort); do
  echo "RUN $f"
  node "$f"
done
```

如果某些运行时测试默认访问其他端口，显式指定：

```bash
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-fixed-canvas-runtime.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-shell-paging-runtime.mjs
```

重点测试：

```text
tests/check-h1-okr-p29-p34-contract.mjs
tests/check-h1-okr-fixed-canvas-runtime.mjs
tests/check-h1-okr-shell-paging-runtime.mjs
tests/check-h1-followers-trend-label-collisions-runtime.mjs
tests/check-h1-second-screen-sound-runtime.mjs
tests/check-h1-wheel-paging-stability.mjs
```

人工验收至少覆盖：

- 登录进度条；
- 三段视频的声音和离场暂停；
- 触摸板慢滑、快速滑、连续反向滑；
- 数据 01–15 的页码、图例、标签；
- OKR 01–11 的顺序、页码、独立背景和无黑边；
- 1366×768、1440×900、1920×1080；
- 沙龙、展会大图弹窗；
- `Esc` 关闭弹窗后仍可继续翻页。

仅改文档时不需要重跑浏览器测试；修改页面、CSS、数据、视频或资源映射时必须运行相应测试。

## 10. Git、LFS 与当前工作区

当前分支：

```text
codex/h1-review-handoff
```

远端：

```text
https://github.com/songchunhui513-bit/q1-okr-review.git
```

三个正式视频由 Git LFS 管理：

```text
previews/assets/vantage-h1-opening-final-4k.mp4
previews/assets/vantage-h1-second-screen-july28-sound-4k.mp4
previews/assets/vantage-h1-closing-sp-4k.mp4
```

Vercel 对单文件限制为 100 MB。当前开场视频使用 3840×2160、87.26 秒、约 66.5 MB 的 H.264/AAC 部署兼容版本；244 MB 高码率原片已保存在：

```text
/Users/julian/.codex/backups/q1-h1-opening-source-20260729/vantage-h1-opening-final-4k-original.mp4
```

`.vercelignore` 会排除未使用的历史视频导出，避免部署包再次超过限制。不要删除三个当前正式视频，也不要把超过 100 MB 的文件直接加入 Vercel 部署。

新环境：

```bash
git clone --branch codex/h1-review-handoff https://github.com/songchunhui513-bit/q1-okr-review.git
cd q1-okr-review
git lfs install
git lfs pull
```

注意：截至本文更新时，本地新增的 6 张 OKR 原画、相关代码和测试还没有提交，因此只 clone 远端分支得不到当前线上最新效果。需由负责人审核当前工作区后提交和推送。

不要使用 `git reset --hard`、`git checkout -- .` 等命令清理当前工作区。当前未提交改动是有效研发成果，不是垃圾文件。

## 11. 部署

Vercel 配置：

```text
vercel.json
.vercel/project.json
```

站点是静态目录部署，`outputDirectory` 为仓库根目录。

线上正式地址：

```text
https://vantage-h1-review-2026.vercel.app/previews/vantage-h1-immersive.html
```

部署前必须：

1. 确认用户已通过本地预览；
2. 检查 `git diff`，保证没有误改数据页；
3. 运行全部 H1 测试；
4. 检查 Git LFS 文件不是指针损坏；
5. 确认部署目标是 H1 项目，不是 Q1 原项目；
6. 部署后逐页验证线上资源、声音、翻页和 OKR 图片。

用户没有明确要求时，不要自动部署。

2026-07-29 已发布的生产部署：

```text
dpl_4mxckhNsnoqzxHvs3R1ae4UFmceQ
https://vantage-h1-review-2026.vercel.app/previews/vantage-h1-immersive.html
```

## 12. 最容易复现的事故与规避方式

### 12.1 改错目录

根因：存在 `/Users/julian/Q1汇报` 和多个 Codex worktree；浏览器服务的是前者，开发却可能在后者修改。

每次开始前执行：

```bash
pwd
git rev-parse --show-toplevel
lsof -nP -iTCP:4180 -sTCP:LISTEN
```

本项目正确结果应指向：

```text
/Users/julian/Q1汇报
```

### 12.2 iframe 中出现登录页

根因通常是 `embedded=1` 丢失、iframe URL 被替换，或登录 CSS/DOM 被误复制到 `index.html`。

规则：

- 登录只属于外层 `vantage-h1-immersive.html`；
- iframe 必须带 `report=h1&embedded=1`；
- 不要在 Full Report 内新增第二个登录门禁。

### 12.3 CSS 改了但页面未变化

根因通常是缓存版本不一致。

检查以下三处：

- `index.html` 中主题 CSS；
- `previews/vantage-h1-immersive.html` 中壳 CSS；
- iframe URL和动态注入的 CSS URL。

### 12.4 OKR 出现黑边、拉伸或文字漂移

根因通常是：

- 把 16:9 原画直接 `contain` 在整屏，但没有同源背景延展；
- 使用 `cover` 裁切了整张 Figma 原画；
- 将原画拆成 DOM 手工重绘；
- 引入了旧 overlay。

正确方案是当前实现：核心原画 `contain`、同页图片外围 `cover` 延展、等比缩放、边缘柔和融合。

### 12.5 翻页不灵敏

根因通常是重复 wheel listener、嵌套滚动、锁未重置或 iframe/外层同时消费事件。

先跑现有翻页测试并阅读现有状态机，不要先追加新的监听器。

## 13. 后续开发建议

优先级建议：

1. 由负责人评审当前 11 页 OKR 独立背景版本；
2. 接入 OKR 第 05、06 页正式视频；
3. 完善 Q3 Outlook 内容；
4. 全屏会议环境做一次最终 QA；
5. 提交、推送、合并并部署；
6. 若后续需要长期维护，再单独评估迁移 Vite/React，避免与内容更新混在同一批改动。

设计工作方式：

- 涉及 Figma 时先读取目标节点和整页原画；
- 先确认范围、页面顺序、是否允许裁切/压缩；
- 只更新本地，用户评审通过后再上线；
- 不压缩、不省略、不自行改写业务数字；
- 所有视觉修改都需同时检查大屏和小屏。

## 14. 给下一位 Codex 的起手提示词

可直接复制：

```text
请先完整阅读 /Users/julian/Q1汇报/HANDOFF.md。
当前正式项目根目录是 /Users/julian/Q1汇报，4180 端口服务的也是这个目录，不要修改同名 Codex worktree。
先检查 git status，不要丢弃现有未提交改动，不要修改 design-qa.md。
先启动或确认本地 4180 服务，再打开 previews/vantage-h1-immersive.html。
当前本地最新版本有 15 页数据和 11 页 OKR；OKR 每页使用独立 Figma 原画背景，数据页背景不受影响。
任何代码修改前先定位到正确模块；修改后运行 HANDOFF.md 第 9 节测试并给出本地预览。未经明确授权不要提交、推送或部署。
```

## 15. 接手检查清单

- [ ] `pwd` 为 `/Users/julian/Q1汇报`
- [ ] 已阅读 `HANDOFF.md`
- [ ] 已确认当前分支和未提交改动
- [ ] Git LFS 三段视频完整
- [ ] `4180` 服务根目录正确
- [ ] 登录、三段视频和声音正常
- [ ] 数据 01–15 正常
- [ ] OKR 01–11 正常
- [ ] 沙龙/展会大图可打开和关闭
- [ ] 触摸板快速滑动能稳定逐页定位
- [ ] 关键测试通过
- [ ] 未经用户授权未提交、未推送、未部署
