/* AI 换脸雷达 —— 给工作室和律师用的维权看板。
   线索、数字全是演示用假数据；平台分级、分级规则、处置四步、公开案例来自 story.js 的 RADAR / PLAN[12]。
   雷达只记元数据（链接、标题、时间、截图哈希），不下载、不存、不看素材；C 级成人站只看搜索摘要，域名不写全。 */
(() => {
  /* ---------- 产品自带的少量样式（颜色全走公用变量） ---------- */
  const CSS = `<style>
  .rd .k5{grid-template-columns:repeat(5,minmax(0,1fr))}
  @media(max-width:1180px){.rd .k5{grid-template-columns:repeat(3,minmax(0,1fr))}}
  @media(max-width:760px){.rd .k5{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .rd .g-ov{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px;margin-top:14px}
  .rd .g-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}
  .rd .g-pack{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.6fr);gap:14px;align-items:start}
  @media(max-width:1060px){.rd .g-ov,.rd .g-2,.rd .g-pack{grid-template-columns:minmax(0,1fr)}}
  .rd .tag{white-space:nowrap}
  .rd .card.hit{border-color:var(--accent-line)}
  .rd .head .more2{display:none}
  @media(max-width:560px){.rd .head>.row{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.rd .head .sec2{display:none}.rd .head .more2{display:inline-flex}}
  .rd .qgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 18px}
  @media(max-width:560px){.rd .qgrid{grid-template-columns:minmax(0,1fr)}}
  .rd .qgrid .step{justify-content:space-between}.rd .qgrid .step>span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rd .qs{font-style:normal;font-size:12px;font-variant-numeric:tabular-nums}.rd .qs.bad{color:var(--bad)}.rd .qs.accent{color:var(--accent)}
  .rd .step.fail::before{content:"✕";width:auto;height:auto;background:none;color:var(--bad);font-size:12px}
  .rd .rs{margin-top:6px;border-top:1px solid var(--line);padding-top:6px}.rd .rs:empty{display:none}
  .rd .skipd{margin-top:12px;font-size:13px}.rd .skipd summary{cursor:pointer;color:var(--muted)}.rd .skipd summary:hover{color:var(--text)}
  .rd .skipd .list li{gap:14px}
  .rd .tn{font-variant-numeric:tabular-nums}
  .rd .kpi small{font-family:var(--sans)}
  .rd .stack{grid-template-columns:minmax(0,1fr)}.rd .card{min-width:0}
  .rd #rd-out:not(:empty){margin-bottom:16px}
  .rd .funnel{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:12px}
  @media(max-width:560px){.rd .funnel{grid-template-columns:repeat(3,minmax(0,1fr))}}
  .rd .fn{all:unset;box-sizing:border-box;cursor:pointer;padding:10px 12px;border-radius:var(--r-sm);background:var(--bg2);border:1px solid var(--line);transition:border-color .2s,transform .15s}
  .rd .fn:hover{border-color:var(--accent-line);transform:translateY(-1px)}
  .rd .fn b{display:block;font-size:20px;font-variant-numeric:tabular-nums;line-height:1.2}.rd .fn span{font-size:12px;color:var(--muted)}
  .rd .chart{display:block;height:auto}
  .rd .chart .bar{transform-box:fill-box;transform-origin:50% 100%;animation:rdGrow .7s var(--ease) both;animation-delay:calc(var(--i)*16ms)}
  @keyframes rdGrow{from{transform:scaleY(0)}}
  .rd .legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--muted);margin-top:8px}
  .rd .legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
  .rd .ell{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rd .q li,.rd .clk{cursor:pointer}
  .rd .q li{align-items:center}
  .rd .q li:hover b{color:var(--accent)}
  .rd .cd{font-size:12.5px;color:var(--warn);font-variant-numeric:tabular-nums;white-space:nowrap}
  .rd .cd.hot,.rd .cd.over{color:var(--bad)}
  .rd .cd.over{font-weight:600}
  .rd .pg{padding:10px 0;border-top:1px solid var(--line)}.rd .pg:first-of-type{border-top:0;padding-top:0}
  .rd .pr{display:grid;grid-template-columns:118px minmax(0,1fr) 64px;align-items:center;gap:10px;margin-top:7px}
  .rd .pr .mono{text-align:right}
  .rd .ticker{font-size:12.5px;font-variant-numeric:tabular-nums;line-height:2;color:var(--muted);min-height:144px}
  .rd .ticker div{animation:fade .35s both;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rd .ticker b{color:var(--accent);font-weight:500}.rd .ticker .hit{color:var(--warn)}
  .rd .live{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--ok)}
  .rd .live::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--ok)}
  .rd .stchips{margin-bottom:12px}
  .rd .filters{display:grid;grid-template-columns:minmax(0,2fr) repeat(5,minmax(0,1fr));gap:10px;margin-bottom:12px}
  @media(max-width:1180px){.rd .filters{grid-template-columns:repeat(3,minmax(0,1fr))}.rd .filters .search{grid-column:1/-1}}
  @media(max-width:560px){.rd .filters{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .rd .tbl tbody tr{cursor:pointer}
  .rd .tbl .tt{display:block;font-weight:500;line-height:1.45}
  .rd .tbl tr.new{animation:rdFlash 3s ease-out}
  .rd .tbl tr.new td:first-child{box-shadow:inset 3px 0 0 var(--accent)}
  @keyframes rdFlash{from{background:var(--accent-soft)}}
  .rd .sm-only{display:none}
  @media(max-width:760px){.rd .hm{display:none}.rd .sm-only{display:inline}.rd .tbl td,.rd .tbl th{padding:10px 8px}.rd .tbl tr.new td:nth-child(2){box-shadow:inset 3px 0 0 var(--accent)}}
  .rd .mono-b{font-family:var(--mono);font-size:11.5px;word-break:break-all}
  .rd .side .fine{margin:18px 10px 0;font-size:11.5px;line-height:1.7;color:var(--dim);border-top:1px solid var(--line);padding-top:12px}
  @media(max-width:860px){.rd .side .fine{margin:10px 0 0;padding-top:8px}}
  .rd .paper{background:var(--bg2);border:1px solid var(--line2);border-radius:var(--r);padding:22px;box-shadow:var(--shadow);min-width:0}
  @media(max-width:560px){.rd .paper{padding:16px}}
  .rd .paper h4{font-size:13px;letter-spacing:.04em;color:var(--accent);margin:20px 0 8px}
  .rd .law{list-style:none;margin:0;padding:0;display:grid;gap:8px}
  .rd .law li{padding:10px 12px;border-radius:var(--r-sm);background:var(--surface);border-left:2px solid var(--accent);font-size:13px}
  .rd .law p{color:var(--muted);margin-top:2px}
  .rd .seg{display:flex;height:12px;border-radius:99px;overflow:hidden;background:var(--surface3)}
  .rd .seg i{display:block;height:100%;transition:width .6s var(--ease)}
  .rd .tl{list-style:none;margin:0 0 8px;padding:0}
  .rd .tl li{position:relative;padding:0 0 14px 18px;border-left:1px solid var(--line2);margin-left:4px;font-size:13.5px}
  .rd .tl li:last-child{padding-bottom:4px}
  .rd .tl li::before{content:"";position:absolute;left:-4px;top:7px;width:7px;height:7px;border-radius:50%;background:var(--accent)}
  .rd .tl .d{font-family:var(--mono);font-size:12px;color:var(--accent)}
  .rd .tl a{font-size:12px;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
  .rd .kws{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
  .rd .kw{display:inline-flex;align-items:center;gap:6px;padding:4px 5px 4px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:13px;animation:fade .3s both}
  .rd .kw button{all:unset;cursor:pointer;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:var(--muted);background:var(--surface3);font-size:12px}
  .rd .kw button:hover{color:var(--bad)}
  .rd .meta{display:grid;grid-template-columns:84px minmax(0,1fr);gap:8px 12px;font-size:13px;margin:14px 0}
  .rd .meta dt{color:var(--muted)}.rd .meta dd{margin:0;min-width:0;word-break:break-all}
  .rd .acts{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 16px}
  .rd .flow{margin:14px 0}.rd .flow span{font-size:12px;padding:5px 10px 5px 6px}
  .rd .bigcd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 14px;border-radius:var(--r-sm);background:var(--bad-soft);border:1px solid color-mix(in srgb,var(--bad) 40%,transparent);margin-top:14px;font-size:13px}
  .rd .bigcd .cd{font-size:15px}
  .rd .log{list-style:none;margin:8px 0 0;padding:0}
  .rd .log li{display:grid;grid-template-columns:86px minmax(0,1fr);gap:10px;padding:8px 0;border-top:1px solid var(--line);font-size:13px}
  .rd .log li:first-child{border-top:0}
  .rd .log time{font-variant-numeric:tabular-nums;font-size:12px;color:var(--dim)}
  .rd .log li.fresh{animation:fade .45s both}.rd .log li.fresh span{color:var(--accent)}
  .rd.form{display:grid;gap:14px}
  .rd.form label,.rd.form .lbl{display:grid;gap:6px;font-size:13px;color:var(--muted)}
  .rd.form small{font-size:12px;color:var(--dim)}
  </style>`;

  const MIN = 6e4, H = 36e5, D = 24 * H;
  const ST = { new: ['新发现', 'info'], evid: ['已取证', 'accent'], filed: ['已投诉', 'warn'], recheck: ['复查中', 'warn'], down: ['已下架', 'ok'], closed: ['已结案', ''] };
  const ST_KEYS = Object.keys(ST);
  const LIMIT = { P0: 24 * H, P1: 72 * H, P2: 7 * D };
  const LIMIT_TXT = { P0: '24 小时内', P1: '72 小时内', P2: '周报汇总' };
  const RULE = Object.fromEntries(RADAR.levels.map(l => [l[0], l[1]]));
  const GROUPS = RADAR.platforms.map((p, i) => ({ i, lv: p[0], type: p[1] }));
  GROUPS.push({ i: 4, lv: 'B', type: '其他网站（真扫发现）' });
  const GCOLOR = ['var(--info)', 'var(--accent)', 'var(--warn)', 'var(--bad)', 'var(--muted)'];
  const PCOLOR = { P0: 'var(--bad)', P1: 'color-mix(in srgb,var(--warn) 70%,transparent)', P2: 'color-mix(in srgb,var(--accent) 45%,transparent)' };
  const STC = { new: 'var(--info)', evid: 'var(--c-quiz)', filed: 'var(--warn)', recheck: 'color-mix(in srgb,var(--warn) 55%,var(--bad))', down: 'var(--ok)', closed: 'var(--dim)' };
  const C_URL = '不记录内容页地址（只看了搜索引擎摘要）';

  /* ---------- 小工具 ---------- */
  const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const digits = (r, n) => Array.from({ length: n }, () => Math.floor(r() * 10)).join('');
  const hexs = (r, n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join('');
  const alnum = (r, n) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'[Math.floor(r() * 56)]).join('');
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const pad = n => String(n).padStart(2, '0');
  const ft = t => { const d = new Date(t); return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const fd = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const fclock = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const ago = t => { const m = (Date.now() - t) / MIN; if (m < 1) return '刚刚'; if (m < 60) return `${Math.floor(m)} 分钟前`; if (m < 1440) return `${Math.floor(m / 60)} 小时前`; return `${Math.floor(m / 1440)} 天前`; };
  const left = (ms, short) => {
    const a = Math.abs(ms), h = Math.floor(a / H), m = Math.floor(a % H / MIN), s = Math.floor(a % MIN / 1000);
    if (ms < 0) return `超时 ${h} 小时 ${pad(m)} 分`;
    return short ? `还剩 ${h} 小时 ${pad(m)} 分` : `还剩 ${h} 小时 ${pad(m)} 分 ${pad(s)} 秒`;
  };
  const strHash = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

  /* ---------- 平台（来自 RADAR.platforms 的四组；C 级只写站名） ---------- */
  const PLATS = [
    { n: '红果短剧', g: 0, url: r => `hongguoduanju.com/drama/${digits(r, 5)}*****` },
    { n: '河马剧场', g: 0, url: r => `河马剧场 App · 剧集 ID ${digits(r, 4)}****` },
    { n: '番茄短剧', g: 0, url: r => `番茄短剧 App · 剧集 ID ${digits(r, 4)}****` },
    { n: '微博', g: 1, url: r => `weibo.com/${digits(r, 2)}******${digits(r, 2)}/${alnum(r, 3)}******` },
    { n: '抖音', g: 1, url: r => `douyin.com/video/7${digits(r, 5)}*************` },
    { n: '小红书', g: 1, url: r => `xiaohongshu.com/explore/6${hexs(r, 6)}*****************` },
    { n: 'B站', g: 1, url: r => `bilibili.com/video/BV1${alnum(r, 3)}******` },
    { n: 'X', g: 1, url: r => `x.com/${alnum(r, 2)}*****/status/18${digits(r, 4)}*************` },
    { n: '红豆短剧 App', g: 2, url: r => `红豆短剧 App · 剧集 ID ${digits(r, 3)}*****` },
    { n: '黄豆（成人站）', g: 3, url: () => C_URL },
    { n: '红豆（成人站）', g: 3, url: () => C_URL },
    { n: '黄果（成人站）', g: 3, url: () => C_URL },
    { n: '其他网站', g: 4, url: () => '' },
  ];
  const lvOf = c => c.lv || GROUPS[PLATS[c.p].g].lv;
  const pfName = c => PLATS[c.p].n;

  /* ---------- 线索标题模板（全部虚构） ---------- */
  const TPL = {
    '3P0': [
      ['标题含「李一桐」的成人 AI 短剧条目', '搜索摘要自述为成人 AI 短剧，标题直接用女演员的名字。', '李一桐'],
      ['「一桐 换脸」成人站合集条目', '摘要写着「AI 换脸」「合集」，拿女演员的名字做标签。', '李一桐 换脸'],
      ['标题挂本名「李雪」的成人站短剧', '标题用女演员的本名引流，摘要描述成人内容。', '李雪'],
      ['「黄蓉同款脸」成人 AI 短剧条目', '用女演员演过的角色名做标题，摘要自述成人 AI 短剧。', '黄蓉 换脸'],
    ],
    '1P0': [
      ['换脸造谣图：配文编造私生活传闻', '配图疑似 AI 合成，配文造黄谣，转发还在涨。', '李一桐 换脸'],
      ['「一桐 AI 换脸」视频私信售卖引流', '摘要写「私信获取换脸视频」，换脸造黄谣并牟利。', '李一桐 AI'],
      ['仿冒本人账号发布 AI 换脸短视频', '昵称和头像仿冒本人，画面疑似 AI 换脸，借机涨粉引流。', '李一桐 AI'],
    ],
    '0P0': [
      ['「李一桐 主演」付费 AI 短剧（共 {n} 集）', '剧集简介写「李一桐主演」，画面疑似 AI 换脸，按集收费：冒充本人参演并牟利。', '李一桐 AI'],
    ],
    '0P1': [
      ['古装 AI 短剧，女主疑似套用黄蓉同款脸', '封面和女演员演黄蓉时的造型高度相似，疑似 AI 合成。', '黄蓉 换脸'],
      ['标题借「李一桐同款」的都市短剧 第 {n} 集', '剧名和简介写「李一桐同款」，演员表里没有女演员。', '李一桐 同款脸'],
      ['「AI 换脸版」《美人余》片段剪辑', '标题直接标注 AI 换脸版，拿女演员的名字当标签。', '美人余 换脸'],
    ],
    '1P1': [
      ['「神似李一桐」AI 短剧切片 第 {n} 集', '标题用「神似李一桐」引流，切片出自疑似 AI 换脸短剧。', '神似李一桐'],
      ['《云秀行》同款脸 AI 换脸混剪', '把剧中镜头换成另一张脸再配原名，疑似 AI 换脸。', '云秀行 换脸'],
      ['用女演员的剧照做演示的 AI 换脸教程', '教程拿女演员的公开剧照做换脸演示，并配名字标签。', '李一桐 换脸'],
      ['「一桐脸」AI 合成短视频合集', '多条短视频疑似 AI 合成同一张脸，标题挂女演员的名字。', '李一桐 同款脸'],
    ],
    '2P1': [
      ['「一桐同款脸」甜宠短剧 第 {n} 集', 'App 内剧名带「一桐同款脸」，封面疑似 AI 合成。', '李一桐 同款脸'],
      ['简介写「李一桐 AI 版」的网剧', '简介借女演员的名字宣传「AI 版」，没有任何授权说明。', '李一桐 AI'],
    ],
    '0P2': [['宣传语写「一桐同款甜妹」的短剧', '宣传语借名营销，画面没有发现换脸痕迹。', '一桐']],
    '1P2': [
      ['「神似一桐」穿搭博主标题党', '标题用「神似一桐」引流，内容是普通穿搭，没有换脸。', '神似李一桐'],
      ['「李一桐同款脸」AI 写真引流帖', 'AI 写真标题借女演员的名字，引流到付费修图。', '李一桐 同款脸'],
      ['「撞脸李一桐」路人合集', '标题党合集，没有发现换脸痕迹。', '李一桐'],
    ],
    '2P2': [['剧名蹭「一桐」的甜宠短剧', '剧名借名营销，画面没有发现换脸痕迹。', '一桐']],
  };
  /* 模板里的名字改读「她的档案」：{N} 名字、{S} 昵称、{W} 在播剧 */
  Object.values(TPL).forEach(arr => arr.forEach(t => { for (let i = 0; i < 3; i++) t[i] = t[i].replace(/李一桐/g, '{N}').replace(/一桐/g, '{S}').replace(/美人余/g, '{W}'); }));
  let PROF = null;
  const prof = () => { try { return (PROF || PROFILE).get(); } catch (e) { return { name: '她', show: '', keywords: '' }; } };
  const profKws = () => String(prof().keywords || prof().name || '').split(/[,，、;；]+/).map(x => x.trim()).filter(Boolean);
  const nick = () => { const n = prof().name; return profKws().find(k => k !== n && n.includes(k)) || n; };
  const fillName = x => x.replace(/\{N\}/g, prof().name).replace(/\{S\}/g, nick()).replace(/\{W\}/g, prof().show || prof().name);
  const kw0 = () => { const n = prof().name; return [...new Set([...profKws(), `${n} 换脸`, `${n} 同款脸`, `神似${n}`, `${n} AI`])]; };
  const REAL_SUFFIX = ['换脸', 'AI 短剧', '神似', '同款脸'];
  const realQueries = () => profKws().slice(0, 3).flatMap(k => REAL_SUFFIX.map(x => x === '神似' ? `神似${k}` : `${k} ${x}`));
  const prFor = (g, r) => { const x = r(); if (g === 3) return 'P0'; if (g === 0) return x < .1 ? 'P0' : x < .8 ? 'P1' : 'P2'; if (g === 2) return x < .8 ? 'P1' : 'P2'; return x < .14 ? 'P0' : x < .58 ? 'P1' : 'P2'; };
  const groupFor = r => { const x = r(); return x < .2 ? 0 : x < .7 ? 1 : x < .8 ? 2 : 3; };

  function makeClue(r, at, g, pr) {
    pr = pr || prFor(g, r);
    const pi = pick(r, PLATS.map((p, i) => [p, i]).filter(x => x[0].g === g))[1];
    const tp = pick(r, TPL[`${g}${pr}`]);
    const src = g === 3 ? '搜索引擎 site: 摘要' : pick(r, ['平台站内搜索', '平台站内搜索', '搜索引擎 site: 摘要', '粉丝举报']);
    return {
      id: '', p: pi, pr, pr0: pr, tt: fillName(tp[0].replace('{n}', 2 + Math.floor(r() * 40))),
      why: `${fillName(tp[1])}命中 ${pr}：${RULE[pr]}。${g === 3 ? 'C 级站只看了搜索引擎摘要，没有进内容页。' : ''}`,
      kw: fillName(tp[2]), src, url: PLATS[pi].url(r), at, due: at + LIMIT[pr], st: 'new', fl: {}, esc: 0, log: [],
    };
  }
  const log = (c, t, x) => { c.log.push({ t, x }); };
  const firstLog = c => log(c, c.at, `${c.src}命中关键词「${c.kw}」，判为 ${c.pr}（${LIMIT_TXT[c.pr]}）`);
  const evNo = (c, t) => `ZJ${fd(t).replace(/-/g, '')}-${String(strHash(c.id + t) % 100000).padStart(5, '0')}`;
  const hashOf = (c, t) => hexs(mulberry(strHash(c.id + ':' + t)), 64);

  /* ---------- 处置动作：状态流转 + 写日志（种子推演和按钮共用） ---------- */
  const ACT = {
    lawyer: { label: '交律师和取证', primary: 1, can: c => c.st === 'new',
      run(c, t) { c.st = 'evid'; c.evidAt = t; c.ev = evNo(c, t); c.hash = hashOf(c, t); log(c, t, `交律师和取证机构固证，取证编号 ${c.ev}；取证机构截图后回填 SHA-256 哈希`); return `${c.id} 已交律师：链接、时间、哈希、法条一起打包`; } },
    complain: { label: '平台投诉', primary: 1, can: c => c.st === 'evid' && lvOf(c) !== 'C',
      run(c, t) { c.st = 'filed'; c.filedAt = t; c.recheckDue = t + 7 * D; c.fl.complain = 1; log(c, t, `向${pfName(c)}提交肖像权侵权投诉，附权属证明和取证编号 ${c.ev}；7 天后复查`); return '投诉已提交，7 天后提醒复查'; } },
    r12377: { label: '12377 举报', primary: 0, can: c => ['evid', 'filed', 'recheck'].includes(c.st) && !c.fl.r12377,
      run(c, t) { c.fl.r12377 = 1; if (c.st === 'evid') { c.st = 'filed'; c.filedAt = t; c.recheckDue = t + 7 * D; } log(c, t, '向中央网信办违法和不良信息举报中心（12377.cn）提交举报，附取证编号'); return '12377 举报已提交'; } },
    letter: { label: '发律师函', primary: 0, can: c => ['evid', 'filed', 'recheck'].includes(c.st) && !c.fl.letter && c.pr !== 'P2',
      run(c, t) { c.fl.letter = 1; log(c, t, '律师函发出：制作方、发布方、播放方各一份'); return '律师函已发出'; } },
    down: { label: '标记已下架', primary: 1, can: c => c.st === 'filed' || c.st === 'recheck',
      run(c, t) { c.st = 'down'; c.downAt = t; log(c, t, '复查确认已下架：链接失效，平台回复已处理'); return '已下架，记进月报'; } },
    still: { label: '复查：还在线', primary: 0, can: c => c.st === 'filed',
      run(c, t) { c.st = 'recheck'; c.recheckDue = t + 7 * D; log(c, t, '复查时内容还在线，已催平台处理；7 天后再查'); return '进入复查中，7 天后再看'; } },
    reup: { label: '再次上传，升一级', primary: 0, can: c => ['recheck', 'down', 'closed'].includes(c.st),
      run(c, t) {
        const o = c.pr; c.pr = o === 'P2' ? 'P1' : 'P0'; c.esc = (c.esc || 0) + 1; c.st = 'new'; c.due = t + LIMIT[c.pr]; c.reAt = t; c.fl = {}; c.ev = null; c.hash = null;
        log(c, t, `同一内容再次上传：${o === c.pr ? '已是 P0，加急' : `${o} 升为 ${c.pr}`}，重新计时取证和投诉`); return `已升为 ${c.pr}，重新计时 ${LIMIT_TXT[c.pr]}`;
      } },
    weekly: { label: '并入周报结案', primary: 1, can: c => c.st === 'new' && c.pr === 'P2',
      run(c, t) { c.st = 'closed'; c.closedAt = t; log(c, t, 'P2 擦边 / 标题党：并入本周周报，结案归档'); return '已并入周报'; } },
    close: { label: '结案归档', primary: 1, can: c => c.st === 'down',
      run(c, t) { c.st = 'closed'; c.closedAt = t; log(c, t, '结案归档：取证编号、哈希、处理记录留档'); return '已结案归档'; } },
  };
  const run = (k, c, t) => ACT[k].can(c) ? ACT[k].run(c, t) : null;

  /* ---------- 种子数据：30 天、50 来条，按时间推演出各自走到哪一步 ---------- */
  function simulate(c, r, now) {
    let t = c.at;
    const next = (lo, hi) => (t = t + (lo + r() * (hi - lo)) * H) < now;
    if (c.pr === 'P2' && r() < .65) { if (next(30, 140)) run('weekly', c, t); return; }
    if (!next(c.pr === 'P0' ? 1.5 : 8, c.pr === 'P0' ? 16 : c.pr === 'P1' ? 56 : 120)) return;
    run('lawyer', c, t);
    if (!next(1, 20)) return;
    run(lvOf(c) === 'C' ? 'r12377' : 'complain', c, t);
    if (c.pr === 'P0' && r() < .75) { if (!next(1, 12)) return; run('letter', c, t); }
    if (!next(48, 160)) return;
    if (r() < .3) { run('still', c, t); if (!next(48, 140) || r() < .2) return; }
    run('down', c, t);
    if (!next(20, 90)) return;
    run('close', c, t);
  }
  function seed(now) {
    const r = mulberry(20261023), list = [];
    for (let i = 0; i < 46; i++) { const g = groupFor(r); list.push(makeClue(r, now - 3 * H - Math.pow(r(), 1.2) * 29 * D, g)); }
    const fixed = [[3, 'P0', 2.2], [1, 'P0', 7.5], [0, 'P0', 15.2, 1], [1, 'P1', 20.4], [0, 'P1', 41], [1, 'P2', 5]].map(f => { const c = makeClue(r, now - f[2] * H, f[0], f[1]); c._fix = f[3] || 0; return c; });
    const all = [...list, ...fixed].sort((a, b) => a.at - b.at);
    all.forEach((c, i) => { c.id = `R-${1001 + i}`; firstLog(c); });
    all.forEach(c => { if (c._fix === undefined) simulate(c, r, now); else if (c._fix) run('lawyer', c, c.at + 3.2 * H); delete c._fix; });
    all.filter(c => c.downAt && c.downAt < now - 5 * D).slice(2, 4).forEach(c => {
      const t = c.downAt + 1.5 * D; run('reup', c, t); run('lawyer', c, t + 2 * H); run(lvOf(c) === 'C' ? 'r12377' : 'complain', c, t + 5 * H);
    });
    return all;
  }
  function freshState(now) {
    const clues = seed(now);
    const t0 = new Date(now); t0.setHours(9, 0, 0, 0);
    const scans = [];
    for (let i = 7; i >= 1; i--) {
      const t = t0.getTime() - i * D, hits = clues.filter(c => c.at >= t - D && c.at < t);
      scans.push({ t, kw: kw0().length, g: 4, hits: hits.length, p0: hits.filter(c => c.pr0 === 'P0').length, dup: 4 + (i * 3) % 9 });
    }
    return { v: 1, clues, kw: kw0(), pf: RADAR.platforms.map(() => true), scans, anchor: now, seq: 1001 + clues.length, f: { q: '', lv: '', p: '', st: '', pr: '', sort: 'new' } };
  }
  /* 隔了半天以上再打开：把演示时间整体平移到现在，倒计时和「本周」才不会过期 */
  const TF = ['at', 'due', 'evidAt', 'filedAt', 'recheckDue', 'downAt', 'closedAt', 'reAt'];
  function shift(S, d) { S.clues.forEach(c => { TF.forEach(k => { if (c[k]) c[k] += d; }); c.log.forEach(l => { l.t += d; }); }); S.scans.forEach(s => { s.t += d; }); }

  /* ---------- 模块状态 ---------- */
  let timers = [], alive = false, prevK = {}, onResize = null;

  App.register({
    id: 'radar', accent: 'guard', demo: 12, name: 'AI 换脸雷达', tag: '守护',
    short: '谁在盗用女演员的脸，先发现、再取证、再下架。',
    meta: '每天扫 · 只记元数据 · P0 24 小时交律师',
    blurb: '替女演员盯着谁在用女演员的脸，处理交给工作室和律师，女演员只看结果。',
    pain: '女演员公开说过没签任何 AI 授权，可换脸短剧、造谣图、「神似」切片还是会冒出来。现在靠粉丝举报和人工搜，发现得晚，证据不好固定，投诉完有没有真下架也没人盯。',
    ai: '每条线索从发现到结案都在一张表里：几点发现、哪一级、走到哪一步、还剩几小时。P0 当天交律师，投诉后 7 天进复查，再上传自动升级。女演员每月只看一页报告。',

    /* 「今天」页：只读 store，不碰 DOM */
    summary(ctx) {
      PROF = (ctx && ctx.profile) || PROF;
      const now = Date.now();
      let S = ctx.store.get('state', null);
      if (!S || S.v !== 1) S = freshState(now);
      else if (now - S.anchor > 12 * H) { S = JSON.parse(JSON.stringify(S)); shift(S, now - S.anchor); }
      const C = S.clues, pend = C.filter(c => (c.st === 'new' || c.st === 'evid') && c.pr !== 'P2').sort((a, b) => a.due - b.due);
      const p0 = pend.filter(c => c.pr === 'P0'), p1 = pend.length - p0.length;
      const rcDue = C.filter(c => (c.st === 'filed' || c.st === 'recheck') && c.recheckDue <= now + D);
      const week = C.filter(c => now - c.at < 7 * D).length, down = C.filter(c => c.downAt).length, filed = C.filter(c => c.filedAt).length;
      const real = C.filter(c => c.real).length;
      const ev = C.filter(c => c.pr0 === 'P0' && c.evidAt), avgH = ev.length ? Math.round(ev.reduce((a, c) => a + (c.evidAt - c.at), 0) / ev.length / H) : 0;
      const short = t => t.length > 18 ? t.slice(0, 18) + '…' : t;
      const items = [
        ...p0.slice(0, 3).map(c => ({ tag: 'P0', text: `${c.real ? '[真实] ' : ''}${short(c.tt)}：${left(c.due - now, true)}交律师`, href: '#/radar/pack', kind: 'bad' })),
        ...(rcDue.length ? [{ tag: '复查', text: `${rcDue.length} 条投诉到了 7 天复查，确认是否真下架`, href: '#/radar/clues', kind: 'warn' }] : []),
        ...(p1 ? [{ tag: 'P1', text: `${p1} 条 P1 要在 72 小时内投诉`, href: '#/radar/clues', kind: 'warn' }] : []),
      ].slice(0, 5);
      const vizRows = pend.slice(0, 4).map(c => { const lim = LIMIT[c.pr], used = Math.max(0, Math.min(100, Math.round((1 - (c.due - now) / lim) * 100))); return { l: `${c.pr} ${short(c.tt)}`, v: used, rt: c.due > now ? left(c.due - now, true) : '已超时', c: c.pr === 'P0' ? 'var(--bad)' : 'var(--warn)', t: `${c.tt}：时限 ${LIMIT_TXT[c.pr]}，已用 ${used}%` }; });
      return {
        viz: vizRows.length && typeof Viz !== 'undefined' ? Viz.hbars(vizRows, { w: 420, lw: 150, vw: 90, maxL: 12, max: 100, rh: 24, label: '在计时的线索还剩多久' }) : '',
        vizLabel: vizRows.length ? '在计时的线索：条越满越急' : '',
        line: p0.length ? `${p0.length} 条 P0 在计时，最急的${left(p0[0].due - now, true)}` : (pend.length ? `没有 P0，${pend.length} 条 P1 在计时` : '今天没有要处置的线索，雷达照常在扫'),
        kpis: [['本周新线索', week], ['P0 待处置', p0.length], ['已下架', down], ['下架率', `${filed ? Math.round(down / filed * 100) : 0}%`]],
        items,
        year: [`雷达建档 ${C.length} 条线索，${down} 条已经下架`, `P0 共 ${C.filter(c => c.pr0 === 'P0').length} 条，平均 ${avgH} 小时交到律师手里`, real ? `其中 ${real} 条是真扫发现的` : `再次上传 ${C.filter(c => c.esc).length} 条，全部升一级处理`],
      };
    },

    mount(root, ctx) {
      const { $, $$, esc, fmt, store, toast, think, show, modal } = ctx;
      alive = true; PROF = ctx.profile || PROF;
      const aiOn = () => !!(ctx.ai && ctx.ai.ready());
      let S = store.get('state', null);
      const now0 = Date.now();
      if (!S || S.v !== 1) S = freshState(now0);
      else if (now0 - S.anchor > 12 * H) { shift(S, now0 - S.anchor); S.anchor = now0; }
      const save = () => store.set('state', S);
      save();
      const byId = id => S.clues.find(c => c.id === id);
      const sub0 = ctx.sub.split('/')[0];
      const page = ['clues', 'pack', 'report', 'settings'].includes(sub0) ? sub0 : '';
      let newIds = new Set(), packOff = new Set(), month = 0;

      /* ---------- 共用片段 ---------- */
      const prTag = pr => `<span class="tag ${pr.toLowerCase()}">${pr}</span>`;
      const stTag = st => `<span class="tag ${ST[st][1]}">${ST[st][0]}</span>`;
      const lvTag = c => `<span class="tag">${lvOf(c)} 级</span>`;
      const pending = c => (c.st === 'new' || c.st === 'evid') && c.pr !== 'P2';
      const cd = (c, short) => `<span class="cd" data-due="${c.due}"${short ? ' data-s="1"' : ''}>${left(c.due - Date.now(), short)}</span>`;
      const enabledPlats = () => PLATS.map((p, i) => ({ ...p, i })).filter(p => p.g < 4 && S.pf[p.g]);

      const realTag = c => c.real ? '<span class="tag accent">真实</span>' : '';
      const headBtns = () => '<button class="btn sec2" data-add>录入举报</button>' + (aiOn()
        ? '<button class="btn sec2" data-scan>演示扫一遍</button><button class="btn btn-primary" data-real>◎ 真扫一遍</button>'
        : '<button class="btn btn-primary" data-scan>◎ 扫一遍</button><a class="btn btn-ghost sec2" href="#/connect" title="接入 AI 后可以真去搜">接入 AI 可真扫</a>')
        + '<button class="btn more2" data-more aria-label="更多操作">更多</button>';
      function moreMenu() {
        const d = modal(`<div class="rd stack">${aiOn() ? '<button class="btn btn-block" data-m="scan">演示扫一遍</button>' : ''}<button class="btn btn-block" data-m="add">录入举报</button>${aiOn() ? '' : '<a class="btn btn-block" href="#/connect" data-m="link">接入 AI 可真扫</a>'}</div>`, { title: '更多' });
        $$('[data-m]', d).forEach(b => b.onclick = () => { const m = b.dataset.m; d.close(); if (m === 'add') addForm(); if (m === 'scan') scan(); });
      }
      function kpis() {
        const now = Date.now(), C = S.clues;
        return [
          ['week', C.filter(c => now - c.at < 7 * D).length, '本周新线索', '7 天', ''],
          ['p0', C.filter(c => c.pr === 'P0' && (c.st === 'new' || c.st === 'evid')).length, 'P0 待处置', '24h', 'var(--bad)'],
          ['filed', C.filter(c => c.filedAt).length, '已投诉', '30 天', 'var(--warn)'],
          ['down', C.filter(c => c.downAt).length, '已下架', '30 天', 'var(--ok)'],
          ['rc', C.filter(c => c.st === 'filed' || c.st === 'recheck').length, '7 天内复查', '到期提醒', 'var(--info)'],
        ];
      }
      function rollAll() {
        $$('[data-roll]', root).forEach(el => {
          const k = el.dataset.roll, to = +el.dataset.to, from = prevK[k] ?? 0;
          prevK[k] = to;
          if (from === to) { el.textContent = fmt(to); return; }
          const t0 = performance.now(), dur = 900;
          const step = now => { if (!el.isConnected) return; const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(step); };
          requestAnimationFrame(step);
        });
      }

      /* ---------- 外壳 ---------- */
      root.innerHTML = `${CSS}
      <div class="app rd">
        <aside class="side">
          <div class="brand"><i>◎</i><div><b>AI 换脸雷达</b><small>女演员的维权看板</small></div></div>
          <nav id="rd-nav"></nav>
          <div class="sec">设置</div>
          <nav><a href="#/radar/settings" data-p="settings">关键词与平台</a></nav>
          <p class="fine">处理交给工作室和律师，女演员只看结果。线索、数字全是演示用的假数据，标题为虚构；公开案例是真实报道。雷达只记链接、标题、时间和截图哈希，不下载、不存、不看素材。</p>
        </aside>
        <section class="main" id="rd-main"></section>
      </div>`;
      const main = $('#rd-main', root);
      function paintNav() {
        const nNew = S.clues.filter(c => c.st === 'new').length, nP0 = S.clues.filter(c => c.pr === 'P0' && ['new', 'evid', 'filed', 'recheck'].includes(c.st)).length;
        $('#rd-nav', root).innerHTML = [['', '总览', ''], ['clues', '线索', nNew], ['pack', '取证包', nP0], ['report', '月报', '']]
          .map(([k, t, e]) => `<a href="#/radar${k ? '/' + k : ''}" data-p="${k}">${t}${e !== '' ? ` <em>${e}</em>` : ''}</a>`).join('');
        $$('.side nav a', root).forEach(a => a.classList.toggle('on', a.dataset.p === page));
      }

      /* ---------- 抽屉：线索详情 ---------- */
      const FLOW = ['发现', '分级', '取证', '投诉', '复查', '下架', '结案'];
      const FLOW_DONE = { new: 2, evid: 3, filed: 4, recheck: 4, down: 6, closed: 7 };
      function drawerBody(c, fresh) {
        const now = Date.now(), k = FLOW_DONE[c.st];
        const acts = Object.entries(ACT).filter(([, a]) => a.can(c));
        const meta = [
          ['线索 ID', `<span class="tn">${esc(c.id)}</span>`],
          ['平台', `${esc(pfName(c))} · ${lvOf(c)} 级（${c.real ? 'AI 按标题判定' : esc(GROUPS[PLATS[c.p].g].type)}）`],
          ['链接', c.link ? `<a class="mono-b accent" href="${esc(c.link)}" target="_blank" rel="noopener noreferrer">打开原链接 ↗</a><div class="xs dim">${esc(c.url)}</div>` : `<span class="mono-b">${esc(c.url)}</span>`],
          ...(c.snip ? [['搜索摘要', `<span class="small muted">${esc(c.snip)}</span>`]] : []),
          ['发现时间', `${ft(c.at)} · ${ago(c.at)}`],
          ['来源', esc(c.src)],
          ['命中关键词', `「${esc(c.kw)}」`],
          ['取证编号', c.ev ? `<span class="mono">${esc(c.ev)}</span>` : '<span class="dim">交律师和取证后生成</span>'],
          ['截图哈希', c.hash ? `<span class="mono-b">SHA-256 ${esc(c.hash)}</span>` : '<span class="dim">待取证机构截图后计算</span>'],
          ...(c.filedAt > (c.reAt || 0) ? [['投诉时间', ft(c.filedAt)]] : []),
          ...(c.recheckDue && (c.st === 'filed' || c.st === 'recheck') ? [['下次复查', `${ft(c.recheckDue)}（${c.recheckDue > now ? '还有 ' + Math.ceil((c.recheckDue - now) / D) + ' 天' : '已到期'}）`]] : []),
          ...(c.downAt > (c.reAt || 0) ? [['下架时间', ft(c.downAt)]] : []),
          ...(c.reAt ? [['再次上传', `${ft(c.reAt)} · 上一轮投诉、下架记录见日志`]] : []),
          ['已走通道', [c.fl.complain && '平台投诉', c.fl.r12377 && '12377', c.fl.letter && '律师函'].filter(Boolean).join('、') || '<span class="dim">还没有</span>'],
        ];
        return `<div class="rd">
          <div class="row">${realTag(c)}${prTag(c.pr)}${lvTag(c)}${stTag(c.st)}${c.esc ? `<span class="tag bad">再次上传 ×${c.esc}</span>` : ''}${c.pr0 !== c.pr ? `<span class="tag">原判 ${c.pr0}</span>` : ''}</div>
          <h3 style="font-size:18px;margin:12px 0 4px">${esc(c.tt)}</h3>
          <p class="xs dim">${c.real ? `真扫发现 · Google 搜索结果的原标题${c.date ? ' · 网页日期 ' + esc(c.date) : ''}` : '标题为演示虚构'} · ${esc(c.id)}</p>
          ${pending(c) ? `<div class="bigcd"><span>${c.pr} 时限：${LIMIT_TXT[c.pr]}${c.pr === 'P0' ? '交律师和取证机构' : '完成投诉'}</span>${cd(c)}</div>` : ''}
          <div class="steps flow">${FLOW.map((f, i) => `<span class="${i < k ? 'done' : i === k ? 'on' : ''}"><i>${i < k ? '✓' : i + 1}</i>${f}</span>`).join('')}</div>
          <div class="panel"><b class="small">判定理由</b><p class="small" style="margin-top:4px">${esc(c.why)}</p><p class="xs muted" style="margin-top:6px">规则：${c.pr} = ${esc(RULE[c.pr])} · ${LIMIT_TXT[c.pr]}</p></div>
          <dl class="meta">${meta.map(m => `<dt>${m[0]}</dt><dd>${m[1]}</dd>`).join('')}</dl>
          <b class="small">处置</b>
          <div class="acts">${acts.length ? acts.map(([key, a]) => `<button class="btn btn-sm ${a.primary ? 'btn-primary' : key === 'reup' ? 'btn-danger' : ''}" data-act="${key}">${a.label}</button>`).join('') : '<span class="small muted">没有可做的处置。</span>'}</div>
          ${lvOf(c) === 'C' && c.st === 'evid' ? '<p class="xs muted" style="margin:-6px 0 12px">C 级成人站没有正规投诉通道，走 12377 举报和律师函。</p>' : ''}
          ${c.st === 'closed' ? '<p class="xs muted" style="margin:-6px 0 12px">已结案。同一内容再出现，点「再次上传，升一级」重新打开。</p>' : ''}
          <b class="small">操作日志 · ${c.log.length} 条</b>
          <ol class="log">${[...c.log].reverse().map((l, i) => `<li class="${fresh && i === 0 ? 'fresh' : ''}"><time>${ft(l.t)}</time><span>${esc(l.x)}</span></li>`).join('')}</ol>
          <p class="xs dim" style="margin-top:14px">只记元数据：链接、标题、发现时间、截图哈希。素材本身不下载、不存、不看；固证交公证处或有资质的取证平台。</p>
        </div>`;
      }
      function openClue(id) {
        const c = byId(id); if (!c) return;
        const d = modal(drawerBody(c), { title: `线索 ${c.id}`, drawer: true });
        const bind = () => $$('[data-act]', d).forEach(b => b.onclick = () => {
          const msg = run(b.dataset.act, c, Date.now());
          if (!msg) return;
          save(); $('.mb', d).innerHTML = drawerBody(c, true); bind(); renderPage(true); tick();
          toast(msg, 'ok');
        });
        bind();
      }

      /* ---------- 扫一遍 ---------- */
      async function scan(btn) {
        const plats = enabledPlats();
        if (!plats.length) { toast('设置里至少打开一组监测平台', 'bad'); return; }
        if (!S.kw.length) { toast('设置里至少留一个关键词', 'bad'); return; }
        const out = $('#rd-out', root);
        $$('[data-scan],[data-real]', main).forEach(b => { b.disabled = true; });
        main.classList.add('scan');
        const gs = [...new Set(plats.map(p => p.g))];
        await think(out, [
          `关键词 ${S.kw.length} 个：${S.kw.slice(0, 4).join(' / ')}${S.kw.length > 4 ? ' …' : ''}`,
          `平台 ${plats.length} 个：${gs.map(g => `${GROUPS[g].lv} 级 ${plats.filter(p => p.g === g).length}`).join('、')}`,
          '只看搜索结果的标题和摘要，不进内容页、不下载素材',
          '去重：和已有线索比对链接和标题',
          '分级：P0 / P1 / P2，P0 起 24 小时倒计时',
        ], '雷达扫描中');
        if (!alive || !out.isConnected) return;
        main.classList.remove('scan');
        const r = Math.random, now = Date.now(), n = 2 + Math.floor(r() * 3), made = [];
        for (let i = 0; i < n; i++) {
          const g = i === 0 && r() < .55 ? (gs.includes(3) ? 3 : gs.includes(1) ? 1 : gs[0]) : pick(r, gs);
          const c = makeClue(r, now - Math.floor(r() * 50) * MIN - i * 7000, g);
          c.id = `R-${S.seq++}`; if (c.src === '粉丝举报') c.src = '平台站内搜索'; firstLog(c); made.push(c);
        }
        S.clues.push(...made);
        const dup = 3 + Math.floor(r() * 9), p0 = made.filter(c => c.pr === 'P0').length;
        S.scans.push({ t: now, kw: S.kw.length, g: gs.length, hits: made.length, p0, dup });
        save(); newIds = new Set(made.map(c => c.id));
        renderPage(true);
        const o2 = $('#rd-out', root);
        show(o2, `<div class="card hit"><div class="hd"><h3>扫完了 · 新增 ${made.length} 条线索</h3><span class="done-line">✓ 去重 ${dup} 条 · ${fclock(now)}</span></div>
          <ul class="list">${made.map(c => `<li style="align-items:center">${prTag(c.pr)}<div style="flex:1;min-width:0"><b class="small">${esc(c.tt)}</b><div class="xs muted">${esc(c.id)} · ${esc(pfName(c))} · ${lvOf(c)} 级 · ${esc(c.kw)}</div></div><button class="btn btn-sm" data-open="${c.id}">查看</button></li>`).join('')}</ul>
          <div class="ft">${page === 'clues' ? '' : '<button class="btn btn-sm btn-primary" data-go="clues">去线索列表</button>'}${p0 ? '<button class="btn btn-sm" data-go="pack">看取证包</button>' : ''}<span class="xs dim">标题为演示虚构</span></div></div>`);
        bindCommon(o2);
        toast(p0 ? `新增 ${made.length} 条，其中 P0 ${p0} 条，24 小时倒计时开始` : `新增 ${made.length} 条线索`, p0 ? 'bad' : 'ok');
      }

      /* ---------- 真扫：ai.search 多关键词 → 去重 → ai.chat 分级（只看标题摘要） ---------- */
      function platIndex(pf, site, lv) {
        const t = `${pf || ''} ${site || ''}`.toLowerCase(), by = n => PLATS.findIndex(p => p.n === n);
        if (/红豆/.test(t)) return by(lv === 'C' ? '红豆（成人站）' : '红豆短剧 App');
        const M = [[/微博|weibo/, '微博'], [/抖音|douyin/, '抖音'], [/小红书|xiaohongshu|xhslink/, '小红书'], [/b站|bilibili|哔哩/, 'B站'], [/twitter|x\.com|推特|^\s*x\s*$/, 'X'], [/红果|hongguo/, '红果短剧'], [/河马/, '河马剧场'], [/番茄/, '番茄短剧'], [/黄豆/, '黄豆（成人站）'], [/黄果/, '黄果（成人站）']];
        for (const [re, n] of M) if (re.test(t)) return by(n);
        return by('其他网站');
      }
      const norm = x => String(x || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
      function realResult(R) {
        if (!R) return '';
        const made = R.ids.map(byId).filter(Boolean);
        return `<div class="card hit"><div class="hd"><h3>真扫完成 · 疑似侵权 ${made.length} 条</h3><span class="done-line">✓ ${ft(R.t)}</span></div>
          <p class="small muted">搜了 ${R.q} 次 Google，找到 ${R.found} 条，去重后 ${R.uniq} 条交 AI 判定${R.fail ? `，${R.fail} 次搜索失败` : ''}。只看了标题和摘要，没有打开任何链接。</p>
          ${made.length ? `<ul class="list" style="margin-top:6px">${made.map(c => `<li style="align-items:center">${prTag(c.pr)}<div style="flex:1;min-width:0"><b class="small">${esc(c.tt)}</b><div class="xs muted">${esc(c.id)} · ${esc(pfName(c))} · ${lvOf(c)} 级 · ${esc(c.kw)}</div></div><button class="btn btn-sm" data-open="${c.id}">查看</button></li>`).join('')}</ul>`
            : '<div class="empty" style="margin-top:10px"><b>这一轮没有疑似侵权的新结果</b>搜到的都是正常报道、作品宣传或粉丝讨论，下面列出了排除理由。</div>'}
          ${R.skip.length ? `<details class="skipd"><summary>排除的 ${R.skip.length} 条（正常报道 / 无关），点开看理由</summary><ul class="list">${R.skip.map(x => `<li class="small"><div style="flex:1;min-width:0">${esc(x.title)}<div class="xs dim">${esc(x.site)}</div></div><span class="xs muted" style="max-width:40%">${esc(x.why)}</span></li>`).join('')}</ul></details>` : ''}
          <div class="ft">${made.length && page !== 'clues' ? '<button class="btn btn-sm btn-primary" data-go="clues">去线索列表</button>' : ''}${made.some(c => c.pr === 'P0') ? '<button class="btn btn-sm" data-go="pack">看取证包</button>' : ''}<button class="btn btn-sm btn-ghost" data-real-again>再真扫一遍</button></div></div>`;
      }
      async function realScan() {
        if (!aiOn()) { toast('还没接入 AI：去「接入」页填钥匙', 'bad'); location.hash = '#/connect'; return; }
        const qs = realQueries(), P = prof();
        if (!qs.length) { toast('档案里没有关键词，去「档案」页填', 'bad'); return; }
        const out = $('#rd-out', root);
        $$('[data-scan],[data-real]', main).forEach(b => { b.disabled = true; });
        main.classList.add('scan');
        out.innerHTML = `<div class="think"><div class="hd">真扫中 · ${qs.length} 次 Google 搜索，只看标题和摘要<i><b></b><b></b><b></b></i></div><div class="qgrid">${qs.map((q, i) => `<div class="step" data-q="${i}"><span>「${esc(q)}」</span><em class="qs dim">排队</em></div>`).join('')}</div><div class="rs"></div></div>`;
        const setQ = (i, txt, cls, done) => { const el = $(`[data-q="${i}"]`, out); if (!el) return; const e = $('.qs', el); e.textContent = txt; e.className = 'qs ' + (cls || ''); el.classList.toggle('done', !!done); el.classList.toggle('fail', cls === 'bad'); };
        const step = txt => { const r = $('.rs', out); if (r) { $$('.step', r).forEach(x => x.classList.add('done')); r.insertAdjacentHTML('beforeend', `<div class="step">${esc(txt)}</div>`); } };
        const finish = () => { main.classList.remove('scan'); $$('[data-scan],[data-real]', main).forEach(b => { b.disabled = false; }); };
        const raw = []; let fail = 0, lastErr = '', next = 0;
        const worker = async () => {
          while (next < qs.length) {
            const i = next++; setQ(i, '搜索中…', 'accent');
            for (let k = 0; k < 2; k++) {
              try { const r = await ctx.ai.search(qs[i], { n: 8 }); r.items.forEach(x => raw.push({ ...x, q: qs[i] })); setQ(i, `${r.items.length} 条`, '', true); break; }
              catch (e) { if (k) { fail++; lastErr = e.message; setQ(i, '失败', 'bad'); const el = $(`[data-q="${i}"]`, out); if (el) el.title = e.message; } else setQ(i, '重试中…', 'accent'); }
            }
          }
        };
        await Promise.all(Array.from({ length: Math.min(6, qs.length) }, worker));
        if (!alive || !out.isConnected) return;
        if (!raw.length) { finish(); toast(fail ? lastErr : '一条都没搜到，换几个关键词再试', 'bad'); return; }
        const known = new Set(S.clues.filter(c => c.real).flatMap(c => [c.link, norm(c.tt)]).filter(Boolean));
        const seen = new Set(), items = [];
        raw.forEach(x => { const a = x.url, b = norm(x.title); if (!b || seen.has(a) || seen.has(b) || known.has(a) || known.has(b)) return; seen.add(a); seen.add(b); items.push(x); });
        step(`合并去重：搜到 ${raw.length} 条，去掉重复和已建档的 ${raw.length - items.length} 条，剩 ${items.length} 条`);
        const now = Date.now(), list = items.slice(0, 80);
        const res = { hits: [], skip: [] }; let badChunk = 0;
        if (list.length) {
          const CH = 20, chunks = [];
          for (let i = 0; i < list.length; i += CH) chunks.push(i);
          step(`AI 分级中：${list.length} 条分 ${chunks.length} 批，只读标题和摘要，不打开任何链接…`);
          const sys = `${ctx.profile ? ctx.profile.brief() : ''}\n你是肖像权维权助理。只根据搜索结果的标题、摘要、站点名做判断，不打开、不访问任何链接；成人站尤其不能打开，只凭标题判断。宁可漏判也不要把正常报道判成侵权。`;
          const ask = from => `下面是搜索「${P.name}」相关关键词 +「换脸 / AI 短剧 / 神似 / 同款脸」得到的结果。逐条判断：是不是在未经授权使用${P.name}的名字或脸（AI 换脸、冒充本人参演、借名借脸引流、造黄谣）。
正常新闻报道（包括报道她维权、她否认 AI 授权）、官方宣传、她本人作品、粉丝正常讨论、法律科普、与她无关的 → 放进 skip。
疑似侵权的放进 hits，按规则分级：
${RADAR.levels.map(l => `${l[0]}：${l[1]}（${l[2]}）`).join('\n')}
平台级别 lv：A = 正规短剧平台（红果、河马、番茄）和社交媒体（微博、抖音、小红书、B站、X）；B = 普通短剧 App 和其他普通网站；C = 成人站（站名或标题明显是成人内容）。C 级只看标题。
硬性要求：标题或摘要里必须明确出现「${profKws().join('」「')}」之一，才可能进 hits；只是含有相同的某个字（比如剧名、剧场名里碰巧有同一个字）的一律 skip。网站导航页、百科词条、新闻聚合页一律 skip。
以下也一律 skip：①她本人出演的作品（正片、预告、花絮、官方或平台账号发布），哪怕带 AI 标签；②拿她和其他真人演员比较的「撞脸 / 长得像」娱乐八卦，这是在聊她本人，不是盗用；③报道她本人、她维权、她表态的新闻。
P2 只给：营销号用「神似${P.name}」「${P.name}同款脸」给别人、给商品或给 AI 写真引流。
每一条都要出现在 hits 或 skip 里。why 里引用标题用「」，不要用英文双引号。
只返回 JSON：{"hits":[{"i":序号,"pr":"P0|P1|P2","lv":"A|B|C","platform":"平台或站点名","why":"一句话判定理由"}],"skip":[{"i":序号,"why":"十个字以内的理由"}]}
结果：
${list.slice(from, from + CH).map((x, j) => `[${from + j}] ${String(x.title).replace(/"/g, '“').slice(0, 90)}｜${x.site || ''}｜${String(x.snippet || '').replace(/"/g, '“').slice(0, 120)}`).join('\n')}`;
          await Promise.all(chunks.map(async from => {
            for (let k = 0; k < 2; k++) {
              try { const r = await ctx.ai.chat(ask(from), { system: sys, json: true, temperature: 0.1 }); res.hits.push(...(r.hits || [])); res.skip.push(...(r.skip || [])); return; }
              catch (e) { if (k) { badChunk++; lastErr = e.message; } }
            }
          }));
          if (!alive || !out.isConnected) return;
          if (badChunk === chunks.length) { finish(); step('AI 分级失败：' + lastErr); toast(lastErr, 'bad'); return; }
          if (badChunk) step(`有 ${badChunk} 批分级失败（${lastErr.slice(0, 40)}），这几批先不建档`);
        }
        const used = new Set(), made = [];
        (res.hits || []).forEach(h => {
          const x = list[h.i]; if (!x || used.has(h.i) || !/^P[012]$/.test(h.pr)) return; used.add(h.i);
          let lv = ['A', 'B', 'C'].includes(h.lv) ? h.lv : 'B';
          const pi = platIndex(h.platform, x.site, lv); if (PLATS[pi].g === 3) lv = 'C';
          const isC = lv === 'C';
          const c = { id: `R-${S.seq++}`, p: pi, lv, pr: h.pr, pr0: h.pr, tt: String(x.title).slice(0, 90), real: 1,
            why: `AI 判定（只看标题和摘要）：${String(h.why || '标题借用了女演员的名字').replace(/[。.\s]+$/, '')}。命中 ${h.pr}：${RULE[h.pr]}。${isC ? 'C 级站只看了搜索标题，没有打开链接，也不记录地址。' : ''}`,
            kw: x.q, src: '真扫 · Google 搜索标题摘要', url: isC ? C_URL : `${x.site || '搜索结果'} · 原链接`, link: isC ? null : x.url, snip: isC ? '' : String(x.snippet || '').slice(0, 160), date: isC ? '' : (x.date || ''),
            at: now, due: now + LIMIT[h.pr], st: 'new', fl: {}, esc: 0, log: [] };
          firstLog(c); made.push(c);
        });
        const skipWhy = new Map((res.skip || []).map(x => [x.i, x.why]));
        const judged = new Set([...res.hits, ...res.skip].map(x => x.i));
        const skip = list.map((x, i) => used.has(i) || (badChunk && !judged.has(i)) ? null : { title: String(x.title).slice(0, 90), site: PLATS[platIndex('', x.site, 'B')].n === '其他网站' ? '其他站点' : PLATS[platIndex('', x.site, 'B')].n, why: skipWhy.get(i) || '与盗用无关' }).filter(Boolean);
        S.clues.push(...made);
        const p0 = made.filter(c => c.pr === 'P0').length;
        S.scans.push({ t: now, real: 1, q: qs.length, found: raw.length, skip: skip.length, kw: qs.length, g: '-', hits: made.length, p0, dup: raw.length - items.length });
        S.lastReal = { t: now, ids: made.map(c => c.id), skip: skip.slice(0, 40), found: raw.length, uniq: list.length, q: qs.length, fail };
        save(); newIds = new Set(made.map(c => c.id));
        finish(); renderPage(true);
        const o2 = $('#rd-out', root); show(o2, realResult(S.lastReal)); bindCommon(o2); $$('[data-real-again]', o2).forEach(b => b.onclick = realScan);
        toast(made.length ? `真扫完成：新增 ${made.length} 条${p0 ? `，其中 P0 ${p0} 条` : ''}` : '真扫完成：没有疑似侵权的新结果', p0 ? 'bad' : 'ok');
      }

      /* ---------- 录入举报（表单） ---------- */
      const suggest = t => /(私密|不雅|成人|黄|裸|售卖|私信)/.test(t) ? 'P0' : (/(主演|冒充|仿冒|本人)/.test(t) && /(AI|换脸)/i.test(t)) ? 'P0' : /(换脸|AI|合成|同款脸)/i.test(t) ? 'P1' : 'P2';
      function addForm() {
        const d = modal(`<div class="rd form">
          <label>平台<select class="select" id="m-pf">${PLATS.map((p, i) => `<option value="${i}">${esc(p.n)} · ${GROUPS[p.g].lv} 级</option>`).join('')}</select></label>
          <label>标题<input class="input" id="m-t" placeholder="照抄搜索结果里的标题，比如：神似${esc(prof().name)} AI 短剧切片"></label>
          <label id="m-uw">链接<input class="input" id="m-u" placeholder="https://"><small>保存时自动打码，只留域名和前几位</small></label>
          <label>来源<select class="select" id="m-src"><option>粉丝举报</option><option>团队发现</option><option>公开报道</option></select></label>
          <div class="lbl">判定<div class="chips" id="m-pr">${['P0', 'P1', 'P2'].map(p => `<button class="chip" data-v="${p}">${p} · ${LIMIT_TXT[p]}</button>`).join('')}</div><small id="m-sug">按标题给建议：先填标题</small></div>
          <label>补充说明（可空）<textarea class="textarea" id="m-why" placeholder="比如：粉丝说转发已经过千"></textarea></label>
        </div>`, { title: '录入一条举报', foot: '<button class="btn btn-ghost" data-x>取消</button><button class="btn btn-primary" id="m-ok">建档</button>' });
        let pr = '', manual = false;
        const setPr = v => { pr = v; $$('#m-pr .chip', d).forEach(x => x.classList.toggle('on', x.dataset.v === v)); };
        $$('#m-pr .chip', d).forEach(ch => ch.onclick = () => { manual = true; setPr(ch.dataset.v); });
        const paint = () => {
          const g = PLATS[+$('#m-pf', d).value].g, t = $('#m-t', d).value.trim();
          $('#m-uw', d).style.display = g === 3 ? 'none' : '';
          $('#m-sug', d).textContent = (g === 3 ? 'C 级成人站：不记录内容页地址，只记站名和搜索摘要。' : '') + (t ? `按标题建议 ${suggest(t)}：${RULE[suggest(t)]}` : '按标题给建议：先填标题');
        };
        $('#m-pf', d).onchange = paint;
        $('#m-t', d).oninput = () => { const t = $('#m-t', d).value.trim(); if (!manual) setPr(t ? suggest(t) : ''); paint(); };
        $('[data-x]', d).onclick = () => d.close();
        $('#m-ok', d).onclick = () => {
          const t = $('#m-t', d).value.trim(), pi = +$('#m-pf', d).value, g = PLATS[pi].g;
          if (!t) { toast('标题要填', 'bad'); $('#m-t', d).focus(); return; }
          const p = pr || suggest(t), now = Date.now(), u = $('#m-u', d).value.trim().replace(/^https?:\/\//, '');
          const masked = g === 3 ? C_URL : u ? (u.split('/')[0] + '/' + (u.split('/').slice(1).join('/').slice(0, 6))).replace(/\/$/, '') + '******' : `${PLATS[pi].n} · 链接待补`;
          const extra = $('#m-why', d).value.trim();
          const c = { id: `R-${S.seq++}`, p: pi, pr: p, pr0: p, tt: t, why: `人工录入，按标题判为 ${p}：${RULE[p]}。${extra ? '补充：' + extra : ''}`, kw: S.kw.find(k => t.includes(k.split(' ')[0])) || '人工录入', src: $('#m-src', d).value, url: masked, at: now, due: now + LIMIT[p], st: 'new', fl: {}, esc: 0, log: [] };
          log(c, now, `人工录入（${c.src}），判为 ${p}（${LIMIT_TXT[p]}）`);
          S.clues.push(c); save(); d.close();
          toast(`${c.id} 已建档 · ${p}`, 'ok');
          if (page === 'clues') { newIds = new Set([c.id]); renderPage(true); } else ctx.go('clues');
        };
        setTimeout(() => $('#m-t', d).focus(), 50);
      }

      /* ---------- 图表 ---------- */
      function trendSVG(el) {
        const W = Math.max(300, Math.round(el.clientWidth || 600)), Hh = 210, L = 30, R = 8, T = 14, B = 26;
        const t0 = new Date(); t0.setHours(0, 0, 0, 0); const start = t0.getTime() - 29 * D;
        const days = Array.from({ length: 30 }, (_, i) => ({ t: start + i * D, P0: 0, P1: 0, P2: 0 }));
        S.clues.forEach(c => { const i = Math.floor((c.at - start) / D); if (i >= 0 && i < 30) days[i][c.pr0]++; });
        const tot = days.map(d => d.P0 + d.P1 + d.P2), top = Math.max(4, Math.ceil(Math.max(...tot) / 2) * 2);
        const cw = (W - L - R) / 30, bw = Math.max(3, cw * .62), y = v => T + (Hh - T - B) * (1 - v / top);
        const ma = tot.map((_, i) => { const s = tot.slice(Math.max(0, i - 6), i + 1); return s.reduce((a, b) => a + b, 0) / s.length; });
        const grid = [0, top / 2, top].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" style="stroke:var(--line)"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" style="fill:var(--dim);font-size:11px;font-variant-numeric:tabular-nums">${v}</text>`).join('');
        const bars = days.map((d, i) => {
          let acc = 0; const x = L + i * cw + (cw - bw) / 2;
          const seg = ['P0', 'P1', 'P2'].map(p => { if (!d[p]) return ''; const y1 = y(acc + d[p]), y0 = y(acc); acc += d[p]; return `<rect class="bar" x="${x.toFixed(1)}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, y0 - y1 - 1).toFixed(1)}" rx="2" style="fill:${PCOLOR[p]};--i:${i}"/>`; }).join('');
          const dt = new Date(d.t), lab = `${dt.getMonth() + 1}/${dt.getDate()}`;
          return `<g><title>${lab}：P0 ${d.P0} · P1 ${d.P1} · P2 ${d.P2}</title><rect x="${(L + i * cw).toFixed(1)}" y="${T}" width="${cw.toFixed(1)}" height="${Hh - T - B}" style="fill:${i === 29 ? 'var(--accent-soft)' : 'transparent'}"/>${seg}</g>
            ${i % 5 === 4 || i === 0 ? `<text x="${(L + i * cw + cw / 2).toFixed(1)}" y="${Hh - 8}" text-anchor="middle" style="fill:${i === 29 ? 'var(--accent)' : 'var(--dim)'};font-size:11px;font-variant-numeric:tabular-nums">${i === 29 ? '今天' : lab}</text>` : ''}`;
        }).join('');
        const line = ma.map((v, i) => `${(L + i * cw + cw / 2).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
        el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${Hh}" width="100%" role="img" aria-label="30 天线索趋势">${grid}${bars}<polyline points="${line}" style="fill:none;stroke:var(--ink);stroke-width:1.4;opacity:.7;stroke-linejoin:round;stroke-linecap:round"/><circle cx="${(L + 29 * cw + cw / 2).toFixed(1)}" cy="${y(ma[29]).toFixed(1)}" r="3.5" style="fill:var(--ink)"/></svg>`;
      }
      function platBars(list) {
        const cnt = PLATS.map((_, i) => list.filter(c => c.p === i));
        const max = Math.max(1, ...cnt.map(x => x.length));
        return GROUPS.filter(g => g.i < 4 || list.some(c => PLATS[c.p].g === 4)).map(g => {
          const rows = PLATS.map((p, i) => ({ p, n: cnt[i] })).filter(x => x.p.g === g.i);
          const sum = rows.reduce((a, x) => a + x.n.length, 0);
          return `<div class="pg"><div class="row between small"><span><span class="tag" style="color:${GCOLOR[g.i]}">${g.lv} 级</span> ${esc(g.type)}</span><span class="tn xs muted">${sum} 条</span></div>
            ${rows.map(x => { const p0 = x.n.filter(c => c.pr === 'P0').length; return `<div class="pr"><span class="small">${esc(x.p.n)}</span><div class="meter" style="--mc:${GCOLOR[g.i]}"><i style="width:${x.n.length / max * 100}%"></i></div><span class="mono xs">${x.n.length}${p0 ? ` <b style="color:var(--bad)">·P0 ${p0}</b>` : ''}</span></div>`; }).join('')}</div>`;
        }).join('');
      }

      /* ---------- 页面：总览 ---------- */
      function pgOverview() {
        const now = Date.now(), q = S.clues.filter(pending).sort((a, b) => a.due - b.due);
        const last = S.scans[S.scans.length - 1];
        const recent30 = S.clues.filter(c => now - c.at < 30 * D);
        const stc30 = ST_KEYS.map(k => [k, recent30.filter(c => c.st === k).length]);
        const f30 = recent30.filter(c => c.filedAt).length, rate30 = f30 ? Math.round(recent30.filter(c => c.downAt).length / f30 * 100) : 0;
        return `
        <div class="head"><div><h2>总览</h2><p>替女演员盯着谁在用女演员的脸：这周扫到什么、处理到哪一步。上次扫描：${last ? ago(last.t) : '还没扫过'} · 关键词 ${S.kw.length} 个 · 平台 ${enabledPlats().length} 个</p></div>
          <div class="row">${headBtns()}</div></div>
        <div id="rd-out" class="out"></div>
        <div class="kpis k5">${kpis().map(k => `<div class="kpi" style="${k[4] ? '--kc:' + k[4] : ''}"><small>${k[3]}</small><b data-roll="${k[0]}" data-to="${k[1]}">${fmt(prevK[k[0]] ?? 0)}</b><span>${k[2]}</span></div>`).join('')}</div>
        <div class="g-ov">
          <div class="card"><div class="hd"><h3>30 天线索趋势</h3><span class="xs muted tn">按发现日 · 共 ${recent30.length} 条</span></div>
            <div id="rd-chart"></div>
            <div class="legend"><span><i style="background:${PCOLOR.P0}"></i>P0</span><span><i style="background:${PCOLOR.P1}"></i>P1</span><span><i style="background:${PCOLOR.P2}"></i>P2</span><span><i style="background:var(--ink);opacity:.7;height:2px;vertical-align:3px"></i>7 日均线</span></div>
            <div class="divider"></div>
            <div class="hd" style="margin-bottom:10px"><h3>处置进度</h3><span class="xs muted tn">近 30 天 · 下架率 ${rate30}%</span></div>
            <div class="seg">${stc30.filter(x => x[1]).map(([k, n]) => `<i style="width:${n / Math.max(1, recent30.length) * 100}%;background:${STC[k]}" title="${ST[k][0]} ${n}"></i>`).join('')}</div>
            <div class="funnel">${stc30.map(([k, n]) => `<button class="fn" data-gost="${k}"><b style="color:${STC[k]}">${n}</b><span>${ST[k][0]}</span></button>`).join('')}</div>
            <p class="xs dim" style="margin-top:8px">点一个状态，直接去线索列表看这一类。</p></div>
          <div class="card"><div class="hd"><h3>待办队列</h3><span class="tag p0">${q.length} 条在计时</span></div>
            ${q.length ? `<ul class="list q">${q.slice(0, 7).map(c => `<li data-open="${c.id}">${prTag(c.pr)}<div style="flex:1;min-width:0"><b class="small ell">${c.real ? '<span class="accent">[真实]</span> ' : ''}${esc(c.tt)}</b><div class="xs muted">${esc(c.id)} · ${esc(pfName(c))} · ${ST[c.st][0]}</div></div>${cd(c, true)}</li>`).join('')}</ul>${q.length > 7 ? `<div class="ft"><button class="btn btn-sm btn-ghost" data-go="clues">还有 ${q.length - 7} 条，去线索列表</button></div>` : ''}`
              : '<div class="empty"><b>队列清空了</b>没有在计时的 P0 / P1。</div>'}</div>
        </div>
        <div class="g-2">
          <div class="card"><div class="hd"><h3>平台分布</h3><span class="xs muted">近 30 天 · A / B / C 级</span></div>${platBars(recent30)}
            <p class="xs dim" style="margin-top:10px">C 级成人站只写站名，只看外部搜索引擎的标题和摘要，不进内容页。</p></div>
          <div class="stack">
            <div class="card"><div class="hd"><h3>监测流</h3><span class="live">实时</span></div><div class="ticker" id="rd-ticker"></div></div>
            <div class="card"><div class="hd"><h3>扫描记录</h3><span class="xs muted">最近 5 次</span></div>
              <ul class="list">${S.scans.slice(-5).reverse().map(s => `<li class="small"><span class="tn xs muted" style="width:86px;flex:none">${ft(s.t)}</span><span style="flex:1">${s.real ? `<span class="tag accent">真扫</span> 搜索 ${s.q} 次 · 找到 ${s.found} 条 · 排除 ${s.skip}` : `<span class="tag">演示</span> 关键词 ${s.kw} · 平台 ${s.g} 组 · 去重 ${s.dup ?? 0}`}</span><span class="tn xs">命中 <b>${s.hits}</b>${s.p0 ? ` · <b style="color:var(--bad)">P0 ${s.p0}</b>` : ''}</span></li>`).join('')}</ul></div>
          </div>
        </div>`;
      }

      /* ---------- 页面：线索 ---------- */
      const PR_RANK = { P0: 0, P1: 1, P2: 2 };
      function filtered() {
        const f = S.f, q = f.q.trim().toLowerCase();
        const L = S.clues.filter(c => (!f.lv || lvOf(c) === f.lv) && (f.p === '' || c.p === +f.p) && (!f.st || c.st === f.st) && (!f.pr || c.pr === f.pr)
          && (!q || [c.id, c.tt, pfName(c), c.kw, c.src].join(' ').toLowerCase().includes(q)));
        const s = { new: (a, b) => b.at - a.at, old: (a, b) => a.at - b.at,
          urgent: (a, b) => (pending(b) - pending(a)) || (pending(a) ? a.due - b.due : 0) || PR_RANK[a.pr] - PR_RANK[b.pr] || b.at - a.at,
          pr: (a, b) => PR_RANK[a.pr] - PR_RANK[b.pr] || b.at - a.at }[f.sort] || ((a, b) => b.at - a.at);
        return L.sort(s);
      }
      function pgClues() {
        const f = S.f, L = filtered(), now = Date.now();
        const sel = (k, opts, ph) => `<select class="select" data-f="${k}" aria-label="${ph}"><option value="">${ph}</option>${opts.map(o => `<option value="${o[0]}" ${String(f[k]) === String(o[0]) ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
        const cnt = ST_KEYS.map(k => [k, S.clues.filter(c => c.st === k).length]);
        const filtering = f.q || f.lv || f.p !== '' || f.st || f.pr;
        /* 一眼看：30 天里每条线索落在哪天、什么级、走到哪一步 */
        const day0 = new Date(now); day0.setHours(0, 0, 0, 0);
        const from = day0.getTime() - 29 * D, to = day0.getTime() + D;
        const PR = ['P0', 'P1', 'P2'];
        const dots = S.clues.filter(c => c.at >= from).map(c => ({ t: c.at, row: PR.indexOf(c.pr), c: STC[c.st], r: c.pr === 'P0' ? 5 : 4, title: `${c.id} · ${c.pr} · ${ST[c.st][0]}\n${c.tt}` }));
        const flow = [['发现', S.clues.length], ['已取证', S.clues.filter(c => c.evidAt).length], ['已投诉', S.clues.filter(c => c.filedAt).length], ['已下架', S.clues.filter(c => c.downAt).length], ['已结案', S.clues.filter(c => c.closedAt).length]].map(([l, v]) => ({ l, v }));
        const viz = `<div class="viz-grid two" style="margin:0 0 16px">
          <div class="viz-card"><div class="vh"><b>30 天里每条线索落在哪天</b><span>一行一级，颜色是现在的状态</span></div><div class="viz-scroll">${Viz.strip(dots, { from, to, rows: PR, w: 640, rh: 30, every: 5, label: '30 天线索点带' })}</div>${Viz.legend(ST_KEYS.map(k => ({ l: ST[k][0], v: cnt.find(x => x[0] === k)[1], c: STC[k] })))}</div>
          <div class="viz-card"><div class="vh"><b>一条线索走到哪一步</b><span>累计 ${S.clues.length} 条</span></div>${Viz.funnel(flow, { w: 460, lw: 60, vw: 96, c: 'var(--accent)', label: '线索处置漏斗' })}<p class="vn">P2 不投诉直接归档，所以「已结案」会比「已下架」多。</p></div>
        </div>`;
        return `
        <div class="head"><div><h2>线索</h2><p>共 ${S.clues.length} 条 · 点一条看详情和处置。标题为演示虚构。</p></div>
          <div class="row">${headBtns()}</div></div>
        <div id="rd-out" class="out"></div>
        ${viz}
        <div class="chips stchips">${[['', '全部', S.clues.length], ...cnt.map(([k, n]) => [k, ST[k][0], n])].map(([k, t, n]) => `<button class="chip ${f.st === k ? 'on' : ''}" data-st="${k}">${t} <span class="mono xs">${n}</span></button>`).join('')}</div>
        <div class="filters">
          <div class="search"><input class="input" id="rd-q" placeholder="搜标题、ID、平台、关键词" value="${esc(f.q)}" aria-label="搜索"></div>
          ${sel('pr', [['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2']], '全部判定')}
          ${sel('lv', [['A', 'A 级'], ['B', 'B 级'], ['C', 'C 级']], '全部级别')}
          ${sel('p', PLATS.map((p, i) => [i, p.n]), '全部平台')}
          ${sel('st', ST_KEYS.map(k => [k, ST[k][0]]), '全部状态')}
          <select class="select" data-f="sort" aria-label="排序">${[['new', '最新发现'], ['old', '最早发现'], ['urgent', '最紧急'], ['pr', '判定 P0→P2']].map(o => `<option value="${o[0]}" ${f.sort === o[0] ? 'selected' : ''}>排序：${o[1]}</option>`).join('')}</select>
        </div>
        <div class="row between" style="margin-bottom:10px"><span class="small muted">筛出 <b class="accent">${L.length}</b> 条</span>${filtering ? '<button class="btn btn-sm btn-ghost" data-clear>清空筛选</button>' : ''}</div>
        ${L.length ? `<div class="card pad-0"><div class="table-wrap"><table class="table tbl"><thead><tr><th class="hm">ID</th><th>判定</th><th>标题（虚构）</th><th class="hm">发现时间</th><th>状态</th><th class="hm">时限 / 复查</th></tr></thead><tbody>
          ${L.map(c => `<tr data-open="${c.id}" class="${newIds.has(c.id) ? 'new' : ''}"><td class="hm tn xs">${esc(c.id)}</td><td>${prTag(c.pr)}</td><td><span class="tt">${realTag(c)} ${esc(c.tt)}</span><span class="xs muted">${esc(pfName(c))} · ${lvOf(c)} 级${c.esc ? ` · <b style="color:var(--bad)">再上传 ×${c.esc}</b>` : ''}<span class="sm-only"> · ${ft(c.at)}</span></span></td><td class="hm tn xs">${ft(c.at)}</td><td>${stTag(c.st)}</td><td class="hm">${pending(c) ? cd(c, true) : c.st === 'filed' || c.st === 'recheck' ? `<span class="xs muted">${c.recheckDue > now ? Math.ceil((c.recheckDue - now) / D) + ' 天后复查' : '复查到期'}</span>` : '<span class="dim xs">—</span>'}</td></tr>`).join('')}
          </tbody></table></div></div>` : '<div class="empty"><b>没有符合条件的线索</b>换个筛选条件，或者清空筛选。</div>'}`;
      }

      /* ---------- 页面：取证包 ---------- */
      const LAW = [
        ['《民法典》第 1019 条', '任何组织或者个人不得以丑化、污损，或者利用信息技术手段伪造等方式侵害他人的肖像权。未经肖像权人同意，不得制作、使用、公开肖像权人的肖像，但是法律另有规定的除外。'],
        ['《民法典》第 1023 条第二款', '对自然人声音的保护，参照适用肖像权保护的有关规定。'],
        ['《人工智能生成合成内容标识办法》（2025 年 9 月 1 日起施行）', 'AI 生成合成的内容要加显式和隐式标识，不得擅自删除。线索中没有标识的换脸内容，投诉时多一条依据。'],
      ];
      const CASES_USE = RADAR.cases.filter(c => /法院|起诉/.test(c[1]));
      const packAll = () => S.clues.filter(c => c.pr === 'P0' && ['new', 'evid', 'filed', 'recheck'].includes(c.st)).sort((a, b) => a.at - b.at);
      const packIn = () => packAll().filter(c => !packOff.has(c.id));
      function packText(L) {
        const now = Date.now();
        return [`交律师包 · AI 换脸雷达`, `当事人：${prof().name}`, `生成时间：${fd(now)} ${fclock(now).slice(0, 5)}　共 ${L.length} 条 P0 线索（演示数据，标题为虚构）`, '',
          '一、线索清单',
          ...L.flatMap((c, i) => [`${i + 1}. ${c.id}｜${pfName(c)}（${lvOf(c)} 级）｜发现 ${ft(c.at)}｜${ST[c.st][0]}${c.real ? '｜真扫' : ''}`, `   标题：${c.tt}`, `   链接：${c.link || c.url}`, `   取证编号：${c.ev || '待固证'}`, `   截图哈希（SHA-256）：${c.hash || '待取证机构截图后计算'}`, `   判定：${c.why}`]),
          '', '二、法条依据', ...LAW.map(l => `· ${l[0]}：${l[1]}`),
          '', '三、可参照的公开判例与报道', ...CASES_USE.map(c => `· ${c[0]}　${c[1]}（${c[2]}）${c[3]}`),
          '', '四、请律师处理', ...RADAR.steps.map((s, i) => `${i + 1}. ${s[0]}：${s[1]}`),
          '', '五、说明', '雷达只记录链接、标题、发现时间和截图哈希，不下载、不存储、不查看素材；C 级成人站只看搜索引擎摘要，不进内容页。固证由公证处或有资质的电子数据取证平台完成。'].join('\n');
      }
      function pgPack() {
        const all = packAll(), L = packIn(), toLawyer = L.filter(c => c.st === 'new');
        return `
        <div class="head"><div><h2>取证包</h2><p>在办的 P0 自动汇成一份「交律师包」：清单、法条、判例、要律师做的事。关掉开关的不进包。</p></div>
          <div class="row"><button class="btn" data-copy-pack ${L.length ? '' : 'disabled'}>复制成文字</button><button class="btn btn-primary" data-send ${toLawyer.length ? '' : 'disabled'}>${toLawyer.length ? `${toLawyer.length} 条新发现一键交律师` : '包里的都已交律师'}</button></div></div>
        <div class="g-pack">
          <div class="card"><div class="hd"><h3>在办 P0</h3><span class="xs muted">${L.length} / ${all.length} 进包</span></div>
            ${all.length ? `<ul class="list">${all.map(c => `<li style="align-items:center"><button class="switch ${packOff.has(c.id) ? '' : 'on'}" data-sel="${c.id}" aria-label="进包"></button><div style="flex:1;min-width:0" data-open="${c.id}" class="clk"><b class="small ell">${esc(c.tt)}</b><div class="xs muted">${esc(c.id)} · ${esc(pfName(c))} · ${ST[c.st][0]}</div></div>${pending(c) ? cd(c, true) : stTag(c.st)}</li>`).join('')}</ul>` : '<div class="empty"><b>没有在办的 P0</b>扫一遍，有新 P0 会自动进来。</div>'}
          </div>
          <article class="paper">
            <div class="row between"><span class="eyebrow">交律师包 · 预览</span><span class="xs dim tn">${fd(Date.now())}</span></div>
            <h3 style="margin-top:10px">AI 换脸雷达 · P0 线索 ${L.length} 条</h3>
            <p class="xs muted" style="margin-top:4px">演示数据，标题为虚构。只含元数据，不含任何素材。</p>
            <h4>一、线索清单</h4>
            ${L.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>平台</th><th>标题 / 链接</th><th>取证</th></tr></thead><tbody>${L.map(c => `<tr><td class="tn xs">${esc(c.id)}<div class="dim">${ft(c.at)}</div></td><td class="small">${esc(pfName(c))}<div class="xs dim">${lvOf(c)} 级</div></td><td class="small">${realTag(c)} ${esc(c.tt)}<div class="mono-b dim">${esc(c.url)}</div></td><td class="xs">${c.ev ? `<span class="mono">${esc(c.ev)}</span><div class="mono-b dim">${esc(c.hash.slice(0, 16))}…</div>` : '<span class="tag warn">待固证</span>'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="small muted">没有勾选线索。</p>'}
            <h4>二、法条依据</h4>
            <ul class="law">${LAW.map(l => `<li><b>${esc(l[0])}</b><p>${esc(l[1])}</p></li>`).join('')}</ul>
            <h4>三、可参照的公开判例与报道</h4>
            <ul class="tl">${CASES_USE.map(c => `<li><span class="d">${esc(c[0])}</span><p>${esc(c[1])}</p><a href="${c[3]}" target="_blank" rel="noopener">${esc(c[2])}</a></li>`).join('')}</ul>
            <h4>四、请律师处理</h4>
            <ol class="small" style="padding-left:20px;margin:0">${RADAR.steps.map(s => `<li><b>${esc(s[0])}</b>：${esc(s[1])}</li>`).join('')}</ol>
            <h4>五、说明</h4>
            <p class="small muted">雷达只记录链接、标题、发现时间和截图哈希，不下载、不存储、不查看素材；C 级成人站只看搜索引擎摘要，不进内容页。固证由公证处或有资质的电子数据取证平台完成。</p>
          </article>
        </div>`;
      }

      /* ---------- 页面：月报 ---------- */
      function monthRange(off) { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth() - off, 1); const e = new Date(n.getFullYear(), n.getMonth() - off + 1, 1); return [s.getTime(), Math.min(e.getTime(), Date.now()), s]; }
      function reportData(off) {
        const [s, e, sd] = monthRange(off), now = Date.now();
        const L = S.clues.filter(c => c.at >= s && c.at < e);
        const by = k => L.filter(c => c.pr0 === k).length;
        const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length / H : null;
        const tm = ['P0', 'P1', 'P2'].map(p => {
          const X = L.filter(c => c.pr0 === p), ref = p === 'P0' ? 'evidAt' : 'filedAt';
          const met = X.filter(c => c[ref] && c[ref] - c.at <= LIMIT[p]).length, miss = X.filter(c => (c[ref] && c[ref] - c.at > LIMIT[p]) || (!c[ref] && now - c.at > LIMIT[p] && !c.closedAt)).length;
          return { p, n: X.length, ev: avg(X.filter(c => c.evidAt).map(c => c.evidAt - c.at)), fi: avg(X.filter(c => c.filedAt).map(c => c.filedAt - c.at)), rate: p !== 'P2' && met + miss ? Math.round(met / (met + miss) * 100) : null };
        });
        const filed = L.filter(c => c.filedAt).length, down = L.filter(c => c.downAt).length;
        const plat = PLATS.map((p, i) => [p.n, L.filter(c => c.p === i).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
        const cC = L.filter(c => lvOf(c) === 'C').length, reup = L.filter(c => c.esc).length, inR = L.filter(c => c.st === 'filed' || c.st === 'recheck').length;
        const tips = [];
        if (plat[0]) tips.push(`${plat[0][0]} 线索最多（${plat[0][1]} 条），下月关键词加上剧名和角色名组合重点盯。`);
        if (cC) tips.push(`C 级成人站 ${cC} 条，全部走 12377 和律师函，不进内容页。`);
        if (reup) tips.push(`再次上传 ${reup} 条，已升级处理；同一来源反复上传的，请律师评估起诉。`);
        const nReal = L.filter(c => c.real).length;
        if (nReal) tips.push(`真扫发现 ${nReal} 条，比演示数据更该优先看；真扫关键词在「档案」页改。`);
        if (inR) tips.push(`还有 ${inR} 条在等复查，下月初逐条确认是否真下架。`);
        return { s, e, sd, L, P0: by('P0'), P1: by('P1'), P2: by('P2'), st: ST_KEYS.map(k => [k, L.filter(c => c.st === k).length]), tm, filed, down, rate: filed ? Math.round(down / filed * 100) : 0, plat, reup, tips };
      }
      function reportText(R) {
        const ym = `${R.sd.getFullYear()} 年 ${R.sd.getMonth() + 1} 月`, h = v => v == null ? '—' : v.toFixed(1) + ' 小时';
        return [`AI 换脸雷达 · ${ym}月报（${fd(R.s)} 至 ${fd(R.e)}，演示数据）`, '',
          `新线索 ${R.L.length} 条：P0 ${R.P0} · P1 ${R.P1} · P2 ${R.P2}`,
          `已投诉 ${R.filed} 条，已下架 ${R.down} 条，下架率 ${R.rate}%`,
          `按状态：${R.st.map(([k, n]) => `${ST[k][0]} ${n}`).join('，')}`,
          `平台分布：${R.plat.map(p => `${p[0]} ${p[1]}`).join('，') || '无'}`, '',
          '处理时效：', ...R.tm.map(t => `· ${t.p}（${t.n} 条）发现→取证 ${h(t.ev)}，发现→投诉 ${h(t.fi)}，时限 ${LIMIT_TXT[t.p]}，达标率 ${t.rate == null ? '—' : t.rate + '%'}`), '',
          '下月建议：', ...R.tips.map(t => `· ${t}`), '',
          '说明：线索为演示用假数据；雷达只记元数据，不下载、不存、不看素材。'].join('\n');
      }
      function pgReport() {
        const R = reportData(month), ym = `${R.sd.getFullYear()} 年 ${R.sd.getMonth() + 1} 月`, h = v => v == null ? '—' : v.toFixed(1) + 'h';
        const stc = STC;
        const pmax = Math.max(1, ...R.plat.map(p => p[1]));
        return `
        <div class="head"><div><h2>月报</h2><p>女演员每月只看这一页，处理细节在线索表里。</p></div>
          <div class="row"><div class="chips" id="rd-month"><button class="chip ${month === 0 ? 'on' : ''}" data-v="0">本月</button><button class="chip ${month === 1 ? 'on' : ''}" data-v="1">上月</button></div><button class="btn btn-primary" data-copy-report>复制成文字</button></div></div>
        <article class="paper">
          <div class="row between"><span class="eyebrow">AI 换脸雷达 · ${esc(prof().name)} · 月报</span><span class="xs dim tn">${fd(R.s)} — ${fd(R.e)}</span></div>
          <h3 style="margin-top:10px;font-size:22px">${ym}：新线索 ${R.L.length} 条，下架率 ${R.rate}%</h3>
          <p class="small muted" style="margin-top:6px">P0 ${R.P0} 条${R.tm[0].rate != null ? `，24 小时内交律师达标率 ${R.tm[0].rate}%` : ''}；再次上传 ${R.reup} 条。演示数据。</p>
          <div class="kpis k5" style="margin-top:16px">${[['新线索', R.L.length, ''], ['P0', R.P0, 'var(--bad)'], ['已投诉', R.filed, 'var(--warn)'], ['已下架', R.down, 'var(--ok)'], ['下架率', R.rate + '%', 'var(--info)']].map(k => `<div class="kpi" style="${k[2] ? '--kc:' + k[2] : ''}"><b>${k[1]}</b><span>${k[0]}</span></div>`).join('')}</div>
          <h4>按状态</h4>
          <div class="seg">${R.st.filter(x => x[1]).map(([k, n]) => `<i style="width:${n / Math.max(1, R.L.length) * 100}%;background:${stc[k]}" title="${ST[k][0]} ${n}"></i>`).join('')}</div>
          <div class="legend">${R.st.map(([k, n]) => `<span><i style="background:${stc[k]}"></i>${ST[k][0]} ${n}</span>`).join('')}</div>
          <div class="g-2">
            <div><h4>平台分布</h4>${R.plat.length ? R.plat.map(p => `<div class="pr"><span class="small">${esc(p[0])}</span><div class="meter"><i style="width:${p[1] / pmax * 100}%"></i></div><span class="mono xs">${p[1]}</span></div>`).join('') : '<p class="small muted">这个月没有线索。</p>'}</div>
            <div><h4>处理时效</h4>
              ${Viz.lollipop(R.tm.flatMap(t => [{ l: `${t.p} 到取证（${t.n} 条）`, v: t.ev == null ? null : +t.ev.toFixed(1), target: t.p === 'P0' ? 24 : null }, { l: `${t.p} 到投诉`, v: t.fi == null ? null : +t.fi.toFixed(1), target: t.p === 'P1' ? 72 : null }]), { w: 460, lw: 130, unit: 'h', label: '各级平均处理时长' })}
              <p class="xs dim" style="margin-top:8px">虚线是达标线：P0 要 24 小时内交律师和取证，P1 要 72 小时内投诉；P2 进周报，不算时效。${R.tm.filter(t => t.rate != null).map(t => `${t.p} 达标 ${t.rate}%`).join('，')}。</p></div>
          </div>
          <h4>下月建议</h4>
          ${R.tips.length ? `<ul class="small" style="padding-left:18px;margin:0">${R.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="small muted">没有需要特别跟进的事。</p>'}
          <p class="xs dim" style="margin-top:16px">线索为演示用假数据。雷达只记元数据，不下载、不存、不看素材。</p>
        </article>`;
      }

      /* ---------- 页面：设置 ---------- */
      function pgSettings() {
        return `
        <div class="head"><div><h2>设置</h2><p>扫什么、去哪扫、怎么分级、怎么处置。改动自动保存。</p></div></div>
        <div class="g-2" style="margin-top:0">
          <div class="card"><div class="hd"><h3>关键词清单</h3><span class="xs muted">${S.kw.length} 个</span></div>
            <p class="small muted">名字、本名、剧名、角色名，加「换脸 / 同款脸 / 神似 / AI」的组合。</p>
            <div class="kws">${S.kw.map((k, i) => `<span class="kw">${esc(k)}<button data-rm="${i}" aria-label="删掉 ${esc(k)}">×</button></span>`).join('') || '<span class="small muted">一个都没有，扫描会停。</span>'}</div>
            <div class="row" style="margin-top:12px;flex-wrap:nowrap"><input class="input" id="rd-kw" placeholder="加一个，比如：${esc(prof().show || prof().name)} 同款脸"><button class="btn" data-addkw>添加</button></div>
            <div class="ft"><button class="btn btn-sm btn-ghost" data-kwreset>恢复默认关键词</button></div></div>
          <div class="card"><div class="hd"><h3>分级规则</h3></div>
            <div class="table-wrap"><table class="table"><thead><tr><th>等级</th><th>判定</th><th>时限</th></tr></thead><tbody>${RADAR.levels.map(l => `<tr><td>${prTag(l[0])}</td><td class="small">${esc(l[1])}</td><td class="small">${esc(l[2])}</td></tr>`).join('')}</tbody></table></div>
            <p class="xs dim" style="margin-top:8px">同一内容再次上传的，升一级处理。</p></div>
        </div>
        <div class="card" style="margin-top:14px"><div class="hd"><h3>监测平台</h3><span class="xs muted">关掉的组，扫描时跳过</span></div>
          <div class="table-wrap"><table class="table"><thead><tr><th>级</th><th>类型</th><th>平台</th><th class="hm">说明</th><th>监测</th></tr></thead><tbody>
          ${RADAR.platforms.map((p, i) => `<tr><td><span class="tag" style="color:${GCOLOR[i]}">${p[0]}</span></td><td class="small">${esc(p[1])}</td><td class="small">${esc(p[2])}</td><td class="hm xs muted">${esc(p[3])}</td><td><button class="switch ${S.pf[i] ? 'on' : ''}" data-pf="${i}" aria-label="监测 ${esc(p[1])}"></button></td></tr>`).join('')}
          </tbody></table></div>
          <p class="xs dim" style="margin-top:8px">C 级成人站只写站名，不写域名；只用外部搜索引擎看标题和摘要来判断是否命中，不点进内容页。</p></div>
        <div class="g-2">
          <div class="card"><div class="hd"><h3>处置四步</h3></div>
            <ol class="list">${RADAR.steps.map((s, i) => `<li><span class="avatar">${i + 1}</span><div><b class="small">${esc(s[0])}</b><p class="small muted">${esc(s[1])}</p></div></li>`).join('')}</ol></div>
          <div class="card"><div class="hd"><h3>跟进闭环</h3></div>
            <div class="steps">${RADAR.loop.map((s, i) => `<span><i>${i + 1}</i>${esc(s)}</span>`).join('')}</div>
            <p class="small muted" style="margin-top:12px">投诉后 7 天内复查是否真下架；同一内容再次上传的，升一级处理。每月给女演员一份报告。</p>
            <div class="divider"></div>
            <b class="small">只碰元数据</b><p class="small muted">${esc(PLAN[12].not)}</p></div>
        </div>
        <div class="card" style="margin-top:14px"><div class="hd"><h3>公开案例时间线</h3><span class="xs muted">只写已证实的内容</span></div>
          <ul class="tl">${RADAR.cases.map(c => `<li><span class="d">${esc(c[0])}</span><p>${esc(c[1])}</p><a href="${c[3]}" target="_blank" rel="noopener">${esc(c[2])}</a></li>`).join('')}</ul>
          <p class="xs dim">目前没有公开报道点名任何平台上有女演员的换脸短剧，雷达是监测框架。</p></div>
        <div class="card" style="margin-top:14px"><div class="hd"><h3>真扫</h3><span class="tag ${aiOn() ? 'ok' : ''}">${aiOn() ? 'AI 已接入' : '未接入，只能演示扫'}</span></div>
          <p class="small muted">真扫用「档案」页里的前 3 个关键词，各配「换脸 / AI 短剧 / 神似 / 同款脸」搜一次 Google，共 ${realQueries().length} 次；只看搜索结果的标题和摘要，再交 AI 按上面的分级规则判定。C 级成人站只在标题里出现：不打开、不记地址、不存摘要。</p>
          <div class="kws">${realQueries().map(q => `<span class="kw" style="padding-right:12px">${esc(q)}</span>`).join('')}</div>
          <div class="ft"><a class="btn btn-sm" href="#/profile">改档案关键词</a>${aiOn() ? '' : '<a class="btn btn-sm btn-primary" href="#/connect">去接入 AI</a>'}</div></div>
        <div class="card" style="margin-top:14px"><div class="hd"><h3>演示数据</h3></div>
          <p class="small muted">这里所有线索、标题、链接、哈希、取证编号、统计数字都是演示用的假数据；平台分级、法条和公开案例是真实资料。操作记录存在本机浏览器里，关掉再开还在。</p>
          <div class="ft"><button class="btn btn-danger btn-sm" data-reset>重置演示数据</button><span class="xs dim">清掉处置记录、录入的举报、关键词和开关</span></div></div>`;
      }

      /* ---------- 渲染与绑定 ---------- */
      const PAGES = { '': pgOverview, clues: pgClues, pack: pgPack, report: pgReport, settings: pgSettings };
      function bindCommon(scope) {
        $$('[data-open]', scope).forEach(el => el.onclick = () => openClue(el.dataset.open));
        $$('[data-go]', scope).forEach(el => el.onclick = () => ctx.go(el.dataset.go));
      }
      function renderPage(keep) {
        if (!alive) return;
        const y = window.scrollY, out = $('#rd-out', root), keepOut = keep && out ? out.innerHTML : '';
        main.innerHTML = PAGES[page]();
        const o2 = $('#rd-out', root);
        if (keepOut && o2) { o2.innerHTML = keepOut; bindCommon(o2); }
        paintNav(); bindPage(); rollAll(); tick();
        if (keep) window.scrollTo(0, y);
      }
      function copyText(text, what) {
        const fallback = () => {
          const d = modal(`<p class="small muted" style="margin-bottom:10px">浏览器没让直接复制，全选下面的文字复制：</p><textarea class="textarea" style="min-height:320px;font-size:12.5px" readonly>${esc(text)}</textarea>`, { title: `${what} · 文字版` });
          const ta = $('textarea', d); ta.focus(); ta.select();
        };
        if (!navigator.clipboard) return fallback();
        Promise.race([navigator.clipboard.writeText(text), new Promise((_, no) => setTimeout(no, 1500))])
          .then(() => toast(`${what}已复制成文字，可以直接粘贴`, 'ok'), fallback);
      }
      function bindPage() {
        bindCommon(main);
        $$('[data-scan]', main).forEach(b => b.onclick = () => scan(b));
        $$('[data-real]', main).forEach(b => b.onclick = realScan);
        $$('[data-more]', main).forEach(b => b.onclick = moreMenu);
        $$('[data-real-again]', main).forEach(b => b.onclick = realScan);
        $$('[data-add]', main).forEach(b => b.onclick = addForm);
        if (page === '') {
          trendSVG($('#rd-chart', main)); feedTicker(true);
          const o = $('#rd-out', main); if (o && !o.innerHTML.trim() && S.lastReal && aiOn()) { o.innerHTML = realResult(S.lastReal); bindCommon(o); $$('[data-real-again]', o).forEach(b => b.onclick = realScan); }
          $$('[data-gost]', main).forEach(b => b.onclick = () => { S.f = { q: '', lv: '', p: '', st: b.dataset.gost, pr: '', sort: S.f.sort }; save(); ctx.go('clues'); });
        }
        if (page === 'clues') {
          const setF = (k, v) => { S.f[k] = v; save(); newIds = new Set(); renderPage(true); };
          $$('[data-f]', main).forEach(s => s.onchange = () => setF(s.dataset.f, s.value));
          $$('[data-st]', main).forEach(b => b.onclick = () => setF('st', b.dataset.st));
          const q = $('#rd-q', main); let to;
          q.oninput = () => { clearTimeout(to); to = setTimeout(() => { S.f.q = q.value; save(); renderPage(true); const q2 = $('#rd-q', main); q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); }, 220); };
          const cl = $('[data-clear]', main); if (cl) cl.onclick = () => { S.f = { q: '', lv: '', p: '', st: '', pr: '', sort: S.f.sort }; save(); renderPage(true); };
        }
        if (page === 'pack') {
          $$('[data-sel]', main).forEach(b => b.onclick = () => { const id = b.dataset.sel; packOff.has(id) ? packOff.delete(id) : packOff.add(id); renderPage(true); });
          $('[data-copy-pack]', main).onclick = () => copyText(packText(packIn()), '交律师包');
          $('[data-send]', main).onclick = () => {
            const L = packIn().filter(c => c.st === 'new'), t = Date.now();
            L.forEach(c => run('lawyer', c, t)); save(); renderPage(true);
            toast(`${L.length} 条已交律师和取证机构，取证编号已生成`, 'ok');
          };
        }
        if (page === 'report') {
          $$('#rd-month .chip', main).forEach(b => b.onclick = () => { month = +b.dataset.v; renderPage(true); });
          $('[data-copy-report]', main).onclick = () => copyText(reportText(reportData(month)), '月报');
        }
        if (page === 'settings') {
          const add = () => { const v = $('#rd-kw', main).value.trim().replace(/\s+/g, ' '); if (!v) { toast('先写一个关键词', 'bad'); return; } if (S.kw.includes(v)) { toast('已经有了'); return; } S.kw.push(v); save(); renderPage(true); toast(`加上了「${v}」，下次扫描生效`, 'ok'); $('#rd-kw', main).focus(); };
          $('[data-addkw]', main).onclick = add;
          $('#rd-kw', main).onkeydown = e => { if (e.key === 'Enter') add(); };
          $$('[data-rm]', main).forEach(b => b.onclick = () => { const k = S.kw.splice(+b.dataset.rm, 1)[0]; save(); renderPage(true); toast(`删掉了「${k}」`); });
          $('[data-kwreset]', main).onclick = () => { S.kw = kw0(); save(); renderPage(true); toast('关键词恢复默认', 'ok'); };
          $$('[data-pf]', main).forEach(b => b.onclick = () => { const i = +b.dataset.pf; S.pf[i] = !S.pf[i]; save(); renderPage(true); toast(`${RADAR.platforms[i][1]}：${S.pf[i] ? '开始监测' : '暂停监测'}`); });
          $('[data-reset]', main).onclick = () => {
            const d = modal('<p>清掉所有处置记录、录入的举报、关键词和平台开关，回到初始演示数据。这一步撤不回。</p>', { title: '重置演示数据？', foot: '<button class="btn btn-ghost" data-x>取消</button><button class="btn btn-danger" data-ok>重置</button>' });
            $('[data-x]', d).onclick = () => d.close();
            $('[data-ok]', d).onclick = () => { S = freshState(Date.now()); save(); packOff = new Set(); prevK = {}; newIds = new Set(); d.close(); renderPage(); toast('演示数据已重置', 'ok'); };
          };
        }
      }

      /* ---------- 实时：倒计时每秒走，监测流每 2.4 秒一行 ---------- */
      function tick() {
        const now = Date.now();
        $$('[data-due]').forEach(el => { const ms = +el.dataset.due - now; el.textContent = left(ms, el.dataset.s); el.classList.toggle('over', ms < 0); el.classList.toggle('hot', ms >= 0 && ms < 6 * H); });
      }
      function feedTicker(fill) {
        const tk = $('#rd-ticker', root); if (!tk) return;
        const plats = enabledPlats();
        const line = t => {
          if (!plats.length || !S.kw.length) return `<div><span class="dim">${fclock(t)}</span>  监测已暂停：设置里没有打开的平台或关键词</div>`;
          const p = pick(Math.random, plats), k = pick(Math.random, S.kw), n = 3 + Math.floor(Math.random() * 40), hit = Math.random() < .12;
          return `<div><span class="dim">${fclock(t)}</span>  <b>${esc(p.n)}</b>  「${esc(k)}」  摘要 ${n} 条 · ${hit ? '<span class="hit">疑似 1 · 已在线索里，去重</span>' : '命中 0'}</div>`;
        };
        if (fill) { const now = Date.now(); tk.innerHTML = Array.from({ length: 6 }, (_, i) => line(now - (6 - i) * 2400)).join(''); return; }
        tk.insertAdjacentHTML('beforeend', line(Date.now()));
        while (tk.children.length > 6) tk.firstElementChild.remove();
      }
      timers.push(setInterval(tick, 1000), setInterval(() => feedTicker(false), 2400));
      let rt; onResize = () => { clearTimeout(rt); rt = setTimeout(() => { const ch = $('#rd-chart', root); if (ch) trendSVG(ch); }, 150); };
      addEventListener('resize', onResize);

      renderPage();
    },

    unmount() {
      alive = false;
      timers.forEach(clearInterval); timers = [];
      if (onResize) { removeEventListener('resize', onResize); onResize = null; }
      document.querySelectorAll('dialog.modal').forEach(d => d.close());
      prevK = {};
    },
  });
})();
