/* 产品模块模板。复制成 radar.js / replies.js / quiz.js / vibe.js，只改这一个文件。
   壳（app.js）负责：顶部导航、路由 #/<id>/<sub>、点心、页脚、公用工具。
   你负责：把一个完整可用的产品渲染进 root。 */

App.register({
  id: 'example',            // 路由 #/example ；必须和文件名一致
  accent: 'guard',          // guard | fans | quiz | vibe  → 决定 --accent 颜色
  demo: 12,                 // 对应 story.js 里 PLAN 的键（DEMOS 下标：雷达 12 / 评论 0 / 测试 2 / vibecoding 11）
  name: 'AI 换脸雷达',       // 产品名（导航、卡片、页脚都用它）
  tag: '守护',               // 一两个字的类别
  short: '谁在盗用她的脸，先发现、再取证、再下架。',   // 首页卡片一句话
  meta: '每天扫 · 只记元数据',                     // 首页卡片底部的等宽小字
  blurb: '一段话介绍这个产品做什么、为什么值得做。',   // 首页「怎么落地」区的介绍
  pain: '现在的情况……',       // 首页「现在」
  ai: '有了它之后……',          // 首页「有了它」

  /* root: 已清空的 <main>。ctx 里有：
     $, $$, sleep, esc, fmt, store(get/set/del，已按产品命名空间隔离), toast(msg, 'ok'|'bad'|''),
     think(box, steps, title), show(box, html), chips(el, onPick), modal(html, {title, foot, drawer, onClose}),
     speak(text, {lang, rate, pitch}), sub（当前子路由字符串，比如 'clues'）, go(sub)（跳到子路由）,
     liked(id), togglePick(id), paintPicks() */
  mount(root, ctx) {
    const { $, $$, esc, store, toast, think, show } = ctx;
    root.innerHTML = `
      <div class="app">
        <aside class="side">
          <div class="brand"><i>◎</i><div><b>AI 换脸雷达</b><small>维权看板 · 演示数据</small></div></div>
          <nav>
            <a href="#/example" class="on">总览</a>
            <a href="#/example/clues">线索 <em>12</em></a>
          </nav>
          <div class="sec">设置</div>
          <nav><a href="#/example/settings">关键词与平台</a></nav>
        </aside>
        <section class="main">
          <div class="head"><div><h2>总览</h2><p>这周扫到什么、处理到哪一步。</p></div><button class="btn btn-primary" id="scan">扫一遍</button></div>
          <div class="kpis"><div class="kpi"><b>12</b><span>本周新线索</span></div></div>
          <div class="out" id="out" style="margin-top:16px"></div>
        </section>
      </div>`;
    $('#scan', root).onclick = async () => {
      await think($('#out', root), ['搜标题和摘要', '分级'], '雷达扫描中');
      show($('#out', root), `<div class="card">结果</div>`);
      toast('扫完了', 'ok');
    };
  },
  unmount() { /* 清定时器等，可省略 */ },
});
