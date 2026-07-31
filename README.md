# Vantage H1 Review 2026

Vantage 2026 H1 复盘演示项目。当前协作版本位于 `codex/h1-review-handoff`，通过 Draft PR #1 汇总交付。

- 完整研发交接、启动方式、架构、测试与素材说明：[HANDOFF.md](HANDOFF.md)
- 正式线上入口：<https://vantage-h1.vercel.app/>
- 正式入口：`previews/vantage-h1-immersive.html`
- GitHub PR：<https://github.com/songchunhui513-bit/q1-okr-review/pull/1>

近期状态：

- 完整报告共 95 页，并包含独立 AI Data Products 外层场景。
- O2 第 21/25 页历史正文槽位错位已经修复，并由专项回归测试保护。
- 当前正式线上页面来自提交 `1370aef`，状态为 `READY`。
- 后续生产发布必须显式确认 `vantage-h1.vercel.app` 指向计划发布的提交；详细流程见 `HANDOFF.md`。

首次运行：

```bash
git lfs install
git lfs pull
npm ci
VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build
python3 -m http.server 4180 --bind 127.0.0.1
```

然后打开 <http://127.0.0.1:4180/previews/vantage-h1-immersive.html>。本地用户名和密码均为 `vantage`。

> O1 TVC 素材不随普通 Git 提交分发。需要完整视频播放或生产部署时，请先阅读 `HANDOFF.md` 的“视频资源交付”一节。
