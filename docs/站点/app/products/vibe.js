/* 桐铃 vibecoding：粉丝说一句话，AI 做出小玩意；她每周点名一个。
   子路由：''=总览 / ideas=点子池 / build[/<点子id>]=做出来 / wall=作品墙 / pick=本周点名 / settings=设置
   状态全在 ctx.store 的 'db' 一个键里；所有数据是演示用的假数据。 */
(() => {
  const DAY = 864e5;
  const NOW = () => Date.now();

  /* ---------- 小玩意的种类 ---------- */
  const KINDS = {
    countdown: { name: '倒计时', icon: '⏱', file: 'countdown' },
    quiz: { name: '接龙题', icon: '✎', file: 'quiz' },
    checkin: { name: '打卡器', icon: '✓', file: 'checkin' },
    map: { name: '城市榜', icon: '⌖', file: 'city-map' },
    lottery: { name: '抽签转盘', icon: '◔', file: 'wheel' },
    palette: { name: '取色器', icon: '◐', file: 'palette' },
    vote: { name: '投票', icon: '☰', file: 'vote' },
    ai: { name: 'AI 现写', icon: '✦', file: 'index' },
  };
  const GUESS = [
    ['countdown', /倒计时|倒数|提醒|闹钟|还有多久|生日|几点|开播/],
    ['quiz', /接龙|台词|答题|问答|小测|测验|出题|知识/],
    ['checkin', /打卡|签到|连续|坚持|复活卡/],
    ['map', /地图|城市|老乡|报到|上榜|哪里/],
    ['lottery', /抽签|转盘|随机|抽一|选择困难|吃什么|抽个/],
    ['palette', /配色|颜色|取色|色卡|色号/],
    ['vote', /投票|投个|穿搭|选哪|票/],
  ];
  const guess = t => (GUESS.find(g => g[1].test(t)) || [null])[0];

  /* ---------- 过滤规则（脸和声音锁死开着） ---------- */
  const FILTERS = [
    { k: 'face', name: '涉及女演员的脸', d: '照片、剧照里的女演员、换装、头像、形象，一律不做。', lock: true, re: /脸|她的照片|她的剧照|换装|头像|自拍|长相|形象|写真/ },
    { k: 'voice', name: '涉及女演员的声音', d: '原声、配音、语音、用女演员的声音读任何东西，一律不做。', lock: true, re: /声音|语音|配音|原声|她读|读给/ },
    { k: 'privacy', name: '追行程、打听隐私', d: '女演员在哪、住哪、航班酒店不做；粉丝自己的手机号、住址也不收。', re: /行程|今天在哪|住址|酒店|航班|手机号|实时位置|身份证/ },
    { k: 'work', name: '涉及女演员的工作', d: '工作上的事不碰，只做追剧和好玩的。', re: /片酬|合作方|商务|通告|代言|合同|工作室/ },
    { k: 'rival', name: '拉踩别的艺人', d: '比人气、踩别家的，不做。', re: /比人气|拉踩|吊打|对家|别家/ },
  ];
  const WHY = {
    face: '要用到女演员的脸（照片 / 剧照里的女演员）。规则：涉及女演员的脸，一律不做。',
    voice: '要用到女演员的声音。规则：涉及女演员的声音，一律不做。',
    privacy: '在追女演员的行程。规则：不追行程、不打听隐私。',
    work: '碰到女演员的工作。规则：工作上的事不碰。',
    rival: '在跟别的艺人比。规则：不拉踩。',
  };

  /* ---------- 种子数据：粉丝一句话点子 ---------- */
  // [作者, 点子, 种类, 配置, 做出来叫什么, 票数, 路人占比]
  const IDEAS = [
    ['一只慢吞吞', '想要一个《美人余》追剧倒计时，更新前一小时提醒一下', 'countdown', { m: 'drama' }, '美人余追剧倒计时', 2410, 62],
    ['画画的阿宁', '帮忙做个剧照配色提取器，拿来给同人图配色', 'palette', { s: 0 }, '剧照配色提取器', 1980, 46],
    ['桐学录', '能不能做个黄蓉台词接龙，原著里那些菜名都是诗', 'quiz', {}, '黄蓉菜名接龙', 1530, 31],
    ['济南的风', '做一个桐铃地图，看看大家都在哪个城市', 'map', {}, '桐铃地图', 1210, 38],
    ['打卡第100天', '想要个打卡器，连续打卡有徽章', 'checkin', {}, '追剧打卡器', 990, 22],
    ['九月六号', '生日倒计时！到 9 月 6 号那天页面会放烟花', 'countdown', { m: 'bday' }, '生日倒计时', 1650, 18],
    ['穿搭小记', '想要机场图的穿搭投票，只投风格，不放照片', 'vote', { set: 'air' }, '机场穿搭投票', 870, 57],
    ['剧荒的猫', '想要一个抽签：今天看她哪部剧', 'lottery', { set: 'drama' }, '今天看哪部剧', 1420, 52],
    ['宵夜研究所', '追剧配宵夜，做个吃什么转盘', 'lottery', { set: 'snack' }, '追剧宵夜转盘', 640, 71],
    ['桃花岛岛民', '出一套桃花岛知识接龙，答对有称号', 'quiz', {}, '桃花岛接龙', 720, 24],
    ['夜猫子小鹿', '每晚八点的开播闹钟，到点页面会亮', 'countdown', { m: 'drama' }, '八点开播闹钟', 830, 40],
    ['小满', '剧里的配色好好看，能不能自动取色出色号', 'palette', { s: 1 }, '桃花岛取色卡', 560, 58],
    ['海外桐铃_Mai', '海外的桐铃都在哪？做个城市榜，河内也算', 'map', {}, '海外桐铃城市榜', 480, 35],
    ['追剧不熬夜', '追剧打卡，看完一集点一下，攒满 30 天给徽章', 'checkin', {}, '看完一集打个卡', 760, 27],
    ['角色控', '投票：最想看她演哪类角色', 'vote', { set: 'role' }, '最想看的角色类型', 1100, 49],
    ['雨夜长街', '想把古装剧的颜色做成手机壁纸色卡', 'palette', { s: 2 }, '雨夜色卡', 390, 63],
    ['重温党', '做个转盘，抽今天重温哪部老剧', 'lottery', { set: 'drama' }, '重温转盘', 410, 33],
    ['桐铃新人', '超话新人小测：答完就知道该从哪部剧入坑', 'quiz', {}, '入坑小测', 520, 66],
    ['周末才追', '周末补剧倒计时，周五晚上提醒', 'countdown', { m: 'drama' }, '周末补剧倒计时', 300, 44],
    ['早睡的桐铃', '每天给超话签到的打卡，断了能补一次', 'checkin', {}, '超话签到打卡', 450, 15],
    ['济南老乡', '济南老乡集合！做个城市榜', 'map', {}, '老乡城市榜', 360, 29],
    ['选择困难', '下次活动穿什么，粉丝投个风格票', 'vote', { set: 'air' }, '活动风格投票', 280, 41],
    ['古风手账', '做个宋制配色卡，做手账用', 'palette', { s: 0 }, '手账配色卡', 240, 72],
    ['抽签上瘾', '今天追剧配什么饮料，抽一个', 'lottery', { set: 'snack' }, '饮料抽签', 190, 68],
    ['手残党', '连续打卡 7 天解锁一张手绘贴纸', 'checkin', {}, '七天贴纸打卡', 330, 20],
    ['数学不好', '做个《美人余》离下一集还有多久的小挂件', 'countdown', { m: 'drama' }, '下一集小挂件', 270, 37],
    ['奶茶续命', '追剧零食转盘，选择困难救星', 'lottery', { set: 'snack' }, '零食转盘', 220, 74],
    ['射雕老粉', '射雕里二十四桥明月夜那道菜，出成接龙题', 'quiz', {}, '二十四桥接龙', 610, 28],
    ['路过的设计师', '给剧照取色出一套色卡，设计稿能直接用', 'palette', { s: 1 }, '剧照色卡 Pro', 350, 81],
    ['东南亚分桐', '曼谷、吉隆坡的桐铃报个到', 'map', {}, '东南亚报到榜', 260, 47],
    ['插画党', '穿搭投票只用插画，别放真人图', 'vote', { set: 'air' }, '插画穿搭投票', 300, 52],
    ['角色控二号', '下一部想看古装还是现代，投个票', 'vote', { set: 'role' }, '古装还是现代', 520, 39],
    ['摸鱼选手', '离下班还有多久，下班就开播，做个倒计时', 'countdown', { m: 'drama' }, '下班就开播', 410, 77],
    ['学生党', '晚自习后打卡，坚持追剧不耽误作业', 'checkin', {}, '晚自习后打卡', 180, 34],
    ['桐铃画手', '同人图取色：剧照一键出 5 个色', 'palette', { s: 2 }, '同人取色', 290, 43],
    ['选剧困难户', '她演过的剧抽一部，今天就重温这一部', 'lottery', { set: 'drama' }, '老剧抽签', 350, 30],
    ['语文课代表', '诗句接龙：黄蓉的菜名都出自哪句诗', 'quiz', {}, '菜名出处接龙', 470, 55],
    ['西北桐铃', '西北的桐铃也想上榜，做个城市榜', 'map', {}, '西北上榜', 150, 26],
  ];
  const REJECTS = [
    ['想看换装', '用她的剧照做个换装小游戏，能给她换衣服', 'face', 340, 61],
    ['闹钟控', '用她的声音做一个起床闹钟', 'voice', 520, 44],
    ['到处跑', '做个她今天在哪的实时地图', 'privacy', 120, 70],
  ];
  /* 实时进来的点子（定时器一条条放进来） */
  const RESERVE = [
    ['刚入坑', '剧里人物关系做成连线接龙'],
    ['懒得想', '今天追剧穿什么颜色睡衣，抽一个'],
    ['小葵', '剧里那盏灯的颜色好看，取个色'],
    ['杭州桐铃', '杭州的桐铃在不在，上个城市榜'],
    ['AI 爱好者', '用她的声音把剧透读一遍'],
    ['不想断签', '打卡断了能不能给张复活卡'],
    ['夜里十一点', '更新后还有多久能看完，做个倒计时'],
    ['投票狂魔', '剧里最喜欢的配角投个票'],
    ['新疆桐铃', '乌鲁木齐也有桐铃，地图上点一下'],
    ['周五见', '周五晚上抽一部老剧二刷'],
  ];

  /* 已经做好的（种子作品）：点子下标、多少天前做的、玩过人数、往周点名（几周前，0=没点过）、给作者的一句话 */
  const SEEDWORKS = [
    [0, 13, 24180, 1, '每晚八点前都会看一眼，谢谢做它的人。'],
    [1, 20, 12040, 2, '原来剧里的颜色这么好看，配色老师看到会开心。'],
    [2, 27, 8930, 3, '二十四桥明月夜那题，答对了。'],
    [5, 34, 6800, 4, '谢谢大家一起倒数，九月见。'],
    [3, 2, 5410, 0],
    [4, 1, 3120, 0],
    [6, 0.2, 4260, 0],
  ];

  /* 黄蓉接龙题库：原著里的菜名、对联、招式（上半句、下半句、选项、提示） */
  const QUIZ = [
    ['二十四桥', '明月夜', ['明月夜', '烟雨楼', '落花时', '春水生'], '黄蓉给洪七公做的菜名，出自杜牧的诗'],
    ['玉笛谁家', '听落梅', ['听落梅', '闻折柳', '吹杨柳', '映雪梅'], '也是黄蓉做给洪七公的一道菜'],
    ['窈窕淑女', '君子好逑', ['君子好逑', '寤寐求之', '在河之洲', '琴瑟友之'], '「好逑汤」的名字就从这句来'],
    ['桃花影落飞神剑', '碧海潮生按玉箫', ['碧海潮生按玉箫', '春风十里过扬州', '明月清风入酒杯', '落英缤纷满江湖'], '桃花岛上的一副对子'],
    ['降龙', '十八掌', ['十八掌', '伏虎拳', '八卦掌', '十三式'], '洪七公传给郭靖的'],
    ['打狗', '棒法', ['棒法', '拳法', '剑法', '刀法'], '黄蓉后来当了丐帮帮主，学的就是它'],
    ['落英', '神剑掌', ['神剑掌', '缤纷拳', '飞花掌', '流云手'], '桃花岛家传的掌法'],
    ['东邪西毒', '南帝北丐', ['南帝北丐', '南僧北侠', '南拳北腿', '南山北海'], '射雕里的「五绝」，东邪是黄蓉的爹'],
  ];
  const DRAMAS = ['射雕英雄传', '鹤唳华亭', '书卷一梦', '美人余', '我不是大师', '云秀行', '女子推理社'];
  const SNACKS = ['烤红薯', '双皮奶', '关东煮', '糖炒栗子', '酸奶水果杯', '热豆浆', '桂花糕', '烤冷面'];
  const CITIES = [['北京', 3120], ['上海', 2650], ['济南', 2210], ['成都', 1720], ['广州', 1540], ['杭州', 1210], ['武汉', 980], ['西安', 760], ['河内', 640], ['曼谷', 470], ['吉隆坡', 390], ['乌鲁木齐', 160]];
  const VOTES = {
    air: { q: '下次机场，想看哪套风格？', o: [['米白风衣 + 乐福鞋', '#efe6d6', '#b9a68a', 1820], ['牛仔外套 + 白 T', '#4a6fa5', '#f4f4f4', 1460], ['黑西装 + 墨镜', '#23252b', '#8c94a8', 1210], ['针织开衫 + 长裙', '#c9a7c7', '#f1e4d8', 980]] },
    role: { q: '下一部最想看她演哪类角色？', o: [['古装侠女', '⚔', '', 2100], ['刑侦警探', '⌕', '', 1340], ['都市喜剧', '☺', '', 1680], ['年代剧', '☏', '', 890]] },
  };
  const SCENES = ['宫灯夜', '桃花岛', '雨夜长街'];
  const SHADES = [100, 56, 84, 42, 70, 50, 92, 62];
  const shade = i => `color-mix(in srgb,var(--c-vibe) ${SHADES[i % SHADES.length]}%,var(--bg2))`;
  const shadeInk = i => SHADES[i % SHADES.length] >= 70 ? 'var(--bg2)' : 'var(--ink)';
  const NOTE_HINTS = ['做得真好用，谢谢做它的人。', '每天都会点开看一眼。', '路人朋友也玩得很开心，这就够了。', '这个点子太可爱了，下周还想看到更多。'];

  /* ---------- 工具 ---------- */
  const rngOf = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pad2 = n => String(Math.floor(n)).padStart(2, '0');
  const dkey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const md = t => { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const weekNo = d => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / DAY + 1) / 7); };
  const ago = t => { const s = (NOW() - t) / 1000; if (s < 60) return '刚刚'; if (s < 3600) return `${Math.floor(s / 60)} 分钟前`; if (s < 86400) return `${Math.floor(s / 3600)} 小时前`; return `${Math.floor(s / 86400)} 天前`; };
  const heat = w => Math.round(w.plays * (1 + w.passer / 100));
  const put = (s, k, v) => s.split(k).join(v);
  /* 她的档案（ctx.profile）：名字、粉丝名、在播剧、更新时间、作品、禁区 */
  const prof = () => (C && C.profile && C.profile.get()) || {};
  const fanName = () => prof().fan || '桐铃';
  const showName = () => prof().show || '美人余';
  const showAt = () => { const m = String(prof().showTime || '').match(/(\d{1,2})[:：](\d{2})/); return m ? [+m[1], +m[2]] : [20, 0]; };
  const worksList = () => { const L = [...String(prof().works || '').matchAll(/《([^》]+)》/g)].map(m => m[1]); const all = [...new Set([...L, showName()])]; return all.length >= 4 ? all.slice(0, 8) : DRAMAS; };
  const aiOn = () => !!(C && C.ai && C.ai.ready && C.ai.ready());
  const ruleName = k => (FILTERS.find(f => f.k === k) || { name: '禁区' }).name;

  /* ---------- 样式（只用公用变量，类名带 vb- 前缀） ---------- */
  const CSS = `
  .vb-eb{letter-spacing:0;display:inline-block}.vb-eb::before{display:inline-block;vertical-align:middle;margin-right:10px}.vb-eb b{font-weight:500;font-variant-numeric:tabular-nums}
  .app .main,.vb-dlg,.vb-thumb svg{font-variant-numeric:tabular-nums}
  .vb-frame{display:block;width:100%;height:500px;border:0;background:var(--bg)}
  .vb-fixbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 12px;background:var(--bad-soft);color:var(--bad);font-size:12.5px;border-top:1px solid color-mix(in srgb,var(--bad) 30%,transparent)}
  .vb-thumb .vb-mini{position:absolute;left:0;top:0;width:400px;height:320px;border:0;transform:scale(.56);transform-origin:0 0;pointer-events:none;background:var(--bg)}
  .vb-realcard{margin-bottom:16px}
  [data-rs] .step.on{color:var(--accent)}[data-rs] .step.on::before{background:var(--accent)}
  [data-rs] .step.bad{color:var(--bad)}[data-rs] .step.bad::before{content:"✕";width:auto;height:auto;background:none;color:var(--bad);font-size:12px}
  .vb-clock{margin-left:auto;font:12px var(--sans);font-style:normal;color:var(--muted);font-variant-numeric:tabular-nums}
  .vb-fail{padding:14px;border-radius:14px;background:var(--bad-soft);border:1px solid color-mix(in srgb,var(--bad) 30%,transparent);font-size:13.5px}
  .vb-fail b{color:var(--bad)}
  .vb-want{display:flex;align-items:center;gap:10px;padding:0 8px 14px;font-size:12.5px;color:var(--muted)}
  .vb-want .heart{width:32px;height:32px;font-size:14px}
  @media (max-width:860px){.vb-want{padding:0}.vb-want span{display:none}}
  .vb-fine{margin:18px 8px 0;padding:12px;border-radius:12px;border:1px dashed var(--line2);font-size:11.5px;line-height:1.7;color:var(--dim)}
  @media (max-width:860px){.vb-fine{display:none}}
  .vb-two{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:16px;align-items:start}
  .vb-two>*{min-width:0}
  @media (max-width:1100px){.vb-two{grid-template-columns:minmax(0,1fr)}}
  .vb-feed{list-style:none;margin:0;padding:0;max-height:330px;overflow:auto}
  .vb-feed li{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line)}
  .vb-feed li:first-child{border-top:0}
  .vb-feed li.vb-new{animation:vbIn .6s var(--ease)}
  @keyframes vbIn{from{opacity:0;translate:0 -10px;background:var(--accent-soft)}}
  .vb-feed .t{flex:1;min-width:0;font-size:13.5px}
  .vb-feed .t small{display:block;color:var(--dim);font-size:11.5px}
  .vb-chart{width:100%;height:auto;display:block}
  .vb-chart text{fill:var(--dim);font:10px var(--sans)}
  .vb-funnel{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
  .vb-funnel div{padding:12px 10px;border-radius:12px;background:var(--bg2);border:1px solid var(--line);text-align:center;position:relative}
  .vb-funnel b{display:block;font:600 22px/1.2 var(--sans);color:var(--accent)}
  .vb-funnel span{font-size:12px;color:var(--muted)}
  @media (max-width:760px){.vb-funnel{grid-template-columns:repeat(2,1fr)}}
  .vb-idea{display:flex;gap:12px;align-items:flex-start;padding:14px 0;border-top:1px solid var(--line)}
  .vb-idea:first-child{border-top:0}
  .vb-idea .vb-vote{all:unset;cursor:pointer;flex:none;width:54px;padding:8px 0;border-radius:12px;border:1px solid var(--line2);background:var(--surface);text-align:center;transition:all .2s}
  .vb-idea .vb-vote i{display:block;font-style:normal;font-size:15px;color:var(--muted)}
  .vb-idea .vb-vote b{display:block;font:600 12px var(--sans)}
  .vb-idea .vb-vote.on{background:var(--accent-soft);border-color:var(--accent-line)}
  .vb-idea .vb-vote.on i{color:var(--accent)}
  .vb-idea .vb-body{flex:1;min-width:0}
  .vb-idea .vb-body p{font-size:14.5px}
  .vb-idea .vb-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:6px;font-size:12px;color:var(--dim)}
  .vb-idea .vb-reason{margin-top:8px;padding:8px 10px;border-radius:10px;background:var(--bad-soft);color:var(--bad);font-size:12.5px}
  .vb-idea .vb-act{flex:none;align-self:center}
  @media (max-width:560px){.vb-idea{flex-wrap:wrap}.vb-idea .vb-act{width:100%;padding-left:66px}}
  .vb-mini{display:inline-flex;align-items:center;gap:6px}
  .vb-mini .meter{width:56px;height:5px}
  .vb-tools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
  .vb-tools .search{flex:1;min-width:180px}
  .vb-tools .select{width:auto}
  .vb-submit{display:grid;grid-template-columns:1fr 150px auto;gap:10px}
  @media (max-width:760px){.vb-submit{grid-template-columns:1fr}}
  .vb-banner{all:unset;box-sizing:border-box;cursor:pointer;display:block;width:100%;text-align:center;padding:9px;border-radius:10px;background:var(--accent-soft);color:var(--accent);font-size:13px;margin-bottom:10px;animation:fade .3s both}
  .vb-pickl{max-height:340px;overflow:auto;margin-top:10px}
  .vb-pickl button{all:unset;box-sizing:border-box;cursor:pointer;display:flex;gap:10px;align-items:center;width:100%;padding:10px 12px;border-radius:12px;border:1px solid transparent;font-size:13.5px}
  .vb-pickl button:hover{background:var(--surface)}
  .vb-pickl button.on{background:var(--accent-soft);border-color:var(--accent-line)}
  .vb-pickl button span{flex:1;min-width:0}
  .vb-pickl button em{font-style:normal;font-size:11.5px;color:var(--dim)}
  .vb-ic{width:30px;height:30px;flex:none!important;border-radius:9px;display:grid;place-items:center;background:var(--accent-soft);border:1px solid var(--accent-line);color:var(--accent);font-size:14px}
  .vb-code{--cbg:#17181b;--cfg:#e6e3de;--cdim:#7d7a75;--cstr:#8fd0a5;--ckw:#8ec3d3;--cline:#2a2b2f;margin-top:12px;border-radius:var(--r);border:1px solid var(--line2);background:var(--cbg);color:var(--cfg);overflow:hidden}
  .vb-code-hd{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--cline);font:12px var(--mono);color:var(--cdim)}
  .vb-code-hd i{font-style:normal;letter-spacing:2px;color:var(--cdim)}
  .vb-code-hd em{margin-left:auto;font-style:normal;color:var(--cstr)}
  .vb-code-bd{font:12px/1.65 var(--mono);max-height:260px;overflow:auto;padding:8px 0;white-space:pre}
  .vb-code-bd.tall{max-height:62svh}
  .vb-code-bd div{padding:0 12px 0 0;display:flex}
  .vb-code-bd div::before{content:attr(data-n);flex:none;width:38px;text-align:right;padding-right:12px;color:var(--cdim);user-select:none}
  .vb-code-bd .c{color:var(--cdim)}.vb-code-bd .s{color:var(--cstr)}.vb-code-bd .k{color:var(--ckw)}
  .vb-phone{border-radius:28px;border:1px solid var(--line2);background:var(--surface);box-shadow:var(--shadow);overflow:hidden;max-width:400px;margin:0 auto}
  .vb-phone-top{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}
  .vb-phone-top .tag{margin-left:auto}
  .vb-phone-body{padding:18px;min-height:280px}
  .vb-wait{display:grid;place-items:center;min-height:280px;text-align:center;color:var(--dim);font-size:13px}
  .vb-done{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .vb-w-title{font-size:12.5px;color:var(--muted);margin-bottom:8px}
  .vb-big{font:600 40px/1 var(--sans);letter-spacing:-.02em;font-variant-numeric:tabular-nums}
  .vb-ring{position:relative;width:210px;height:210px;margin:6px auto 12px}
  .vb-ring svg{width:100%;height:100%;rotate:-90deg}
  .vb-ring circle{fill:none;stroke-width:8}
  .vb-ring .bg{stroke:var(--surface3)}
  .vb-ring .fg{stroke:var(--accent);stroke-linecap:round;stroke-dasharray:326.7;transition:stroke-dashoffset 1s linear}
  .vb-ring-in{position:absolute;inset:0;display:grid;place-content:center;text-align:center}
  .vb-ring-in .vb-big{font-size:30px}
  .vb-ring-in small{font-size:12px;color:var(--muted);margin-top:6px}
  .vb-alert{padding:9px 12px;border-radius:10px;background:var(--warn-soft);color:var(--warn);font-size:13px;margin-bottom:10px;text-align:center}
  .vb-party{display:inline-block;font-size:22px;letter-spacing:6px;color:var(--warn);animation:jump 1s infinite}
  .vb-bub{padding:14px 16px;border-radius:14px;background:var(--surface2);font-size:20px;font-weight:600;margin-bottom:6px}
  .vb-bub .vb-blank{color:var(--accent);letter-spacing:2px}
  .vb-opts{display:grid;gap:8px;margin-top:12px}
  .vb-opts button{all:unset;box-sizing:border-box;cursor:pointer;padding:11px 14px;border-radius:12px;border:1px solid var(--line2);background:var(--surface);font-size:15px;transition:all .2s}
  .vb-opts button:hover{border-color:var(--accent-line)}
  .vb-opts button.ok{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
  .vb-opts button.no{background:var(--bad-soft);border-color:var(--bad);color:var(--bad)}
  .vb-dots{display:flex;gap:5px;margin-top:12px}
  .vb-dots i{flex:1;height:4px;border-radius:9px;background:var(--surface3)}
  .vb-dots i.ok{background:var(--ok)}.vb-dots i.no{background:var(--bad)}.vb-dots i.cur{background:var(--accent)}
  .vb-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin:10px 0 12px}
  .vb-cal span{aspect-ratio:1;border-radius:8px;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;font:10.5px var(--sans);color:var(--dim)}
  .vb-cal span.on{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent)}
  .vb-cal span.today{outline:2px solid var(--accent);outline-offset:1px}
  .vb-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .vb-badges span{display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;font-size:12px;background:var(--surface);border:1px solid var(--line);color:var(--dim)}
  .vb-badges span.on{background:var(--warn-soft);border-color:color-mix(in srgb,var(--warn) 40%,transparent);color:var(--warn)}
  .vb-badges span.new{animation:vbPop 1s 3}
  @keyframes vbPop{50%{transform:scale(1.15)}}
  .vb-bars{display:grid;grid-template-columns:auto 1fr auto;gap:7px 10px;align-items:center;font-size:13px}
  .vb-bars .meter{height:10px}
  .vb-bars .n{font:12px var(--sans);color:var(--muted);text-align:right}
  .vb-bars .me{color:var(--accent);font-weight:600}
  .vb-wheel{position:relative;width:min(250px,100%);margin:4px auto 10px}
  .vb-wheel svg{width:100%;display:block;transition:rotate 3.4s cubic-bezier(.15,.75,.1,1)}
  .vb-wheel svg text{font:600 9px var(--sans)}
  .vb-wheel::before{content:"";position:absolute;left:50%;top:-6px;translate:-50% 0;border:10px solid transparent;border-top:16px solid var(--ink);z-index:1}
  .vb-wheel::after{content:"";position:absolute;left:50%;top:50%;width:26px;height:26px;translate:-50% -50%;border-radius:50%;background:var(--bg2);border:2px solid var(--ink)}
  .vb-res{text-align:center;font-size:18px;font-weight:600;min-height:28px}
  .vb-res b{color:var(--accent)}
  .vb-canvas{width:100%;border-radius:12px;display:block;border:1px solid var(--line)}
  .vb-sw{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px}
  .vb-sw button{all:unset;cursor:pointer;border-radius:10px;overflow:hidden;border:1px solid var(--line2);text-align:center;font:10.5px var(--mono);color:var(--muted);background:var(--bg2);animation:fade .4s both;animation-delay:calc(var(--i)*80ms)}
  .vb-sw button i{display:block;height:46px}
  .vb-sw button span{display:block;padding:4px 0}
  .vb-strip{display:flex;height:14px;border-radius:5px;overflow:hidden;flex:1}
  .vb-strip i{flex:1}
  .vb-vote-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .vb-vote-g button{all:unset;box-sizing:border-box;cursor:pointer;padding:10px;border-radius:14px;border:1px solid var(--line2);background:var(--surface);text-align:center;font-size:12.5px;transition:all .2s;position:relative;overflow:hidden}
  .vb-vote-g button:hover{border-color:var(--accent-line)}
  .vb-vote-g button.on{border-color:var(--accent);background:var(--accent-soft)}
  .vb-vote-g svg{width:56px;height:62px;display:block;margin:0 auto 4px}
  .vb-vote-g .gl{font-size:30px;line-height:62px;height:62px;display:block;color:var(--accent)}
  .vb-vote-g .pc{display:block;font:600 13px var(--sans);color:var(--accent);margin-top:2px}
  .vb-vote-g .bar{position:absolute;left:0;bottom:0;height:3px;background:var(--accent);transition:width .6s var(--ease)}
  .vb-wall{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
  .vb-wcard{cursor:pointer;display:flex;flex-direction:column;gap:10px}
  .vb-wcard .vb-thumb{height:112px;padding:8px 12px;border-radius:12px;display:grid;place-items:center;font-size:38px;color:var(--accent);background:var(--surface2);border:1px solid var(--line);position:relative;overflow:hidden}
  .vb-wcard .vb-thumb svg{width:100%;height:100%;display:block}
  .vb-wcard .vb-thumb svg text{font-family:var(--sans)}
  .vb-wcard .vb-thumb .tag{position:absolute;right:8px;top:8px}
  .vb-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:11.5px;color:var(--dim)}
  .vb-stats b{display:block;font:600 14px var(--sans);color:var(--text)}
  .vb-pin{position:relative;overflow:hidden}
  .vb-pin .vb-note{margin-top:10px;padding:12px 14px;border-radius:12px;background:var(--bg2);border-left:3px solid var(--accent);font-family:var(--kai);font-size:17px}
  .vb-rank{list-style:none;margin:0;padding:0}
  .vb-rank li{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}
  .vb-rank li:first-child{border-top:0}
  .vb-rank .no{font:600 20px var(--sans);color:var(--dim);text-align:center}
  .vb-rank li:nth-child(-n+3) .no{color:var(--accent)}
  .vb-rank .meter{margin-top:6px;height:5px}
  @media (max-width:560px){.vb-rank li{grid-template-columns:28px minmax(0,1fr)}.vb-rank li>.row{grid-column:2}}
  .vb-post{padding:14px;border-radius:14px;background:var(--bg2);border:1px solid var(--line);font-size:14px;white-space:pre-wrap}
  .vb-post .who{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12.5px;color:var(--muted);white-space:normal}
  .vb-rule{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-top:1px solid var(--line)}
  .vb-rule:first-of-type{border-top:0}
  .vb-rule>div{flex:1}
  .vb-rule .switch[disabled]{opacity:.85;cursor:not-allowed}
  .vb-lock{font-size:11px;color:var(--warn);margin-left:6px}
  `;

  /* ---------- 模块级状态（mount 时重置） ---------- */
  let C, db, root, gen = 0;
  const timers = new Set();
  const cleans = new Set();
  const every = (fn, ms) => { const id = setInterval(fn, ms); timers.add(id); return id; };
  function clearAll() {
    timers.forEach(id => clearInterval(id)); timers.clear();
    cleans.forEach(f => { try { f(); } catch (e) {} }); cleans.clear();
  }

  /* ---------- 数据 ---------- */
  function seed(P = {}) {
    const r = rngOf(43), now = NOW(), fan = P.fan || '桐铃';
    const ideas = IDEAS.map((x, i) => ({ id: 'i' + (i + 1), by: x[0], text: x[1], kind: x[2], cfg: x[3], title: x[4], votes: x[5], passer: x[6], t: now - Math.floor((0.3 + r() * 9.5) * DAY), status: 'queue' }));
    REJECTS.forEach((x, i) => ideas.push({ id: 'x' + (i + 1), by: x[0], text: x[1], kind: null, cfg: {}, title: '', votes: x[3], passer: x[4], t: now - Math.floor((1 + r() * 5) * DAY), status: 'rejected', rule: x[2], reason: WHY[x[2]] }));
    const cw = weekNo(new Date());
    const works = [], history = [];
    SEEDWORKS.forEach((s, n) => {
      const idea = ideas[s[0]];
      const w = { id: 'w' + (n + 1), ideaId: idea.id, kind: idea.kind, cfg: idea.cfg, name: idea.title, by: idea.by, idea: idea.text, plays: s[2], passer: idea.passer, t: now - Math.floor(s[1] * DAY), posted: true };
      w.lines = source(w).split('\n').length;
      idea.status = 'built'; idea.wid = w.id; idea.t = Math.min(idea.t, w.t - DAY / 3);
      if (s[3]) { w.pickedWeek = cw - s[3]; history.push({ week: cw - s[3], wid: w.id, name: w.name, by: w.by, plays: w.plays, passer: w.passer, note: s[4], t: now - s[3] * 7 * DAY }); }
      works.push(w);
    });
    const cr = rngOf(7), chart = Array.from({ length: 14 }, (_, i) => Math.round(1800 + i * 160 + cr() * 900 + (i > 9 ? 900 : 0)));
    return {
      v: 1, ideas, works, history, chart, votes: {}, pick: null, ws: {}, seq: 100, feed: 0, nick: '',
      settings: { call: `#${fan}vibecoding# 第 ${cw} 周征集\n想要什么小玩意？说一句话就行，不用会写代码。\nAI 每周挑几个做成能直接打开的小页面，发回超话大家一起玩；周末她点名一个最好玩的。\n用到她的脸和声音的点子不做，所有小玩意都标明「AI 生成」。`, perWeek: 10, rules: { privacy: true, work: true, rival: true } },
    };
  }
  function load() {
    let d = C.store.get('db', null);
    if (!d || d.v !== 1) { d = seed(prof()); C.store.set('db', d); }
    const cw = weekNo(new Date());
    if (d.pick && d.pick.week !== cw) { d.history.unshift(d.pick); d.pick = null; C.store.set('db', d); }
    return d;
  }
  const save = () => C.store.set('db', db);
  const idea = id => db.ideas.find(x => x.id === id);
  const work = id => db.works.find(x => x.id === id);
  const voted = i => !!db.votes[i.id];
  const votesOf = i => i.votes + (voted(i) ? 1 : 0);
  const thisWeek = () => db.works.filter(w => NOW() - w.t < 7 * DAY);
  const queueCount = () => db.ideas.filter(i => statusOf(i) === 'queue').length;
  const statusOf = i => i.status === 'rejected' ? 'rejected' : i.wid ? (db.pick && db.pick.wid === i.wid ? 'pick' : 'built') : 'queue';
  const ST = { queue: ['排队', ''], built: ['做好了', 'ok'], pick: ['本周点名', 'accent'], rejected: ['已拒绝', 'bad'] };
  const stTag = s => `<span class="tag ${ST[s][1]}">${ST[s][0]}</span>`;
  const checkRules = text => FILTERS.find(f => (f.lock || db.settings.rules[f.k]) && f.re.test(text)) || null;
  function addIdea(by, text, mine) {
    const rule = checkRules(text);
    const kind = guess(text);
    const i = { id: (mine ? 'u' : 'r') + (++db.seq), by, text, kind, cfg: defaultCfg(kind, text), title: autoName(kind, text), votes: mine ? 0 : rint(3, 40), passer: mine ? 0 : rint(20, 70), t: NOW(), status: rule ? 'rejected' : 'queue', mine: !!mine };
    if (rule) { i.rule = rule.k; i.reason = WHY[rule.k]; }
    db.ideas.unshift(i);
    if (mine) db.votes[i.id] = true;
    save();
    return i;
  }
  function defaultCfg(kind, text) {
    if (kind === 'countdown') return { m: /生日/.test(text) ? 'bday' : 'drama' };
    if (kind === 'lottery') return { set: /吃|宵夜|零食|饮料|喝|睡衣/.test(text) ? 'snack' : 'drama' };
    if (kind === 'palette') return { s: rint(0, 2) };
    if (kind === 'vote') return { set: /角色|演|配角|古装|现代/.test(text) ? 'role' : 'air' };
    return {};
  }
  function autoName(kind, text) {
    const k = KINDS[kind || 'lottery'];
    const m = text.match(/《([^》]+)》/);
    return (m ? m[1] : '桐铃') + k.name;
  }

  /* ---------- 假源码（看代码 / 逐行滚出） ---------- */
  const BODY = {
    countdown: String.raw`// %MODE%
const REMIND = %REMIND%;            // 提前多少秒提醒
function nextAt() {
  const now = new Date();
  %NEXT%
  return t;
}
const pad = n => String(Math.floor(n)).padStart(2, '0');
function draw() {
  const s = Math.max(0, (nextAt() - Date.now()) / 1000);
  const d = Math.floor(s / 86400);
  $('#left').textContent = (d ? d + ' 天 ' : '') +
    [s / 3600 % 24, s / 60 % 60, s % 60].map(pad).join(':');
  const done = 1 - s / %SPAN%;
  $('#arc').style.strokeDashoffset = 327 * (1 - done);
  $('#hint').hidden = !(load('remind', true) && s < REMIND);
}
$('#app').innerHTML =
  '<p>%TITLE%</p>' +
  '<svg viewBox="0 0 120 120"><circle id="arc" cx="60" cy="60" r="52"/></svg>' +
  '<b id="left">--:--:--</b>' +
  '<p id="hint" hidden>快到了，准备好</p>' +
  '<label><input type="checkbox" id="remind"> 到点前提醒</label>';
$('#remind').checked = load('remind', true);
$('#remind').onchange = e => save('remind', e.target.checked);
setInterval(draw, 1000);
draw();`,
    quiz: String.raw`// 题库：原著里的菜名、对联、招式，接下半句
const BANK = [
%BANK%
];
const TITLES = [[5, '桃花岛主'], [3, '丐帮弟子'], [0, '牛家村路人']];
let qs, i, score;
function start() {
  qs = shuffle(BANK).slice(0, 5);
  i = 0; score = 0;
  ask();
}
function ask() {
  if (i >= qs.length) return finish();
  const [up, down, opts, hint] = qs[i];
  $('#app').innerHTML =
    '<p>第 ' + (i + 1) + ' / 5 题</p>' +
    '<h2>' + up + ' ______</h2><small>' + hint + '</small>' +
    shuffle(opts).map(o => '<button>' + o + '</button>').join('');
  document.querySelectorAll('button').forEach(b => b.onclick = () => {
    const right = b.textContent === down;
    b.className = right ? 'ok' : 'no';
    if (right) score++;
    setTimeout(() => { i++; ask(); }, 700);
  });
}
function finish() {
  const best = Math.max(load('best', 0), score);
  save('best', best);
  const name = TITLES.find(t => score >= t[0])[1];
  $('#app').innerHTML = '<h2>' + score + ' / 5</h2><p>称号：' + name + '</p>' +
    '<p>最好成绩 ' + best + ' / 5</p><button onclick="start()">再来一轮</button>';
}
function shuffle(a) {
  a = a.slice();
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}
start();`,
    checkin: String.raw`// 连续打卡：断一天就从头算
const BADGES = [[3, '三日桐铃'], [7, '一周不断'], [14, '两周徽章'], [30, '满月徽章']];
const key = d => d.toISOString().slice(0, 10);
let days = new Set(load('days', []));
function streak() {
  let n = 0;
  const d = new Date();
  if (!days.has(key(d))) d.setDate(d.getDate() - 1);
  while (days.has(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function draw() {
  const n = streak();
  const today = days.has(key(new Date()));
  let cal = '';
  for (let k = 27; k >= 0; k--) {
    const d = new Date(); d.setDate(d.getDate() - k);
    cal += '<span class="' + (days.has(key(d)) ? 'on' : '') + '">' + d.getDate() + '</span>';
  }
  $('#app').innerHTML =
    '<p>%TITLE%</p><h1>' + n + ' 天</h1>' +
    BADGES.map(b => '<i class="' + (n >= b[0] ? 'got' : '') + '">' + b[1] + '</i>').join('') +
    '<div class="cal">' + cal + '</div>' +
    '<button id="go" ' + (today ? 'disabled' : '') + '>' + (today ? '今天打过了' : '今天打卡') + '</button>';
  $('#go').onclick = () => {
    days.add(key(new Date()));
    save('days', [...days]);
    const got = BADGES.find(b => b[0] === streak());
    if (got) alert('解锁「' + got[1] + '」');
    draw();
  };
}
draw();`,
    map: String.raw`// 只记城市，不记人
const CITIES = [
%CITIES%
];
let mine = load('city', '');
function draw() {
  const rows = CITIES.map(([name, n]) => [name, n + (name === mine ? 1 : 0)]);
  const max = Math.max(...rows.map(r => r[1]));
  const total = rows.reduce((s, r) => s + r[1], 0);
  $('#app').innerHTML =
    '<p>这周打开过的桐铃，一共 ' + total.toLocaleString() + ' 人，来自</p>' +
    rows.map(([name, n]) =>
      '<div class="row' + (name === mine ? ' me' : '') + '">' +
      '<span>' + name + '</span>' +
      '<i style="width:' + (n / max * 100) + '%"></i>' +
      '<b>' + n.toLocaleString() + '</b></div>').join('') +
    '<select id="pick">' + CITIES.map(c => '<option>' + c[0] + '</option>').join('') + '</select>' +
    '<button id="here">这里也有桐铃</button>';
  $('#pick').value = mine || CITIES[0][0];
  $('#here').onclick = () => {
    mine = $('#pick').value;
    save('city', mine);
    draw();
  };
}
draw();`,
    lottery: String.raw`// 转盘：指针在正上方，转 5 圈再停
const ITEMS = [%ITEMS%];
const SEG = 360 / ITEMS.length;
let rot = load('rot', 0);
function wheel() {
  return ITEMS.map((t, i) => {
    const a0 = i * SEG, a1 = a0 + SEG;
    const p = a => [Math.sin(a * Math.PI / 180) * 100, -Math.cos(a * Math.PI / 180) * 100];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return '<path d="M0 0L' + x0 + ' ' + y0 + 'A100 100 0 0 1 ' + x1 + ' ' + y1 + 'Z"/>' +
      '<text transform="rotate(' + (a0 + SEG / 2) + ') translate(0 -62)">' + t + '</text>';
  }).join('');
}
function spin() {
  const pick = Math.floor(Math.random() * ITEMS.length);
  const center = pick * SEG + SEG / 2;
  rot += 360 * 5 + ((360 - center - rot % 360) % 360 + 360) % 360;
  $('#w').style.rotate = rot + 'deg';
  save('rot', rot);
  setTimeout(() => {
    $('#res').textContent = '%VERB%' + ITEMS[pick];
    const log = [ITEMS[pick], ...load('log', [])].slice(0, 5);
    save('log', log);
  }, 3400);
}
$('#app').innerHTML =
  '<svg id="w" viewBox="-100 -100 200 200">' + wheel() + '</svg>' +
  '<p id="res"></p><button id="go">转一下</button>';
$('#w').style.rotate = rot + 'deg';
$('#go').onclick = spin;`,
    palette: String.raw`// 取色：采样像素 → k-means 聚 5 类 → 按占比排
const cv = $('#cv'), g = cv.getContext('2d');
function kmeans(px, k = 5) {
  let c = px.filter((_, i) => i % Math.floor(px.length / k) === 0).slice(0, k);
  let groups;
  for (let it = 0; it < 8; it++) {
    groups = c.map(() => []);
    for (const p of px) {
      let best = 0, bd = Infinity;
      c.forEach((q, j) => {
        const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
        if (d < bd) { bd = d; best = j; }
      });
      groups[best].push(p);
    }
    c = groups.map((gp, j) => gp.length
      ? [0, 1, 2].map(ch => gp.reduce((s, p) => s + p[ch], 0) / gp.length)
      : c[j]);
  }
  return c.map((q, j) => ({ rgb: q, share: groups[j].length / px.length }))
    .sort((a, b) => b.share - a.share);
}
const hex = rgb => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
function extract() {
  const { data } = g.getImageData(0, 0, cv.width, cv.height);
  const px = [];
  for (let i = 0; i < data.length; i += 4 * 7) px.push([data[i], data[i + 1], data[i + 2]]);
  const out = kmeans(px);
  $('#sw').innerHTML = out.map(o =>
    '<button style="--c:' + hex(o.rgb) + '">' + hex(o.rgb) + ' · ' + Math.round(o.share * 100) + '%</button>').join('');
}
drawScene('%SCENE%');
extract();
$('#file').onchange = e => {
  const img = new Image();
  img.onload = () => { g.drawImage(img, 0, 0, cv.width, cv.height); extract(); };
  img.src = URL.createObjectURL(e.target.files[0]);
};`,
    vote: String.raw`// 只投风格，不放任何人的照片
const Q = '%Q%';
const OPTS = [
%OPTS%
];
let mine = load('vote', -1);
function draw() {
  const counts = OPTS.map((o, i) => o[1] + (i === mine ? 1 : 0));
  const total = counts.reduce((a, b) => a + b, 0);
  $('#app').innerHTML = '<p>' + Q + '</p>' + OPTS.map((o, i) =>
    '<button data-i="' + i + '" class="' + (i === mine ? 'on' : '') + '">' + o[0] +
    (mine >= 0 ? '<b>' + Math.round(counts[i] / total * 100) + '%</b>' : '') +
    '</button>').join('') +
    '<small>' + (mine >= 0 ? '共 ' + total.toLocaleString() + ' 票，可以改投' : '投一票才能看结果') + '</small>';
  document.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
    mine = +b.dataset.i;
    save('vote', mine);
    draw();
  });
}
draw();`,
  };
  function source(w) {
    if (w.kind === 'ai') return w.html || '';
    const c = w.cfg || {};
    const head = [
      '<!doctype html>',
      '<!-- 桐铃 vibecoding · AI 生成 -->',
      `<!-- 点子：@${w.by}「${w.idea}」 -->`,
      '<!-- 不用她的脸，不用她的声音，不收任何个人信息 -->',
      '<html lang="zh-CN">',
      '<head>',
      '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      `<title>${w.name}</title>`,
      '<style>',
      '  :root { --bg: #fbfaf8; --fg: #1c1c1c; --hi: #2f7a4f; }',
      '  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.6 system-ui; }',
      '  #app { max-width: 360px; margin: 24px auto; padding: 20px; border-radius: 18px; background: #fff; border: 1px solid #e8e4de; }',
      '  button { border: 0; border-radius: 999px; padding: 10px 18px; background: var(--hi); color: #fff; font-weight: 600; }',
      '  .badge { text-align: center; font: 11px monospace; color: var(--hi); }',
      '</style>',
      '</head>',
      '<body>',
      '<main id="app"></main>',
      '<p class="badge">AI 生成 · 桐铃 vibecoding</p>',
      '<script>',
      "const $ = s => document.querySelector(s);",
      "const save = (k, v) => localStorage.setItem('tl.' + k, JSON.stringify(v));",
      "const load = (k, d) => JSON.parse(localStorage.getItem('tl.' + k) ?? 'null') ?? d;",
      '',
    ];
    const bday = c.m === 'bday';
    const vs = VOTES[c.set] || VOTES.air;
    let b = BODY[w.kind];
    const R = {
      '%MODE%': bday ? '生日倒计时：每年 9 月 6 日，提前一天提醒' : '每天 20:00 更新（演示设定），提前 1 小时提醒',
      '%REMIND%': bday ? '24 * 60 * 60' : '60 * 60',
      '%NEXT%': bday ? 'let t = new Date(now.getFullYear(), 8, 6);\n  if (t < now) t = new Date(now.getFullYear() + 1, 8, 6);'
        : 'const t = new Date(now);\n  t.setHours(20, 0, 0, 0);\n  if (t <= now) t.setDate(t.getDate() + 1);',
      '%SPAN%': bday ? '(365 * 86400)' : '86400',
      '%TITLE%': w.kind === 'countdown' ? (bday ? '距她生日 9 月 6 日' : `距《${showName()}》下一集更新`) : w.name,
      '%BANK%': QUIZ.map(q => `  ['${q[0]}', '${q[1]}', [${q[2].map(o => `'${o}'`).join(', ')}], '${q[3]}'],`).join('\n'),
      '%CITIES%': CITIES.map(x => `  ['${x[0]}', ${x[1]}],`).join('\n'),
      '%ITEMS%': (c.set === 'snack' ? SNACKS : DRAMAS).map(s => `'${s}'`).join(', '),
      '%VERB%': c.set === 'snack' ? '今天配：' : '今天看：',
      '%SCENE%': SCENES[c.s || 0],
      '%Q%': vs.q,
      '%OPTS%': vs.o.map(o => `  ['${o[0]}', ${o[3]}],`).join('\n'),
    };
    for (const k in R) b = put(b, k, R[k]);
    return head.join('\n') + '\n' + b + '\n</script>\n</body>\n</html>';
  }
  function lineHTML(n, raw) {
    let h = C.esc(raw);
    const tr = raw.trim();
    if (tr.startsWith('//') || tr.startsWith('<!--')) h = `<span class="c">${h}</span>`;
    else h = h.replace(/('[^']*')/g, '<span class="s">$1</span>').replace(/\b(const|let|function|return|if|else|for|of|new|setTimeout|setInterval)\b/g, '<span class="k">$1</span>');
    return `<div data-n="${n + 1}">${h || ' '}</div>`;
  }
  const codeHTML = src => src.split('\n').map((l, i) => lineHTML(i, l)).join('');
  function roll(el, ln, src, dur) {
    return new Promise(res => {
      const lines = src.split('\n'); let i = 0; const t0 = performance.now();
      const step = () => {
        if (!el.isConnected) return res();
        const n = Math.min(lines.length, Math.ceil((performance.now() - t0) / dur * lines.length));
        let h = ''; for (; i < n; i++) h += lineHTML(i, lines[i]);
        if (h) { el.insertAdjacentHTML('beforeend', h); el.scrollTop = el.scrollHeight; ln.textContent = `${i} / ${lines.length} 行`; }
        if (i < lines.length) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- 7 个真能玩的小玩意（每个返回清理函数或 null） ---------- */
  const W = {
    countdown(box, w, st, sv) {
      const { $, esc } = C; const bday = w.cfg.m === 'bday';
      if (st.remind === undefined) st.remind = true;
      const isBday = () => { const d = new Date(); return d.getMonth() === 8 && d.getDate() === 6; };
      const next = () => {
        const now = new Date();
        if (bday) { let t = new Date(now.getFullYear(), 8, 6); if (t < now) t = new Date(now.getFullYear() + 1, 8, 6); return t; }
        const [hh, mm] = showAt(); const t = new Date(now); t.setHours(hh, mm, 0, 0); if (t <= now) t.setDate(t.getDate() + 1); return t;
      };
      const hm = showAt().map(pad2).join(':');
      box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · ${bday ? '距她生日 9 月 6 日' : `距《${esc(showName())}》下一集更新`}</div>
        <div class="vb-alert" data-al hidden></div>
        <div class="vb-ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" data-arc/></svg>
          <div class="vb-ring-in"><b class="vb-big" data-cd>--:--:--</b><small data-sub></small></div></div>
        <div class="row between"><span class="small">${bday ? '提前一天提醒' : '更新前 1 小时提醒'}</span><button class="switch ${st.remind ? 'on' : ''}" data-rm aria-label="提醒"></button></div>
        <p class="xs dim" style="margin-top:8px">${bday ? '9 月 6 日当天页面放烟花。' : `${esc(prof().showTime || '每天 20:00 更新')}，以平台排期为准。`}提醒只在这个页面里亮，不收手机号。</p>`;
      const tick = () => {
        const cd = $('[data-cd]', box); if (!cd) return;
        if (bday && isBday()) { cd.textContent = '就是今天'; $('[data-sub]', box).innerHTML = '<span class="vb-party">✦ ✦ ✦</span>'; $('[data-arc]', box).style.strokeDashoffset = 0; return; }
        const t = next(), s = Math.max(0, (t - NOW()) / 1000), d = Math.floor(s / 86400);
        cd.textContent = (d ? `${d}天 ` : '') + [s / 3600 % 24, s / 60 % 60, s % 60].map(pad2).join(':');
        $('[data-sub]', box).textContent = bday ? `${t.getFullYear()} 年 9 月 6 日` : `${t.getDate() === new Date().getDate() ? '今天' : '明天'} ${hm} 更新`;
        $('[data-arc]', box).style.strokeDashoffset = 326.7 * (s / (bday ? 365 * 86400 : 86400));
        const al = $('[data-al]', box);
        al.hidden = !(st.remind && s < (bday ? 86400 : 3600));
        if (!al.hidden) al.textContent = bday ? '明天就是她生日了，倒数准备好' : `还有不到 1 小时，${Math.ceil(s / 60)} 分钟后更新`;
      };
      $('[data-rm]', box).onclick = e => { st.remind = !st.remind; sv(); e.currentTarget.classList.toggle('on', st.remind); C.toast(st.remind ? '提醒开了，快到点时这个页面会亮' : '提醒关了'); tick(); };
      tick(); const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    },

    quiz(box, w, st, sv) {
      const { $$, esc } = C; let qs, i, score, res, to;
      const start = () => { qs = shuffle(QUIZ).slice(0, 5); i = 0; score = 0; res = []; ask(); };
      const dots = () => `<div class="vb-dots">${qs.map((_, k) => `<i class="${res[k] || (k === i ? 'cur' : '')}"></i>`).join('')}</div>`;
      const ask = () => {
        if (i >= qs.length) {
          st.best = Math.max(st.best || 0, score); st.rounds = (st.rounds || 0) + 1; sv();
          const name = score === 5 ? '桃花岛主' : score >= 3 ? '丐帮弟子' : '牛家村路人';
          box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · 结果</div><div style="text-align:center;padding:10px 0">
            <div class="vb-big">${score} / 5</div><div style="font-size:20px;margin:10px 0 4px">称号：<b class="accent">${name}</b></div>
            <p class="small muted">最好成绩 ${st.best} / 5 · 一共玩了 ${st.rounds} 轮</p></div>${dots()}
            <button class="btn btn-primary btn-block" data-again style="margin-top:14px">再来一轮</button>
            <p class="xs dim" style="margin-top:10px">题目来自原著里的菜名、对联和招式。</p>`;
          box.querySelector('[data-again]').onclick = start; return;
        }
        const q = qs[i];
        box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · 第 ${i + 1} / 5 题 · 接下半句</div>
          <div class="vb-bub">${esc(q[0])} <span class="vb-blank">______</span></div><p class="xs muted">${esc(q[3])}</p>
          <div class="vb-opts">${shuffle(q[2]).map(o => `<button data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>${dots()}`;
        $$('.vb-opts button', box).forEach(b => b.onclick = () => {
          if (box.dataset.lock) return; box.dataset.lock = 1;
          const ok = b.dataset.o === q[1];
          b.classList.add(ok ? 'ok' : 'no');
          if (!ok) $$('.vb-opts button', box).find(x => x.dataset.o === q[1]).classList.add('ok');
          if (ok) score++; res[i] = ok ? 'ok' : 'no';
          to = setTimeout(() => { delete box.dataset.lock; i++; ask(); }, 750);
        });
      };
      start();
      return () => clearTimeout(to);
    },

    checkin(box, w, st, sv) {
      const { $, esc } = C;
      const BADGES = [[3, '三日桐铃'], [7, '一周不断'], [14, '两周徽章'], [30, '满月徽章']];
      if (!st.days) { st.days = []; for (let k = 13; k >= 1; k--) { const d = new Date(); d.setDate(d.getDate() - k); st.days.push(dkey(d)); } sv(); }
      const streak = () => { const set = new Set(st.days); let n = 0; const d = new Date(); if (!set.has(dkey(d))) d.setDate(d.getDate() - 1); while (set.has(dkey(d))) { n++; d.setDate(d.getDate() - 1); } return n; };
      const draw = fresh => {
        const set = new Set(st.days), n = streak(), today = set.has(dkey(new Date()));
        const nextB = BADGES.find(b => n < b[0]);
        let cal = ''; for (let k = 27; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); cal += `<span class="${set.has(dkey(d)) ? 'on' : ''} ${k === 0 ? 'today' : ''}">${d.getDate()}</span>`; }
        box.innerHTML = `<div class="row between"><div><div class="vb-w-title" style="margin:0">${esc(w.name)} · 连续</div><div class="vb-big">${n}<small class="small muted"> 天</small></div></div>
          <span class="tag ${nextB ? '' : 'ok'}">${nextB ? `再 ${nextB[0] - n} 天拿「${nextB[1]}」` : '徽章全拿了'}</span></div>
          <div class="vb-cal">${cal}</div>
          <div class="vb-badges">${BADGES.map(b => `<span class="${n >= b[0] ? 'on' : ''} ${fresh === b[0] ? 'new' : ''}">${n >= b[0] ? '★' : '☆'} ${b[1]}</span>`).join('')}</div>
          <button class="btn btn-primary btn-block" data-go ${today ? 'disabled' : ''}>${today ? '今天打过了，明天见' : '今天打卡'}</button>
          <p class="xs dim" style="margin-top:8px">记录只存在这台设备上，一共打过 ${st.days.length} 次。</p>`;
        $('[data-go]', box).onclick = () => {
          st.days.push(dkey(new Date())); sv();
          const m = streak(), got = BADGES.find(b => b[0] === m);
          draw(got && got[0]); C.toast(got ? `解锁「${got[1]}」` : `打卡成功，连续 ${m} 天`, 'ok');
        };
      };
      draw();
      return null;
    },

    map(box, w, st, sv) {
      const { $, esc } = C;
      const draw = () => {
        const rows = CITIES.map(([c, n]) => [c, n + (st.city === c ? 1 : 0)]);
        const max = Math.max(...rows.map(r => r[1])), total = rows.reduce((s, r) => s + r[1], 0);
        box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · 这周打开过的${esc(fanName())}一共 <b class="accent">${C.fmt(total)}</b> 人，来自</div>
          <div class="vb-bars">${rows.map(([c, n]) => `<span class="${st.city === c ? 'me' : ''}">${c}</span><div class="meter"><i style="width:0;--mc:${st.city === c ? 'var(--accent)' : 'color-mix(in srgb,var(--accent) 45%,var(--info))'}" data-w="${(n / max * 100).toFixed(1)}"></i></div><span class="n">${C.fmt(n)}</span>`).join('')}</div>
          <div class="row" style="margin-top:14px;flex-wrap:nowrap"><select class="select" data-c style="flex:1;min-width:0">${CITIES.map(c => `<option ${st.city === c[0] ? 'selected' : ''}>${c[0]}</option>`).join('')}</select><button class="btn btn-primary btn-sm" data-here>${st.city ? '改一下' : '这里也有桐铃'}</button></div>
          <p class="xs dim" style="margin-top:8px">${st.city ? `已算上一个：${esc(st.city)}。` : ''}只记城市，不记人；海外的城市也算。</p>`;
        requestAnimationFrame(() => box.querySelectorAll('[data-w]').forEach(i => i.style.width = i.dataset.w + '%'));
        $('[data-here]', box).onclick = () => { st.city = $('[data-c]', box).value; sv(); draw(); C.toast(`${st.city} +1`, 'ok'); };
      };
      draw();
      return null;
    },

    lottery(box, w, st, sv) {
      const { $, esc } = C; let to;
      const items = w.cfg.set === 'snack' ? SNACKS : worksList(), seg = 360 / items.length;
      st.rot = st.rot || 0; st.log = st.log || [];
      const P = a => [Math.sin(a * Math.PI / 180) * 100, -Math.cos(a * Math.PI / 180) * 100].map(v => v.toFixed(2));
      const svg = items.map((t, i) => { const a0 = i * seg, [x0, y0] = P(a0), [x1, y1] = P(a0 + seg); return `<path d="M0 0L${x0} ${y0}A100 100 0 0 1 ${x1} ${y1}Z" style="fill:${shade(i)}" stroke="var(--bg2)" stroke-width="1.2"/>`; }).join('');
      /* 文字停下时一律横着正读：每块文字反向转掉整个转盘的角度 */
      const labels = () => items.map((t, i) => { const ac = i * seg + seg / 2; return `<text transform="rotate(${ac}) translate(0 -62) rotate(${-(ac + st.rot)})" text-anchor="middle" dominant-baseline="middle" style="fill:${shadeInk(i)}">${esc(t)}</text>`; }).join('');
      box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · ${w.cfg.set === 'snack' ? '追剧配什么，转一下' : '今天看她哪部剧，转一下'}</div>
        <div class="vb-wheel"><svg viewBox="-102 -102 204 204" data-w style="rotate:${st.rot}deg"><circle r="101" style="fill:var(--bg2)"/>${svg}<g data-lb>${labels()}</g></svg></div>
        <div class="vb-res" data-res>${st.log[0] ? `上次：<b>${esc(st.log[0])}</b>` : '&nbsp;'}</div>
        <button class="btn btn-primary btn-block" data-go style="margin-top:10px">转一下</button>
        <p class="xs dim" style="margin-top:8px" data-log>${st.log.length ? '最近抽到：' + st.log.map(esc).join(' · ') : '抽到的结果会记下最近 5 次。'}</p>`;
      $('[data-go]', box).onclick = e => {
        const btn = e.currentTarget; btn.disabled = true;
        const pick = Math.floor(Math.random() * items.length), center = pick * seg + seg / 2, jit = (Math.random() - .5) * seg * .5;
        st.rot += 360 * 5 + ((360 - center - (st.rot % 360)) % 360 + 360) % 360 + jit;
        $('[data-w]', box).style.rotate = st.rot + 'deg';
        $('[data-res]', box).innerHTML = '转呀转……';
        to = setTimeout(() => {
          st.log = [items[pick], ...st.log].slice(0, 5); sv();
          $('[data-res]', box).innerHTML = `${w.cfg.set === 'snack' ? '今天配' : '今天看'}：<b>${esc(items[pick])}</b>`;
          $('[data-log]', box).textContent = '最近抽到：' + st.log.join(' · ');
          $('[data-lb]', box).innerHTML = labels();
          btn.disabled = false; btn.textContent = '再转一次';
        }, 3500);
      };
      return () => clearTimeout(to);
    },

    palette(box, w, st, sv) {
      const { $, $$, esc } = C; let scene = w.cfg.s || 0, custom = false;
      st.saved = st.saved || [];
      box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · 挑一张「剧照」，取出 5 个主色</div>
        <div class="chips" data-sc style="margin-bottom:10px">${SCENES.map((s, i) => `<button class="chip ${i === scene ? 'on' : ''}" data-v="${i}">${s}</button>`).join('')}</div>
        <canvas class="vb-canvas" width="360" height="220" data-cv></canvas>
        <div class="vb-sw" data-sw></div>
        <div class="row" style="margin-top:12px"><button class="btn btn-primary btn-sm" data-save>存成色卡</button><label class="btn btn-sm btn-ghost">换自己的图<input type="file" accept="image/*" hidden data-f></label></div>
        <div data-saved style="margin-top:10px"></div>
        <p class="xs dim" style="margin-top:8px">「剧照」是画出来的场景，没有人物。自己的图只在这台设备上取色，不上传。</p>`;
      const cv = $('[data-cv]', box), g = cv.getContext('2d', { willReadFrequently: true });
      let colors = [];
      const draw = () => drawScene(g, scene, cv.width, cv.height);
      const extract = () => {
        const { data } = g.getImageData(0, 0, cv.width, cv.height), px = [];
        for (let i = 0; i < data.length; i += 4 * 9) px.push([data[i], data[i + 1], data[i + 2]]);
        colors = kmeans(px, 5);
        $('[data-sw]', box).innerHTML = colors.map((o, i) => `<button style="--i:${i}" data-hex="${o.hex}" title="点一下复制"><i style="background:${o.hex}"></i><span>${o.hex}<br>${Math.round(o.share * 100)}%</span></button>`).join('');
        $$('[data-hex]', box).forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(b.dataset.hex); C.toast(`复制了 ${b.dataset.hex}`, 'ok'); } catch (e) { C.toast(`色号 ${b.dataset.hex}`); } });
      };
      const paintSaved = () => { $('[data-saved]', box).innerHTML = st.saved.length ? `<div class="xs muted" style="margin-bottom:6px">存过的色卡（${st.saved.length}）</div>` + st.saved.slice(0, 4).map(s => `<div class="row" style="gap:8px;margin-bottom:6px;flex-wrap:nowrap"><span class="xs dim" style="width:64px;flex:none">${esc(s.name)}</span><div class="vb-strip">${s.c.map(h => `<i style="background:${h}"></i>`).join('')}</div></div>`).join('') : ''; };
      C.chips($('[data-sc]', box), v => { scene = +v; custom = false; draw(); extract(); });
      $('[data-save]', box).onclick = () => { st.saved.unshift({ name: custom ? '自己的图' : SCENES[scene], c: colors.map(c => c.hex) }); st.saved = st.saved.slice(0, 12); sv(); paintSaved(); C.toast('色卡存好了', 'ok'); };
      $('[data-f]', box).onchange = e => {
        const f = e.target.files[0]; if (!f) return;
        const rd = new FileReader();
        rd.onload = () => { const img = new Image(); img.onload = () => { const r = Math.max(cv.width / img.width, cv.height / img.height); g.drawImage(img, (cv.width - img.width * r) / 2, (cv.height - img.height * r) / 2, img.width * r, img.height * r); custom = true; $$('[data-sc] .chip', box).forEach(c => c.classList.remove('on')); extract(); }; img.src = rd.result; };
        rd.readAsDataURL(f);
      };
      draw(); extract(); paintSaved();
      return null;
    },

    ai(box, w) {
      let stop = () => {};
      const mount = () => { stop(); stop = runIn(box, w, (s, msg) => { if (s === 'err') showFixBar(box, w, msg, mount); }); };
      mount();
      return () => stop();
    },

    vote(box, w, st, sv) {
      const { $$, esc } = C; const vs = VOTES[w.cfg.set] || VOTES.air;
      if (st.pick === undefined) st.pick = -1;
      const icon = o => o[2] ? `<svg viewBox="0 0 80 90"><path d="M28 8 L40 15 L52 8 L66 16 L73 48 L62 50 L60 32 L60 70 L20 70 L20 32 L18 50 L7 48 L14 16 Z" fill="${o[1]}" stroke="var(--line2)"/><path d="M40 15 L40 70" stroke="${o[2]}" stroke-width="3"/><path d="M22 72 L58 72 L62 88 L18 88 Z" fill="${o[2]}" opacity=".85"/></svg>` : `<span class="gl">${o[1]}</span>`;
      const draw = () => {
        const counts = vs.o.map((o, i) => o[3] + (i === st.pick ? 1 : 0)), total = counts.reduce((a, b) => a + b, 0), shown = st.pick >= 0;
        box.innerHTML = `<div class="vb-w-title">${esc(w.name)} · ${esc(vs.q)}</div>
          <div class="vb-vote-g">${vs.o.map((o, i) => `<button data-i="${i}" class="${i === st.pick ? 'on' : ''}">${icon(o)}${esc(o[0])}${shown ? `<span class="pc">${Math.round(counts[i] / total * 100)}%</span><i class="bar" style="width:${(counts[i] / total * 100).toFixed(1)}%"></i>` : ''}</button>`).join('')}</div>
          <p class="xs dim" style="margin-top:10px">${shown ? `共 ${C.fmt(total)} 票，点别的可以改投。` : '投一票才能看结果。'}只投风格，用插画，不放任何人的照片。</p>`;
        $$('[data-i]', box).forEach(b => b.onclick = () => { const first = st.pick < 0; st.pick = +b.dataset.i; sv(); draw(); C.toast(first ? '投好了' : '改投了', 'ok'); });
      };
      draw();
      return null;
    },
  };

  /* 取色器用：画三张没有人物的「剧照」 */
  function drawScene(g, s, W0, H0) {
    const lin = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; };
    g.clearRect(0, 0, W0, H0);
    if (s === 0) {
      g.fillStyle = lin(0, H0, ['#0b1a3a', '#1d2f5f', '#7a4a52', '#c2703c']); g.fillRect(0, 0, W0, H0);
      g.fillStyle = '#f6e7c1'; g.beginPath(); g.arc(280, 52, 22, 0, 7); g.fill();
      g.fillStyle = '#0a0f1c'; g.beginPath(); g.moveTo(0, 150); g.lineTo(40, 120); g.lineTo(150, 112); g.lineTo(200, 130); g.lineTo(360, 128); g.lineTo(360, 220); g.lineTo(0, 220); g.fill();
      g.beginPath(); g.moveTo(60, 120); g.quadraticCurveTo(110, 96, 170, 120); g.lineTo(60, 120); g.fill();
      for (const [x, y] of [[80, 140], [120, 132], [170, 142], [240, 150], [300, 140]]) { g.fillStyle = 'rgba(216,52,44,.35)'; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill(); g.fillStyle = '#d8342c'; g.beginPath(); g.ellipse(x, y, 8, 10, 0, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(246,231,193,.18)'; g.fillRect(0, 186, W0, 4);
    } else if (s === 1) {
      g.fillStyle = lin(0, 130, ['#ffd6e0', '#ffeef2']); g.fillRect(0, 0, W0, 130);
      g.fillStyle = lin(130, H0, ['#3fa7b5', '#1f6f8b']); g.fillRect(0, 130, W0, 90);
      g.fillStyle = '#3e7d4f'; g.beginPath(); g.ellipse(120, 132, 110, 26, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#5a3b2e'; g.fillRect(250, 60, 6, 70);
      const r = rngOf(9);
      for (let k = 0; k < 70; k++) { g.fillStyle = ['#f7a1b8', '#f28aa5', '#fff4f7', '#e86b8f'][k % 4]; g.beginPath(); g.arc(200 + r() * 120, 30 + r() * 70, 3 + r() * 6, 0, 7); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 0; k < 6; k++) g.fillRect(20 + k * 60, 160 + (k % 2) * 20, 30, 2);
    } else {
      g.fillStyle = lin(0, H0, ['#1e2a32', '#2f4550', '#22333b']); g.fillRect(0, 0, W0, H0);
      g.fillStyle = '#141c22'; [[0, 40, 90, 140], [95, 70, 70, 110], [170, 30, 80, 150], [255, 60, 105, 120]].forEach(b => g.fillRect(...b));
      const r = rngOf(5); g.fillStyle = '#f2b25c';
      for (let k = 0; k < 22; k++) g.fillRect(10 + Math.floor(r() * 330), 50 + Math.floor(r() * 100), 8, 10);
      g.fillStyle = 'rgba(242,178,92,.25)'; g.fillRect(0, 180, W0, 40);
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1; g.beginPath();
      for (let k = 0; k < 80; k++) { const x = r() * W0, y = r() * H0; g.moveTo(x, y); g.lineTo(x - 4, y + 12); } g.stroke();
    }
  }
  function kmeans(px, k) {
    const dist = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
    let c = [px[Math.floor(px.length / 2)].slice()];
    while (c.length < k) { let far = px[0], fd = -1; for (const p of px) { const d = Math.min(...c.map(q => dist(p, q))); if (d > fd) { fd = d; far = p; } } c.push(far.slice()); }
    let groups = [];
    for (let it = 0; it < 10; it++) {
      groups = c.map(() => []);
      for (const p of px) { let best = 0, bd = Infinity; for (let j = 0; j < c.length; j++) { const q = c[j], d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < bd) { bd = d; best = j; } } groups[best].push(p); }
      c = groups.map((gp, j) => gp.length ? [0, 1, 2].map(ch => gp.reduce((s, p) => s + p[ch], 0) / gp.length) : c[j]);
    }
    const hex = q => '#' + q.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    return c.map((q, j) => ({ hex: hex(q), share: groups[j].length / px.length })).sort((a, b) => b.share - a.share);
  }

  function mountWidget(box, w) {
    const st = db.ws[w.id] || (db.ws[w.id] = {});
    box.style.padding = w.kind === 'ai' ? '0' : '';
    const c = W[w.kind](box, w, st, save);
    const f = () => { c && c(); };
    cleans.add(f);
    return () => { f(); cleans.delete(f); };
  }

  /* ---------- 作品墙迷你预览：每种小玩意画一个缩小的静态样子 ---------- */
  const PALS = [['#0a0f1c', '#1d2f5f', '#7a4a52', '#c2703c', '#d8342c'], ['#ffd6e0', '#3fa7b5', '#1f6f8b', '#3e7d4f', '#f28aa5'], ['#141c22', '#2f4550', '#1e2a32', '#f2b25c', '#3a5560']];
  function thumb(w) {
    const c = w.cfg || {}, A = 'var(--accent)', T = 'var(--text)', D = 'var(--surface3)', L = 'var(--line2)';
    const svg = inner => `<svg viewBox="0 0 240 96" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${inner}</svg>`;
    switch (w.kind) {
      case 'ai':
        return `<iframe class="vb-mini" sandbox="allow-scripts" tabindex="-1" aria-hidden="true" loading="lazy" srcdoc="${C.esc(wrapHtml(w.html || '', 'thumb', (db.ws[w.id] || {}).ls))}"></iframe>`;
      case 'countdown': {
        const bday = c.m === 'bday', r = 34, C0 = 2 * Math.PI * r;
        return svg(`<circle cx="62" cy="48" r="${r}" fill="none" stroke="${D}" stroke-width="7"/><circle cx="62" cy="48" r="${r}" fill="none" stroke="${A}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C0}" stroke-dashoffset="${C0 * .3}" transform="rotate(-90 62 48)"/>
          <text x="62" y="53" text-anchor="middle" style="font:600 15px var(--sans);fill:${T}">${bday ? '9/6' : '20:00'}</text>
          <text x="120" y="38" style="font-size:12px;fill:var(--muted)">${bday ? '距她生日' : '距下一集更新'}</text><text x="120" y="62" style="font:600 20px var(--sans);fill:${T}">${bday ? '318 天' : '05:31:51'}</text>`);
      }
      case 'quiz':
        return svg(`<rect x="8" y="6" width="224" height="30" rx="8" style="fill:var(--surface2)"/><text x="20" y="26" style="font-size:14px;font-weight:600;fill:${T}">二十四桥 <tspan style="fill:${A}">＿＿＿</tspan></text>
          ${['明月夜', '烟雨楼', '落花时', '春水生'].map((o, i) => `<rect x="${8 + (i % 2) * 114}" y="${44 + Math.floor(i / 2) * 26}" width="110" height="22" rx="7" style="fill:${i ? 'var(--surface)' : 'var(--ok-soft)'};stroke:${i ? L : 'var(--ok)'}"/><text x="${20 + (i % 2) * 114}" y="${59 + Math.floor(i / 2) * 26}" style="font-size:11px;fill:${i ? 'var(--muted)' : 'var(--ok)'}">${o}</text>`).join('')}`);
      case 'checkin':
        return svg(`<text x="8" y="40" style="font:600 30px var(--sans);fill:${T}">14</text><text x="8" y="60" style="font-size:11px;fill:var(--muted)">连续天数</text><text x="8" y="82" style="font-size:11px;fill:var(--warn)">★ 两周徽章</text>
          ${Array.from({ length: 21 }, (_, i) => `<rect x="${92 + (i % 7) * 21}" y="${8 + Math.floor(i / 7) * 28}" width="17" height="22" rx="4" style="fill:${i >= 6 ? 'var(--accent-soft)' : 'var(--surface)'};stroke:${i >= 6 ? 'var(--accent-line)' : 'var(--line)'}${i === 20 ? ';stroke:' + A + ';stroke-width:2' : ''}"/>`).join('')}`);
      case 'map':
        return svg(CITIES.slice(0, 5).map(([n, v], i) => `<text x="8" y="${18 + i * 18}" style="font-size:11px;fill:var(--muted)">${n}</text><rect x="44" y="${10 + i * 18}" width="${(v / 3120 * 150).toFixed(1)}" height="9" rx="4.5" style="fill:${i === 2 ? A : 'color-mix(in srgb,var(--accent) 45%,var(--info))'}"/><text x="${50 + v / 3120 * 150}" y="${18 + i * 18}" style="font:10px var(--sans);fill:var(--dim)">${C.fmt(v)}</text>`).join(''));
      case 'lottery': {
        const items = c.set === 'snack' ? SNACKS : DRAMAS, seg = 360 / items.length, R = 42;
        const P = a => [(120 + Math.sin(a * Math.PI / 180) * R).toFixed(1), (50 - Math.cos(a * Math.PI / 180) * R).toFixed(1)];
        return svg(items.map((_, i) => { const [x0, y0] = P(i * seg), [x1, y1] = P(i * seg + seg); return `<path d="M120 50L${x0} ${y0}A${R} ${R} 0 0 1 ${x1} ${y1}Z" style="fill:${shade(i)}" stroke="var(--bg2)"/>`; }).join('') + `<circle cx="120" cy="50" r="7" style="fill:var(--bg2);stroke:${T}" stroke-width="1.5"/><path d="M114 0 L126 0 L120 11 Z" style="fill:${T}"/>`);
      }
      case 'palette': {
        const pal = PALS[c.s || 0];
        return svg(`<rect x="8" y="6" width="224" height="44" rx="8" fill="url(#vbp${c.s || 0})"/><defs><linearGradient id="vbp${c.s || 0}" x1="0" y1="0" x2="0" y2="1">${pal.slice(0, 4).map((h, i) => `<stop offset="${i / 3}" stop-color="${h}"/>`).join('')}</linearGradient></defs>
          ${pal.map((h, i) => `<rect x="${8 + i * 45.6}" y="56" width="41" height="26" rx="6" fill="${h}" stroke="var(--line2)"/><text x="${28.5 + i * 45.6}" y="93" text-anchor="middle" style="font:8px var(--mono);fill:var(--dim)">${h}</text>`).join('')}`);
      }
      case 'vote': {
        const vs = VOTES[c.set] || VOTES.air, tot = vs.o.reduce((s, o) => s + o[3], 0);
        return svg(vs.o.map((o, i) => { const x = 8 + i * 57; const pct = Math.round(o[3] / tot * 100); return `<rect x="${x}" y="4" width="52" height="88" rx="8" style="fill:var(--surface);stroke:${i ? L : A}"/>` +
          (o[2] ? `<path transform="translate(${x + 12} 10) scale(.36)" d="M28 8 L40 15 L52 8 L66 16 L73 48 L62 50 L60 32 L60 70 L20 70 L20 32 L18 50 L7 48 L14 16 Z" fill="${o[1]}" stroke="var(--line2)" stroke-width="2"/><path transform="translate(${x + 12} 10) scale(.36)" d="M22 72 L58 72 L62 88 L18 88 Z" fill="${o[2]}"/>` : `<text x="${x + 26}" y="42" text-anchor="middle" style="font-size:24px;fill:${A}">${o[1]}</text>`) +
          `<text x="${x + 26}" y="66" text-anchor="middle" style="font:600 12px var(--sans);fill:${i ? T : A}">${pct}%</text><rect x="${x + 6}" y="76" width="40" height="4" rx="2" style="fill:${D}"/><rect x="${x + 6}" y="76" width="${(40 * pct / 100 * 2.2).toFixed(1)}" height="4" rx="2" style="fill:${A}"/>`; }).join(''));
      }
    }
    return '';
  }

  /* ---------- 真做：禁区判断 → AI 现写单文件 HTML → 沙盒真跑 → 报错让 AI 修 ---------- */
  const rid = () => Math.random().toString(36).slice(2, 10);
  const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:">`;
  /* 注进 iframe 的一行：断网（CSP）、localStorage 换成回传父页保存、报错和空白页回报 */
  function wrapHtml(html, id, ls) {
    const shim = `<script>(function(){var ID=${JSON.stringify(id)},D=${JSON.stringify(ls || {}).replace(/</g, '\\u003c')};function P(m){m.id=ID;try{parent.postMessage(m,'*')}catch(e){}}function sv(){P({vb:'ls',data:D})}var S={getItem:function(k){return Object.prototype.hasOwnProperty.call(D,k)?D[k]:null},setItem:function(k,v){D[k]=String(v);sv()},removeItem:function(k){delete D[k];sv()},clear:function(){D={};sv()},key:function(i){return Object.keys(D)[i]||null},get length(){return Object.keys(D).length}};try{Object.defineProperty(window,'localStorage',{value:S,configurable:true})}catch(e){}window.onerror=function(m,s,l){P({vb:'err',msg:String(m)+(l?'（第 '+l+' 行）':'')})};addEventListener('unhandledrejection',function(e){P({vb:'err',msg:'Promise 出错：'+String(e.reason&&e.reason.message||e.reason)})});addEventListener('load',function(){setTimeout(function(){var n=document.body?document.body.querySelectorAll('*').length:0;P(n<3?{vb:'err',msg:'页面打开是空的，什么都没画出来'}:{vb:'ok'})},600)})})();<\/script>`;
    const inj = CSP + shim;
    if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, m => m + inj);
    if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, m => m + '<head>' + inj + '</head>');
    return inj + html;
  }
  function pickHtml(t) {
    t = String(t || '');
    const m = t.match(/```(?:html)?\s*([\s\S]*?)```/i); if (m) t = m[1];
    const a = t.search(/<!doctype html|<html/i); if (a > 0) t = t.slice(a);
    const e = t.toLowerCase().lastIndexOf('</html>'); if (e >= 0) t = t.slice(0, e + 7);
    t = t.trim();
    if (!/<html|<body|<script|<div/i.test(t)) throw new Error('AI 没给出完整的 HTML，再试一次');
    return tidy(t);
  }
  /* AI 偶尔把整页压成一行：只在标签之间和 CSS 里换行，脚本原样不动 */
  function tidy(html) {
    if (html.split('\n').length >= 12) return html;
    return html.replace(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<pre[\s\S]*?<\/pre>|<textarea[\s\S]*?<\/textarea>)|>\s*(?=<)/gi, (m, block) => {
      if (!block) return '>\n';
      if (/^<style/i.test(block)) return block.replace(/^(<style[^>]*>)\s*/i, '$1\n').replace(/\}\s*/g, '}\n');
      return block;
    });
  }
  const RED = [
    [/speechSynthesis|SpeechSynthesisUtterance/, '用了浏览器朗读，可能被当成女演员的声音'],
    [/getUserMedia|mediaDevices/, '想打开摄像头或麦克风'],
    [/<(audio|video)\b/i, '放了音频或视频'],
    [/\b(src|href)\s*=\s*["']?(https?:)?\/\//i, '引用了外部资源'],
    [/@import|url\(\s*["']?https?:/i, '样式里引用了外链'],
    [/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/, '想联网'],
  ];
  const redline = html => (RED.find(r => r[0].test(html)) || [])[1] || '';
  const genSystem = () => {
    const p = prof();
    return `${C.profile.brief()}
你是给${p.fan || '粉丝'}做小玩意的前端工程师。按粉丝的一句话写一个单文件 HTML 小玩意，必须全部做到：
1. 只输出一个完整 HTML 文件（<!doctype html> 开头，</html> 结尾），不要任何解释，不要 markdown 代码块。
2. 不引用任何外部资源：不用 CDN、外链脚本、外链样式、网络字体、网络图片，不用 fetch 或任何联网接口。图形用 CSS、内联 SVG 或 canvas 自己画。
3. 不出现任何真人的脸、照片、头像、形象；不模仿、不合成任何人的声音，不用 speechSynthesis，不放音频视频，不开摄像头麦克风。
4. 不收集任何个人信息：不要手机号、住址、真名输入框。要记住的东西只用 localStorage，读写都包在 try/catch 里。
5. 手机宽度 360px 好用；浅色背景（米白 #fbfaf8），墨黑字 #1c1c1c，主色用深绿 #2f7a4f，最多搭一个辅助色；不要发光、霓虹效果；字体用系统字体。
6. 打开就能玩，有真实交互（点按、输入、计时或动画），离线能跑。
7. 代码精简，整份文件不超过 150 行（硬性上限，超了作废）：CSS 写紧凑，不写注释，不留空行；但要正常换行缩进，每条语句一行，不要压成一行。
8. 页面顶部有一行小字：「AI 生成 · ${p.fan || '粉丝'} vibecoding」，下面一行写「点子来自 @作者」。
9. 禁区：${p.taboo || '不用她的脸和声音，不碰工作和行程'}。页面文字不用第一人称「我」指代${p.name || '她'}。`;
  };
  const gatePrompt = text => {
    const p = prof();
    return `粉丝点子：「${text}」
判断这个点子能不能做成一个网页小玩意。下面任意一条命中就不做：
face：要用到${p.name || '她'}的脸、照片、剧照里的她、形象、换装、AI 合成她的样子
voice：要用到她的声音、配音、语音、模仿她说话、用她的口吻朗读
privacy：追她的行程、住处、航班酒店，或者要收集粉丝的手机号、住址等个人信息
work：涉及她的工作安排、合作、商务
rival：拉踩、和别的艺人比人气
另外的禁区：${p.taboo || ''}
只是提到她的名字、剧名、角色、粉丝名都没问题，追剧、打卡、小游戏、小工具都可以做。
只返回 JSON：{"ok":true或false,"rule":"face|voice|privacy|work|rival|none","reason":"一句话说明为什么，不用第一人称","title":"给这个小玩意起的名字，不超过 8 个字","plan":"一句话说准备做成什么样、怎么玩"}`;
  };
  async function aiGate(text) {
    const g = await C.ai.chat(gatePrompt(text), { system: C.profile.brief() + '\n你是粉丝共创小玩意的审核员，只判断能不能做，宁严勿松。', json: true, temperature: 0.1 });
    return { ok: g.ok === true || g.ok === 'true', rule: String(g.rule || 'none'), reason: String(g.reason || ''), title: String(g.title || '').slice(0, 12), plan: String(g.plan || '') };
  }
  async function aiWrite(text, by, gate) {
    const t = await C.ai.chat(`粉丝 @${by} 的点子：「${text}」\n作品名：${gate.title || '小玩意'}\n做成：${gate.plan || '按点子的意思做'}\n现在输出完整 HTML。`, { system: genSystem(), temperature: 0.6, maxTokens: 16000 });
    return pickHtml(t);
  }
  async function aiFix(html, err, by) {
    const t = await C.ai.chat(`下面这个单文件 HTML 小玩意有问题：${err}\n${by ? `点子作者是 @${by}。` : ''}请修好它，仍然遵守全部约束，只输出修好后的完整 HTML。\n\n${html}`, { system: genSystem(), temperature: 0.3, maxTokens: 16000 });
    return pickHtml(t);
  }
  /* 把一份 HTML 放进沙盒 iframe 跑；onState('ok'|'err', msg) */
  function runIn(box, w, onState) {
    const id = rid(), st = db.ws[w.id] || (db.ws[w.id] = {});
    box.innerHTML = `<iframe class="vb-frame" sandbox="allow-scripts" title="${C.esc(w.name)}"></iframe><div data-fixbar></div>`;
    const f = box.querySelector('iframe');
    const on = e => { const d = e.data; if (!d || d.id !== id || e.source !== f.contentWindow) return; if (d.vb === 'ls') { st.ls = d.data; save(); } else if (onState) onState(d.vb, d.msg || ''); };
    addEventListener('message', on);
    f.srcdoc = wrapHtml(w.html || '', id, st.ls);
    return () => removeEventListener('message', on);
  }
  /* 跑一次，等回报（ok / err），最多 8 秒 */
  function runOnce(box, w) {
    return new Promise(res => {
      let done = false, stop = () => {};
      const fin = (s, msg) => { if (done) return; done = true; clearTimeout(to); res({ s, msg, stop }); };
      stop = runIn(box, w, (s, msg) => { if (s === 'err' && done) showFixBar(box, w, msg); fin(s, msg); });
      const to = setTimeout(() => fin('ok', '没收到回报'), 8000);
    });
  }
  async function fixWork(w, msg) {
    w.html = await aiFix(w.html, msg, w.by); w.lines = w.html.split('\n').length; w.fixes = (w.fixes || 0) + 1; save();
  }
  function showFixBar(box, w, msg, remount) {
    const bar = box.querySelector('[data-fixbar]'); if (!bar) return;
    bar.innerHTML = `<div class="vb-fixbar"><span>运行报错：${C.esc(msg)}</span>${aiOn() ? '<button class="btn btn-sm btn-primary" data-fix>让 AI 修一下</button>' : '<a class="btn btn-sm" href="#/connect">接入 AI 才能修</a>'}</div>`;
    const b = bar.querySelector('[data-fix]');
    if (b) b.onclick = async () => { b.disabled = true; b.textContent = 'AI 在修……'; try { await fixWork(w, msg); C.toast('修好了，重新跑一遍', 'ok'); remount && remount(); } catch (e) { C.toast(e.message, 'bad'); b.disabled = false; b.textContent = '再修一次'; } };
  }

  /* ---------- 弹层：玩一下 / 看代码 ---------- */
  function openWork(wid, after) {
    const w = work(wid); if (!w) return;
    const g0 = gen;
    w.plays++; save();
    let stop = () => {};
    const d = C.modal(`<div class="row" style="margin-bottom:12px;gap:8px"><span class="tag">${KINDS[w.kind].icon} ${KINDS[w.kind].name}</span><span class="small muted">点子来自 @${C.esc(w.by)}「${C.esc(w.idea)}」</span></div>
      <div class="vb-phone"><div class="vb-phone-top"><span>超话 · 小玩意</span><span class="tag accent">AI 生成</span></div><div class="vb-phone-body" data-mw></div></div>
      <div class="vb-stats" style="margin-top:14px"><div><b>${C.fmt(w.plays)}</b>玩过</div><div><b>${w.passer}%</b>路人</div><div><b>${w.lines}</b>行代码</div></div>`,
    { title: w.name, foot: `<button class="btn btn-sm btn-ghost" data-code>看代码</button><button class="btn btn-sm btn-primary" data-post ${w.posted ? 'disabled' : ''}>${w.posted ? '已发回超话 ✓' : '发回超话'}</button>`, onClose: () => { stop(); if (g0 === gen && after) after(); } });
    d.classList.add('vb-dlg');
    stop = mountWidget(C.$('[data-mw]', d), w);
    C.$('[data-code]', d).onclick = () => openCode(w);
    C.$('[data-post]', d).onclick = e => { postWork(w); e.currentTarget.disabled = true; e.currentTarget.textContent = '已发回超话 ✓'; };
  }
  function openCode(w) {
    const src = source(w);
    const d = C.modal(`<p class="small muted" style="margin-bottom:10px">AI 按 @${C.esc(w.by)} 的一句话写的，${w.lines} 行，单个 HTML 文件，双击就能打开。粉丝可以拿去改着玩。</p>
      <div class="vb-code" style="margin:0"><div class="vb-code-hd"><i>●●●</i><b>${KINDS[w.kind].file}.html</b><em>${w.lines} 行</em></div><div class="vb-code-bd tall">${codeHTML(src)}</div></div>`,
    { title: `${w.name} · 代码`, foot: `<button class="btn btn-sm btn-primary" data-copy>复制代码</button>` });
    d.classList.add('vb-dlg');
    C.$('[data-copy]', d).onclick = async () => { try { await navigator.clipboard.writeText(src); C.toast(`复制好了，${w.lines} 行`, 'ok'); } catch (e) { const r = document.createRange(); r.selectNodeContents(C.$('.vb-code-bd', d)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); C.toast('已选中，按 ⌘C 复制'); } };
  }
  function postWork(w) {
    if (w.posted) return; w.posted = true; w.postedAt = NOW(); w.plays += rint(20, 80); save();
    C.toast(`「${w.name}」发回超话了，标着「AI 生成」`, 'ok');
  }

  /* ---------- 外壳：侧栏 + 主区 ---------- */
  function shell(page, head, body) {
    const nav = [['', '总览', '◇'], ['ideas', '点子池', '✦', queueCount()], ['build', '做出来', '⌘'], ['wall', '作品墙', '▦', db.works.length], ['pick', '本周点名', '★', db.pick ? '✓' : '待点']];
    return `<div class="app">
      <aside class="side">
        <div class="brand"><i>⌘</i><div><b>${C.esc(fanName())} vibecoding</b><small>粉丝共创 · 演示数据</small></div></div>
        <div class="vb-want"><button class="heart" data-pick="vibe" aria-label="想要">♡</button><span>看中了就点心</span></div>
        <nav>${nav.map(n => `<a href="#/vibe${n[0] ? '/' + n[0] : ''}" class="${page === n[0] ? 'on' : ''}" data-nav="${n[0]}"><span>${n[2]}</span>${n[1]}${n[3] !== undefined ? `<em>${n[3]}</em>` : ''}</a>`).join('')}</nav>
        <div class="sec">设置</div>
        <nav><a href="#/vibe/settings" class="${page === 'settings' ? 'on' : ''}" data-nav="settings"><span>⚙</span>征集与规则</a></nav>
        <div class="vb-fine">所有点子、昵称、人数都是演示用的假数据。小玩意都标明「AI 生成」，不用女演员的脸和声音。</div>
      </aside>
      <section class="main">
        <div class="head">${head}</div>
        ${body}
      </section>
    </div>`;
  }
  const H = (t, p, right = '') => `<div><span class="eyebrow vb-eb">第 <b>${weekNo(new Date())}</b> 周，<b>${new Date().getMonth() + 1}</b> 月 <b>${new Date().getDate()}</b> 日</span><h2 style="margin-top:6px">${t}</h2><p>${p}</p></div>${right ? `<div class="row">${right}</div>` : ''}`;
  const navCount = (k, v) => { const e = root.querySelector(`[data-nav="${k}"] em`); if (e) e.textContent = v; };

  function countUp(el, to, dur = 900) {
    const t0 = performance.now();
    const f = t => { if (!el.isConnected) return; const k = Math.min(1, (t - t0) / dur), e = 1 - (1 - k) ** 3; el.textContent = C.fmt(Math.round(to * e)) + (el.dataset.suf || ''); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  /* ---------- 页面：总览 ---------- */
  function pageHome() {
    const plan = (typeof PLAN !== 'undefined' && PLAN[11]) || {};
    const plays = db.works.reduce((s, w) => s + w.plays, 0);
    const passer = Math.round(db.works.reduce((s, w) => s + w.plays * w.passer, 0) / Math.max(1, plays));
    const tw = thisWeek().length, q = queueCount();
    const pw = db.pick && work(db.pick.wid);
    root.innerHTML = shell('', H(`${C.esc(fanName())} vibecoding`, '粉丝说一句话，AI 做出能直接玩的小玩意，发回超话；女演员每周点名一个。', `<a class="btn" href="#/vibe/ideas">看点子池</a><a class="btn btn-primary" href="#/vibe/build">让 AI 做一个 →</a>`), `
      <div class="kpis">
        <div class="kpi"><b data-k="ideas">0</b><span>收到的点子</span><small>排队 ${q}</small></div>
        <div class="kpi" style="--kc:var(--info)"><b data-k="tw">0</b><span>本周做好 / 名额 ${db.settings.perWeek}</span><small>共 ${db.works.length} 个</small></div>
        <div class="kpi" style="--kc:var(--ok)"><b data-k="plays">0</b><span>玩过的人次</span><small>实时</small></div>
        <div class="kpi" style="--kc:var(--warn)"><b data-k="passer" data-suf="%">0</b><span>路人占比</span><small>不是粉丝的人</small></div>
      </div>
      <div class="vb-two" style="margin-top:16px">
        <div class="card"><div class="hd"><h3>超话里刚投来的点子</h3><span class="tag accent">实时</span></div><ul class="vb-feed" data-feed>${db.ideas.slice().sort((a, b) => b.t - a.t).slice(0, 9).map(feedLi).join('')}</ul></div>
        <div class="card"><div class="hd"><h3>近 14 天玩的人次</h3><span class="small muted">每天</span></div>${chart(db.chart)}
          <div class="row between small muted" style="margin-top:8px"><span>小玩意一发回超话，路人也会点开</span><span class="accent">↗ ${Math.round((db.chart[13] / db.chart[0] - 1) * 100)}%</span></div></div>
      </div>
      <div class="card" style="margin-top:16px"><div class="hd"><h3>一条点子走到哪一步</h3><span class="small muted">累计</span></div>
        ${Viz.funnel([['收到', db.ideas.length], ['过了规则', db.ideas.filter(i => i.status !== 'rejected').length], ['做出来', db.works.length], ['发回超话', db.works.filter(w => w.posted).length], ['被女演员点名', db.history.length + (db.pick ? 1 : 0)]].map(f => ({ l: f[0], v: f[1] })), { w: 720, lw: 80, vw: 120, label: '点子走到哪一步' })}
        <p class="vn small muted" style="margin-top:8px">${db.ideas.filter(i => i.status === 'rejected').length} 条没过规则，都是要用女演员的脸、声音或行程的；做出来的每一个都发回了超话。</p></div>
      <div class="vb-two" style="margin-top:16px">
        <div class="card vb-pin ${pw ? 'glow' : ''}"><div class="hd"><h3>本周点名</h3>${pw ? '<span class="tag accent">置顶中</span>' : '<span class="tag warn">还没点</span>'}</div>
          ${pw ? `<b style="font-size:18px">${C.esc(pw.name)}</b><div class="small muted">@${C.esc(pw.by)} 的点子 · ${C.fmt(pw.plays)} 人玩过</div><div class="vb-note">「${C.esc(db.pick.note)}」</div><div class="row" style="margin-top:12px"><button class="btn btn-sm" data-play="${pw.id}">玩一下</button><a class="btn btn-sm btn-ghost" href="#/vibe/pick">去点名页</a></div>`
            : `<p class="muted small">本周 ${tw} 个小玩意在榜上，按玩的人数和路人占比排好了，等女演员挑一个。</p><a class="btn btn-primary btn-sm" href="#/vibe/pick" style="margin-top:12px">去点名 →</a>`}</div>
        <div class="card"><div class="hd"><h3>谁做什么</h3><span class="small muted">${C.esc(plan.cost || '每周 1 分钟')}</span></div>
          <ul class="list">${[['女演员', plan.she], ['AI', plan.ai], ['不做', plan.not]].map(x => `<li><span class="avatar">${x[0][0]}</span><div><b class="small">${x[0]}</b><div class="small muted">${C.esc(String(x[1] || '').replace(/她/g, '女演员'))}</div></div></li>`).join('')}</ul></div>
      </div>`);
    const K = { ideas: db.ideas.length, tw, plays, passer };
    C.$$('[data-k]', root).forEach(el => countUp(el, K[el.dataset.k]));
    C.$$('[data-play]', root).forEach(b => b.onclick = () => openWork(b.dataset.play));
    every(() => {
      bumpPlays();
      const el = C.$('[data-k="plays"]', root); if (el) el.textContent = C.fmt(db.works.reduce((s, w) => s + w.plays, 0));
      const ni = incoming();
      if (ni) {
        C.$('[data-feed]', root).insertAdjacentHTML('afterbegin', feedLi(ni).replace('<li', '<li class="vb-new"'));
        const k = C.$('[data-k="ideas"]', root); if (k) k.textContent = db.ideas.length;
        navCount('ideas', queueCount());
      }
    }, 4500);
  }
  function feedLi(i) {
    return `<li><span class="avatar">${C.esc(i.by.slice(0, 1))}</span><div class="t">${C.esc(i.text)}<small>@${C.esc(i.by)} · ${ago(i.t)}${i.status === 'rejected' ? ' · 自动拒绝：' + C.esc(ruleName(i.rule)) : ''}</small></div>${stTag(statusOf(i))}</li>`;
  }
  function chart(data) {
    const w = 520, h = 170, p = 26, top = Math.max(...data) * 1.1;
    const X = i => p + i * (w - p * 2) / (data.length - 1), Y = v => h - p - v / top * (h - p * 2);
    const pts = data.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`);
    const days = data.map((_, i) => md(NOW() - (13 - i) * DAY));
    const grid = [0, .5, 1].map(f => { const v = Math.max(...data) * f; return `<line x1="${p}" x2="${w - p}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="0" y="${Y(v) + 3}">${f ? (v / 1000).toFixed(1) + 'k' : '0'}</text>`; }).join('');
    return `<svg class="vb-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="近 14 天玩的人次">
      <defs><linearGradient id="vbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
      ${grid}
      <path d="M${pts[0]} L${pts.join(' L')} L${X(data.length - 1)},${h - p} L${X(0)},${h - p} Z" fill="url(#vbg)"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round"/>
      ${data.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="${i === data.length - 1 ? 4.5 : 2.5}" fill="${i === data.length - 1 ? 'var(--accent)' : 'var(--bg2)'}" stroke="var(--accent)"><title>${days[i]}：${C.fmt(v)} 人次</title></circle>`).join('')}
      ${days.map((d, i) => i % 3 === 1 || i === 13 ? `<text x="${X(i) - 10}" y="${h - 6}">${d}</text>` : '').join('')}
    </svg>`;
  }
  function bumpPlays() {
    const tw = thisWeek(); if (!tw.length) return;
    for (let k = 0; k < 2; k++) { const w = tw[Math.floor(Math.random() * tw.length)]; w.plays += rint(3, 36); }
    db.chart[13] += rint(10, 60);
    save();
  }
  function incoming() {
    if (db.feed >= RESERVE.length || Math.random() < .35) return null;
    const r = RESERVE[db.feed++];
    return addIdea(r[0], r[1], false);
  }

  /* ---------- 页面：点子池 ---------- */
  function pageIdeas() {
    const ui = { f: 'all', sort: 'votes', q: '' };
    let fresh = 0;
    root.innerHTML = shell('ideas', H('点子池', '粉丝在超话里说的一句话。点 ♡ 投票，票多、路人多的先做；用到女演员的脸和声音的自动拒绝。'), `
      <div class="card glow">
        <div class="hd"><h3>投一条点子</h3><span class="small muted">说一句话就行，不用会写代码</span></div>
        <div class="vb-submit"><input class="input" data-in maxlength="60" placeholder="比如：想要一个《美人余》追剧倒计时"><input class="input" data-nick maxlength="12" placeholder="昵称（可不填）" value="${C.esc(db.nick)}"><button class="btn btn-primary" data-send>投进点子池</button></div>
        <div class="xs dim" style="margin-top:8px" data-hint>投进去先过一遍规则：涉及女演员的脸、声音的，AI 会直接拒绝并写明原因。</div>
      </div>
      <div class="card" style="margin-top:16px">
        <div class="vb-tools">
          <div class="search"><input class="input" data-q placeholder="搜点子或昵称"></div>
          <select class="select" data-sort><option value="votes">票数最多</option><option value="passer">路人占比最高</option><option value="new">最新</option></select>
        </div>
        <div class="chips" data-f style="margin-bottom:12px">${[['all', '全部'], ['queue', '排队'], ['built', '做好了'], ['pick', '本周点名'], ['rejected', '已拒绝']].map((c, i) => `<button class="chip ${i ? '' : 'on'}" data-v="${c[0]}">${c[1]} <span class="dim" data-cnt="${c[0]}"></span></button>`).join('')}</div>
        <div class="viz-grid two" data-viz style="margin-bottom:14px"></div>
        <div data-bn></div>
        <div data-list></div>
      </div>`);
    const list = C.$('[data-list]', root);
    const paint = () => {
      const all = db.ideas;
      C.$$('[data-cnt]', root).forEach(s => { const k = s.dataset.cnt; s.textContent = k === 'all' ? all.length : all.filter(i => statusOf(i) === k).length; });
      navCount('ideas', queueCount());
      /* 一眼看：点子想要什么类型、走到哪一步 */
      const vz = C.$('[data-viz]', root);
      if (vz) {
        const ok = all.filter(i => i.status !== 'rejected');
        const kinds = Object.keys(KINDS).map(k => ({ l: `${KINDS[k].icon} ${KINDS[k].name}`, v: ok.filter(i => (i.kind || 'lottery') === k).length, n: `票 ${C.fmt(ok.filter(i => (i.kind || 'lottery') === k).reduce((s, i) => s + votesOf(i), 0))}` })).filter(x => x.v).sort((a, b) => b.v - a.v);
        const stt = [['queue', '排队', 'var(--surface3)'], ['built', '做好了', 'var(--accent)'], ['pick', '本周点名', 'var(--warn)'], ['rejected', '已拒绝', 'var(--bad)']].map(([k, l, c]) => ({ l, v: all.filter(i => statusOf(i) === k).length, c })).filter(x => x.v);
        const pass = ok.map(i => i.passer || 0), buckets = [['<30%', 0, 30], ['30–50%', 30, 50], ['50–70%', 50, 70], ['70%+', 70, 101]].map(([l, a, b]) => ({ l, v: pass.filter(p => p >= a && p < b).length }));
        vz.innerHTML = `<div class="viz-card"><div class="vh"><b>${C.esc(fanName())}最想要什么</b><span>按类型，右边是票数</span></div>${Viz.hbars(kinds, { w: 420, lw: 96, vw: 92, label: '点子按类型' })}</div>
          <div class="viz-card"><div class="vh"><b>${all.length} 条点子走到哪一步</b><span>路人占比越高越容易破圈</span></div>${Viz.stack(stt, { w: 420, label: '点子状态' })}<div style="margin-top:14px">${Viz.cols(buckets.map(b => b.v), { w: 420, h: 90, labels: buckets.map(b => b.l), vals: true, c: 'var(--warn)', label: '点子按路人占比' })}</div><p class="vn">横轴是投票的人里路人占多少。</p></div>`;
      }
      const L = all.filter(i => (ui.f === 'all' || statusOf(i) === ui.f) && (!ui.q || (i.text + i.by).includes(ui.q)));
      L.sort(ui.sort === 'votes' ? (a, b) => votesOf(b) - votesOf(a) : ui.sort === 'passer' ? (a, b) => b.passer - a.passer : (a, b) => b.t - a.t);
      list.innerHTML = L.length ? L.map(ideaRow).join('') : `<div class="empty"><b>没有对得上的点子</b>换个筛选或搜索词试试。</div>`;
      C.$$('[data-v-id]', list).forEach(b => b.onclick = () => {
        const i = idea(b.dataset.vId); if (db.votes[i.id]) delete db.votes[i.id]; else db.votes[i.id] = true; save();
        b.classList.toggle('on', voted(i)); C.$('b', b).textContent = C.fmt(votesOf(i)); C.$('i', b).textContent = voted(i) ? '♥' : '♡';
      });
      C.$$('[data-build]', list).forEach(b => b.onclick = () => C.go('build/' + b.dataset.build));
      C.$$('[data-play]', list).forEach(b => b.onclick = () => openWork(b.dataset.play, paint));
    };
    C.chips(C.$('[data-f]', root), v => { ui.f = v; paint(); });
    C.$('[data-sort]', root).onchange = e => { ui.sort = e.target.value; paint(); };
    C.$('[data-q]', root).oninput = e => { ui.q = e.target.value.trim(); paint(); };
    const send = () => {
      const inp = C.$('[data-in]', root), text = inp.value.trim(), nick = C.$('[data-nick]', root).value.trim();
      if (text.length < 4) { C.toast('多说几个字，AI 才知道要做什么', 'bad'); inp.focus(); return; }
      db.nick = nick; const i = addIdea(nick || '桐铃新人', text, true);
      inp.value = '';
      ui.f = 'all'; ui.sort = 'new'; ui.q = ''; C.$('[data-q]', root).value = ''; C.$('[data-sort]', root).value = 'new';
      C.$$('[data-f] .chip', root).forEach(c => c.classList.toggle('on', c.dataset.v === 'all'));
      paint();
      const hint = C.$('[data-hint]', root);
      if (i.status === 'rejected') { C.toast('这条不做：' + ruleName(i.rule), 'bad'); hint.innerHTML = `<span style="color:var(--bad)">没收进排队：${C.esc(i.reason)}</span>`; }
      else { C.toast('投进去了，排在点子池里', 'ok'); hint.innerHTML = `<span class="accent">收到。AI 判断这是一个「${KINDS[i.kind || 'lottery'].name}」${i.kind ? '' : '（没对上现成类型，先按抽签做）'}，可以直接 <a href="#/vibe/build/${i.id}" style="text-decoration:underline">让 AI 做出来 →</a></span>`; }
    };
    C.$('[data-send]', root).onclick = send;
    C.$('[data-in]', root).onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) send(); };
    paint();
    every(() => {
      const ni = incoming(); if (!ni) return; fresh++;
      navCount('ideas', queueCount());
      C.$('[data-bn]', root).innerHTML = `<button class="vb-banner" data-fresh>超话里又进来 ${fresh} 条新点子 · 点一下看</button>`;
      C.$('[data-fresh]', root).onclick = () => { fresh = 0; C.$('[data-bn]', root).innerHTML = ''; ui.sort = 'new'; C.$('[data-sort]', root).value = 'new'; paint(); };
    }, 7000);
  }
  function ideaRow(i) {
    const s = statusOf(i), k = i.kind ? KINDS[i.kind] : null;
    const act = s === 'queue' ? `<button class="btn btn-sm btn-primary" data-build="${i.id}">让 AI 做</button>` : (s === 'built' || s === 'pick') ? `<button class="btn btn-sm" data-play="${i.wid}">去玩</button>` : '';
    return `<div class="vb-idea">
      <button class="vb-vote ${voted(i) ? 'on' : ''}" data-v-id="${i.id}" aria-label="投一票"><i>${voted(i) ? '♥' : '♡'}</i><b>${C.fmt(votesOf(i))}</b></button>
      <div class="vb-body"><p>${C.esc(i.text)}</p>
        <div class="vb-meta"><span>@${C.esc(i.by)}</span><span>${ago(i.t)}</span>${k && s !== 'rejected' ? `<span class="tag">${k.icon} ${k.name}</span>` : ''}${stTag(s)}${i.mine ? '<span class="tag info">你投的</span>' : ''}
          <span class="vb-mini">路人 ${i.passer ? i.passer + '%' : '—'}<span class="meter"><i style="width:${i.passer}%;--mc:var(--warn)"></i></span></span></div>
        ${s === 'rejected' ? `<div class="vb-reason">自动拒绝：${C.esc(i.reason)}</div>` : ''}
      </div>
      <div class="vb-act">${act}</div></div>`;
  }

  /* ---------- 页面：做出来 ---------- */
  function pageBuild(arg) {
    const myGen = gen;
    const queue = () => db.ideas.filter(i => statusOf(i) === 'queue').sort((a, b) => votesOf(b) - votesOf(a));
    let sel = (arg && idea(arg) && statusOf(idea(arg)) === 'queue') ? arg : (queue()[0] || {}).id;
    let busy = false, q = '', stopW = () => {};
    const on = aiOn();
    root.innerHTML = shell('build', H('做出来', '选一条点子，AI 读懂、写代码、跑起来、自己先玩一遍，右边直接能玩。做好的自动进作品墙。'), `
      ${on ? `<div class="card glow vb-realcard"><div class="hd"><h3>✦ 真做出来</h3><span class="tag accent">AI 现写 · 沙盒真跑</span></div>
        <p class="small muted" style="margin-bottom:10px">输入粉丝的一句话：AI 先过禁区，再现写一个单文件页面，右边直接跑；跑不起来可以让 AI 修。一次大约 15–40 秒。</p>
        <div class="vb-submit"><input class="input" data-rt maxlength="80" placeholder="${matchMedia('(max-width:760px)').matches ? '比如：追剧喝水提醒' : `比如：追《${C.esc(showName())}》时的喝水提醒，每集提醒一次`}"><input class="input" data-rby maxlength="12" placeholder="谁的点子" value="${C.esc(db.nick)}"><button class="btn btn-primary" data-real>真做出来</button></div>
        <div class="xs dim" style="margin-top:8px">也可以在下面选一条排队的点子，点「用这条真做」。</div></div>`
      : `<div class="card vb-realcard"><div class="row between"><span class="small muted">接入 AI 后，这里能让 AI 按粉丝的一句话现写一个真能跑的小页面。现在是演示。</span><a class="btn btn-sm" href="#/connect">去接入 →</a></div></div>`}
      <div class="vb-two">
        <div>
          <div class="card">
            <div class="hd"><h3>选一条点子</h3><span class="small muted" data-quota></span></div>
            <div class="search"><input class="input" data-q placeholder="搜排队里的点子"></div>
            <div class="vb-pickl" data-pl></div>
            <div class="divider"></div>
            <div data-selcard></div>
            <button class="btn btn-primary btn-lg btn-block" data-make style="margin-top:12px">让 AI 做出来</button>
            ${on ? '<button class="btn btn-lg btn-block" data-realsel style="margin-top:8px">✦ 用这条真做</button>' : ''}
          </div>
          <div data-proc style="margin-top:14px"></div>
        </div>
        <div>
          <div class="vb-phone"><div class="vb-phone-top"><span>超话 · 小玩意</span><span class="tag accent">AI 生成</span></div><div class="vb-phone-body" data-stage><div class="vb-wait"><div><div style="font-size:34px;color:var(--accent)">⌘</div>选好点子，点「让 AI 做出来」<br>做好的小玩意会出现在这里，直接能玩</div></div></div></div>
          <div data-after style="margin-top:12px"></div>
        </div>
      </div>`);
    const quota = () => { const n = thisWeek().length, m = db.settings.perWeek; C.$('[data-quota]', root).innerHTML = `本周 <b style="color:${n >= m ? 'var(--warn)' : 'var(--accent)'}">${n}</b> / ${m} 个`; return n < m; };
    const paintList = () => {
      const L = queue().filter(i => !q || (i.text + i.by).includes(q));
      if (!L.find(i => i.id === sel) && !q) sel = (L[0] || {}).id;
      C.$('[data-pl]', root).innerHTML = L.length ? L.map(i => `<button class="${i.id === sel ? 'on' : ''}" data-s="${i.id}"><span class="vb-ic">${(KINDS[i.kind] || KINDS.lottery).icon}</span><span>${C.esc(i.text)}<br><em>@${C.esc(i.by)} · ♡ ${C.fmt(votesOf(i))} · 路人 ${i.passer ? i.passer + '%' : '—'}</em></span></button>`).join('') : `<div class="empty"><b>排队里没有点子了</b>去点子池投一条。</div>`;
      C.$$('[data-s]', root).forEach(b => b.onclick = () => { if (busy) return; sel = b.dataset.s; paintList(); });
      paintSel();
    };
    const paintSel = () => {
      const i = idea(sel), ok = quota();
      const btn = C.$('[data-make]', root);
      if (!i || statusOf(i) !== 'queue') { C.$('[data-selcard]', root).innerHTML = ''; btn.disabled = true; return; }
      const kind = i.kind || guess(i.text) || 'lottery', made = db.works.find(w => w.kind === kind);
      C.$('[data-selcard]', root).innerHTML = `<div class="panel"><div class="xs dim">选中的点子 · @${C.esc(i.by)}</div><div style="font-size:16px;margin:4px 0 8px">「${C.esc(i.text)}」</div>
        <div class="row small"><span class="tag accent">${KINDS[kind].icon} AI 判断：${KINDS[kind].name}</span>${made ? `<span class="muted">会参考做过的「${C.esc(made.name)}」</span>` : ''}</div></div>`;
      btn.disabled = busy || !ok;
      btn.textContent = busy ? 'AI 正在做……' : ok ? (on ? '演示做出来（不调 AI）' : '让 AI 做出来') : `本周 ${db.settings.perWeek} 个名额用完了`;
      const rs = C.$('[data-realsel]', root); if (rs) rs.disabled = busy || !ok;
      if (!ok && !busy) C.$('[data-after]', root).insertAdjacentHTML('beforeend', C.$('[data-quota-tip]', root) ? '' : `<p class="small muted" data-quota-tip style="text-align:center;margin-top:10px">名额在「设置」里能调，<a class="accent" href="#/vibe/settings">去调 →</a></p>`);
    };
    C.$('[data-q]', root).oninput = e => { q = e.target.value.trim(); paintList(); };
    C.$('[data-make]', root).onclick = async () => {
      const i = idea(sel); if (!i || busy || !quota()) return;
      busy = true; paintSel(); C.$$('[data-s]', root).forEach(b => b.disabled = true);
      const kind = i.kind || guess(i.text) || 'lottery';
      const w = { id: 'w' + (++db.seq), ideaId: i.id, kind, cfg: Object.keys(i.cfg || {}).length ? i.cfg : defaultCfg(kind, i.text), name: i.title || autoName(kind, i.text), by: i.by, idea: i.text, plays: 0, passer: i.passer || rint(25, 65), t: NOW(), posted: false };
      const src = source(w); w.lines = src.split('\n').length;
      const made = db.works.find(x => x.kind === kind);
      const steps = [`读懂这句话：要一个「${KINDS[kind].name}」`, ...(made ? [`参考做过的「${made.name}」，换成这条点子的说法`] : []), `写代码，约 ${w.lines} 行，单个 HTML`, '跑起来：在手机宽度上打开', `自己玩一遍：点了 ${rint(9, 18)} 下，没报错`, '标上「AI 生成」，检查不碰脸和声音'];
      const proc = C.$('[data-proc]', root);
      proc.innerHTML = `<div data-th></div><div class="vb-code"><div class="vb-code-hd"><i>●●●</i><b>${KINDS[kind].file}.html</b><em data-ln>0 行</em></div><div class="vb-code-bd" data-cb></div></div>`;
      C.$('[data-stage]', root).innerHTML = `<div class="scan" style="border-radius:12px"><div class="skeleton" style="height:22px;width:60%"></div><div class="skeleton" style="height:120px;margin-top:12px"></div><div class="skeleton" style="height:38px;margin-top:12px"></div></div>`;
      C.$('[data-after]', root).innerHTML = '';
      const t0 = performance.now();
      await Promise.all([C.think(C.$('[data-th]', proc), steps, 'AI 正在做'), roll(C.$('[data-cb]', proc), C.$('[data-ln]', proc), src, 2600)]);
      if (myGen !== gen) return;
      w.plays = rint(40, 160);
      db.works.unshift(w); i.status = 'built'; i.wid = w.id; save();
      const res = C.$('[data-stage]', root);
      res.innerHTML = '';
      stopW = mountWidget(res, w);
      if (innerWidth < 1100) res.closest('.vb-phone').scrollIntoView({ behavior: 'smooth', block: 'start' });
      C.$('[data-after]', root).innerHTML = `<div class="out"><div class="vb-done"><span class="done-line">✓ 做好了 · ${w.lines} 行 · ${((performance.now() - t0) / 1000).toFixed(1)} 秒</span><span class="tag ok">已进作品墙</span></div>
        <div class="row"><button class="btn btn-primary btn-sm" data-post>发回超话</button><button class="btn btn-sm" data-code>看代码</button><a class="btn btn-sm btn-ghost" href="#/vibe/wall">去作品墙</a><button class="btn btn-sm btn-ghost" data-next>做下一个</button></div>
        <p class="xs dim" style="margin-top:10px">粉丝的点子、AI 写的代码、做出来的东西，都不碰女演员的脸和声音。</p></div>`;
      C.$('[data-post]', root).onclick = e => { postWork(w); e.currentTarget.disabled = true; e.currentTarget.textContent = '已发回超话 ✓'; };
      C.$('[data-code]', root).onclick = () => openCode(w);
      C.$('[data-next]', root).onclick = () => { stopW(); C.$('[data-proc]', root).innerHTML = ''; C.$('[data-after]', root).innerHTML = ''; C.$('[data-stage]', root).innerHTML = `<div class="vb-wait"><div><div style="font-size:34px;color:var(--accent)">⌘</div>选下一条点子吧</div></div>`; paintList(); };
      C.toast(`「${w.name}」做好了，已放进作品墙`, 'ok');
      busy = false; paintList();
      navCount('wall', db.works.length); navCount('ideas', queueCount());
    };

    /* ---------- 真做 ---------- */
    const lockReal = v => C.$$('[data-real],[data-realsel],[data-rt]', root).forEach(b => b.disabled = v);
    const realMake = async (text, by, fromIdea) => {
      if (busy) return;
      if (!aiOn()) { C.toast('先去接入页填钥匙', 'bad'); return; }
      if (!quota()) { C.toast(`本周 ${db.settings.perWeek} 个名额用完了，可在设置里调`, 'bad'); return; }
      busy = true; paintSel(); lockReal(true); C.$$('[data-s]', root).forEach(b => b.disabled = true); stopW(); stopW = () => {};
      const proc = C.$('[data-proc]', root), stage = C.$('[data-stage]', root), after = C.$('[data-after]', root);
      const labels = ['过禁区：脸 / 声音 / 行程 / 工作 / 拉踩', 'AI 现写代码：单文件 HTML，不联网', '红线自查：外链、朗读、摄像头', '放进沙盒里真跑', '进作品墙'];
      proc.innerHTML = `<div class="think" data-rs><div class="hd">AI 真做中<i><b></b><b></b><b></b></i><em class="vb-clock" data-clock>0.0 秒</em></div>${labels.map((l, k) => `<div class="step" data-k="${k}">${l}</div>`).join('')}</div>
        <div class="vb-code"><div class="vb-code-hd"><i>●●●</i><b>index.html</b><em data-ln>等 AI 写</em></div><div class="vb-code-bd" data-cb></div></div>`;
      stage.style.padding = '';
      stage.innerHTML = `<div class="scan" style="border-radius:12px"><div class="skeleton" style="height:22px;width:60%"></div><div class="skeleton" style="height:160px;margin-top:12px"></div><div class="skeleton" style="height:38px;margin-top:12px"></div></div>`;
      after.innerHTML = '';
      const t0 = performance.now();
      const clock = every(() => { const c = C.$('[data-clock]', root); if (c) c.textContent = ((performance.now() - t0) / 1000).toFixed(1) + ' 秒'; }, 100);
      const step = (k, cls, note) => { const el = C.$(`[data-rs] [data-k="${k}"]`, root); if (!el) return; el.classList.remove('on', 'done', 'bad'); if (cls) el.classList.add(cls); el.textContent = labels[k] + (note ? ' · ' + note : ''); };
      const end = () => { clearInterval(clock); timers.delete(clock); const i = C.$('[data-rs] .hd i', root); if (i) i.remove(); busy = false; lockReal(false); paintList(); };
      const showCode = async html => { const cb = C.$('[data-cb]', root); if (!cb) return; cb.innerHTML = ''; await roll(cb, C.$('[data-ln]', root), html, 1400); };
      const askFix = msg => new Promise(res => {
        after.innerHTML = `<div class="vb-fail out"><b>跑起来报错了</b><div style="margin:6px 0 10px">${C.esc(msg)}</div><div class="row"><button class="btn btn-primary btn-sm" data-fix>让 AI 修一下</button><button class="btn btn-sm btn-ghost" data-give>这次不要了</button></div></div>`;
        C.$('[data-fix]', after).onclick = () => res(true); C.$('[data-give]', after).onclick = () => res(false);
      });
      let k = 0;
      try {
        step(0, 'on');
        const local = checkRules(text);
        const gate = local ? { ok: false, rule: local.k, reason: WHY[local.k] + '（规则直接拦下，没去问 AI）' } : await aiGate(text);
        if (myGen !== gen) return;
        if (!gate.ok) {
          step(0, 'bad', '不做');
          let i = fromIdea;
          if (!i) { i = addIdea(by, text, true); }
          i.status = 'rejected'; i.rule = gate.rule; i.reason = (local ? '' : 'AI 判断：') + (gate.reason || '碰到禁区');
          save();
          stage.innerHTML = `<div class="vb-wait"><div><div style="font-size:34px;color:var(--bad)">✕</div><b style="color:var(--text)">这条不做</b><br>${C.esc(i.reason)}</div></div>`;
          after.innerHTML = `<p class="small muted">已记进点子池「已拒绝」，规则在 <a class="accent" href="#/vibe/settings">设置</a> 里。</p>`;
          C.toast('这条不做：' + ruleName(gate.rule), 'bad');
          end(); return;
        }
        step(0, 'done', `通过 · 「${gate.title}」`); k = 1; step(1, 'on', '大约 10–30 秒');
        let html = await aiWrite(text, by, gate);
        if (myGen !== gen) return;
        step(1, 'done', `${html.split('\n').length} 行`);
        await showCode(html);
        k = 2; step(2, 'on');
        const red = redline(html);
        if (red) {
          step(2, 'on', `${red}，让 AI 改掉`);
          html = await aiFix(html, `代码里${red}，违反约束，请去掉，改成纯本地实现`, by);
          if (myGen !== gen) return;
          await showCode(html);
          const red2 = redline(html);
          if (red2) throw new Error('AI 两次都' + red2 + '，这条先不做');
          step(2, 'done', '已改掉');
        } else step(2, 'done', '干净');
        const nl = html.split('\n').length;
        if (nl > 165) {
          step(2, 'on', `${nl} 行，超过 150 行，让 AI 精简`);
          try { const short = await aiFix(html, `整份文件 ${nl} 行，超过 150 行的上限。功能不变，精简到 150 行以内`, by); if (myGen !== gen) return; if (!redline(short) && short.split('\n').length < nl) { html = short; await showCode(html); } } catch (e) { /* 精简失败就用原版 */ }
          step(2, 'done', `干净 · ${html.split('\n').length} 行`);
        }
        const w = { id: 'w' + (++db.seq), ideaId: fromIdea ? fromIdea.id : null, kind: 'ai', cfg: {}, html, real: true, name: gate.title || '小玩意', plan: gate.plan, by, idea: text, plays: 0, passer: fromIdea && fromIdea.passer ? fromIdea.passer : rint(25, 65), t: NOW(), posted: false, fixes: 0, lines: html.split('\n').length };
        k = 3; step(3, 'on');
        let r = await runOnce(stage, w);
        while (r.s === 'err') {
          if (myGen !== gen) { r.stop(); return; }
          step(3, 'bad', r.msg);
          const go = await askFix(r.msg);
          if (myGen !== gen) { r.stop(); return; }
          if (!go) { r.stop(); after.innerHTML = '<p class="small muted">这次没进作品墙。换个说法再试一次。</p>'; end(); return; }
          after.innerHTML = ''; step(3, 'on', 'AI 在修：' + r.msg);
          r.stop();
          w.html = await aiFix(w.html, r.msg, by); w.fixes++; w.lines = w.html.split('\n').length;
          if (myGen !== gen) return;
          await showCode(w.html);
          r = await runOnce(stage, w);
        }
        stopW = r.stop;
        step(3, 'done', w.fixes ? `修了 ${w.fixes} 次，跑起来了` : '跑起来了');
        w.plays = rint(5, 30);
        let i = fromIdea;
        if (!i) { i = addIdea(by, text, true); }
        i.status = 'built'; i.wid = w.id; w.ideaId = i.id; if (!i.title) i.title = w.name;
        db.works.unshift(w); save();
        k = 4; step(4, 'done', '已放进作品墙');
        if (innerWidth < 1100) stage.closest('.vb-phone').scrollIntoView({ behavior: 'smooth', block: 'start' });
        after.innerHTML = `<div class="out"><div class="vb-done"><span class="done-line">✓ 真做好了 · ${w.lines} 行 · ${((performance.now() - t0) / 1000).toFixed(1)} 秒</span><span class="tag info">真做</span><span class="tag ok">已进作品墙</span></div>
          <div class="row"><button class="btn btn-primary btn-sm" data-post>发回超话</button><button class="btn btn-sm" data-code>看代码</button><a class="btn btn-sm btn-ghost" href="#/vibe/wall">去作品墙</a></div>
          <p class="xs dim" style="margin-top:10px">这是 AI 现写的真代码，跑在断网的沙盒里；不碰女演员的脸和声音，不收任何个人信息。</p></div>`;
        C.$('[data-post]', after).onclick = e => { postWork(w); e.currentTarget.disabled = true; e.currentTarget.textContent = '已发回超话 ✓'; };
        C.$('[data-code]', after).onclick = () => openCode(w);
        C.toast(`「${w.name}」真做好了，已放进作品墙`, 'ok');
        const rt = C.$('[data-rt]', root); if (rt) rt.value = '';
        navCount('wall', db.works.length); navCount('ideas', queueCount());
        end();
      } catch (e) {
        if (myGen !== gen) return;
        step(k, 'bad', '没成');
        stage.innerHTML = `<div class="vb-wait"><div><div style="font-size:34px;color:var(--warn)">!</div>${C.esc(e.message)}</div></div>`;
        after.innerHTML = `<div class="vb-fail"><b>这次没做成</b><div style="margin:6px 0 10px">${C.esc(e.message)}</div><button class="btn btn-sm btn-primary" data-retry>再试一次</button></div>`;
        C.$('[data-retry]', after).onclick = () => realMake(text, by, fromIdea);
        C.toast(e.message, 'bad');
        end();
      }
    };
    if (on) {
      const send = () => { const t = C.$('[data-rt]', root).value.trim(), by = C.$('[data-rby]', root).value.trim(); if (t.length < 4) { C.toast('多说几个字，AI 才知道要做什么', 'bad'); return; } db.nick = by; realMake(t, by || '桐铃新人', null); };
      C.$('[data-real]', root).onclick = send;
      C.$('[data-rt]', root).onkeydown = e => { if (e.key === 'Enter' && !e.isComposing) send(); };
      C.$('[data-realsel]', root).onclick = () => { const i = idea(sel); if (i && statusOf(i) === 'queue') realMake(i.text, i.by, i); };
    }
    paintList();
  }

  /* ---------- 页面：作品墙 ---------- */
  function pageWall() {
    const ui = { f: 'all', sort: 'plays' };
    root.innerHTML = shell('wall', H('作品墙', '所有做出来的小玩意。点开就能玩，能看代码，能发回超话。', `<a class="btn btn-primary" href="#/vibe/build">再做一个 →</a>`), `
      <div class="vb-tools"><div class="chips" data-f>${[['all', '全部'], ['posted', '已发超话'], ['draft', '还没发'], ['week', '本周做的']].map((c, i) => `<button class="chip ${i ? '' : 'on'}" data-v="${c[0]}">${c[1]}</button>`).join('')}</div><span style="flex:1"></span>
        <select class="select" data-sort><option value="plays">玩的人最多</option><option value="passer">路人占比最高</option><option value="new">最新</option><option value="lines">代码最长</option></select></div>
      <div class="viz-card" style="margin-bottom:14px"><div class="vh"><b>${db.works.length} 个小玩意：玩的人多不多，路人占几成</b><span>越靠右上越破圈</span></div><div class="viz-scroll">${Viz.scatter(db.works.map(w => ({ x: w.plays, y: w.passer, l: w.name, r: 4 + Math.min(6, w.lines / 15), c: db.pick && db.pick.wid === w.id ? 'var(--warn)' : 'var(--accent)' })), { w: 760, h: 220, xl: '玩过的人次', yl: '路人占比 %', ymax: 100, yfmt: v => v + '%', label: '作品玩过人次与路人占比' })}</div><p class="vn">圆点越大代码越长。黄色是本周点名的那个。</p></div>
      <div class="vb-wall" data-wall></div>`);
    const paint = () => {
      navCount('wall', db.works.length);
      const L = db.works.filter(w => ui.f === 'all' || (ui.f === 'posted' ? w.posted : ui.f === 'draft' ? !w.posted : NOW() - w.t < 7 * DAY));
      L.sort({ plays: (a, b) => b.plays - a.plays, passer: (a, b) => b.passer - a.passer, new: (a, b) => b.t - a.t, lines: (a, b) => b.lines - a.lines }[ui.sort]);
      C.$('[data-wall]', root).innerHTML = L.length ? L.map((w, n) => {
        const picked = db.pick && db.pick.wid === w.id;
        return `<article class="card hover vb-wcard ${picked ? 'glow' : ''}" data-open="${w.id}" style="animation:fade .4s both;animation-delay:${Math.min(n, 12) * 40}ms">
          <div class="vb-thumb">${thumb(w)}${picked ? '<span class="tag accent">本周点名</span>' : w.pickedWeek ? `<span class="tag warn">第 ${w.pickedWeek} 周点名</span>` : ''}</div>
          <div><b>${C.esc(w.name)}</b><div class="xs muted">@${C.esc(w.by)} 的点子 · ${ago(w.t)}</div></div>
          <div class="vb-stats"><div><b data-plays="${w.id}">${C.fmt(w.plays)}</b>玩过</div><div><b>${w.passer}%</b>路人</div><div><b>${w.lines}</b>行代码</div></div>
          <div class="row" style="gap:6px"><span class="tag accent">AI 生成</span>${w.kind === 'ai' ? '<span class="tag info">真做</span>' : ''}${w.posted ? '<span class="tag ok">已发超话</span>' : '<span class="tag warn">还没发</span>'}<span style="flex:1"></span>
            <button class="btn btn-sm btn-ghost" data-code="${w.id}">看代码</button>${w.posted ? '' : `<button class="btn btn-sm btn-primary" data-post="${w.id}">发回超话</button>`}</div>
        </article>`;
      }).join('') : `<div class="empty" style="grid-column:1/-1"><b>这里还空着</b>去「做出来」让 AI 做一个。</div>`;
      C.$$('[data-open]', root).forEach(c => c.onclick = e => { if (e.target.closest('button')) return; openWork(c.dataset.open, paint); });
      C.$$('[data-code]', root).forEach(b => b.onclick = () => openCode(work(b.dataset.code)));
      C.$$('[data-post]', root).forEach(b => b.onclick = () => { postWork(work(b.dataset.post)); paint(); });
    };
    C.chips(C.$('[data-f]', root), v => { ui.f = v; paint(); });
    C.$('[data-sort]', root).onchange = e => { ui.sort = e.target.value; paint(); };
    paint();
    every(() => { bumpPlays(); thisWeek().forEach(w => { const el = C.$(`[data-plays="${w.id}"]`, root); if (el) el.textContent = C.fmt(w.plays); }); }, 4000);
  }

  /* ---------- 页面：本周点名 ---------- */
  function pagePick() {
    const cw = weekNo(new Date());
    const paint = () => {
      const pickedIds = new Set(db.history.map(h => h.wid));
      const L = thisWeek().filter(w => !pickedIds.has(w.id)).sort((a, b) => heat(b) - heat(a));
      const maxH = Math.max(1, ...L.map(heat));
      const pw = db.pick && work(db.pick.wid);
      root.innerHTML = shell('pick', H(`本周点名 · 第 ${cw} 周`, '本周做出来的小玩意，按玩的人数和路人占比排好了。女演员点一个，置顶一周，再写一句话给作者。'), `
        ${pw ? `<div class="card glow vb-pin" style="margin-bottom:16px"><div class="hd"><h3>★ 本周点名 · 置顶到 ${md(db.pick.t + 7 * DAY)}</h3><span class="tag accent">已置顶</span></div>
          <div class="row between"><div style="min-width:0"><b style="font-size:20px">${C.esc(pw.name)}</b><div class="small muted">@${C.esc(pw.by)}「${C.esc(pw.idea)}」 · <span data-plays="${pw.id}">${C.fmt(pw.plays)}</span> 人玩过 · 路人 ${pw.passer}%</div></div>
          <div class="row"><button class="btn btn-sm" data-play="${pw.id}">玩一下</button><button class="btn btn-sm btn-ghost" data-undo>撤回点名</button></div></div>
          <div class="vb-note">「${C.esc(db.pick.note)}」</div><p class="xs dim" style="margin-top:8px">这句话已发给 @${C.esc(pw.by)}，超话置顶一周。下周一自动进往周记录。</p></div>` : ''}
        <div class="vb-two">
          <div class="card"><div class="hd"><h3>本周榜</h3><span class="xs dim">热度 = 玩的人数 × (1 + 路人占比)</span></div>
            ${L.length ? `<ol class="vb-rank">${L.map((w, n) => { const me = db.pick && db.pick.wid === w.id; return `<li>
              <span class="no">${n + 1}</span>
              <div style="min-width:0"><b>${C.esc(w.name)}</b> ${me ? '<span class="tag accent">已点名</span>' : ''}${w.posted ? '' : ' <span class="tag warn">还没发超话</span>'}
                <div class="xs muted">@${C.esc(w.by)} · <span data-plays="${w.id}">${C.fmt(w.plays)}</span> 人玩过 · 路人 ${w.passer}% · 热度 ${C.fmt(heat(w))}</div>
                <div class="meter"><i style="width:${(heat(w) / maxH * 100).toFixed(1)}%"></i></div></div>
              <div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn btn-sm btn-ghost" data-play="${w.id}">玩</button><button class="btn btn-sm ${me ? '' : 'btn-primary'}" data-pk="${w.id}" ${me ? 'disabled' : ''}>${me ? '已点名' : db.pick ? '改点它' : '点名'}</button></div></li>`; }).join('')}</ol>`
              : `<div class="empty"><b>本周还没有新作品</b>去「做出来」做一个。</div>`}
          </div>
          <div class="card"><div class="hd"><h3>往周点名</h3><span class="small muted">${db.history.length} 周</span></div>
            ${db.history.length ? `<div style="margin-bottom:12px">${Viz.cols([...db.history].sort((a, b) => a.week - b.week).map(h => h.plays), { w: 420, h: 110, labels: [...db.history].sort((a, b) => a.week - b.week).map(h => `第 ${h.week} 周`), vals: true, c: 'var(--accent)', label: '往周点名作品的玩过人次' })}<p class="xs dim" style="margin-top:4px">每周点名那个作品，点名时有多少人玩过。</p></div>` : ''}
            <ul class="list">${db.history.map(h => `<li><span class="avatar">${h.week}</span><div style="flex:1;min-width:0"><b>${C.esc(h.name)}</b> <span class="xs dim">第 ${h.week} 周 · @${C.esc(h.by)}</span><div class="small" style="font-family:var(--kai);margin-top:4px">「${C.esc(h.note)}」</div><div class="xs dim">点名时 ${C.fmt(h.plays)} 人玩过 · 路人 ${h.passer}%</div></div>${work(h.wid) ? `<button class="btn btn-sm btn-ghost" data-play="${h.wid}">玩</button>` : ''}</li>`).join('') || '<li class="muted small">还没有往周记录。</li>'}</ul>
          </div>
        </div>`);
      C.$$('[data-play]', root).forEach(b => b.onclick = () => openWork(b.dataset.play, paint));
      C.$$('[data-pk]', root).forEach(b => b.onclick = () => pickModal(work(b.dataset.pk), paint));
      const u = C.$('[data-undo]', root); if (u) u.onclick = () => { db.pick = null; save(); paint(); C.toast('撤回了，可以重新点'); };
    };
    paint();
    every(() => { bumpPlays(); thisWeek().forEach(w => C.$$(`[data-plays="${w.id}"]`, root).forEach(el => el.textContent = C.fmt(w.plays))); }, 4000);
  }
  function pickModal(w, after) {
    const g0 = gen;
    const d = C.modal(`<div class="panel" style="margin-bottom:14px"><b>${C.esc(w.name)}</b><div class="small muted">@${C.esc(w.by)}「${C.esc(w.idea)}」 · ${C.fmt(w.plays)} 人玩过 · 路人 ${w.passer}%</div></div>
      <label class="small muted">写一句话给作者（会和点名一起发出去）</label>
      <textarea class="textarea" data-note maxlength="40" style="margin-top:6px;min-height:80px" placeholder="说一句为什么喜欢"></textarea>
      <div class="row between xs dim" style="margin:4px 0 10px"><span>不超过 40 个字</span><span data-len>0 / 40</span></div>
      <div class="chips">${NOTE_HINTS.map(h => `<button class="chip" data-h="${C.esc(h)}">${C.esc(h)}</button>`).join('')}</div>
      <p class="xs dim" style="margin-top:12px">点名只能女演员本人点，AI 不替女演员点。置顶一周，下周一自动进往周记录。</p>`,
    { title: '点名这个小玩意', foot: `<button class="btn btn-sm btn-ghost" data-cancel>再想想</button><button class="btn btn-sm btn-primary" data-ok>确认点名</button>` });
    d.classList.add('vb-dlg');
    const ta = C.$('[data-note]', d), len = () => { C.$('[data-len]', d).textContent = `${ta.value.length} / 40`; };
    ta.oninput = len;
    C.$$('[data-h]', d).forEach(c => c.onclick = () => { ta.value = c.dataset.h; len(); });
    C.$('[data-cancel]', d).onclick = () => d.close();
    C.$('[data-ok]', d).onclick = () => {
      const note = ta.value.trim(); if (!note) { C.toast('写一句话再点名', 'bad'); ta.focus(); return; }
      db.pick = { week: weekNo(new Date()), wid: w.id, name: w.name, by: w.by, plays: w.plays, passer: w.passer, note, t: NOW() };
      if (!w.posted) { w.posted = true; w.postedAt = NOW(); }
      save(); d.close(); if (g0 === gen && after) after();
      C.toast(`点名了「${w.name}」，置顶一周，@${w.by} 会收到这句话`, 'ok');
    };
  }

  /* ---------- 页面：设置 ---------- */
  function pageSettings() {
    const S = db.settings;
    const rej = db.ideas.filter(i => i.status === 'rejected');
    root.innerHTML = shell('settings', H('征集与规则', '征集文案、每周做几个、哪些点子不做。改了马上生效，存在这台设备上。'), `
      <div class="vb-two">
        <div class="card"><div class="hd"><h3>征集文案</h3><span class="small muted">发在超话</span></div>
          <textarea class="textarea" data-call style="min-height:150px">${C.esc(S.call)}</textarea>
          <div class="row" style="margin-top:10px"><button class="btn btn-primary btn-sm" data-savecall>保存</button><button class="btn btn-sm" data-copy>复制</button><button class="btn btn-sm btn-ghost" data-def>恢复默认</button></div>
          <div class="xs dim" style="margin:14px 0 6px">超话里看起来是这样</div>
          <div class="vb-post" data-prev></div>
        </div>
        <div class="stack">
          <div class="card"><div class="hd"><h3>每周做几个</h3><span class="small muted">本周已做 ${thisWeek().length} 个</span></div>
            <div class="chips" data-per>${[3, 5, 8, 10, 12].map(n => `<button class="chip ${S.perWeek === n ? 'on' : ''}" data-v="${n}">${n} 个</button>`).join('')}</div>
            <p class="xs dim" style="margin-top:8px">做够了，「做出来」的按钮会停住，等下周。少而精，女演员点名才看得过来。</p></div>
          <div class="card"><div class="hd"><h3>所有小玩意标明「AI 生成」</h3><button class="switch on" disabled aria-label="固定开"></button></div>
            <p class="small muted">固定开，关不掉。每个小玩意顶部和代码开头都写着「AI 生成 · 桐铃 vibecoding」。</p></div>
        </div>
      </div>
      <div class="card" style="margin-top:16px"><div class="hd"><h3>过滤规则</h3><span class="small muted">粉丝投点子时自动过一遍</span></div>
        ${FILTERS.map(f => `<div class="vb-rule"><div><b class="small">${f.name}</b>${f.lock ? '<span class="vb-lock">固定开</span>' : ''}<div class="small muted">${f.d}</div><div class="xs dim">已拒绝 ${rej.filter(i => i.rule === f.k).length} 条</div></div>
          <button class="switch ${f.lock || S.rules[f.k] ? 'on' : ''}" data-rule="${f.k}" ${f.lock ? 'disabled' : ''} aria-label="${f.name}"></button></div>`).join('')}
      </div>
      <div class="card" style="margin-top:16px"><div class="hd"><h3>被拒的点子</h3><span class="tag bad">${rej.length} 条</span></div>
        <ul class="list">${rej.map(i => `<li><span class="avatar" style="--accent:var(--bad);--accent-soft:var(--bad-soft);--accent-line:var(--bad)">✕</span><div style="flex:1;min-width:0"><div class="small">「${C.esc(i.text)}」 <span class="xs dim">@${C.esc(i.by)} · ${ago(i.t)}</span></div><div class="small" style="color:var(--bad);margin-top:2px">原因：${C.esc(i.reason)}</div></div></li>`).join('')}</ul>
      </div>
      <div class="vb-two" style="margin-top:16px">
        <div class="card"><div class="hd"><h3>假数据声明</h3></div><p class="small muted">这里的点子、昵称、票数、玩的人数、城市分布、往周点名，全部是演示用的假数据，不代表任何真实粉丝或真实数据。小玩意不使用女演员的照片、脸和声音；「每天 20:00 更新」是演示设定。</p></div>
        <div class="card"><div class="hd"><h3>重置演示数据</h3></div><p class="small muted">清掉投过的点子、做出来的小玩意、点名、打卡和投票记录，回到第一次打开的样子。</p><button class="btn btn-danger btn-sm" data-reset style="margin-top:12px">重置演示数据</button></div>
      </div>`);
    const prev = () => { C.$('[data-prev]', root).innerHTML = `<div class="who"><span class="avatar">${C.esc(fanName().slice(-1))}</span><b>${C.esc(fanName())} vibecoding</b><span class="dim">· 超话 · 刚刚</span></div>${C.esc(C.$('[data-call]', root).value)}`; };
    C.$('[data-call]', root).oninput = prev; prev();
    C.$('[data-savecall]', root).onclick = () => { S.call = C.$('[data-call]', root).value.trim() || S.call; save(); C.toast('征集文案存好了', 'ok'); };
    C.$('[data-def]', root).onclick = () => { C.$('[data-call]', root).value = seed(prof()).settings.call; prev(); C.toast('恢复成默认了，记得保存'); };
    C.$('[data-copy]', root).onclick = async () => { try { await navigator.clipboard.writeText(C.$('[data-call]', root).value); C.toast('复制好了，去超话粘贴', 'ok'); } catch (e) { C.$('[data-call]', root).select(); C.toast('已选中，按 ⌘C 复制'); } };
    C.chips(C.$('[data-per]', root), v => { S.perWeek = +v; save(); C.toast(`每周做 ${v} 个`, 'ok'); });
    C.$$('[data-rule]:not([disabled])', root).forEach(b => b.onclick = () => { const k = b.dataset.rule; S.rules[k] = !S.rules[k]; save(); b.classList.toggle('on', S.rules[k]); C.toast(`「${FILTERS.find(f => f.k === k).name}」${S.rules[k] ? '开了' : '关了'}`); });
    C.$('[data-reset]', root).onclick = () => {
      const d = C.modal(`<p>会清掉这台设备上本产品的所有演示记录，回到第一次打开的样子。</p>`, { title: '确定重置？', foot: `<button class="btn btn-sm btn-ghost" data-no>取消</button><button class="btn btn-sm btn-danger" data-yes>重置</button>` });
      d.classList.add('vb-dlg');
      C.$('[data-no]', d).onclick = () => d.close();
      C.$('[data-yes]', d).onclick = () => { C.store.del('db'); db = load(); d.close(); C.toast('重置好了', 'ok'); C.go(''); };
    };
  }

  /* ---------- 「今天」页汇总：只读 store，不碰页面 ---------- */
  function summary(ctx) {
    const p = (ctx.profile && ctx.profile.get && ctx.profile.get()) || {};
    let d = ctx.store.get('db', null); if (!d || d.v !== 1) d = seed(p);
    const fmt = ctx.fmt || (n => Number(n).toLocaleString('zh-CN'));
    const now = NOW(), cw = weekNo(new Date());
    const wk = d.works.filter(w => now - w.t < 7 * DAY);
    const pick = d.pick && d.pick.week === cw ? d.pick : null;
    const hist = new Set(d.history.map(h => h.wid));
    const rank = wk.filter(w => !hist.has(w.id)).sort((a, b) => heat(b) - heat(a));
    const queue = d.ideas.filter(i => i.status !== 'rejected' && !i.wid).sort((a, b) => b.votes - a.votes);
    const rej = d.ideas.filter(i => i.status === 'rejected');
    const draft = d.works.filter(w => !w.posted);
    const plays = d.works.reduce((s, w) => s + w.plays, 0);
    const passer = Math.round(d.works.reduce((s, w) => s + w.plays * w.passer, 0) / Math.max(1, plays));
    const real = d.works.filter(w => w.kind === 'ai').length;
    const items = [];
    if (!pick && rank[0]) items.push({ tag: '待点名', text: `第 ${cw} 周还没点名：榜首「${rank[0].name}」，${fmt(rank[0].plays)} 人玩过，路人占 ${rank[0].passer}%`, href: '#/vibe/pick', kind: 'warn' });
    if (draft.length) items.push({ tag: '待发', text: `${draft.length} 个做好的小玩意还没发回超话`, href: '#/vibe/wall', kind: '' });
    if (queue[0]) items.push({ tag: '点子', text: `票最多的点子：「${queue[0].text}」（@${queue[0].by}）`, href: '#/vibe/build/' + queue[0].id, kind: '' });
    const rr = rej.filter(i => now - i.t < 7 * DAY);
    if (rr.length) items.push({ tag: '已拦下', text: `这周 ${rr.length} 条涉及脸、声音或行程的点子被自动拒绝`, href: '#/vibe/settings', kind: 'ok' });
    return {
      viz: typeof Viz !== 'undefined' && d.chart ? `<div class="row" style="gap:14px;flex-wrap:nowrap">${Viz.spark(d.chart, { w: 200, h: 44, c: 'var(--c-vibe)', zero: true, label: '近 14 天玩的人次' })}<span class="small muted">近 14 天每天玩的人次，${d.chart[0] ? `比两周前多 ${Math.round((d.chart[13] / d.chart[0] - 1) * 100)}%` : ''}</span></div>` : '',
      line: pick ? `本周已点名「${pick.name}」，排队 ${queue.length} 条点子` : `本周 ${rank.length} 个小玩意等女演员点名，排队 ${queue.length} 条点子`,
      kpis: [['排队点子', String(queue.length)], ['本周做好', String(wk.length)], ['玩过人次', fmt(plays)], real ? ['AI 真做', String(real)] : ['路人占比', passer + '%']],
      items: items.slice(0, 5),
      year: [`${p.fan || '粉丝'}投来 ${d.ideas.length} 个点子，做出 ${d.works.length} 个小玩意，被玩了 ${fmt(plays)} 次`, `女演员点名了 ${d.history.length + (d.pick ? 1 : 0)} 个粉丝的作品，路人占 ${passer}%`, `${rej.length} 条想用女演员的脸或声音的点子，一条都没做`],
    };
  }

  /* ---------- 注册 ---------- */
  App.register({
    id: 'vibe',
    accent: 'vibe',
    demo: 11,
    name: '桐铃 vibecoding',
    tag: '粉丝',
    short: '粉丝说一句话，AI 做出能直接玩的小玩意；女演员每周点名一个。',
    meta: '点子池 · 7 种小玩意 · 每周点名',
    blurb: '粉丝说一句想要什么，AI 当场做成能玩的小页面。',
    pain: '粉丝想为女演员做点什么，只会做图、剪混剪；AI 做东西已经不用会编程，可没人带着玩，做出来的也只在超话里转。',
    ai: '一句话点子进池子，用到女演员的脸和声音的自动拒绝；AI 读懂、写代码、自己先玩一遍，做好就能玩；女演员每周花 1 分钟点名一个，置顶一周，顺手破圈。',

    summary,

    mount(r, ctx) {
      C = ctx; root = r; gen++; clearAll();
      if (!document.getElementById('vb-css')) { const s = document.createElement('style'); s.id = 'vb-css'; s.textContent = CSS; document.head.append(s); }
      db = load();
      const [page, arg] = (ctx.sub || '').split('/');
      ({ '': pageHome, ideas: pageIdeas, build: () => pageBuild(arg), wall: pageWall, pick: pagePick, settings: pageSettings }[page] || pageHome)();
    },
    unmount() {
      gen++; clearAll();
      document.querySelectorAll('dialog.vb-dlg').forEach(d => d.open && d.close());
      const s = document.getElementById('vb-css'); if (s) s.remove();
    },
  });
})();
