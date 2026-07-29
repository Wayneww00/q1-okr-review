# H1 OKR p27 设计 QA

## 验证范围

- 目标：在现有 p25 下方新增 p27，以相同奖杯背景呈现“全球一线品牌的四个可衡量结果”，并纳入既有上下 PPT 翻页链路。
- 视觉真值：`/var/folders/c0/kvj67z5n4mxcpgzhyhv00rw00000gn/T/codex-clipboard-a0f88ccf-9580-4955-bd6f-6136a41f5129.png`
- 实现页面：`http://127.0.0.1:4180/previews/vantage-h1-immersive.html?audit=okr-p27-v1`
- 页面状态：Full Report → p25 → p27。
- 设计画布：1920 × 1080，按视口等比缩放。

## 证据

- 自动化契约：`tests/check-h1-okr-p27-brand-results.mjs`
- 真实翻页验证：`tests/check-h1-okr-shell-paging-runtime.mjs`
- 浏览器视觉检查：1280 × 720 小屏比例，完整 p27 页面无黑边、无卡片出界、无正文截断。
- 并排视觉对照：`.tmp/okr-p27-compare.png`（左为用户清晰截图，右为本地实现）。

## Findings

- P0：无。
- P1：无。
- P2：无。
- P3：无。

## 五项视觉核对

1. 字体与排版：保留 Figma 的描边英文标题、中文 Black 主标题、顶部定义说明、中部 2 × 2 结果矩阵和底部结论条。
2. 间距与布局：右侧内容列的顶部说明、中部主面板和底部总结按参考图的纵向节奏排列；四张卡片维持等宽等高和统一间隙。
3. 色彩：卡片按象牙白、品牌金、深炭黑、象牙白排列；背景及金属奖杯色彩未改变。
4. 图像质量：p27 复用 p25 的 `h1-review-bg-320-194-2280x1346.png`，未新增、拉伸或重复背景资源。
5. 文案与内容：标题、定义、四项结果、全部说明与 Brand Result 结论均按清晰截图逐字录入。

## 翻页与响应式

- 报告页注册表由 16 页增加为 17 页，顺序为 15 个数据页 → p25 → p27。
- p27 使用与数据报表相同的 `[data-report-page]` 动态翻页注册机制；PageDown、PageUp 和滚轮均按页定位。
- 从 p27 再向下翻页进入 Q3 Outlook；从 Q3 Outlook 返回时优先回到 p27。
- p27 使用独立 1920 × 1080 固定设计画布，按 `min(viewportWidth / 1920, viewportHeight / 1080)` 等比缩放，避免拉伸。

## 验证

- 新增测试先失败，再完成实现。
- 全部 32 项项目测试通过。
- 浏览器 DOM 边界审查未发现卡片越界、标题遮挡或文本折损。

final result: passed
