# 做一个「能点、能用」的产品页

站点在 `~/项目/李一桐AI场景/index.html`，深色产品站，壳已经搭好（导航、路由、首页、点心、页脚、公用样式和工具）。你只写 **`app/products/<你的产品>.js`** 这一个文件（可以另建 `app/products/<你的产品>.css`，在 mount 时动态 `<link>` 进去也行，但优先用公用类名）。别动其他文件。

## 用户的原话（就是验收标准）

「我需要完整的页面，详细的，酷炫的，产品能够点击的。能够使用的。」

翻译成要求：
1. **是产品，不是演示**。像一个真的后台 / App：有侧栏导航、多个子页面（用 `ctx.sub` 子路由，`ctx.go('xxx')` 跳转）、列表、详情、筛选、搜索、表单、状态流转、设置页。
2. **每个按钮按下去都有结果**，结果要有后续（状态改了、列表变了、数字变了、出了一张卡 / 一份报告）。不能有「正式版才有」这种 toast 糊弄；要么做出来，要么别放按钮。
3. **状态要存住**：用 `ctx.store`（已按产品隔离的 localStorage），刷新、关掉再开，记录还在；给一个「重置演示数据」按钮。
4. **详细**：数据要有量（线索几十条、评论几百条、点子几十条），字段要全，详情页要有内容，有时间线、有来源、有解释。
5. **酷炫**：深色玻璃、发光、数字滚动、扫描动画、出场动画、图表（用内联 SVG / canvas 自己画，不引库）、实时更新感（定时器模拟新数据进来，但 unmount 时要清掉）。动效克制，别卡。
6. **离线可用**：不引任何 CDN、外链、Web 字体。手机 390 宽也要能用（侧栏在壳里会自动变成横向标签栏）。

## 壳提供的东西

先读 `app/products/_template.js`（注册格式 + ctx 清单）和 `app/app.css`（所有公用类名：.app/.side/.main/.head/.tabs、.card/.panel/.kpi/.kpis/.table/.list/.meter/.steps/.avatar、.btn 系列、.chip/.tag(.p0/.p1/.p2/.ok/.warn/.bad/.info/.accent)、.input/.textarea/.select/.search/.switch、.think/.step/.out/.done-line/.skeleton/.scan/.pulse、dialog.modal/.drawer、.toast、.empty、.grid-2/3/4、.r 出场）。颜色只用变量：`--accent`（壳按你的 accent 自动设）、`--ok --warn --bad --info` 和它们的 `-soft`、`--surface* --line* --text --muted --dim --bg*`。

`ctx` 里的工具：`$ $$ sleep esc fmt store toast think show chips modal speak sub go liked togglePick paintPicks`。`think(box, steps, title)` 是「AI 正在处理」逐步打勾动画；`modal(html,{title,foot,drawer})` 弹层 / 右侧抽屉；`speak` 是浏览器朗读（不是她的声音）。

## 内容来源

- `../story.js`：`PLAN[你的 demo 下标]`（要她做 / AI 做 / 不会做 / 第一周 / 边界）、`RADAR`（雷达的平台分级、P0/P1/P2、处置四步、闭环、公开案例）、`TIMELINE`、`RULES`。
- `../../js/demos.js` 里对应的旧小样（`DEMOS[下标]`）：里面的文案、假数据、交互逻辑可以照搬扩写，**但不要 require 它**，把需要的数据抄进你的文件。
- `../../调研笔记.md`：她的公开画像和事实。
- 雷达专用：`../../参考/雷达仓库/radar-plan.md` 和 `dashboard.html`（用户自己做的看板，风格可以参考）。

## 红线

- 不出现她的脸（任何照片、头像、生成形象），不用她的声音，不做数字分身。结果卡、海报全用文字 + 图形。
- 不碰工作：合同、通告、代言、商务不提。雷达里「工作室 / 律师 / 维权」可以出现。
- 页面文字不用第一人称「我」。
- 所有线索、评论、数字是假数据，产品页里要有一处小字声明（比如侧栏底部或设置页）。
- 雷达：只记元数据（链接、标题、时间、截图哈希），不下载、不存、不看素材；成人站不进内容页，域名不写全。

## 验收（自己跑，没过别交）

写一个 Playwright 脚本（import 路径：`/Users/chenhuajin/.npm-global/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs`），打开 `file:///Users/chenhuajin/项目/李一桐AI场景/app/_dev/harness.html?p=<你的产品>`：
- 桌面 1366×900 和手机 390×844 两档，控制台零报错，`document.documentElement.scrollWidth` 不超过视口。
- 走一遍主流程：每个子页面都进一次，主要按钮都按一遍，截图存到 `app/_dev/<你的产品>/`。
- 刷新后状态还在（再 goto 一次检查）。
- 脚本也放 `app/_dev/<你的产品>/check.mjs`，方便我复跑。

## 交付

回报：文件路径、截图路径、产品有哪些子页面和功能、每个按钮做什么、哪里没做到。不贴代码。
