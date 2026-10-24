# 第二阶段：真 AI + 「今天」汇总 + 共用档案

壳已加三样东西（`app/ai.js`，读它）：

1. **`ctx.ai`**（Gemini 直连，已实测可用，含 Google 搜索落地）
   - `ai.ready()` → 有没有填钥匙。没填时你的产品必须照旧走演示数据，所有新按钮要么隐藏、要么点了提示「去接入页填钥匙」（链接 `#/connect`）。
   - `await ai.chat(prompt, { system, json: true, temperature })` → 返回文本或解析好的 JSON（json:true 时）。失败会 throw，message 是中文，用 toast(e.message,'bad') 显示即可。
   - `await ai.search(q, { n })` → `{ items: [{title,url,snippet,site,date}], sources }`，用 Google 搜索只看标题摘要。url 多是 Google 的跳转链接，照样可以点。
   - 调用时要有「AI 正在处理」的反馈（用 ctx.think 或你自己的加载态），一次调用 3–15 秒。
2. **`ctx.profile`**：`profile.get()` → `{name, fan, show, showTime, works, persona, tone, taboo, keywords}`；`profile.brief()` → 一段给 AI 的自我介绍，直接拼进 system prompt。**所有写死的「桐铃」「美人余」「李一桐」改为读 profile**（至少在 AI prompt 和显眼文案里）。
3. **`summary(ctx)`**：在你的 `App.register({...})` 对象上加一个同步方法，「今天」页（`#/today`）会调它。返回：
   ```js
   { line: '一句话今天的状态',                       // 比如「6 条等她点头，1 条已回」
     kpis: [['标签', '值'], ...],                   // 最多 4 个
     items: [{ tag: 'P0'|'待点头'|'待点名'|..., text: '要她做的一件事', href: '#/replies/queue', kind: 'bad'|'warn'|'ok'|'' }, ...],  // 最多 5 条，只放真的要她做的
     year: ['这一年她亲自回了 23 条', '...'] }       // 2–3 句，给「这一年的回忆」卡
   ```
   数据从你自己的 store 读（ctx 里有 store，但 **没有 $ 以外的 DOM**，别在 summary 里碰页面）。

## 每个产品的「真做」

- **radar**：「真扫一遍」按钮（接入后才出现，和演示的「扫一遍」并列）。用 `profile.keywords` 拆出关键词，组合「关键词 + 换脸 / AI 短剧 / 神似 / 同款脸」各搜一次（`ai.search`），合并去重；再把标题摘要交给 `ai.chat(json)` 按 radar-plan 的规则判 P0/P1/P2 和平台级别，**C 级成人站只允许出现在标题里，不要让 AI 去打开**；结果作为新线索进线索表，带「真实」标记和原链接，其余流程（处置、取证包、月报）照旧。扫描记录里区分「演示扫描」和「真扫」。
- **replies**：「贴真评论」入口（接入后出现）：textarea 一行一条粘贴（支持「昵称：内容」或纯内容），点「AI 帮挑」→ `ai.chat(json)`，system 用 `profile.brief()` + 你的挑选规则（六类、控评模板去掉、每类至多 N 条、给两版草稿 + 三种语气、海外的带翻译、每条一句「为什么挑它」），输出和现有卡片一模一样的结构，进同一套待发 / 历史流程，卡片带「真实」标记。粉丝隐私：真评论只存本地、「重置演示数据」时一并清掉，并在入口写明。
- **quiz**：「真出一套」（接入后出现）：输入本周剧情一句话（可空），`ai.chat(json)` 按 profile 的作品和粉丝名出 8 题 4 选项 + 6 种类型（类型沿用现有六种），进候选审核流程（状态：AI 初稿 → 她点头 → 发布），发布后可玩、结果卡照常；结果卡背景改用 `../assets/quiz-bg-<type>.jpg`（camera / bell / tape / tv / star / globe，对应六种类型，已在生成中，没生成出来就退回现在的渐变）。
- **vibe**：「真做出来」（接入后出现）：粉丝一句话（输入框，或点子池任一条）→ `ai.chat` 生成**单文件 HTML**（system 里写死约束：不引外部资源、不用任何人脸/声音/照片、不收集信息、手机宽度可用、必须能离线运行、代码精简 ≤ 150 行、顶部标「AI 生成」），先用 `ai.chat(json)` 过一遍禁区判断（脸 / 声音 / 行程 / 工作 / 拉踩 → 拒绝并说明）；通过后把 HTML 放进 `<iframe sandbox="allow-scripts" srcdoc=...>` 在手机框里真跑，代码窗滚真代码，作品进作品墙（HTML 存 store，作品墙点开能再跑，看代码是真代码）。失败（AI 生成的页面报错）要有「让 AI 修一下」按钮，把错误信息回传再生成一次。

## 验收

- 没钥匙：你的 check.mjs 照旧全过，页面上看不到坏掉的入口。
- 有钥匙：在 harness 里先 `localStorage.setItem('lyt4.ai.key', process.env.GEMINI_KEY)`（我会在环境变量里给你，用 `node -e` 读 `~/项目/自己的应用/密钥存储/.env` 里的 GEMINI_API_KEY 也行，**但钥匙不许写进任何文件、截图、回报**），真跑一次你的「真做」流程，截图存 `app/_dev/<id>/real-*.png`。
- `summary()` 在 node 里能被安全调用（不依赖 DOM）。

回报：改了什么、真做流程跑通了没、截图路径、summary 返回示例。