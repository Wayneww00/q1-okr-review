# Vantage H1 Review — 项目交接文档

最后同步：2026-07-29
仓库：[songchunhui513-bit/q1-okr-review](https://github.com/songchunhui513-bit/q1-okr-review)
主分支：`main`
本地项目目录：`/Users/julian/Q1汇报`

## 1. 项目目标与当前状态

这是 Vantage 2026 H1 Review 的沉浸式桌面汇报页面。项目以 16:9 PPT 式逐屏体验为核心，包含登录预加载、开场视频、第二屏视频、经营数据、OKR、Q3 展望和片尾视频。

当前正式版本已完成：

- 2025 H2 vs 2026 H1 的 15 页经营数据展示与可读性优化。
- 社媒数据 11–15 页：声量、品牌搜索与口碑、社媒 SOV、行业关注者份额、关注者趋势。
- 5 页 Figma 原画 OKR：品牌目标、全球一线品牌定义、奖项、线下活动沙龙、线下活动展会。
- OKR 页面采用 Figma 直接导出的 1920×1080 资源；字体、文字、卡片、图片和间距不依赖浏览器重新排版。
- 登录页视频预加载和进度条；开场、第二屏、片尾视频的播放/暂停/声音/最后一帧逻辑。
- 触摸板、滚轮、键盘的逐页翻页稳定性优化。

本项目的“登录”仅为演示门禁，不是生产级身份认证。账号和密码当前均为 `vantage`，并写在前端源码中；不要将其用于任何真实受保护内容。

## 2. 本地启动与预览

项目是静态 HTML，无需安装 npm 依赖。建议从仓库根目录启动：

```bash
cd /Users/julian/Q1汇报
python3 -m http.server 4180
```

打开正式版：

```text
http://127.0.0.1:4180/previews/vantage-h1-immersive.html
```

推荐使用 Chrome / Codex 内置浏览器，并以 16:9、全屏模式进行演示。正式页面会在内部 iframe 中加载 H1 数据与 OKR 报告：

```text
http://127.0.0.1:4180/index.html?report=h1&embedded=1
```

## 3. 页面结构与用户流

外层演示壳：`previews/vantage-h1-immersive.html`

1. 登录页：预加载开场和第二屏的视频，显示资源加载进度。
2. 首屏视频：`vantage-h1-opening-final-4k.mp4`。
   - 进入后尝试有声播放；浏览器阻止自动有声时自动降级为静音播放。
   - 离开时暂停并静音。
   - 播放完停在最后一帧；离开后再返回会从头重新播放。
   - 播放到中途离开，再返回时从暂停位置继续。
3. 第二屏视频：`vantage-h1-second-screen-july28-sound-4k.mp4`。
   - 滑入播放、滑走暂停；返回从暂停位置继续；播放结束时停留最后一帧。
4. Full Report：外层 iframe 中的 H1 报告。
   - 数据页 01–15。
   - OKR 原画页：p25、p27、奖项、线下活动 01、线下活动 02。
   - 线下活动页面支持点击热区，在模态窗中放大图片；`Esc` 或点击外部关闭。
5. Q3 Outlook：暂为结构框架，待后续业务内容确认。
6. 片尾视频：`vantage-h1-closing-sp-4k.mp4`，播放完保留视频原有最后一帧，不叠加任何结束文案。

翻页由外层壳和 iframe 协调：滚轮、触摸板、`PageUp` / `PageDown`、方向键均以整页为单位定位。不要移除 `data-report-page` 属性，也不要随意改动 `postMessage` 导航协议，否则会破坏报告与外层场景之间的翻页衔接。

## 4. 关键文件与职责

| 文件 / 目录 | 职责 |
| --- | --- |
| `previews/vantage-h1-immersive.html` | 入口、登录门禁、场景状态机、视频播放、声音、滚轮和 iframe 翻页协调。 |
| `index.html` | H1 数据结构、Recharts 图表、OKR 原画页面映射、编辑模式与报告内容。 |
| `previews/h1-figma-racing-theme.css` | H1 正式版的全局视觉样式、数据页、OKR 等比固定画布、模态窗和响应式规则。 |
| `previews/assets/figma-exact/` | Figma 直接导出的 OKR 1920×1080 原画和活动模态图。 |
| `previews/assets/` | 视频海报、当前演示视频、赛车背景、图标等资源。 |
| `okr-images/` | 原始 OKR 内容图片、活动图片和周边图片。 |
| `tests/` | 静态契约与浏览器运行时回归测试。 |
| `Q1 OKR Review.html` | 原始 Q1 编辑型内容源；当前 H1 演示主要入口不是此文件。 |

## 5. 数据维护位置

经营数据的单一维护入口是 `index.html` 中的 `H1_DASHBOARDS` 常量。

- 对比周期当前统一为 **2025 H2 vs 2026 H1**。
- 数据页 1–3：Retail FTD / ND / TV。
- 数据页 4–8：Paid Ads FTD / ND / TV / 利润 / 区域 ROI。
- 数据页 9–10：SEO 日均曝光 / 日均点击。
- 数据页 11–15：品牌声量、品牌搜索与口碑、GM Social Media SOV、行业关注者份额、关注者趋势。

更新数据时，必须同步检查：

1. `tableData` / `tableRegionsQuarter1` / `tableRegionsQuarter2` 的表格值；
2. `kpi1`、`kpi2` 和描述文案；
3. 图表坐标轴 `leftDomain`、`leftTicks` 与格式化单位；
4. 柱、折线标签是否会与数据点重叠；
5. 结论文字是否和新数字一致。

现有实现刻意隐藏了区域 ROI 表的 `Conv. Cost` 列；如业务要重新展示，需同时复核表格列宽与移动/窄屏阅读性。

## 6. Figma 原画 OKR 维护方式

当前 `OKR_FIGMA_PAGES` 位于 `index.html`。页面对应关系如下：

| 页面 ID | 内容 | 本地资源 |
| --- | --- | --- |
| `okr-review` | p25：将 Vantage 建设成全球一线品牌 | `previews/assets/figma-exact/p25-source.png` |
| `okr-brand-results` | p27：什么是全球一线品牌 | `previews/assets/figma-exact/p27-source.png` |
| `okr-awards` | 奖项 | `previews/assets/figma-exact/awards-source.png` |
| `okr-offline-event-01` | 线下活动：沙龙 | `salon.jpg` + `salon-modal-source.png` |
| `okr-offline-event-02` | 线下活动：展会 | `expo-source.png` + `expo-modal-source.png` |

Figma 参考文件：

- [H1 Review](https://www.figma.com/design/VWXAscA9ei4JWJGaH0HuZ1/H1-Review)
- [H1（P7 P14）](https://www.figma.com/design/kF7d42oENhWzA0oANM58J8/H1-%EF%BC%88P7-P14%EF%BC%89)
- [Untitled 资源文件](https://www.figma.com/design/fdc3bNBy49w5lLH0KeSFpM/Untitled)

**重要原则：** 若需要一比一更新 OKR，请在 Figma 以 PNG、1x、1920×1080 导出整页后替换对应资源，并保持页面 id、图片尺寸和 `data-report-page` 不变。不要把 Figma 文字和卡片重新拆成浏览器 DOM 后凭视觉猜测重绘，否则字体、字距、遮罩透明度和图片裁切会发生漂移。

OKR 固定画布由 CSS 按 `min(viewportWidth / 1920, viewportHeight / 1080)` 等比缩放。非 16:9 视口采用同源背景延展，核心 16:9 原画不拉伸，不裁切。

## 7. 媒体资源与 Git LFS

当前正式版真正使用的三个视频由 Git LFS 管理：

```text
previews/assets/vantage-h1-opening-final-4k.mp4
previews/assets/vantage-h1-second-screen-july28-sound-4k.mp4
previews/assets/vantage-h1-closing-sp-4k.mp4
```

克隆项目后先执行：

```bash
git lfs install
git lfs pull
```

否则会只得到 LFS 指针文件，视频无法播放。其余 `.mp4` 文件为历史素材，仍被 `.gitignore` 忽略，避免仓库和下载体积持续增长。若替换当前视频，建议：

1. 导出 / 转码为兼容浏览器的 MP4（H.264 + AAC）；
2. 保持 16:9、优先 4K 或高码率 1080p；
3. 替换当前被 LFS 跟踪的文件，或把新文件加入 `.gitattributes`；
4. 同步更新视频海报与 `previews/vantage-h1-immersive.html` 中的 `src`；
5. 运行视频生命周期测试。

## 8. 验证与测试

所有静态契约测试：

```bash
cd /Users/julian/Q1汇报
for f in tests/*.mjs; do
  case "$f" in
    *runtime*) continue ;;
  esac
  node "$f"
done
```

启动本地服务器后执行运行时测试：

```bash
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-shell-paging-runtime.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-fixed-canvas-runtime.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-okr-title-font-formal-runtime.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-second-screen-sound-runtime.mjs
H1_OKR_TEST_URL=http://127.0.0.1:4180 node tests/check-h1-followers-trend-label-collisions-runtime.mjs
```

本次交接前已通过全部静态检查和上述 5 项运行时检查。重点覆盖：

- H1 数据和 PPT 数据契约；
- 图例、坐标轴、单位与标签可读性；
- 触摸板/滚轮翻页稳定性；
- 开场、第二屏、片尾视频及声音生命周期；
- OKR 固定画布、原画资源、翻页与活动图片放大；
- 社媒图表标签碰撞。

## 9. 发布方式

`vercel.json` 是静态站点配置，构建命令为空，输出目录是仓库根目录。通常将 `main` 推送至 GitHub 后，由已连接的 Vercel 项目自动部署；若未自动部署，请在 Vercel 控制台检查 Git 集成或使用团队既有的部署流程。

本次任务仅同步 GitHub 源码和媒体 LFS 资源；未主动创建新的 Vercel 部署，以免覆盖当前线上版本。

## 10. 接手建议与边界

- 改动前先确认用户希望修改的是“数据页”、“OKR Figma 原画页”还是“外层视频场景”，三者入口不同。
- 修改数据页时优先改 `H1_DASHBOARDS`，不要在图表组件内硬编码数字。
- 修改 OKR 时优先从 Figma 导出整页，不要重绘原画。
- 修改翻页时，必须用鼠标滚轮、触摸板快速滑动、键盘上下翻页都做一次回归。
- 视频自动有声受浏览器策略限制：代码已优先尝试有声播放，失败才回退静音。演示时从登录页点击 `Sign In` 进入，可获得最佳成功率。
- `.tmp/` 是视觉审查中间图，`.codex-backups/` 是本地历史备份；两者均不应提交。
- 当前站点使用 CDN 形式的 React 18、Babel、Recharts 和 OGL。它是快速演示工程，不是打包后的生产前端；若后续有性能、离线或企业安全要求，建议单独迁移为 Vite/React 工程，不要与日常内容更新混在同一个改动中。

## 11. 下一位 Codex 的推荐起手式

```bash
git clone https://github.com/songchunhui513-bit/q1-okr-review.git
cd q1-okr-review
git lfs install
git lfs pull
python3 -m http.server 4180
```

然后打开正式版，完成登录，依次检查：首屏视频 → 第二屏视频 → 数据页 01–15 → OKR 五页与活动弹窗 → Q3 Outlook → 片尾视频。开始改动前先运行第 8 节的测试，确保接手环境正常。
