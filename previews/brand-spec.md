# Vantage Q1 / H1 视觉 Demo · Brand Spec

> 更新日期：2026-07-23  
> 资产完整度：本次视觉 Demo 所需资产完整

## 核心资产

### Logo

- 主版本：`../vantage-logo.svg`
- 使用场景：沿用现有页面中的页眉、Hero 和导航位置
- 使用约束：不拉伸、不重画、不改变白色字标与橙色标志的结构关系

### 页面与影像

- 正式页面：`../index.html`
- H1 沙漠赛车主视觉：`assets/vantage-h1-desert-racing-hero.png`（1672×941）
- H1 主视觉来源：依据用户提供的图二重建；只继承黑橙沙漠、低位赛车与地平线光感，不包含参考图中的文字、数字或品牌标识
- H1 主视觉质量：8.6/10；无文字、主体清晰、构图为网页标题预留上方暗区
- H1 沙漠赛车主图：`assets/vantage-h1-desert-racing-hero.png`（静态全屏背景）
- H1 主视觉运动语言：赛车和镜头保持静止；不叠加光扫、光晕、网格或位移动效
- Demo C 赛车舞台背景：`assets/vantage-racing-stage-bg.png`
- Demo C 背景来源：依据用户提供的参考稿，通过内置图像生成工具重建为无文字、无标识的独立背景板
- Figma A 赛车主视觉：`assets/vantage-racing-stage-bg.png`，严格保留红色方程式赛车、红色聚光与黑色地面
- Figma B 棋子主视觉：`assets/vantage-h1-chess-stage.png`（1672×941），按参考稿重建的无文字琥珀金棋王舞台，右侧保留数据排版空间
- Figma 赛车数据 Deck：`vantage-h1-figma-racing-data-deck.html`，包含当前 H1 的 10 个数据页面；背景、柔和红色聚光与赛道固定，只有数据层进行 PPT 式纵向翻页
- 赛车只作为联名叙事素材，不改变 Vantage 的品牌主体身份

## 配色系统

### A · Rosso Executive

- Canvas：`#030101`
- Reference black：`#020101`
- Racing red：`#D5001C`
- Racing red highlight：`#FF3B43`
- Vantage orange：`#E35728`
- Primary text：`#F4F0ED`
- Body text：`#CDBEB8`

### B · Vantage Ember

- Canvas：`#080301`
- Elevated dark：`#160703`
- Vantage orange：`#E35728`
- Orange highlight：`#FF7540`
- Racing red：`#D31328`
- Primary text：`#F7F0EA`
- Body text：`#D3BDB0`

### C · Racing Stage

- Canvas：`#020202`
- Stage black：`#080405`
- Vantage orange：`#FF6A13`
- Racing crimson：`#C4122F`
- Crimson highlight：`#F04455`
- Primary text：`#F7F5F2`
- Body text：`#C7C0C0`

## 签名细节

- A：红色负责速度与权威，橙色只在品牌标记、关键状态和少量高光出现。
- B：橙色负责结构与温度，红色只用于赛车感、风险和关键数据。
- C：大幅描边英文、横向信息带、低位赛车背景和双层 KPI 卡构成统一的数据页语法。
- Figma A：赛车与红色聚光为固定主视觉，数据模块使用黑色半透明板、红色斜切标签与非对称舞台构图。
- Figma B：橙红渐变、发光棋王和严格的黑色模块网格，强调战略秩序与管理层阅读路径。
- Figma 数据 Deck：描边 `PERFORMANCE` 与“整体表现”只在第一个数据页面出现；卡片采用无描边深黑半透明材质，允许中央红光轻微透入；其余页面直接进入数据，统一使用 `2025 H2 vs 2026 H1`。
- 两版均使用局部光域与细线，不使用满屏多色渐变或泛滥霓虹。

## 禁区

- 不引入紫色、蓝紫渐变或与品牌无关的强调色。
- 不改变现有数据与事实；Demo C 只重构经营数据板块的版式。
- 不把所有绿色状态色改成橙红，保留必要的语义区分。
- 评审通过前不修改 `../index.html`。

## H1 背景探索 · 2026-07-23

- A「精密数据场」：`vantage-h1-background-a.html`，使用暖黑底、透视数据网格与低亮度橙色扫描。
- B「空气动力学」：`vantage-h1-background-b.html`，使用非具象流线、双层橙色体积光与掠光峰值，不重复汽车素材。
- C「高管黑曜石」：`vantage-h1-background-c.html`，使用深色材质切面与低频橙色掠光。
- 三版统一引用正式 H1 页面、现有 Vantage Logo 与真实数据，只替换报告区域的固定背景层。
- 动效周期控制在 8–12 秒，强调色仅使用 Vantage 橙及少量联名红；评审通过前不部署线上、不修改正式页面。
