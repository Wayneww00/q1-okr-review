# Vantage H1 Review 多人协作规则

本文档是本项目双人并行开发的执行规则。目标是让两位负责人在不同电脑上修改各自页面，通过独立分支提交，并在共享协作分支完成验证和集成。

## 1. 分支分配

| 角色 | 开发分支 | 用途 |
| --- | --- | --- |
| 页面负责人 A（当前电脑） | `codex/pages-a` | 当前负责人已认领页面及其专项测试、页面专属素材 |
| 页面负责人 B（同事电脑） | `codex/pages-b` | 同事已认领页面及其专项测试、页面专属素材 |
| 共享集成 | `codex/h1-review-handoff` | 接收两条页面分支的 PR，并执行完整回归 |
| 稳定主线 | `main` | 只接收已经通过集成验证的共享分支 |

两条开发分支均从同一个协作基线创建。正常合入关系：

```text
codex/pages-a ──PR──┐
                    ├──> codex/h1-review-handoff ──PR──> main
codex/pages-b ──PR──┘
```

禁止把 `codex/pages-a` 或 `codex/pages-b` 直接合入 `main`。

## 2. 页面认领规则

1. 以页面的 `data-page-id`、`pageId` 或章节 ID 作为唯一标识，不以可变化的视觉页码作为唯一依据。
2. 同一个页面 ID 同一时间只能有一位负责人。
3. 每个 PR 必须列出本次修改的页面 ID。没有列出的页面不得顺手修改。
4. 页面新增、删除、重排或跨章节移动属于共享结构变更，必须先由两人确认，再由一人集中实施。
5. 发现必须修改对方页面时，先通知对方；优先由原负责人修改，或明确完成页面所有权转交。

建议双方在开始开发前用以下格式记录各自范围：

```text
负责人 A / codex/pages-a
- page-id:
- page-id:

负责人 B / codex/pages-b
- page-id:
- page-id:
```

页面范围发生变化时，应在相关 PR 描述中留下记录。

## 3. 文件修改边界

本项目多数页面集中在 `index.html`，因此“修改不同页面”仍可能修改同一个文件。必须按页面区块和选择器隔离变更。

### 可独立修改

- 自己认领页面对应的 `index.html` 页面区块。
- 自己页面专属的 CSS 规则。
- 自己页面的专项测试文件。
- 自己页面对应的图片、SVG 等素材目录。

### 需要协调后修改

- `previews/vantage-h1-immersive.html`：外层场景、登录、翻页、媒体和 iframe 运行时。
- `src/`：内容模型和浏览器运行时。
- `package.json`、`package-lock.json`：依赖和构建命令。
- `vercel.json`：路由和部署配置。
- 全局字体、通用卡片、通用标题、全局导航等共享 CSS。
- 页码注册、章节边界、页面顺序和公共编辑器节点结构。

共享文件需要修改时，遵循以下规则：

1. 在开始前说明修改目的、涉及文件和预计影响页面。
2. 指定一位负责人完成共享改动，另一位暂不修改相同区域。
3. 共享改动单独提交，不与大量页面视觉修改混在一个 commit。
4. 共享提交优先合入 `codex/h1-review-handoff`，另一条分支随后同步。

### CSS 隔离

页面样式必须尽量使用页面专属父级进行限定，例如：

```css
[data-page-id="o2-example"] .metric-card {
  /* 仅影响指定页面 */
}
```

不要为了单页效果直接修改无页面限定的 `.card`、`.title`、`.metric` 等全局选择器。

## 4. 开始工作

每次开始工作前先确认分支和工作区：

```bash
git branch --show-current
git status
git fetch origin
```

负责人 A 应位于：

```text
codex/pages-a
```

负责人 B 应位于：

```text
codex/pages-b
```

工作区干净时，同步自己的远程分支：

```bash
git pull --ff-only
```

不要在有未提交修改时执行合并、变基或切换到不相关分支。需要临时保存时：

```bash
git stash push -u -m "WIP: <页面 ID>"
```

恢复：

```bash
git stash pop
```

## 5. 提交规则

禁止直接使用 `git add .`。只暂存本次负责页面实际涉及的文件：

```bash
git add index.html
git add previews/h1-figma-racing-theme.css
git add tests/check-h1-<topic>.mjs
```

提交前必须检查：

```bash
git status
git diff
git diff --cached
git diff --check
```

Commit 使用简短前缀：

```text
feat: 完成指定页面
fix: 修复页面布局或交互
test: 增加页面回归测试
docs: 更新协作文档
```

建议一个页面或一组紧密相关页面对应一个 commit。不要把格式化全文件、公共运行时修改和页面内容修改混在同一个 commit。

严禁提交：

- `.env*.local`
- `runtime-config.js`
- 真实 Supabase 配置或密钥
- `dist/`
- 未经确认的大型视频文件
- 与本人页面无关的其他负责人修改

## 6. 测试规则

首次安装：

