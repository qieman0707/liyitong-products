/* 真 AI 接入（浏览器直连 Gemini）+ 她的档案。
   产品通过 ctx.ai / ctx.profile 使用；没配钥匙时 ai.ready() 为 false，产品走演示数据。 */

const AI = (() => {
  const KEY = 'lyt4.ai.key', MODEL = 'lyt4.ai.model';
  const get = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const set = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} };
  const state = { busy: 0, last: null, log: [] };
  const DEFAULT_MODEL = 'gemini-2.5-flash';

  const ready = () => !!get(KEY, '');
  const model = () => get(MODEL, DEFAULT_MODEL);
  const endpoint = (m, stream) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${encodeURIComponent(get(KEY, ''))}`;

  function stripJson(t) {
    t = String(t || '').trim();
    const m = t.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) t = m[1].trim();
    const a = t.indexOf('{'), b = t.indexOf('['); let s = -1;
    if (a >= 0 && b >= 0) s = Math.min(a, b); else s = Math.max(a, b);
    if (s > 0) t = t.slice(s);
    const e = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']')); if (e >= 0) t = t.slice(0, e + 1);
    return JSON.parse(t);
  }

  /* chat(prompt, {system, json, search, temperature, maxTokens}) → 文本 或 JSON；search:true 时附带 sources */
  async function chat(prompt, opt = {}) {
    if (!ready()) throw new Error('还没接入 AI：去「接入」页填钥匙');
    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: opt.temperature ?? 0.7, maxOutputTokens: opt.maxTokens ?? 8192 },
    };
    if (opt.system) body.systemInstruction = { parts: [{ text: opt.system }] };
    if (opt.json && !opt.search) body.generationConfig.responseMimeType = 'application/json';
    if (opt.search) body.tools = [{ google_search: {} }];
    state.busy++;
    const t0 = Date.now();
    try {
      const r = await fetch(endpoint(opt.model || model(), false), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) { const e = await r.text(); throw new Error(`AI 返回 ${r.status}：${e.slice(0, 200)}`); }
      const data = await r.json();
      const cand = data.candidates && data.candidates[0];
      const text = (cand && cand.content && cand.content.parts || []).map(p => p.text || '').join('');
      const sources = [];
      const gm = cand && cand.groundingMetadata;
      if (gm && gm.groundingChunks) gm.groundingChunks.forEach(c => { if (c.web) sources.push({ title: c.web.title || '', url: c.web.uri || '' }); });
      state.last = { ms: Date.now() - t0, model: opt.model || model(), usage: data.usageMetadata || null };
      state.log.unshift({ at: Date.now(), ms: state.last.ms, chars: text.length, search: !!opt.search }); state.log = state.log.slice(0, 20);
      if (opt.json) { const j = stripJson(text); return opt.search ? Object.assign(Array.isArray(j) ? { items: j } : j, { sources }) : j; }
      return opt.search ? { text, sources } : text;
    } finally { state.busy--; }
  }

  /* search(q, {n}) → 用 Google 搜索落地，返回 {items:[{title,url,snippet,site,date}], sources} */
  async function search(q, opt = {}) {
    const n = opt.n || 12;
    const r = await chat(`请用搜索工具查找最近与「${q}」相关的网页，尽量多找，至少 ${n} 条。只看标题和摘要，不要打开任何成人站内容页。
返回 JSON 数组，每项：{"title":"网页标题","url":"链接","snippet":"一句话摘要","site":"站点名","date":"能看到的日期，没有留空"}。只返回 JSON。`, { json: true, search: true, temperature: 0.2 });
    const items = (r.items || []).filter(x => x && x.title);
    const seen = new Set(items.map(x => x.url));
    r.sources.forEach(s => { if (s.url && !seen.has(s.url)) { items.push({ title: s.title, url: s.url, snippet: '', site: s.title, date: '' }); seen.add(s.url); } });
    return { items, sources: r.sources };
  }

  async function test() {
    const t = await chat('只回复四个字：接入成功', { temperature: 0, maxTokens: 20 });
    return String(t).trim();
  }

  return { ready, model, chat, search, test, state, key: { get: () => get(KEY, ''), set: v => set(KEY, v.trim()) }, setModel: v => set(MODEL, v), DEFAULT_MODEL };
})();

/* ---------- 她的档案：四个产品共用 ---------- */
const PROFILE = (() => {
  const K = 'lyt4.profile';
  const DEFAULTS = {
    name: '李一桐', fan: '桐铃', show: '美人余', showTime: '每天 20:00 更新',
    works: '《射雕英雄传》黄蓉（2017）、《鹤唳华亭》、《书卷一梦》、《云秀行》、《我不是大师》（一人五个身份）、《美人余》',
    persona: '北舞民族民间舞出身；爱健身，舞者底子；对粉丝温和、认真，回复简短不油',
    tone: '温暖、简短、像朋友说话，不用网络梗，不用感叹号连发',
    taboo: '不用她的脸和声音；不谈合同、通告、代言、商务；不谈行程和住处；不回应黑评',
    keywords: '李一桐, 一桐, 李雪, 黄蓉, 美人余, 云秀行',
  };
  let data = null;
  const load = () => { if (data) return data; try { data = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(K) || '{}')); } catch (e) { data = { ...DEFAULTS }; } return data; };
  const save = patch => { data = Object.assign(load(), patch); try { localStorage.setItem(K, JSON.stringify(data)); } catch (e) {} return data; };
  const reset = () => { data = { ...DEFAULTS }; try { localStorage.removeItem(K); } catch (e) {} return data; };
  /* 给 AI 的一段自我介绍，产品直接拼进 system prompt */
  const brief = () => { const p = load(); return `当事人：${p.name}，演员。粉丝名「${p.fan}」。在播：《${p.show}》（${p.showTime}）。作品：${p.works}。人设：${p.persona}。回复语气：${p.tone}。禁区：${p.taboo}。页面文字不用第一人称「我」指代当事人。`; };
  return { get: load, set: save, reset, brief, DEFAULTS };
})();
