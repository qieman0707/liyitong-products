/* 站点壳：路由、导航、首页、点心、公用工具。产品模块在 app/products/*.js，各自 register 进 App.products。 */

const App = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Number(n).toLocaleString('zh-CN');

  /* 本地存储：每个产品一个命名空间，关了浏览器再开还在 */
  const store = ns => ({
    get(k, d) { try { const v = localStorage.getItem(`lyt4.${ns}.${k}`); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(`lyt4.${ns}.${k}`, JSON.stringify(v)); } catch (e) { /* 隐私模式 */ } },
    del(k) { try { localStorage.removeItem(`lyt4.${ns}.${k}`); } catch (e) {} },
  });

  function toast(msg, kind = '') {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast ' + kind; t.textContent = msg;
    document.body.append(t); setTimeout(() => t.remove(), 2000);
  }

  /* AI 工作中：逐步打勾，最后停一下再出结果 */
  async function think(box, steps, title = 'AI 正在处理') {
    box.innerHTML = `<div class="think"><div class="hd">${esc(title)}<i><b></b><b></b><b></b></i></div></div>`;
    const t = box.firstChild;
    for (const s of steps) {
      $$('.step', t).forEach(x => x.classList.add('done'));
      t.insertAdjacentHTML('beforeend', `<div class="step">${esc(s)}</div>`);
      await sleep(520);
    }
    $$('.step', t).forEach(x => x.classList.add('done'));
    await sleep(260);
  }
  function show(box, html) { box.innerHTML = html; [...box.children].forEach((c, i) => c.style.setProperty('--i', i)); }
  function chips(el, onPick) {
    $$('.chip', el).forEach(c => c.onclick = () => { $$('.chip', el).forEach(x => x.classList.remove('on')); c.classList.add('on'); onPick && onPick(c.dataset.v, c); });
  }
  function modal(html, opt = {}) {
    const d = document.createElement('dialog'); d.className = 'modal' + (opt.drawer ? ' drawer' : '');
    d.innerHTML = `<div class="mh"><b>${esc(opt.title || '')}</b><button class="x" aria-label="关闭">×</button></div><div class="mb">${html}</div>${opt.foot ? `<div class="mf">${opt.foot}</div>` : ''}`;
    document.body.append(d);
    $('.x', d).onclick = () => d.close();
    d.addEventListener('click', e => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => { opt.onClose && opt.onClose(d); d.remove(); });
    d.showModal(); return d;
  }
  function speak(text, opt = {}) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const lang = opt.lang || 'zh-CN', u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = opt.rate || 1; u.pitch = opt.pitch || 1;
    const v = speechSynthesis.getVoices().find(v => v.lang.replace('_', '-').startsWith(lang)); if (v) u.voice = v;
    speechSynthesis.speak(u); return true;
  }
  const reveal = root => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .08 });
    $$('.r', root).forEach(el => io.observe(el));
  };

  /* ---------- 点心（想要） ---------- */
  const picksStore = store('picks');
  let picks = picksStore.get('ids', []);
  const liked = id => picks.includes(id);
  function togglePick(id) {
    picks = liked(id) ? picks.filter(x => x !== id) : [...picks, id];
    picksStore.set('ids', picks); paintPicks();
    toast(liked(id) ? '记下了，右上角能看到' : '已取消');
  }
  function paintPicks() {
    $$('[data-pick]').forEach(b => { const on = liked(b.dataset.pick); b.classList.toggle('on', on); b.textContent = on ? '♥' : '♡'; b.setAttribute('aria-pressed', on); });
    const n = $('#picks-n'); if (n) n.textContent = picks.length;
  }

  /* ---------- 产品注册与路由 ---------- */
  const products = {};
  const ALL = ['radar', 'replies', 'quiz', 'vibe'];
  /* 暂时关闭的产品（2026-10-24 他定：先只留 3 小测试、4 vibecoding）。代码全保留，恢复时从这里删掉即可 */
  /* 地址带 ?all（如 index.html?all#/radar）时四件全开，给「产品展示」页用 */
  const OFF = /[?&]all\b/.test(location.search) ? [] : ['radar', 'replies'];
  const ORDER = ALL.filter(id => !OFF.includes(id));
  const register = p => { products[p.id] = p; };
  const live = () => ORDER.filter(k => products[k]);
  const CN = n => '零一两三四五六七八九'[n] || String(n);
  const nWord = () => CN(live().length);
  const SITE = () => `这一年 · ${nWord()}件事`;
  /* 首页 / 页脚那句「一个替女演员守住脸，几个让粉丝离女演员更近」，按在线的产品算 */
  const splitLine = () => { const g = live().filter(k => products[k].accent === 'guard').length, f = live().length - g; return [g ? `${CN(g)}个替女演员守住脸` : '', f ? `${CN(f)}个让粉丝离女演员更近` : ''].filter(Boolean).join('，'); };
  let current = null;

  function route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const [id, ...rest] = hash.split('/');
    const sub = rest.join('/');
    const root = $('#view');
    if (current && current.unmount) { try { current.unmount(); } catch (e) {} }
    current = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
    $$('.nav .links a').forEach(a => a.classList.toggle('on', a.dataset.route === (id || 'home')));
    if (id && products[id] && OFF.includes(id)) { location.replace('#/'); return; }
    if (id && products[id]) {
      const p = products[id];
      document.documentElement.dataset.accent = p.accent;
      document.title = `${p.name} · ${SITE()}`;
      root.innerHTML = productFrame(p);
      current = p;
      const mountRoot = $('#p-app', root) || root;
      p.mount(mountRoot, { $, $$, sleep, esc, fmt, store: store(p.id), toast, think, show, chips, modal, speak, sub, liked, togglePick, paintPicks, ai: AI, profile: PROFILE, go: s => { location.hash = `#/${p.id}/${s}`; } });
      paintPicks();
      if (rest.length) { const d = $('#p-desk', root); if (d) window.scrollTo(0, d.offsetTop - 70); else window.scrollTo(0, 0); } else window.scrollTo(0, 0);
      return;
    }
    if (id === 'connect') { document.documentElement.dataset.accent = 'guard'; document.title = `接入 · ${SITE()}`; renderConnect(root); window.scrollTo(0, 0); return; }
    if (id === 'profile') { document.documentElement.dataset.accent = 'quiz'; document.title = `女演员的档案 · ${SITE()}`; renderProfile(root); window.scrollTo(0, 0); return; }
    if (id === 'today') { document.documentElement.dataset.accent = 'fans'; document.title = `今天 · ${SITE()}`; renderToday(root); window.scrollTo(0, 0); return; }
    if (id === 'cases') { document.documentElement.dataset.accent = 'guard'; document.title = `案例佐证 · ${SITE()}`; renderCases(root, sub); window.scrollTo(0, 0); return; }
    if (id === 'picks') { document.documentElement.dataset.accent = 'fans'; document.title = `女演员挑的 · ${SITE()}`; renderPicks(root); window.scrollTo(0, 0); return; }
    document.documentElement.dataset.accent = 'quiz';
    document.title = `这一年，AI 能接住的${nWord()}件事`;
    renderHome(root);
    if (id) { const t = $('#' + id); if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 50); } else window.scrollTo(0, 0);
  }

  /* ---------- 首页：刊物 ---------- */
  const ICON = { radar: '◎', replies: '✉', quiz: '✦', vibe: '⌘' };
  const ASSETS = (document.querySelector('script[src$="app.js"]')?.src || 'app/app.js').replace(/app\.js$/, 'assets/');
  const PIC = { radar: 'ill-radar.jpg', replies: 'ill-replies.jpg', quiz: 'ill-quiz.jpg', vibe: 'ill-vibe.jpg' };
  const TALL = { replies: 1, quiz: 1 };
  const NOTES = {
    radar: [['只记线索，不存素材', '链接、标题、时间和一串哈希。素材本身不下载、不存、不看。'], ['最严重的当天交律师', '按严重程度分三级，最急的 24 小时内打包交律师和取证机构。'], ['女演员每月只看一页', '平时不用管；月底一页报告，出了大事当天一句话。']],
    replies: [['AI 只起草', '挑出最该回的几条，起好草稿。发不发、改不改，女演员说了算。'], ['六类时刻', '生日、考试、生病、多年陪伴、海外粉丝、同人创作。'], ['每天五分钟', '收工后看一眼，点头回一两条，就够了。']],
    quiz: [['一张想晒的卡', '测完拿到一张结果卡，文字和图形，不用女演员的照片。'], ['每周换一个', 'AI 出初稿，女演员点头才发。'], ['不收任何信息', '不登录、不收手机号。']],
    vibe: [['粉丝说一句话', '想要什么小玩意，一句话就行。'], ['AI 做出来，当场能玩', '倒计时、接龙、打卡、抽签……发回超话大家一起玩。'], ['女演员每周点名一个', '说一句为什么喜欢，作者会收到。']],
  };
  function productFrame(p) {
    const notes = NOTES[p.id] || [];
    return `<section class="p-hero">
      <div class="in">
        <div><div class="k">${esc(p.tag)}</div><h1>${esc(p.name)}</h1><p class="lead">${esc(p.blurb)}</p>
          <div class="cta"><a class="btn btn-primary btn-lg" href="#/${p.id}" data-scroll="p-desk">试试看</a><button class="btn btn-lg heart-btn" data-pick="${p.id}">♡</button></div></div>
        <div class="pic${TALL[p.id] ? ' tall' : ''}"><img src="${ASSETS}${PIC[p.id]}" alt="" onerror="this.remove()"></div>
      </div></section>
      <section class="p-notes"><div class="in">${notes.map(n => `<div><b>${esc(n[0])}</b><p>${esc(n[1])}</p></div>`).join('')}</div></section>
      <section class="p-desk" id="p-desk"><div class="in"><div class="k">亲手试</div><h2>下面是真的能用的。</h2><p>里面的数字和内容是演示用的假数据${AI.ready() ? '；带「真」字的按钮会真的调 AI' : '；在「接入 AI」页填上钥匙，带「真」字的按钮就会真的跑'}。</p></div></section>
      <div id="p-app"></div>`;
  }

  function renderHome(root) {
    const P = ORDER.map(id => products[id]).filter(Boolean);
    const dateKey = w => { const m = w.match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/); return m ? +m[1] * 10000 + +m[2] * 100 + (+m[3] || 0) : 0; };
    /* 前因只留和在线产品有关的：guard 条归雷达，fans 条归另外三个 */
    const hasGuard = P.some(p => p.accent === 'guard'), hasFans = P.some(p => p.accent !== 'guard');
    const TL = TIMELINE.filter(t => (t.to === 'guard' ? hasGuard : hasFans));
    const timeline = [...TL].sort((a, b) => dateKey(a.when) - dateKey(b.when)).map(t => `<article class="story-card">
        <div class="when">${esc(t.when.replace(/ 年 /g, '.').replace(/ 月 /g, '.').replace(/ 月$/, '').replace(/ 日$/, ''))}<small>${t.to === 'guard' ? '关于女演员的脸' : '关于粉丝'}</small></div>
        <div><h3>${esc(t.head)}</h3><p class="what">${esc(t.what)}</p>
        <div class="so">所以，${esc(t.so)}</div>
        <div class="src">来源 ${t.src.map(s => `<a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join('')}</div></div></article>`).join('');
    /* 前因：先给一根时间线，四件事落在哪个月 */
    const tlEvents = [...TL].sort((a, b) => dateKey(a.when) - dateKey(b.when)).map(t => { const m = t.when.match(/(\d{4})\D+(\d{1,2})(?:\D+(\d{1,2}))?/); return { t: new Date(+m[1], +m[2] - 1, +(m[3] || 15)).getTime(), l: t.head, sub: `${m[1]}.${m[2]}${m[3] ? '.' + m[3] : ''} · ${t.to === 'guard' ? '关于女演员的脸' : '关于粉丝'}`, c: t.to === 'guard' ? 'var(--c-guard)' : 'var(--c-fans)' }; });
    const storyViz = `<div class="f-viz"><div class="vh"><b>这一年发生了什么</b><span>${tlEvents.length} 件事，${tlEvents.filter(e => e.c.includes('guard')).length} 件关于脸，${tlEvents.filter(e => e.c.includes('fans')).length} 件关于粉丝</span></div><div class="viz-scroll">${Viz.timeline(tlEvents, { w: 1000, h: 140, maxL: 22, from: new Date(2025, 8, 1).getTime(), to: new Date(2026, 8, 1).getTime(), label: `这一年${nWord()}件事的时间线` })}</div></div>`;
    /* 案例：68 条怎么分布 */
    const caseAll = typeof CASES !== 'undefined' ? ORDER.filter(k => products[k]).flatMap(k => (CASES[k] || []).map(c => ({ ...c, p: k }))) : [];
    const caseViz = caseAll.length ? (() => {
      const byP = ORDER.filter(k => products[k]).map(k => ({ l: CASE_LABEL[k], v: caseAll.filter(c => c.p === k).length, c: `var(--c-${products[k].accent})` }));
      const yrs = {}; caseAll.forEach(c => { const y = (c.when || '').match(/20\d\d/); const k = y ? y[0] : '更早'; yrs[k] = (yrs[k] || 0) + 1; });
      const yk = Object.keys(yrs).filter(k => k !== '更早').sort(), yv = yk.map(k => yrs[k]);
      const reg = [['中国', 'var(--c-guard)'], ['韩国', 'var(--c-quiz)'], ['海外', 'var(--c-vibe)']].map(([r, c]) => ({ l: r, v: caseAll.filter(x => x.region === r).length, c }));
      const conf = [['高', '官方原文', 'var(--ink)'], ['中', '媒体转述', 'var(--dim)']].map(([k, l, c]) => ({ l, v: caseAll.filter(x => x.conf === k).length, c }));
      return `<div class="f-viz"><div class="vh"><b>${caseAll.length} 条公开案例，都在这里了</b><span>按产品、按年份、按地区</span></div>
        <div class="f-viz-row">
          <div>${Viz.stack(byP, { w: 320, label: '案例按产品' })}</div>
          <div>${Viz.cols(yv, { w: 320, h: 96, labels: yk, vals: true, c: 'var(--c-guard)', label: '案例按年份' })}<p class="xs dim" style="margin-top:4px">按发生年份，越近越多：这不是老故事，是正在发生的事。</p></div>
          <div>${Viz.stack(reg, { w: 320, label: '案例按地区' })}<div style="margin-top:14px">${Viz.stack(conf, { w: 320, h: 8, label: '案例来源' })}</div></div>
        </div></div>`;
    })() : '';
    /* 落地：一周里哪天要她出手 */
    const WEEK_ROWS = {
      radar: { l: 'AI 换脸雷达', days: [0, 0, 0, 0, 0, 0, 0], note: '月底看一页；P0 当天一句话', c: 'var(--c-guard)' },
      replies: { l: '评论挑信', days: [1, 1, 1, 1, 1, 1, 1], note: '每天收工后 5 分钟', c: 'var(--c-fans)' },
      quiz: { l: '桐铃小测试', days: [0, 0, 0, 2, 0, 0, 0], note: '周四点头，周五 20:00 上线', c: 'var(--c-quiz)' },
      vibe: { l: '桐铃 vibecoding', days: [0, 0, 0, 0, 0, 0, 2], note: '周日点名一个', c: 'var(--c-vibe)' },
    };
    const weekViz = Viz.weekgrid(ORDER.filter(k => products[k] && WEEK_ROWS[k]).map(k => WEEK_ROWS[k]), { w: 760, lw: 130, nw: 220, label: '一周里哪天要女演员出手' });
    /* 三个不做：只属于某个产品的那条（only）跟着产品一起下线；提到雷达的补句（radar）也一样 */
    const RL = RULES.filter(r => !r.only || ORDER.includes(r.only));
    const vows = RL.map(r => `<div class="vow"><div class="mark">不</div><b>${esc(r.head)}</b><p>${esc(r.d)}${r.radar && ORDER.includes('radar') ? esc(r.radar) : ''}</p></div>`).join('');
    const features = P.map(p => {
      const plan = PLAN[p.demo] || {};
      return `<details class="plan-row" id="f-${p.id}">
        <summary><span class="pn">${esc(p.name)}</span><span class="pw">${esc((plan.week1 && plan.week1[0] && plan.week1[0][1]) || p.short)}</span><span class="pc">${esc(plan.cost || '')}</span></summary>
        <div class="detail">
          <div>
            <div class="pair"><div><b>现在</b>${esc(p.pain)}</div><div><b>有了它</b>${esc(p.ai)}</div></div>
            <div class="cols" style="margin-top:14px"><div><b>要女演员做的</b>${esc(plan.she || '')}</div><div><b>AI 做的</b>${esc(plan.ai || '')}</div><div><b>不会做的</b>${esc(plan.not || '')}</div></div>
          </div>
          <div>
            <div class="sub">第一周怎么开始</div>
            <ol class="week">${(plan.week1 || []).map((w, k) => `<li><b>第 ${k + 1} 步 ${esc(w[0])}</b><span>${esc(w[1])}</span></li>`).join('')}</ol>
            <div class="sub">边界</div>
            <ul class="bounds">${(plan.bounds || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
            <div class="row" style="margin-top:16px"><a class="btn btn-primary" href="#/${p.id}">打开 ${esc(p.name)}</a><button class="heart" data-pick="${p.id}" aria-label="想要">♡</button></div>
          </div>
        </div>
      </details>`;
    }).join('');
    root.innerHTML = `
    <div class="folio">
      <header class="f-hero" id="top">
        <div class="in">
          <div class="f-meta"><span>李一桐</span><span>二〇二六年十月</span></div>
          <figure class="f-cover"><img src="${ASSETS}ill-cover.jpg" alt="" onerror="this.parentElement.remove()"></figure>
          <div class="f-intro">
            <i class="sq"></i>
            <p>这一年女演员的日子，AI 能接住的${nWord()}件事。</p>
            <p class="muted">先讲前因：这一年公开报道里发生了什么。再给后果：${nWord()}个做出来、能直接点、能直接用的东西。${splitLine()}。</p>
            <p class="f-links"><a href="#/today">从「今天」开始</a><a href="#story">先看前因</a></p>
          </div>
        </div>
      </header>

      <section class="f-works" id="products">
        <div class="in">
          ${P.map((p, i) => `<a class="work w-${p.id}" href="#/${p.id}" style="--pc:var(--c-${p.accent})">
            <figure><img src="${ASSETS}ill-${p.id}.jpg" alt="" onerror="this.remove()"></figure>
            <div class="cap"><div class="l"><h3>${esc(p.name)}</h3><small>${esc(p.tag)}</small></div><p>${esc(p.short)}</p></div>
            <button class="heart" data-pick="${p.id}" aria-label="想要">♡</button>
          </a>`).join('')}
          <p class="f-note">不是演示稿。点开是完整的产品：有数据、有按钮，按了有结果，关了再开记录还在。里面的线索、评论、数字都是演示用的假数据。页面里没有女演员的照片，会出声的只是浏览器自带的朗读。</p>
        </div>
      </section>

      <section class="f-story" id="story">
        <div class="in">
          <p class="f-lead">主意不是凭空想的，都来自这一年的公开报道。每条都带出处，细节以女演员说的为准。</p>
          ${storyViz}
          <div class="story">${timeline}</div>
        </div>
      </section>

      <section class="f-vows" id="rules">
        <div class="in">
          <p class="f-lead">所有东西都在这${CN(RL.length)}条线以内。</p>
          <div class="vows">${vows}</div>
        </div>
      </section>

      <section class="f-cases" id="cases-teaser">
        <div class="in">
          <p class="f-lead">别人已经这么做了，而且有数据。${nWord()}件东西各找了十几到二十几条公开案例，每条都打开原文核对过。</p>
          ${caseViz}
          <div class="case-teaser">${ORDER.filter(k => products[k]).map(k => { const top = topCase(k); return `<a class="case-pill" href="#/cases/${k}"><div class="n"><b>${typeof CASES !== 'undefined' ? (CASES[k] || []).length : '—'}</b><span>${esc(CASE_LABEL[k])}</span></div>${top ? `<div class="t"><em>${esc(top.title)}</em><small>${esc(top.proves)}</small></div>` : ''}</a>`; }).join('')}</div>
          <p class="f-links"><a href="#/cases">看全部案例</a></p>
        </div>
      </section>

      <section class="f-plans" id="plans">
        <div class="in">
          <p class="f-lead">谁做什么，第一周怎么开始，边界在哪。每件东西一行，点开看细节。</p>
          <div class="f-viz"><div class="vh"><b>一周里哪天要女演员出手</b><span>实心点是要女演员点头的那天，其余日子 AI 自己转</span></div><div class="viz-scroll">${weekViz}</div></div>
          <div class="plan-list">${features}</div>
        </div>
      </section>
    </div>`;
    paintPicks();
  }

  /* ---------- 案例佐证 ---------- */
  const TOP_HINT = { radar: ['迪丽热巴'], replies: ['Facebook', 'Creator Studio', 'Meta'], quiz: ['K-Pop Persona', 'Persona', 'Spotify'], vibe: ['Alex Finn', 'B 站', 'Toy'] };
  const topCase = k => { if (typeof CASES === 'undefined') return null; const arr = CASES[k] || []; return arr.find(c => (TOP_HINT[k] || []).some(h => (c.title + c.who).includes(h))) || arr[0] || null; };
  const CASE_LABEL = { radar: 'AI 换脸雷达', replies: '评论挑信', quiz: '桐铃小测试', vibe: '桐铃 vibecoding' };
  const CONF_CLS = { '高': 'ok', '中': 'warn', '低': 'bad' };
  const CONF_TXT = { '高': '官方原文', '中': '媒体转述', '低': '说法有冲突' };
  function renderCases(root, sub) {
    if (typeof CASES === 'undefined') { root.innerHTML = `<div class="landing"><section class="section"><div class="in"><div class="empty"><b>案例还在整理</b>稍后再来。</div></div></section></div>`; return; }
    const f = { p: ORDER.includes(sub) ? sub : 'all', r: 'all', c: 'all', q: '' };
    const all = ORDER.filter(k => products[k]).flatMap(k => (CASES[k] || []).map(c => ({ ...c, p: k })));
    const draw = () => {
      const list = all.filter(c => (f.p === 'all' || c.p === f.p) && (f.r === 'all' || c.region === f.r) && (f.c === 'all' || c.conf === f.c) && (!f.q || (c.title + c.who + c.what + c.proves).includes(f.q)));
      const counts = Object.fromEntries(ORDER.map(k => [k, (CASES[k] || []).length]));
      $('#case-list', root).innerHTML = list.length ? list.map(c => `<details class="case" style="--pc:var(--c-${products[c.p].accent})">
          <summary>
            <div class="case-top"><span class="tag" style="color:var(--pc);border-color:color-mix(in srgb,var(--pc) 45%,transparent)">${esc(CASE_LABEL[c.p])}</span><span class="tag ${CONF_CLS[c.conf] || ''}">${esc(CONF_TXT[c.conf] || c.conf)}</span></div>
            <h3>${esc(c.title)}</h3>
            <div class="case-meta">${esc(c.who)}${c.when ? `，${esc(c.when)}` : ''}${c.region ? `，${esc(c.region)}` : ''}${c.step ? `，${esc(c.step)}` : ''}${c.group ? `，${esc(c.group)}` : ''}</div>
            <div class="case-proves">${esc(c.proves)}</div>
            <span class="case-more">看经过</span>
          </summary>
          <p class="case-what">${esc(c.what)}</p>
          <div class="case-src">来源 ${(c.source || []).map(sr => `<a href="${esc(sr[1])}" target="_blank" rel="noopener">${esc(sr[0])}</a>`).join('')}</div>
        </details>`).join('') : `<div class="empty"><b>没有符合的案例</b><span class="small">换个条件，或者</span><div style="margin-top:12px"><button class="btn btn-sm" id="case-clear">清空筛选</button></div></div>`;
      const cc = $('#case-clear', root); if (cc) cc.onclick = () => { f.p = 'all'; f.r = 'all'; f.c = 'all'; f.q = ''; $('#case-q', root).value = ''; location.hash = '#/cases'; draw(); };
      $('#case-n', root).textContent = `${list.length} 条`;
      /* 一眼看：筛出来的这些案例按产品 / 年份 / 地区怎么分 */
      const vz = $('#case-viz', root);
      if (vz) {
        if (!list.length) vz.innerHTML = '';
        else {
          const byP = ORDER.filter(k => products[k]).map(k => ({ l: CASE_LABEL[k], v: list.filter(c => c.p === k).length, c: `var(--c-${products[k].accent})` })).filter(x => x.v);
          const yrs = {}; list.forEach(c => { const y = (c.when || '').match(/20\d\d/); if (y) yrs[y[0]] = (yrs[y[0]] || 0) + 1; });
          const yk = Object.keys(yrs).sort(), yv = yk.map(k => yrs[k]);
          const reg = [['中国', 'var(--c-guard)'], ['韩国', 'var(--c-quiz)'], ['海外', 'var(--c-vibe)']].map(([r, c]) => ({ l: r, v: list.filter(x => x.region === r).length, c })).filter(x => x.v);
          const conf = [['高', '官方原文', 'var(--ink)'], ['中', '媒体转述', 'var(--dim)'], ['低', '说法有冲突', 'var(--bad)']].map(([k, l, c]) => ({ l, v: list.filter(x => x.conf === k).length, c })).filter(x => x.v);
          const latest = yk.length ? yk[yk.length - 1] : '';
          vz.innerHTML = `<div class="viz-grid">
            <div class="viz-card"><div class="vh"><b>按产品</b><span>${list.length} 条</span></div>${Viz.stack(byP, { w: 320, label: '案例按产品' })}</div>
            <div class="viz-card"><div class="vh"><b>按年份</b><span>${latest ? `${latest} 年 ${yrs[latest]} 条` : ''}</span></div>${Viz.cols(yv, { w: 320, h: 92, labels: yk, vals: true, c: 'var(--c-guard)', label: '案例按年份' })}</div>
            <div class="viz-card"><div class="vh"><b>按地区 · 按来源</b><span>${reg.map(r => r.l + ' ' + r.v).join(' · ')}</span></div>${Viz.stack(reg, { w: 320, label: '案例按地区' })}<div style="margin-top:12px">${Viz.stack(conf, { w: 320, h: 8, label: '案例来源' })}</div></div>
          </div>`;
        }
      }
      $$('[data-f]', root).forEach(b => { const [k, v] = b.dataset.f.split(':'); b.classList.toggle('on', f[k] === v); });
      $('#case-note', root).textContent = f.p === 'all' ? `${nWord()}个产品共 ${all.length} 条公开案例，每条都打开过原文核对。点开一条看经过和出处。` : (CASES_NOTE[f.p] || '');
      ORDER.forEach(k => { const e = $(`[data-f="p:${k}"] em`, root); if (e) e.textContent = counts[k]; });
    };
    root.innerHTML = `<div class="landing"><section class="section cases-page"><div class="in">
      <div class="title"><span class="eyebrow">佐证</span><h2>别人已经这么做了，<br>而且有数据。</h2><p id="case-note"></p></div>
      <div class="case-filters">
        <div class="chips"><button class="chip" data-f="p:all">全部</button>${ORDER.map(k => `<button class="chip" data-f="p:${k}">${esc(CASE_LABEL[k])} <em></em></button>`).join('')}</div>
        <div class="row case-more-filters" style="margin-top:10px;gap:14px">
          <button class="chip only-m" id="case-toggle">更多筛选</button>
          <div class="chips hide-m-f"><button class="chip" data-f="r:all">所有地区</button><button class="chip" data-f="r:中国">中国</button><button class="chip" data-f="r:韩国">韩国</button><button class="chip" data-f="r:海外">海外</button></div>
          <div class="chips hide-m-f"><button class="chip" data-f="c:all">所有来源</button><button class="chip" data-f="c:高">官方原文</button><button class="chip" data-f="c:中">媒体转述</button></div>
          <div class="search hide-m-f" style="flex:1;min-width:200px"><input class="input" id="case-q" placeholder="搜人名、平台、关键词"></div>
          <span class="small muted" id="case-n"></span>
        </div>
      </div>
      <div id="case-viz" style="margin:6px 0 22px"></div>
      <div class="case-grid" id="case-list"></div>
      <p class="fine muted" style="margin-top:26px">每条都附原文链接，检索于 2026-10-23。</p>
    </div></section></div>`;
    $$('[data-f]', root).forEach(b => b.onclick = () => { const [k, v] = b.dataset.f.split(':'); f[k] = v; if (k === 'p') history.replaceState(null, '', v === 'all' ? '#/cases' : `#/cases/${v}`); draw(); });
    $('#case-toggle', root).onclick = e => { $('.case-more-filters', root).classList.toggle('open'); e.target.textContent = $('.case-more-filters', root).classList.contains('open') ? '收起筛选' : '更多筛选'; };
    $('#case-q', root).oninput = e => { f.q = e.target.value.trim(); draw(); };
    draw();
  }

  /* ---------- 接入 / 档案 / 今天 ---------- */
  const REAL_LINE = { radar: '真扫网页', replies: '真挑评论', quiz: '真出题', vibe: '真写小玩意' };
  const REAL_DESC = {
    radar: p => `「真扫一遍」：用搜索找今天含「${esc(p.keywords.split(',')[0])}」+ 换脸 / 神似 的网页标题，AI 分级进线索表。成人站只看标题。`,
    replies: () => '「贴真评论」：把一条微博下的评论复制进来，AI 按女演员的语气挑出最该回的几条并起草。',
    quiz: () => '「真出一套」：按本周剧情现场出题，结果卡照常能存。',
    vibe: () => '「真做出来」：随口说一句，AI 现场写出能玩的小玩意，当场跑。',
  };
  const PROFILE_USE = { replies: '挑信按这里的语气起草', quiz: '小测试按作品出题', vibe: 'vibecoding 按禁区过滤点子', radar: '雷达按关键词扫' };
  const TODAY_USE = { replies: '该回谁', radar: '有没有新线索', vibe: '这周点名哪个', quiz: '测试数据怎么样' };
  function paintAI() { const a = $('.nav .ai-dot'); if (a) a.classList.toggle('on-ai', AI.ready()); }
  function renderConnect(root) {
    const p = PROFILE.get();
    root.innerHTML = `<div class="landing"><section class="section"><div class="in" style="max-width:720px">
      <span class="eyebrow">接入</span><h2 style="font-size:32px;margin:10px 0 8px">让${nWord()}件东西真的跑起来。</h2>
      <p class="muted">填一把钥匙，${nWord()}件东西就从演示数据切到真 AI：${live().map(k => REAL_LINE[k]).filter(Boolean).join('、')}。钥匙只存在这台设备的浏览器里，不上传。</p>
      <div class="card" style="margin-top:24px">
        <label class="small muted">Gemini API 钥匙</label>
        <input class="input" id="ai-key" type="password" placeholder="AIza…" value="${esc(AI.key.get())}" style="margin:6px 0 14px">
        <div class="row"><button class="btn btn-primary" id="ai-save">保存并测试</button><button class="btn btn-ghost" id="ai-clear">清掉钥匙</button><span class="tag ${AI.ready() ? 'ok' : ''}" id="ai-msg">${AI.ready() ? '已接入' : '未接入，用演示数据'}</span></div>
        <details style="margin-top:14px"><summary class="small muted" style="cursor:pointer">高级：换模型</summary><input class="input" id="ai-model" value="${esc(AI.model())}" style="margin:8px 0 0"></details>
      </div>
      <div class="card" style="margin-top:14px"><div class="hd"><h3>接入后每件东西多出什么</h3></div>
        <ul class="list">
          ${live().map(k => `<li><span class="avatar" style="--accent:var(--c-${products[k].accent})">${ICON[k]}</span><div><b>${esc(products[k].name)}</b><div class="small muted">${REAL_DESC[k](p)}</div></div></li>`).join('')}
        </ul></div>
      <div class="row" style="margin-top:16px"><a class="btn" href="#/profile">女演员的档案</a><a class="btn btn-ghost" href="#/today">去「今天」</a></div>
      <p class="fine muted" style="margin-top:16px">要联网。断网时${nWord()}件东西自动退回演示数据，不会坏。</p>
    </div></section></div>`;
    $('#ai-save', root).onclick = async () => {
      AI.key.set($('#ai-key', root).value); AI.setModel($('#ai-model', root).value.trim() || AI.DEFAULT_MODEL); paintAI();
      const m = $('#ai-msg', root); m.textContent = '测试中…'; m.className = 'tag';
      try { const t = await AI.test(); m.textContent = `${t}，${(AI.state.last.ms / 1000).toFixed(1)} 秒`; m.className = 'tag ok'; toast('接入成功', 'ok'); } catch (e) { m.textContent = e.message; m.className = 'tag bad'; toast('没接上', 'bad'); }
    };
    $('#ai-clear', root).onclick = () => { AI.key.set(''); paintAI(); $('#ai-key', root).value = ''; const m = $('#ai-msg', root); m.textContent = '已清掉，用演示数据'; m.className = 'tag'; };
  }
  function renderProfile(root) {
    const p = PROFILE.get();
    const G = [['女演员是谁', [['name', '名字'], ['fan', '粉丝名'], ['show', '在播的剧'], ['showTime', '更新节奏'], ['works', '作品']]], ['女演员怎么说话', [['persona', '人设关键词'], ['tone', '回复语气']]], ['红线', [['taboo', '禁区'], ...(ORDER.includes('radar') ? [['keywords', '雷达关键词（逗号分开）']] : [])]]];
    const field = (k, l) => `<label class="small muted">${l}</label>${['works', 'persona', 'taboo', 'tone'].includes(k) ? `<textarea class="textarea" data-k="${k}" style="min-height:70px;margin:6px 0 14px">${esc(p[k])}</textarea>` : `<input class="input" data-k="${k}" value="${esc(p[k])}" style="margin:6px 0 14px">`}`;
    const briefShown = () => PROFILE.brief().replace(/页面文字不用第一人称「我」指代当事人。?/, '');
    root.innerHTML = `<div class="landing"><section class="section"><div class="in" style="max-width:720px">
      <span class="eyebrow">女演员的档案</span><h2 style="font-size:32px;margin:10px 0 8px">一处填好，${nWord()}件东西共用。</h2>
      <p class="muted">${live().map(k => PROFILE_USE[k]).filter(Boolean).join('，')}。</p>
      ${G.map(([t, fs]) => `<div class="card" style="margin-top:18px"><div class="hd"><h3>${t}</h3></div>${fs.map(([k, l]) => field(k, l)).join('')}</div>`).join('')}
      <div class="row" style="margin-top:18px"><button class="btn btn-primary" id="pf-save">保存</button><button class="btn btn-ghost" id="pf-reset">恢复默认</button></div>
      <div class="card" style="margin-top:18px"><div class="hd"><h3>AI 会看到的自我介绍</h3></div><p class="small muted" id="pf-brief">${esc(briefShown())}</p></div>
    </div></section></div>`;
    $('#pf-save', root).onclick = () => { const patch = {}; $$('[data-k]', root).forEach(el => patch[el.dataset.k] = el.value.trim()); PROFILE.set(patch); $('#pf-brief', root).textContent = briefShown(); toast('档案已保存', 'ok'); };
    $('#pf-reset', root).onclick = () => { PROFILE.reset(); renderProfile(root); toast('已恢复默认'); };
  }
  function renderToday(root) {
    const P = ORDER.map(id => products[id]).filter(Boolean);
    const ctxOf = p => ({ $, $$, esc, fmt, store: store(p.id), profile: PROFILE, ai: AI });
    const blocks = P.map(p => {
      let sm = null; try { sm = p.summary ? p.summary(ctxOf(p)) : null; } catch (e) { sm = null; }
      const items = (sm && sm.items) || [];
      const kpis = (sm && sm.kpis) || [];
      return `<section class="today-block" style="--pc:var(--c-${p.accent})">
        <div class="hd"><div class="row"><span class="avatar" style="--accent:var(--c-${p.accent})">${ICON[p.id]}</span><div><b>${esc(p.name)}</b><div class="small muted">${esc(sm && sm.line || p.short)}</div></div></div><a class="btn btn-sm" href="#/${p.id}">打开</a></div>
        ${kpis.length ? `<div class="today-kpis">${kpis.map(k => `<div><b>${esc(k[1])}</b><span>${esc(k[0])}</span></div>`).join('')}</div>` : ''}
        ${sm && sm.viz ? `<div class="today-viz">${sm.vizLabel ? `<div class="lbl">${esc(sm.vizLabel)}</div>` : ''}${sm.viz}</div>` : ''}
        ${items.length ? `<ul class="list">${items.map(it => `<li><span class="tag ${it.kind || ''}">${esc(it.tag || '待办')}</span><div style="flex:1">${esc(it.text)}</div>${it.href ? `<a class="btn btn-sm btn-ghost" href="${esc(it.href)}">去做</a>` : ''}</li>`).join('')}</ul>` : `<div class="empty" style="min-height:90px"><span class="small">今天没有要女演员做的</span></div>`}
      </section>`;
    }).join('');
    const d = new Date(), wk = '日一二三四五六'[d.getDay()];
    root.innerHTML = `<div class="landing"><section class="section today-page"><div class="in" style="max-width:860px">
      <span class="eyebrow">今天 · ${d.getMonth() + 1} 月 ${d.getDate()} 日 周${wk}</span>
      <h2 style="font-size:34px;margin:10px 0 8px">女演员每天只看这一页。</h2>
      <p class="muted">${nWord()}件东西把今天要女演员做的事汇到这里：${live().map(k => TODAY_USE[k]).filter(Boolean).join('、')}。每件事一分钟。${AI.ready() ? '' : '<a href="#/connect" style="color:var(--accent);text-decoration:underline">接入 AI</a> 后这里会是真数据。'} <a href="#/profile" style="color:var(--muted);text-decoration:underline">女演员的档案</a></p>
      <div class="today-grid">${blocks}</div>
      <div class="card year-card" style="margin-top:22px"><div class="hd"><h3>这一年的回忆</h3><button class="btn btn-sm" id="yr-make">重新生成</button></div><div id="yr-out" style="margin-top:12px"></div></div>
    </div></section></div>`;
    $('#yr-make', root).onclick = () => {
      const stats = P.map(p => { let sm = null; try { sm = p.summary ? p.summary(ctxOf(p)) : null; } catch (e) {} return { p, year: (sm && sm.year) || [] }; });
      const H = 1560; const c = document.createElement('canvas'); c.width = 1080; c.height = H; const g = c.getContext('2d');
      const bg = g.createLinearGradient(0, 0, 1080, H); bg.addColorStop(0, '#fbfaf8'); bg.addColorStop(1, '#f1eef7'); g.fillStyle = bg; g.fillRect(0, 0, 1080, H);
      const COL = { guard: '#2f6f80', fans: '#9a3f58', quiz: '#4b3d84', vibe: '#2f7a4f' };
      stats.forEach((s, i) => { const gr = g.createRadialGradient(200 + i * 230, 200, 10, 200 + i * 230, 200, 420); gr.addColorStop(0, COL[s.p.accent] + '22'); gr.addColorStop(1, 'transparent'); g.fillStyle = gr; g.fillRect(0, 0, 1080, H); });
      g.fillStyle = '#121212'; g.font = '600 64px "Songti SC","STSong",serif'; g.fillText('这一年，', 80, 200); g.fillText(`${PROFILE.get().name}和${PROFILE.get().fan}`, 80, 290);
      g.font = '400 30px "PingFang SC",sans-serif'; g.fillStyle = '#6e6a66'; g.fillText(`${d.getFullYear()} 年 · ${nWord()}件事的记录`, 80, 350);
      let y = 460;
      stats.forEach(s => { g.fillStyle = COL[s.p.accent]; g.fillRect(80, y - 34, 8, 44); g.fillStyle = '#121212'; g.font = '600 38px "Songti SC","STSong",serif'; g.fillText(s.p.name, 110, y); g.font = '400 30px "PingFang SC",sans-serif'; g.fillStyle = '#4a4744'; (s.year.length ? s.year : ['还没开始']).slice(0, 3).forEach(line => { y += 52; g.fillText(line, 110, y); }); y += 90; });
      g.fillStyle = '#a19c96'; g.font = '400 24px "PingFang SC",sans-serif'; g.fillText(`不碰脸，不碰声音，只做女演员和${PROFILE.get().fan}之间的事 · 数字为演示`, 80, H - 70);
      const url = c.toDataURL('image/png');
      $('#yr-out', root).innerHTML = `<img src="${url}" style="width:100%;max-width:420px;border-radius:12px;border:1px solid var(--line)"><div><p class="small muted" style="line-height:1.9">把女演员亲自点头过的、点名过的攒成一张图。数字会跟着${nWord()}件东西里的记录走。年底这张卡就是这一年的注脚，可以存下来，也可以发给桐铃。</p><div class="row" style="margin-top:14px"><a class="btn btn-sm btn-primary" download="这一年.png" href="${url}">保存图片</a><button class="btn btn-sm btn-ghost" id="yr-re">重新生成</button></div></div>`;
      const re = $('#yr-re', root); if (re) re.onclick = () => $('#yr-make', root).click();
    };
    $('#yr-make', root).click();
  }

  function renderPicks(root) {
    const P = picks.map(id => products[id]).filter(Boolean);
    root.innerHTML = `<div class="landing"><section class="picks-page"><div class="in" style="max-width:760px">
      <span class="eyebrow">最后 · 女演员挑的</span><h2 style="font-size:32px;margin:10px 0 8px">看中哪几个，就先从哪几个开始。</h2>
      <p class="muted">在卡片或产品页点 ♡，这里会列出来。</p>
      <div class="card" style="margin-top:24px">${P.length ? `<ul class="list">${P.map(p => `<li><span class="avatar" style="--accent:var(--c-${p.accent})">${ICON[p.id]}</span><div style="flex:1"><b>${esc(p.name)}</b><div class="small muted">${esc(p.short)}</div></div><a class="btn btn-sm" href="#/${p.id}">打开</a><button class="btn btn-sm btn-ghost" data-un="${p.id}">取消</button></li>`).join('')}</ul>`
        : `<div class="empty" style="text-align:left"><b>还没点心</b><span class="small">看中哪个，在这里直接点 ♡。</span><ul class="list" style="margin-top:14px">${ORDER.map(id => products[id]).filter(Boolean).map(p => `<li><span class="avatar" style="--accent:var(--c-${p.accent})">${ICON[p.id]}</span><div style="flex:1"><b>${esc(p.name)}</b><div class="small muted">${esc(p.short)}</div></div><button class="heart" data-pick="${p.id}" aria-label="想要">♡</button></li>`).join('')}</ul></div>`}</div>
      <div class="row" style="margin-top:16px"><button class="btn btn-primary" id="copy" ${P.length ? '' : 'disabled'}>把挑的复制成一段话</button><a class="btn" href="#/">回首页</a></div>
    </div></section></div>`;
    $$('[data-un]', root).forEach(b => b.onclick = () => { togglePick(b.dataset.un); renderPicks(root); });
    const c = $('#copy', root); if (c) c.onclick = async () => { const text = `想先试这几个：${P.map(p => p.name).join('；')}。`; try { await navigator.clipboard.writeText(text); toast('复制好了'); } catch (e) { window.prompt('长按全选复制：', text); } };
  }

  /* ---------- 启动 ---------- */
  function boot() {
    /* 站名、页脚产品栏、页脚那句话都按在线产品数来 */
    const logo = $('.nav .logo'); if (logo) logo.innerHTML = `<i></i>${esc(SITE())}`;
    const fh = $('#foot-head'); if (fh) fh.textContent = SITE();
    const fl = $('#foot-line'); if (fl) fl.textContent = `给女演员的${nWord()}件东西：${splitLine()}。`;
    const fr = $('#foot-rules'); if (fr) fr.textContent = `${CN(RULES.filter(r => !r.only || ORDER.includes(r.only)).length)}个不做`;
    const fp = $('#foot-products'); if (fp) fp.innerHTML = `<h4>产品</h4>` + live().map(k => `<a href="#/${k}">${esc(products[k].name)}</a>`).join('');
    const links = $('#nav-links');
    links.innerHTML = `<a href="#/" data-route="home">首页</a><a href="#/today" data-route="today">今天</a>` + ORDER.map(id => products[id]).filter(Boolean).map(p => `<a href="#/${p.id}" data-route="${p.id}">${esc(p.name)}</a>`).join('') + `<a href="#/cases" data-route="cases">案例</a><a href="#/picks" data-route="picks" class="only-m">女演员挑的</a><a href="#/connect" data-route="connect" class="ai-dot only-m"><span class="dot"></span>接入 AI</a>`;
    paintAI();
    $('#burger').onclick = () => $('.nav').classList.toggle('open');
    links.addEventListener('click', () => $('.nav').classList.remove('open'));
    document.addEventListener('click', e => { const h = e.target.closest('[data-pick]'); if (h) { e.preventDefault(); e.stopPropagation(); togglePick(h.dataset.pick); if (location.hash.startsWith('#/picks')) renderPicks($('#view')); } });
    document.addEventListener('click', e => { const a = e.target.closest('[data-scroll]'); if (a) { e.preventDefault(); const t = $('#' + a.dataset.scroll); if (t) window.scrollTo({ top: t.offsetTop - 70, behavior: 'smooth' }); } });
    addEventListener('hashchange', route);
    route();
  }
  document.addEventListener('DOMContentLoaded', boot);

  return { register, products, $, $$, sleep, esc, fmt, store, toast, think, show, chips, modal, speak, reveal, liked, togglePick, paintPicks, ai: AI, profile: PROFILE };
})();