```bash
git lfs install
git lfs pull
npm ci
```

每个页面 PR 至少执行：

```bash
npm test
VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build
```

同时运行本次页面对应的专项测试：

```bash
node tests/check-h1-<topic>.mjs
```

涉及页面视觉、动画、翻页、视频或编辑器时，还必须在本地正式入口进行人工检查：

```text
http://127.0.0.1:4180/previews/vantage-h1-immersive.html
```

人工检查至少覆盖：

- 自己修改的页面。
- 修改页面的前一页和后一页。
- 1920×1080 下的排版、溢出和遮挡。
- 翻页、键盘和滚轮行为。
- 涉及编辑器时的正文槽位和持久化行为。

## 7. 推送与 PR

完成并提交后：

```bash
git push
```

PR 必须使用以下目标：

```text
base:    codex/h1-review-handoff
compare: codex/pages-a 或 codex/pages-b
```

PR 标题示例：

```text
feat: 完成 O2 指定页面
```

PR 描述必须包含：

```text
负责页面 ID：
- ...

修改文件：
- ...

共享区域修改：
- 无 / 具体说明

已执行：
- npm test
- VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build
- node tests/...

人工验证：
- 页面及相邻页已检查
```

## 8. 合入顺序

1. 两人分别把开发分支推送到远程。
2. 分别创建以 `codex/h1-review-handoff` 为 base 的 PR。
3. 先检查并合入其中一个 PR。
4. 第二位负责人同步已经更新的共享分支。
5. 解决冲突并重新执行测试。
6. 合入第二个 PR。
7. 在 `codex/h1-review-handoff` 执行完整测试和整份报告人工回归。
8. 通过现有集成 PR 将 `codex/h1-review-handoff` 合入 `main`。

第二条分支同步共享分支时，使用普通 merge，避免不必要的强制推送：

```bash
git fetch origin
git switch codex/pages-b
git merge origin/codex/h1-review-handoff
```

测试通过后：

```bash
git push
```

## 9. 冲突处理

发生冲突后先查看范围：

```bash
git status
```

在冲突文件中处理：

```text
&lt;&lt;&lt;&lt;&lt;&lt;&lt; 当前分支
&#61;&#61;&#61;&#61;&#61;&#61;&#61; 分隔线
&gt;&gt;&gt;&gt;&gt;&gt;&gt; 合入分支
```

处理原则：

1. 自己页面保留自己的最终实现。
2. 对方页面保留已经进入共享分支的实现。
3. 页面注册、页序、公共数组和公共运行时不能简单选择“全部使用本地”或“全部使用远程”，必须逐项合并。
4. CSS 同名选择器应改为页面专属选择器，避免互相覆盖。
5. 解决后检查是否遗留冲突标记。

```bash
rg -n '^(<<<<<<<|=======|>>>>>>>)' index.html previews src tests
git diff --check
```

然后只暂存已处理文件：

```bash
git add <已处理文件>
git commit -m "merge: sync latest handoff branch"
```

重新执行基础测试、专项测试和人工检查后才能推送。

如果合并过程判断错误且尚未提交：

```bash
git merge --abort
```

禁止使用 `git reset --hard` 或强制覆盖对方分支。

## 10. 集成验收

两个 PR 合入后，在共享分支执行：

```bash
git switch codex/h1-review-handoff
git pull --ff-only
npm test
VANTAGE_ALLOW_EMPTY_CONFIG=1 npm run build
```

还需要检查：

- 完整报告页数和章节顺序。
- 两位负责人修改的所有页面及其相邻页。
- 登录、翻页、编辑器、媒体和关闭页面。
- 控制台没有新增错误。
- 没有意外加入密钥、构建产物或大型媒体。

只有共享分支通过完整验收，才能合入 `main`。

## 11. 生产发布边界

合并代码不等于生产发布。只有收到明确的生产部署请求后才能发布。

唯一生产 URL：

```text
https://vantage-h1.vercel.app/
```

生产发布后必须确认：

- `vantage-h1.vercel.app` 指向本次目标部署。
- 部署状态为 `READY`。
- 部署 commit SHA 与计划发布的 Git commit 完全一致。

其他 Vercel 别名或唯一部署 URL 不能作为最终交付地址。

## 12. 每次交付检查清单

- [ ] 当前分支是本人分配的页面分支。
- [ ] PR 中列出了全部页面 ID。
- [ ] 没有修改未认领页面。
- [ ] 共享区域修改已经协调并单独说明。
- [ ] 使用明确文件路径暂存，没有使用 `git add .`。
- [ ] `git diff --cached` 只包含本次范围。
- [ ] `git diff --check` 通过。
- [ ] `npm test` 通过。
- [ ] 生产构建通过。
- [ ] 页面专项测试通过。
- [ ] 修改页及相邻页已人工检查。
- [ ] PR base 是 `codex/h1-review-handoff`。
- [ ] 没有提交密钥、运行时配置、构建产物或未确认的大型视频。
