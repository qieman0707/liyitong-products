/* 桐铃小测试 —— 粉丝玩的 + 工作室管的，两面一个产品。
   整个文件包在 IIFE 里，避免和其他产品文件的顶层变量撞名。
   所有人数、比例、记录都是演示用的假数据。 */
(() => {

/* ============================================================
   1. 数据：测试题库
   ============================================================ */
const WEEK = { now: 'W43', range: '10.19–10.25', next: 'W44' };
/* 粉丝名：mount 时从 ctx.profile 读，画卡和文案都用它 */
let FAN = '桐铃';
/* 结果卡背景图：app/assets/quiz-bg-<type>.jpg，按图形对应；没生成出来就回退渐变 */
const SCRIPT_SRC = (typeof document !== 'undefined' && document.currentScript && document.currentScript.src) || '';
const BG_KEY = { camera: 'camera', bell: 'bell', cassette: 'tape', play: 'tv', star: 'star', globe: 'globe' };
const BG = {};
const DRAWN = new Map();

/* 类型测试：qs = [题干, [[选项, 结果键], ...]]；结果 results[键] */
/* 知识测试：qs = [题干, [选项×4], 正确下标, 小注]；结果 tiers 按答对数 */
const TESTS = {
  tongling: {
    id: 'tongling', title: '你是哪种桐铃', kind: 'type', cat: '性格', badge: '本周', week: 'W43', shape: 'bell', pal: ['--c-quiz', '--c-fans'],
    desc: '8 道题，测出你是六种桐铃里的哪一种。结果卡能直接存进相册，晒到超话。', mins: 1,
    base: { plays: 56320, done: .81, share: .34, passer: .31 },
    qs: [
      ['刷到她的新路透，第一反应是？', [['先存图，要原图', 'beauty'], ['去超话打卡报到', 'company'], ['翻出以前的同款造型对比', 'archive'], ['查《美人余》今晚更几集', 'update']]],
      ['手机相册里她的照片是？', [['几千张，按年份分好了', 'beauty'], ['剧照截图，做成了表情包', 'create'], ['2017 年的黄蓉剧照还留着', 'archive'], ['外网存的高清图', 'overseas']]],
      ['9 月 6 日她生日那天，你会？', [['修一张精修图', 'beauty'], ['零点准时写一段长祝福', 'company'], ['剪一个这些年的混剪', 'create'], ['用好几种语言刷生日快乐', 'overseas']]],
      ['《美人余》更新那晚，你在？', [['准点蹲更新，弹幕刷起来', 'update'], ['截最好看的一帧当壁纸', 'beauty'], ['边看边和黄蓉对比演技成长', 'archive'], ['给海外朋友发带字幕的链接', 'overseas']]],
      ['超话里你最常发？', [['每日打卡签', 'company'], ['自己画的图、做的手书', 'create'], ['老剧考古帖', 'archive'], ['剧情追更讨论', 'update']]],
      ['朋友问「她演过什么」，你？', [['甩一张自制作品年表', 'create'], ['从《射雕》一路讲到《美人余》', 'archive'], ['直接拉人进剧', 'update'], ['先发一组美图', 'beauty']]],
      ['深夜睡不着，你会？', [['重温一集《射雕英雄传》', 'archive'], ['去超话看看大家在聊什么', 'company'], ['翻译一段花絮发到外网', 'overseas'], ['再剪一版混剪', 'create']]],
      ['如果能给她留一句话？', [['今天也要好好吃饭', 'company'], ['下一集快点更', 'update'], ['黄蓉永远是神', 'archive'], ['外网也有很多人在等你', 'overseas']]],
    ],
    results: {
      beauty: { name: '美颜型桐铃', shape: 'camera', pal: ['--c-fans', '--c-quiz'], line: '相册里全是她，修图手法比修图师还熟。', tags: ['原图收藏家', '修图一把好手', '壁纸供应商'], match: 'create', pct: 19 },
      company: { name: '陪伴型桐铃', shape: 'bell', pal: ['--c-quiz', '--c-guard'], line: '每天打卡从不断，她的每一步你都在。', tags: ['打卡不断签', '超话常驻', '生日零点准时'], match: 'update', pct: 24 },
      archive: { name: '考古型桐铃', shape: 'cassette', pal: ['--warn', '--c-fans'], line: '从黄蓉开始一部不落，老剧台词张口就来。', tags: ['射雕十刷', '名场面活字典', '年表制作人'], match: 'beauty', pct: 17 },
      update: { name: '追更型桐铃', shape: 'play', pal: ['--c-guard', '--c-vibe'], line: '新剧一更就到，弹幕里永远有你。', tags: ['准点蹲更', '弹幕前排', '剧情讨论主力'], match: 'company', pct: 21 },
      create: { name: '创作型桐铃', shape: 'star', pal: ['--c-vibe', '--c-quiz'], line: '剪辑、手书、表情包，超话一半的好图出自你手。', tags: ['混剪剪刀手', '表情包工厂', '二创担当'], match: 'overseas', pct: 9 },
      overseas: { name: '海外型桐铃', shape: 'globe', pal: ['--c-guard', '--c-fans'], line: '字幕搬运、外网安利，把她的剧带到更远的地方。', tags: ['字幕搬运工', '外网安利员', '多语种祝福'], match: 'archive', pct: 10 },
    },
  },
  level: {
    id: 'level', title: '桐铃等级考', kind: 'score', cat: '知识', badge: '往期', week: 'W42', shape: 'crown', pal: ['--warn', '--c-quiz'],
    desc: '6 道送分题，考考你对她了解多少。答完出一张等级证书卡。', mins: 1,
    base: { plays: 31870, done: .88, share: .29, passer: .22 },
    qs: [
      ['她的粉丝名叫？', ['桐心', '桐铃', '一桐', '铃铛'], 1, '粉丝名是「桐铃」。'],
      ['她的生日是？', ['6 月 9 日', '9 月 16 日', '9 月 6 日', '10 月 6 日'], 2, '1990 年 9 月 6 日，生于济南。'],
      ['让她成名的，是 2017 年哪部剧里的角色？', ['《射雕英雄传》黄蓉', '《鹤唳华亭》', '《书卷一梦》', '《美人余》'], 0, '2017 版《射雕英雄传》里的黄蓉。'],
      ['她毕业于？', ['北京电影学院', '中央戏剧学院', '上海戏剧学院', '北京舞蹈学院'], 3, '北京舞蹈学院民族民间舞系。'],
      ['《我不是大师》里，她一人演了几个身份？', ['两个', '三个', '五个', '七个'], 2, '江飞燕等五个身份。'],
      ['《美人余》在哪个平台播出？', ['腾讯视频', '爱奇艺', '优酷', '芒果 TV'], 0, '腾讯视频播出，东方卫视同步。'],
    ],
    tiers: [
      { min: 0, name: '见习桐铃', shape: 'bell', pal: ['--c-guard', '--c-quiz'], line: '刚入坑的新朋友，欢迎来到桐铃大家庭。', tags: ['新朋友', '欢迎入坑'] },
      { min: 3, name: '正式桐铃', shape: 'star', pal: ['--c-quiz', '--c-fans'], line: '基本功扎实，超话里的事都门儿清。', tags: ['基本功扎实', '超话熟人'] },
      { min: 5, name: '资深桐铃', shape: 'crown', pal: ['--warn', '--c-quiz'], line: '只错一道，差一点就满分了。', tags: ['资深', '差一点满分'] },
      { min: 6, name: '桐铃本铃', shape: 'crown', pal: ['--warn', '--c-fans'], line: '全对！她的事你比日历记得还清楚。', tags: ['满分', '活百科'] },
    ],
  },
  huangrong: {
    id: 'huangrong', title: '黄蓉接龙测验', kind: 'score', cat: '知识', badge: '往期', week: 'W41', shape: 'flower', pal: ['--c-fans', '--warn'],
    desc: '射雕考古专场：接上半句、认出名场面。题目按金庸原著设定出。', mins: 1,
    base: { plays: 24410, done: .84, share: .26, passer: .18 },
    qs: [
      ['黄蓉给洪七公做的菜：「玉笛谁家听＿＿」', ['折柳', '落梅', '春风', '秋声'], 1, '「玉笛谁家听落梅」，一道菜名。'],
      ['桃花岛的对联：「桃花影落飞神剑，碧海潮生＿＿」', ['弄琴弦', '听潮声', '按玉箫', '送归舟'], 2, '「碧海潮生按玉箫」。'],
      ['黄蓉第一次见郭靖时，是什么打扮？', ['小乞丐', '富家公子', '渔家女', '道姑'], 0, '张家口那场，她扮成小乞丐。'],
      ['黄蓉后来当上了哪个帮的帮主？', ['铁掌帮', '全真教', '桃花帮', '丐帮'], 3, '洪七公把打狗棒传给了她。'],
      ['黄蓉的爹爹是？', ['洪七公', '黄药师', '欧阳锋', '周伯通'], 1, '桃花岛主「东邪」黄药师。'],
    ],
    tiers: [
      { min: 0, name: '路过的江湖客', shape: 'fan', pal: ['--c-guard', '--c-quiz'], line: '江湖路远，回去重温一遍《射雕》再来。', tags: ['待考古', '射雕新人'] },
      { min: 2, name: '桃花岛常客', shape: 'flower', pal: ['--c-fans', '--c-quiz'], line: '名场面记得七七八八，再刷一遍就满分。', tags: ['考古中', '桃花岛熟客'] },
      { min: 4, name: '蓉儿本蓉', shape: 'flute', pal: ['--c-fans', '--warn'], line: '接龙全在线，射雕考古你是专业的。', tags: ['考古专家', '射雕活字典'] },
    ],
  },
  role: {
    id: 'role', title: '你和她哪部剧的角色最像', kind: 'type', cat: '性格', badge: '往期', week: 'W40', shape: 'fan', pal: ['--c-quiz', '--c-guard'],
    desc: '4 道题，看看你的性格最像她演过的哪个角色。', mins: 1,
    base: { plays: 41050, done: .86, share: .37, passer: .35 },
    qs: [
      ['遇到难题你会？', [['想个鬼点子绕过去', 'hr'], ['咬牙扛住，慢慢想办法', 'lw'], ['换个身份、换个思路', 'jf'], ['先看下一集再说', 'my']]],
      ['朋友怎么评价你？', [['聪明又护短', 'hr'], ['温柔但有主见', 'lw'], ['百变，猜不透', 'jf'], ['靠谱的追剧搭子', 'my']]],
      ['最喜欢的场景？', [['江湖和集市', 'hr'], ['书房和宫墙', 'lw'], ['热闹的城市街头', 'jf'], ['古装大戏的灯火', 'my']]],
      ['一句话形容理想生活？', [['吃好玩好，身边有人', 'hr'], ['守住心里那件事', 'lw'], ['每天都不重样', 'jf'], ['剧有得追，日子有盼头', 'my']]],
    ],
    results: {
      hr: { name: '黄蓉', sub: '《射雕英雄传》', shape: 'flute', pal: ['--c-fans', '--warn'], line: '机灵、嘴快、主意多，认定的人就护到底。', tags: ['机灵鬼', '护短'], pct: 34 },
      lw: { name: '陆文昔', sub: '《鹤唳华亭》', shape: 'moon', pal: ['--c-quiz', '--c-guard'], line: '外柔内刚，心里有一盏灯，再难也往前走。', tags: ['外柔内刚', '有主见'], pct: 22 },
      jf: { name: '江飞燕', sub: '《我不是大师》', shape: 'star', pal: ['--c-vibe', '--c-guard'], line: '一人千面，换个身份照样活得漂亮。', tags: ['百变', '一人千面'], pct: 27 },
      my: { name: '《美人余》里的她', sub: '在播', shape: 'fan', pal: ['--c-fans', '--c-quiz'], line: '在播的那个她，每晚更新，你都在。', tags: ['在播', '准点追更'], pct: 17 },
    },
  },
  checkin: {
    id: 'checkin', title: '追剧打卡签 · 美人余', kind: 'type', cat: '签', badge: '往期', week: 'W42', shape: 'stick', pal: ['--c-fans', '--c-quiz'], kicker: '今天抽到',
    desc: '3 道题抽一支今天的追剧签，看完《美人余》来打个卡。', mins: 1,
    base: { plays: 18920, done: .91, share: .41, passer: .14 },
    qs: [
      ['今天看《美人余》的心情？', [['激动，等了一整天', 'up'], ['平静，攒着再看', 'mid'], ['着急，想快进', 'fun'], ['上头，想回看', 'love']]],
      ['你通常在哪看剧？', [['床上，被子裹好', 'up'], ['沙发，零食摆好', 'mid'], ['通勤路上', 'fun'], ['书桌前，开着弹幕', 'love']]],
      ['抽签前许个愿？', [['今晚多更一集', 'up'], ['周末一口气看完', 'mid'], ['剧情别太虐', 'fun'], ['名场面多来几个', 'love']]],
    ],
    results: {
      up: { name: '上上签 · 准点追更', shape: 'stick', pal: ['--c-fans', '--c-quiz'], line: '今晚更新准时到，剧情不卡，弹幕全是好词。', tags: ['宜追更', '宜发弹幕'], pct: 31 },
      mid: { name: '上签 · 攒集大吉', shape: 'calendar', pal: ['--c-quiz', '--c-guard'], line: '攒到周末一口气看完，快乐加倍。', tags: ['宜囤剧', '忌剧透'], pct: 26 },
      fun: { name: '中签 · 倍速慎用', shape: 'play', pal: ['--c-guard', '--c-vibe'], line: '慢一点看，名场面都在细节里。', tags: ['宜一倍速', '忌跳集'], pct: 18 },
      love: { name: '大吉 · 名场面', shape: 'star', pal: ['--warn', '--c-fans'], line: '今晚必有一个名场面，记得截图。', tags: ['宜截图', '宜回看'], pct: 25 },
    },
  },
  bday: {
    id: 'bday', title: '生日签 · 9·6 限定', kind: 'type', cat: '签', badge: '限定', week: 'W36', shape: 'cake', pal: ['--c-fans', '--warn'], kicker: '给她抽到',
    desc: '她生日那周的限定签：3 道题，替她抽一支生日祝福签。', mins: 1,
    base: { plays: 27600, done: .93, share: .45, passer: .27 },
    qs: [
      ['想送她什么？', [['一块大蛋糕', 'cake'], ['一场烟花', 'fire'], ['一封长信', 'letter'], ['一束桃花', 'peach']]],
      ['零点那一刻你在？', [['守着超话刷祝福', 'fire'], ['写祝福写到一半', 'letter'], ['给自己切一块蛋糕', 'cake'], ['早睡了，起床补上', 'peach']]],
      ['最想对她说？', [['生日快乐，天天开心', 'cake'], ['新的一岁，好戏连连', 'fire'], ['谢谢这些年的好角色', 'letter'], ['身体健康最重要', 'peach']]],
    ],
    results: {
      cake: { name: '蛋糕签', shape: 'cake', pal: ['--c-fans', '--warn'], line: '新的一岁，甜的多一点，累的少一点。', tags: ['甜度满分', '9·6 快乐'], pct: 29 },
      fire: { name: '烟花签', shape: 'star', pal: ['--c-quiz', '--c-fans'], line: '新的一岁，好戏一部接一部。', tags: ['好戏连连', '9·6 快乐'], pct: 24 },
      letter: { name: '长信签', shape: 'chat', pal: ['--c-guard', '--c-quiz'], line: '这些年的每个角色，都有人记得。', tags: ['被记得', '9·6 快乐'], pct: 21 },
      peach: { name: '桃花签', shape: 'flower', pal: ['--c-fans', '--c-vibe'], line: '照顾好自己，按时吃饭，好好睡觉。', tags: ['身体健康', '9·6 快乐'], pct: 26 },
    },
  },
};
const BASE_ORDER = ['tongling', 'level', 'checkin', 'huangrong', 'role', 'bday'];

/* AI 初稿池：工作室后台里轮换，「她点头发布」后进测试库 */
const POOL = {
  routine: {
    id: 'routine', title: '你的追剧作息是哪种', kind: 'type', cat: '性格', shape: 'moon', pal: ['--c-quiz', '--c-guard'], topic: 'meirenyu',
    desc: '4 道题，测测你追《美人余》是哪种作息。', mins: 1, est: { share: .31, done: .82 },
    qs: [
      ['《美人余》几点更新，你就几点在？', [['准点在线，弹幕抢前排', 'r1'], ['先攒着，周末一口气看', 'r2'], ['开 1.5 倍先看剧情', 'r3'], ['看完一遍再回头抠细节', 'r4']]],
      ['追剧时的零食是？', [['泡面，跟更新一起开', 'r1'], ['一整箱，囤够周末', 'r2'], ['不吃，手要拖进度条', 'r3'], ['一杯茶，慢慢看', 'r4']]],
      ['剧情卡在关键处断更，你？', [['盯着倒计时等下一集', 'r1'], ['正好，等攒满再说', 'r2'], ['先去搜剧情走向', 'r3'], ['把这集再看一遍找伏笔', 'r4']]],
      ['看完一集最想做？', [['马上去超话打卡', 'r1'], ['继续下一集，停不下来', 'r2'], ['看解说补细节', 'r3'], ['截图存最喜欢的镜头', 'r4']]],
    ],
    results: {
      r1: { name: '准点蹲更型', shape: 'moon', pal: ['--c-quiz', '--c-guard'], line: '更新提醒比闹钟还准，弹幕前排总有你。', tags: ['准点', '弹幕前排'], pct: 33 },
      r2: { name: '攒集一口气型', shape: 'calendar', pal: ['--c-fans', '--c-quiz'], line: '平时忍住不看，周末一口气追完最过瘾。', tags: ['囤剧', '周末狂欢'], pct: 27 },
      r3: { name: '倍速快进型', shape: 'play', pal: ['--c-guard', '--c-vibe'], line: '效率第一，剧情一个不漏。', tags: ['1.5 倍速', '效率派'], pct: 18 },
      r4: { name: '二刷细品型', shape: 'cassette', pal: ['--warn', '--c-fans'], line: '每一帧都值得回看，伏笔全被你找到。', tags: ['二刷', '伏笔猎人'], pct: 22 },
    },
  },
  look: {
    id: 'look', title: '古装造型你会选哪套', kind: 'type', cat: '性格', shape: 'fan', pal: ['--c-fans', '--warn'], topic: 'photo',
    desc: '4 道题，配出最适合你的一套古装造型。', mins: 1, est: { share: .38, done: .86 },
    qs: [
      ['出门第一件事？', [['背上剑就走', 'x'], ['带上一本书', 'g'], ['换上最不起眼的衣服溜出去', 'q'], ['挑一支最配的发簪', 'h']]],
      ['最喜欢的配色？', [['黑与红', 'x'], ['月白与青', 'g'], ['杏黄与灰', 'q'], ['金与绯', 'h']]],
      ['遇到麻烦？', [['直接出手', 'x'], ['先写信问清楚', 'g'], ['想个鬼点子绕过去', 'q'], ['端住，气场先到', 'h']]],
      ['最想拍的镜头？', [['屋檐上飞身而过', 'x'], ['窗下抄书', 'g'], ['集市里讨价还价', 'q'], ['长阶上一步步走上去', 'h']]],
    ],
    results: {
      x: { name: '江湖侠女', shape: 'fan', pal: ['--c-fans', '--bad'], line: '一身利落，说走就走。', tags: ['利落', '江湖气'], pct: 29 },
      g: { name: '书卷闺秀', shape: 'moon', pal: ['--c-quiz', '--c-guard'], line: '安安静静，心里有丘壑。', tags: ['书卷气', '温柔'], pct: 23 },
      q: { name: '灵动俏丫头', shape: 'flower', pal: ['--c-fans', '--c-vibe'], line: '主意最多，走到哪都热闹。', tags: ['机灵', '热闹'], pct: 26 },
      h: { name: '宫廷华服', shape: 'crown', pal: ['--warn', '--c-quiz'], line: '一出场，满屏都是你的气场。', tags: ['气场', '华丽'], pct: 22 },
    },
  },
  taohua: {
    id: 'taohua', title: '桃花岛入岛考', kind: 'score', cat: '知识', shape: 'flower', pal: ['--c-fans', '--c-quiz'], topic: 'huangrong',
    desc: '4 道射雕原著题，答对才能上桃花岛。', mins: 1, est: { share: .27, done: .79 },
    qs: [
      ['桃花岛岛主黄药师的外号是？', ['西毒', '东邪', '南帝', '北丐'], 1, '「东邪」黄药师。'],
      ['黄药师用玉箫吹的曲子叫？', ['碧海潮生曲', '广陵散', '平沙落雁', '十面埋伏'], 0, '《碧海潮生曲》。'],
      ['黄蓉贴身穿的桃花岛宝贝是？', ['金丝甲', '天蚕衣', '软猬甲', '乌蚕衣'], 2, '软猬甲，刀枪不入。'],
      ['桃花岛的疗伤灵药叫？', ['黑玉断续膏', '天王保命丹', '大还丹', '九花玉露丸'], 3, '九花玉露丸。'],
    ],
    tiers: [
      { min: 0, name: '迷路的访客', shape: 'globe', pal: ['--c-guard', '--c-quiz'], line: '桃花阵太绕，下次带上地图。', tags: ['迷路中', '再来一次'] },
      { min: 2, name: '岛上常客', shape: 'flower', pal: ['--c-fans', '--c-quiz'], line: '桃花岛的路你认得一半。', tags: ['常客', '认路中'] },
      { min: 4, name: '岛主座上宾', shape: 'flute', pal: ['--c-fans', '--warn'], line: '全对，黄岛主请你喝茶。', tags: ['全对', '座上宾'] },
    ],
  },
  post: {
    id: 'post', title: '你的超话发帖人格', kind: 'type', cat: '性格', shape: 'chat', pal: ['--c-guard', '--c-quiz'], topic: 'daily',
    desc: '4 道题，看看你在超话里是哪种发帖人。', mins: 1, est: { share: .35, done: .87 },
    qs: [
      ['每天第一次打开超话？', [['先签到再说', 'a'], ['看看有没有新路透可以分析', 'b'], ['找素材做图', 'c'], ['把好帖转给朋友', 'd']]],
      ['你的帖子通常多长？', [['一句话加一张图', 'a'], ['一千字起步', 'b'], ['一张图就够了', 'c'], ['一个链接加一句「快看」', 'd']]],
      ['最开心的时刻？', [['连续签到满一百天', 'a'], ['长文被加精', 'b'], ['表情包被到处转', 'c'], ['安利成功一个新桐铃', 'd']]],
      ['超话吵起来了，你？', [['继续安静打卡', 'a'], ['写一篇来龙去脉', 'b'], ['发个表情包缓和一下', 'c'], ['转一点好剧，换个话题', 'd']]],
    ],
    results: {
      a: { name: '早安打卡人', shape: 'calendar', pal: ['--c-quiz', '--c-guard'], line: '雷打不动的签到，超话的早安由你开启。', tags: ['签到', '早安'], pct: 36 },
      b: { name: '长文分析人', shape: 'chat', pal: ['--c-guard', '--c-quiz'], line: '一千字起步，条理清楚，常被加精。', tags: ['长文', '加精'], pct: 19 },
      c: { name: '表情包工厂', shape: 'star', pal: ['--c-vibe', '--c-quiz'], line: '一张图胜过千言，超话快乐源泉。', tags: ['做图', '快乐源泉'], pct: 24 },
      d: { name: '安利搬运工', shape: 'globe', pal: ['--c-guard', '--c-fans'], line: '好东西都要分享，新桐铃一半是你拉来的。', tags: ['安利', '拉新'], pct: 21 },
    },
  },
  treasure: {
    id: 'treasure', title: '射雕里你是哪件宝贝', kind: 'type', cat: '性格', shape: 'flute', pal: ['--c-fans', '--c-guard'], topic: 'huangrong',
    desc: '4 道题，测测你是射雕里的哪件宝贝。', mins: 1, est: { share: .36, done: .84 },
    qs: [
      ['朋友眼里的你？', [['有才，懂浪漫', 'xiao'], ['靠谱，能扛事', 'bang'], ['嘴硬心软，护短', 'jia'], ['贴心，关键时刻救场', 'wan']]],
      ['周末怎么过？', [['听歌、练琴', 'xiao'], ['去运动出一身汗', 'bang'], ['宅家，谁也别打扰', 'jia'], ['陪朋友逛街', 'wan']]],
      ['你最擅长？', [['让气氛变好', 'xiao'], ['解决问题', 'bang'], ['保护身边的人', 'jia'], ['安慰人', 'wan']]],
      ['看射雕最喜欢哪段？', [['桃花岛上的箫声', 'xiao'], ['打狗棒法传给黄蓉', 'bang'], ['蓉儿伶牙俐齿怼人', 'jia'], ['牛家村密室疗伤', 'wan']]],
    ],
    results: {
      xiao: { name: '玉箫', shape: 'flute', pal: ['--c-guard', '--c-quiz'], line: '有才有趣，一开口气氛就好了。', tags: ['浪漫', '有才'], pct: 24 },
      bang: { name: '打狗棒', shape: 'staff', pal: ['--c-vibe', '--c-guard'], line: '靠得住，大事交给你最放心。', tags: ['靠谱', '扛事'], pct: 22 },
      jia: { name: '软猬甲', shape: 'shield', pal: ['--warn', '--c-fans'], line: '外面带刺，里面最软。', tags: ['护短', '嘴硬心软'], pct: 27 },
      wan: { name: '九花玉露丸', shape: 'pill', pal: ['--c-fans', '--c-quiz'], line: '关键时刻总能救场。', tags: ['贴心', '救场'], pct: 27 },
    },
  },
  season: {
    id: 'season', title: '你是哪个季节的桐铃', kind: 'type', cat: '性格', shape: 'sun', pal: ['--warn', '--c-fans'], topic: 'bday',
    desc: '4 道题，测测你是春夏秋冬哪一季的桐铃。', mins: 1, est: { share: .33, done: .88 },
    qs: [
      ['最喜欢的天气？', [['微风', 'spring'], ['大太阳', 'summer'], ['凉快的晴天', 'autumn'], ['下雪天', 'winter']]],
      ['周末最想做？', [['出门看花', 'spring'], ['游泳、吃冰', 'summer'], ['窝着追剧', 'autumn'], ['火锅配热茶', 'winter']]],
      ['你的手机壁纸？', [['一张剧照，粉色调', 'spring'], ['一张亮闪闪的路透', 'summer'], ['一张古装定妆', 'autumn'], ['一张雪景', 'winter']]],
      ['她生日在 9 月，你会怎么庆祝？', [['送一束花', 'spring'], ['线下应援热热闹闹', 'summer'], ['重温一部老剧', 'autumn'], ['写一封长信', 'winter']]],
    ],
    results: {
      spring: { name: '春日桐铃', shape: 'flower', pal: ['--c-fans', '--c-vibe'], line: '温柔又有生气，像刚开的花。', tags: ['温柔', '有生气'], pct: 25 },
      summer: { name: '盛夏桐铃', shape: 'sun', pal: ['--warn', '--c-fans'], line: '热情满格，走到哪亮到哪。', tags: ['热情', '闪亮'], pct: 28 },
      autumn: { name: '金秋桐铃', shape: 'moon', pal: ['--warn', '--c-quiz'], line: '安静念旧，和她一样是秋天生的。', tags: ['念旧', '秋天'], pct: 27 },
      winter: { name: '初雪桐铃', shape: 'star', pal: ['--c-guard', '--c-quiz'], line: '外冷内热，认定了就一直在。', tags: ['长情', '外冷内热'], pct: 20 },
    },
  },
};

const TOPICS = [
  ['meirenyu', '《美人余》追更', 128, '每晚更新后的剧情讨论、弹幕名场面'],
  ['huangrong', '黄蓉考古', 143, '2017 版《射雕英雄传》名场面、原著梗'],
  ['photo', '剧照修图', 96, '精修图、壁纸、造型对比'],
  ['daily', '超话日常', 210, '打卡、签到、早安帖'],
  ['bday', '生日与季节', 64, '9 月 6 日生日相关、季节应援'],
  ['dashi', '《我不是大师》一人五角', 71, '五个身份的讨论'],
  ['overseas', '海外安利', 38, '外网字幕、安利帖'],
];

const TREND = { weeks: ['W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42', 'W43'], plays: [27600, 12400, 14900, 19300, 41050, 24410, 50790, 56320], shares: [12420, 3470, 4320, 5590, 15190, 6350, 17000, 19150] };
const WISHES = [
  '新的一岁，好好吃饭、好好睡觉，追的剧都有好结局。',
  '把今天过成喜欢的样子，桐铃们都在。',
  '愿你像黄蓉一样机灵，也像她一样被好好爱着。',
  '生日这天，所有更新都准时，所有愿望都算数。',
  '又长大一岁，热爱不减，快乐加倍。',
  '愿新的一岁，晴天多一点，烦恼少一点。',
];
const MOODS = { 上头: '今晚这集太上头，明天还要准点来。', 心碎: '虐到了，抱抱自己，明天接着追。', 笑疯: '笑到停不下来，弹幕全是哈哈哈。', 等更: '刚看完就开始等下一集。' };
/* 生日签 / 打卡卡的底色：纸色和三种极淡的单色，线条一律是本产品的紫 */
const CARD_PALS = [['纸白', '#fbfaf8'], ['淡紫', '#f1eef7'], ['淡灰', '#f3f1ec'], ['淡粉', '#f8f1f3']];
const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

/* ============================================================
   2. 状态（ctx.store 持久化，单键 state）
   ============================================================ */
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => ymd(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return ymd(d); };
const dot = s => String(s).replace(/-/g, '.');

function defaults() {
  const t = today();
  return {
    v: 1, local: {}, live: 0, typeLocal: {}, results: [], play: null, real: [],
    drafts: [
      { slot: 1, key: 'routine', status: 'review', ver: 1 },
      { slot: 2, key: 'look', status: 'review', ver: 1 },
      { slot: 3, key: 'taohua', status: 'review', ver: 1 },
    ],
    redo: 0, published: 0,
    log: [
      { t: '10-20 09:00', k: 'ai', x: 'AI 从超话收了 750 条话题素材，按 7 个话题归类。' },
      { t: '10-21 10:30', k: 'ai', x: 'AI 出了 W44 的 3 个初稿：追剧作息、古装造型、桃花岛入岛考。' },
      { t: '10-21 10:31', k: 'sys', x: '3 个初稿进入「等你看」，发布前必须你点头。' },
    ],
    settings: { topics: Object.fromEntries(TOPICS.map(x => [x[0], true])), day: 4, time: '20:00' },
    checkins: [-5, -4, -3, -2, -1].map(n => addDays(t, n)),
    form: { tab: 'bday', nick: '', date: t, wish: WISHES[0], pal: 0, drama: '', ep: 12, mood: '上头' },
  };
}

/* 纯数据助手：不碰 DOM，summary() 也用 */
const TYPE_KEYS = ['beauty', 'company', 'archive', 'update', 'create', 'overseas'];
const QZ_PAL = ['var(--accent)', 'var(--c-fans)', 'var(--c-guard)', 'var(--c-vibe)', 'var(--warn)', 'var(--dim)'];
const REAL_PALS = [['--c-quiz', '--c-fans'], ['--c-guard', '--c-quiz'], ['--c-fans', '--warn'], ['--c-vibe', '--c-guard']];
const loadState = store => Object.assign(defaults(), store.get('state', {}));
const asTest = (key, extra) => ({ ...POOL[key], week: WEEK.next, base: { plays: 0, done: POOL[key].est.done, share: POOL[key].est.share, passer: .3 }, ...extra });
const realAsTest = (r, extra) => ({ id: r.id, title: r.title, kind: 'type', cat: '性格', shape: 'bell', pal: r.pal, desc: r.desc, mins: 1, week: WEEK.next, qs: r.qs, results: r.results, real: true, est: { share: .33, done: .85 }, base: { plays: 0, done: .85, share: .33, passer: .3 }, ...extra });
const liveDrafts = st => [
  ...st.drafts.filter(d => d.status === 'live').map(d => asTest(d.key, { badge: '新' })),
  ...(st.real || []).filter(r => r.status === 'live').map(r => realAsTest(r, { badge: '新' })),
];
const libTests = st => [...BASE_ORDER.map(id => TESTS[id]), ...liveDrafts(st)];
const testById = (st, id) => {
  if (TESTS[id]) return TESTS[id];
  const live = liveDrafts(st).find(t => t.id === id); if (live) return live;
  if (POOL[id]) return asTest(id, { badge: '预览', preview: true });
  const r = (st.real || []).find(x => x.id === id); return r ? realAsTest(r, { badge: '预览', preview: true }) : null;
};
const statOf = (st, t) => {
  const l = st.local[t.id] || { plays: 0, done: 0, shares: 0 }; const live = t.id === 'tongling' ? st.live : 0;
  const bp = t.base.plays + live; const plays = bp + l.plays;
  const done = Math.round(bp * t.base.done) + l.done; const shares = Math.round(bp * t.base.done * t.base.share) + l.shares;
  return { plays, done, shares, doneRate: plays >= 30 ? done / plays : t.base.done, shareRate: done >= 30 ? shares / done : t.base.share, passer: t.base.passer };
};
const pendingOf = st => st.drafts.filter(d => d.status === 'review').length + (st.real || []).filter(r => r.status === 'review').length;

/* AI 出的题 → 和题库同一结构；类型沿用六种 */
function normalizeSet(j, fan) {
  const qs = (Array.isArray(j && j.qs) ? j.qs : []).slice(0, 8).map(q => {
    const used = new Set();
    const o = (q.o || q.options || []).slice(0, 4).map(x => {
      const t = String((x && (x.t || x.text)) || x || '').trim().slice(0, 20);
      let k = x && TYPE_KEYS.includes(x.k) ? x.k : null;
      if (!k || used.has(k)) k = TYPE_KEYS.find(z => !used.has(z));
      used.add(k); return [t, k];
    });
    return [String(q.q || q.question || '').trim().slice(0, 40), o];
  }).filter(q => q[0] && q[1].length === 4 && q[1].every(o => o[0]));
  if (qs.length < 6) throw new Error(`AI 只出了 ${qs.length} 道能用的题，再点一次试试`);
  const base = TESTS.tongling.results; const types = (j && j.types) || {};
  const results = {};
  TYPE_KEYS.forEach(k => {
    const a = types[k] || {};
    results[k] = { ...base[k], name: base[k].name.replace('桐铃', fan), line: String(a.line || base[k].line).slice(0, 30), tags: (Array.isArray(a.tags) && a.tags.length ? a.tags : base[k].tags).slice(0, 3).map(s => String(s).slice(0, 8)) };
  });
  return { title: String((j && j.title) || `你是哪种${fan}`).slice(0, 16), desc: String((j && j.desc) || `${qs.length} 道题，测测你是哪种${fan}。`).slice(0, 60), qs, results };
}

/* ============================================================
   3. 画图：图形、结果卡、封面（canvas，颜色从 CSS 变量读）
   ============================================================ */
/* 结果卡、封面是成品图，配色固定，不跟页面主题走 */
/* 画布配色固定：纸色底、墨色字、本产品的紫一种强调色、细线图形 */
const INK = { paper: '#fbfaf8', tint: '#f1eef7', ink: '#1c1c1c', muted: '#6e6a66', line: '#e2ddd5', accent: '#4b3d84' };
const cssv = (n, d = '') => (typeof document !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue(n).trim()) || d;
const SANS = () => cssv('--sans', 'sans-serif');
const SERIF = () => cssv('--serif', 'serif');
/* drawShape 的笔：默认细线紫；结果卡用 */
let PEN = { stroke: INK.accent, fill: 'rgba(75,61,132,.06)', solid: 'rgba(75,61,132,.14)', lw: .022, outline: true };
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function sparkle(g, x, y, r) { g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.closePath(); }
const FS = g => { g.fill(); g.stroke(); };

function drawShape(g, key, cx, cy, s) {
  g.save(); g.translate(cx, cy);
  g.strokeStyle = PEN.stroke; g.fillStyle = PEN.fill; g.lineWidth = Math.max(1.4, s * PEN.lw); g.lineJoin = 'round'; g.lineCap = 'round';
  const W = PEN.solid;
  /* 细线模式：所有实心块都补一道描边，看起来是线稿 */
  if (PEN.outline) { const f = g.fill.bind(g); g.fill = (...a) => { f(...a); g.stroke(); }; }
  switch (key) {
    case 'camera':
      rr(g, -s * .45, -s * .88, s * .5, s * .3, s * .08); FS(g);
      rr(g, -s, -s * .65, s * 2, s * 1.4, s * .24); FS(g);
      g.beginPath(); g.arc(0, .05 * s, s * .46, 0, 7); g.stroke();
      g.beginPath(); g.arc(0, .05 * s, s * .3, 0, 7); g.stroke();
      g.fillStyle = W; g.beginPath(); g.arc(0, .05 * s, s * .12, 0, 7); g.fill();
      g.beginPath(); g.arc(s * .7, -s * .38, s * .07, 0, 7); g.fill();
      sparkle(g, s * 1.05, -s * .95, s * .2); g.fill(); break;
    case 'bell':
      g.beginPath(); g.moveTo(-s * .82, s * .5); g.lineTo(-s * .62, s * .28);
      g.bezierCurveTo(-s * .62, -s * .5, -s * .45, -s * .8, 0, -s * .8); g.bezierCurveTo(s * .45, -s * .8, s * .62, -s * .5, s * .62, s * .28);
      g.lineTo(s * .82, s * .5); g.closePath(); FS(g);
      g.beginPath(); g.arc(0, -s * .9, s * .1, 0, 7); g.stroke();
      g.fillStyle = W; g.beginPath(); g.arc(0, s * .66, s * .14, 0, 7); g.fill();
      g.beginPath(); g.arc(0, 0, s * 1.08, -.55, -.12); g.stroke(); g.beginPath(); g.arc(0, 0, s * 1.08, Math.PI + .12, Math.PI + .55); g.stroke(); break;
    case 'cassette':
      rr(g, -s, -s * .66, s * 2, s * 1.32, s * .12); FS(g);
      rr(g, -s * .62, -s * .38, s * 1.24, s * .52, s * .26); g.stroke();
      for (const x of [-.33, .33]) { g.beginPath(); g.arc(x * s, -s * .12, s * .16, 0, 7); g.stroke(); for (let a = 0; a < 3; a++) { const r = a * 2.094; g.beginPath(); g.moveTo(x * s, -s * .12); g.lineTo(x * s + Math.cos(r) * s * .16, -s * .12 + Math.sin(r) * s * .16); g.stroke(); } }
      g.beginPath(); g.moveTo(-s * .55, s * .66); g.lineTo(-s * .42, s * .36); g.lineTo(s * .42, s * .36); g.lineTo(s * .55, s * .66); g.stroke(); break;
    case 'play':
      rr(g, -s, -s * .72, s * 2, s * 1.26, s * .16); FS(g);
      g.fillStyle = W; g.beginPath(); g.moveTo(-s * .22, -s * .4); g.lineTo(s * .34, -s * .09); g.lineTo(-s * .22, s * .22); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(-s * .85, s * .82); g.lineTo(s * .85, s * .82); g.stroke();
      g.lineWidth *= 2.2; g.beginPath(); g.moveTo(-s * .85, s * .82); g.lineTo(s * .2, s * .82); g.stroke();
      g.beginPath(); g.arc(s * .2, s * .82, s * .07, 0, 7); g.fill(); break;
    case 'star':
      g.fillStyle = W; sparkle(g, 0, 0, s * .92); g.fill();
      sparkle(g, s * .78, -s * .66, s * .26); g.fill(); sparkle(g, -s * .74, s * .62, s * .2); g.fill();
      g.beginPath(); g.arc(-s * .78, -s * .55, s * .06, 0, 7); g.fill(); g.beginPath(); g.arc(s * .7, s * .6, s * .05, 0, 7); g.fill(); break;
    case 'globe':
      g.beginPath(); g.arc(0, 0, s * .82, 0, 7); FS(g);
      g.beginPath(); g.ellipse(0, 0, s * .34, s * .82, 0, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(-s * .82, 0); g.lineTo(s * .82, 0); g.stroke();
      for (const y of [-.42, .42]) { g.beginPath(); g.moveTo(-s * .7, y * s); g.lineTo(s * .7, y * s); g.stroke(); }
      g.setLineDash([s * .08, s * .08]); g.beginPath(); g.ellipse(0, 0, s * 1.16, s * .34, -.4, 0, 7); g.stroke(); g.setLineDash([]);
      g.fillStyle = W; g.beginPath(); g.arc(s * 1.05, -s * .5, s * .08, 0, 7); g.fill(); break;
    case 'stick':
      g.rotate(-.14);
      rr(g, -s * .3, -s, s * .6, s * 2, s * .14); FS(g);
      g.beginPath(); g.arc(0, -s * .74, s * .1, 0, 7); g.stroke();
      for (const y of [-.38, -.18, .02, .22]) { g.beginPath(); g.moveTo(-s * .14, y * s); g.lineTo(s * .14, y * s); g.stroke(); }
      g.rotate(.3); g.fillStyle = W; sparkle(g, s * .62, -s * .78, s * .18); g.fill(); break;
    case 'cake':
      rr(g, -s * .82, 0, s * 1.64, s * .72, s * .1); FS(g);
      rr(g, -s * .56, -s * .44, s * 1.12, s * .44, s * .08); FS(g);
      g.beginPath(); for (let i = 0; i <= 8; i++) { const x = -s * .82 + i * s * .205; g[i ? 'lineTo' : 'moveTo'](x, s * .22 + (i % 2 ? s * .1 : 0)); } g.stroke();
      rr(g, -s * .05, -s * .86, s * .1, s * .42, s * .03); g.stroke();
      g.fillStyle = W; g.beginPath(); g.moveTo(0, -s * 1.16); g.quadraticCurveTo(s * .14, -s * .96, 0, -s * .9); g.quadraticCurveTo(-s * .14, -s * .96, 0, -s * 1.16); g.fill(); break;
    case 'crown':
      g.beginPath(); g.moveTo(-s * .9, s * .52); g.lineTo(-s * .9, -s * .42); g.lineTo(-s * .45, 0); g.lineTo(0, -s * .72); g.lineTo(s * .45, 0); g.lineTo(s * .9, -s * .42); g.lineTo(s * .9, s * .52); g.closePath(); FS(g);
      g.beginPath(); g.moveTo(-s * .9, s * .3); g.lineTo(s * .9, s * .3); g.stroke();
      g.fillStyle = W; for (const [x, y] of [[-.9, -.42], [0, -.72], [.9, -.42]]) { g.beginPath(); g.arc(x * s, y * s - s * .1, s * .09, 0, 7); g.fill(); } break;
    case 'flower':
      for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; g.beginPath(); g.ellipse(Math.cos(a) * s * .46, Math.sin(a) * s * .46, s * .44, s * .28, a, 0, 7); FS(g); }
      g.fillStyle = W; g.beginPath(); g.arc(0, 0, s * .17, 0, 7); g.fill(); break;
    case 'fan': {
      const oy = s * .55;
      g.beginPath(); g.moveTo(0, oy); g.arc(0, oy, s * 1.2, Math.PI + .35, Math.PI * 2 - .35); g.closePath(); FS(g);
      for (let i = 0; i <= 6; i++) { const a = Math.PI + .35 + i * (Math.PI - .7) / 6; g.beginPath(); g.moveTo(0, oy); g.lineTo(Math.cos(a) * s * 1.2, oy + Math.sin(a) * s * 1.2); g.stroke(); }
      g.beginPath(); g.arc(0, oy, s * .42, Math.PI + .35, Math.PI * 2 - .35); g.stroke();
      g.fillStyle = W; g.beginPath(); g.arc(0, oy, s * .08, 0, 7); g.fill(); break; }
    case 'calendar':
      rr(g, -s * .86, -s * .7, s * 1.72, s * 1.52, s * .14); FS(g);
      g.beginPath(); g.moveTo(-s * .86, -s * .34); g.lineTo(s * .86, -s * .34); g.stroke();
      for (const x of [-.4, .4]) { g.beginPath(); g.moveTo(x * s, -s * .86); g.lineTo(x * s, -s * .56); g.stroke(); }
      g.fillStyle = W; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { if (r === 1 && c === 2) continue; g.beginPath(); g.arc(-s * .5 + c * s * .33, -s * .08 + r * s * .27, s * .045, 0, 7); g.fill(); }
      g.beginPath(); g.moveTo(s * .07, s * .2); g.lineTo(s * .17, s * .3); g.lineTo(s * .36, s * .08); g.stroke(); break;
    case 'moon': {
      const R = s * .8, d = s * .5;
      g.beginPath(); g.arc(0, 0, R, 1.254, Math.PI * 2 - 1.254, false); g.arc(d, 0, R, Math.PI * 2 - 1.889, 1.889, true); g.closePath(); g.fillStyle = W; g.fill();
      sparkle(g, s * .62, -s * .4, s * .22); g.fill(); sparkle(g, s * .9, s * .32, s * .13); g.fill(); break; }
    case 'chat':
      rr(g, -s * .92, -s * .66, s * 1.84, s * 1.1, s * .32); FS(g);
      g.beginPath(); g.moveTo(-s * .5, s * .42); g.lineTo(-s * .62, s * .82); g.lineTo(-s * .16, s * .44); g.stroke();
      g.fillStyle = W; for (const x of [-.4, 0, .4]) { g.beginPath(); g.arc(x * s, -s * .11, s * .09, 0, 7); g.fill(); } break;
    case 'flute':
      g.rotate(-.55); rr(g, -s * 1.1, -s * .12, s * 2.2, s * .24, s * .12); FS(g);
      g.fillStyle = W; for (const x of [-.5, -.25, 0, .25, .5]) { g.beginPath(); g.arc(x * s, 0, s * .05, 0, 7); g.fill(); }
      g.beginPath(); g.moveTo(s * 1.1, 0); g.quadraticCurveTo(s * 1.3, s * .3, s * 1.18, s * .6); g.stroke();
      g.rotate(.55); sparkle(g, -s * .6, -s * .7, s * .2); g.fill(); break;
    case 'staff':
      g.rotate(.6); g.lineWidth *= 2.4; g.beginPath(); g.moveTo(0, -s * 1.05); g.lineTo(0, s * 1.05); g.stroke(); g.lineWidth /= 2.4;
      for (const y of [-.7, -.2, .3]) { rr(g, -s * .12, y * s, s * .24, s * .14, s * .05); FS(g); }
      g.rotate(-.6); g.fillStyle = W; sparkle(g, s * .7, -s * .6, s * .2); g.fill(); break;
    case 'shield':
      g.beginPath(); g.moveTo(0, -s * .9); g.lineTo(s * .78, -s * .6); g.quadraticCurveTo(s * .78, s * .5, 0, s * .95); g.quadraticCurveTo(-s * .78, s * .5, -s * .78, -s * .6); g.closePath(); FS(g);
      for (let i = 0; i < 7; i++) { const x = -s * .54 + i * s * .18; g.beginPath(); g.moveTo(x, -s * .5); g.lineTo(x + s * .05, -s * .64); g.stroke(); }
      g.fillStyle = W; sparkle(g, 0, s * .05, s * .3); g.fill(); break;
    case 'pill':
      g.beginPath(); g.arc(0, 0, s * .62, 0, 7); FS(g); g.beginPath(); g.arc(0, 0, s * .4, 0, 7); g.stroke();
      g.fillStyle = W; for (let i = 0; i < 9; i++) { const a = i * .698; g.beginPath(); g.arc(Math.cos(a) * s * .86, Math.sin(a) * s * .86, s * .05, 0, 7); g.fill(); }
      sparkle(g, 0, 0, s * .22); g.fill(); break;
    case 'sun':
      g.beginPath(); g.arc(0, 0, s * .48, 0, 7); g.fillStyle = W; g.fill();
      for (let i = 0; i < 12; i++) { const a = i * .5236; g.beginPath(); g.moveTo(Math.cos(a) * s * .66, Math.sin(a) * s * .66); g.lineTo(Math.cos(a) * s * (i % 2 ? .86 : .98), Math.sin(a) * s * (i % 2 ? .86 : .98)); g.stroke(); } break;
    default:
      g.fillStyle = W; sparkle(g, 0, 0, s); g.fill();
  }
  if (PEN.outline) delete g.fill;
  g.restore();
}

/* 纸色底 + 一圈极淡的细线圆，替代原来的饱和渐变和网格 */
function paintPaper(g, W, H, tone, cx, cy, rad) {
  g.fillStyle = tone || INK.paper; g.fillRect(0, 0, W, H);
  g.strokeStyle = INK.line; g.lineWidth = 1.5;
  g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.stroke();
}
function wrapText(g, text, maxW) {
  const lines = []; let cur = '';
  for (const ch of String(text)) { if (g.measureText(cur + ch).width > maxW && cur && !'，。！？、；：」』）》…'.includes(ch)) { lines.push(cur); cur = ch; } else cur += ch; }
  if (cur) lines.push(cur); return lines;
}
function fitFont(g, text, weight, start, min, maxW, fam = SANS()) { let s = start; g.font = `${weight} ${s}px ${fam}`; while (g.measureText(text).width > maxW && s > min) { s -= 4; g.font = `${weight} ${s}px ${fam}`; } }

/* 结果卡：1080×1440，k 是缩放（缩略图用） */
/* 先请求内嵌版 quiz-bg.data.js（data URL，本地打开也能导出）；它还没到时先用 assets 里的原图显示 */
let BG_DATA_REQ = false;
function loadBgData() {
  if (BG_DATA_REQ || !SCRIPT_SRC) return; BG_DATA_REQ = true;
  const s = document.createElement('script'); s.src = new URL('quiz-bg.data.js', SCRIPT_SRC).href;
  s.onload = () => { for (const k of Object.keys(BG)) if (!BG[k].data) delete BG[k]; redrawCards(); };
  document.head.append(s);
}
function bgFor(shape) {
  const k = BG_KEY[shape]; if (!k || !SCRIPT_SRC || typeof Image === 'undefined') return null;
  loadBgData();
  let b = BG[k];
  if (!b) {
    const data = window.QUIZ_BG && window.QUIZ_BG[k];
    const img = new Image(); b = BG[k] = { img, ok: false, data: !!data };
    img.onload = () => { b.ok = true; redrawCards(); };
    img.onerror = () => { b.failed = true; };
    img.src = data || new URL(`../assets/quiz-bg-${k}.jpg`, SCRIPT_SRC).href;
  }
  return b.ok ? b.img : null;
}
function redrawCards() { for (const [cv, e] of [...DRAWN]) { if (!cv.isConnected) DRAWN.delete(cv); else drawCard(cv, e.sp, e.k); } }
function drawCard(cv, sp, k = 1) {
  const W = 1080, H = 1440; cv.width = Math.round(W * k); cv.height = Math.round(H * k);
  const g = cv.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0);
  if (!sp._noBg && !sp._once) { DRAWN.set(cv, { sp, k }); if (DRAWN.size > 60) for (const c of [...DRAWN.keys()]) if (!c.isConnected) DRAWN.delete(c); }
  const bg = sp._noBg ? null : bgFor(sp.shape);
  /* 两种卡：有静物图 → 图做底、白字；没有 → 纸色底、细线紫图形、墨色字 */
  const C = bg ? { t: '#ffffff', m: 'rgba(255,255,255,.78)', l: 'rgba(255,255,255,.35)', tagBg: 'rgba(255,255,255,.16)', tagT: '#ffffff' }
               : { t: INK.ink, m: INK.muted, l: INK.line, tagBg: 'rgba(75,61,132,.08)', tagT: INK.accent };
  if (bg) {
    const s = Math.max(W / bg.width, H / bg.height), iw = bg.width * s, ih = bg.height * s;
    g.drawImage(bg, (W - iw) / 2, (H - ih) / 2, iw, ih);
    const top = g.createLinearGradient(0, 0, 0, 280); top.addColorStop(0, 'rgba(10,10,14,.55)'); top.addColorStop(1, 'rgba(10,10,14,0)'); g.fillStyle = top; g.fillRect(0, 0, W, 280);
    const bot = g.createLinearGradient(0, 560, 0, H); bot.addColorStop(0, 'rgba(10,10,14,0)'); bot.addColorStop(.35, 'rgba(10,10,14,.7)'); bot.addColorStop(1, 'rgba(10,10,14,.92)'); g.fillStyle = bot; g.fillRect(0, 560, W, H - 560);
  } else {
    paintPaper(g, W, H, sp.tone || INK.paper, 540, 470, 250);
    g.strokeStyle = INK.line; g.lineWidth = 2; rr(g, 36, 36, W - 72, H - 72, 28); g.stroke();
    drawShape(g, sp.shape, 540, 470, 150);
  }
  g.fillStyle = C.t; g.textBaseline = 'alphabetic';
  g.font = `600 32px ${SERIF()}`; g.textAlign = 'left'; g.fillText(`${FAN}小测试`, 84, 124);
  g.fillStyle = C.m; g.font = `400 26px ${SANS()}`; g.fillText(sp.sub || '', 84, 166);
  g.font = `500 24px ${SANS()}`; const aw = g.measureText('AI 生成').width + 36;
  g.strokeStyle = C.m; g.lineWidth = 1.5; rr(g, W - 84 - aw, 92, aw, 46, 23); g.stroke(); g.textAlign = 'center'; g.fillText('AI 生成', W - 84 - aw / 2, 123);
  g.fillStyle = C.m; g.font = `400 40px ${SANS()}`; g.fillText(sp.kicker || '你是', 540, 820);
  g.fillStyle = C.t; fitFont(g, sp.title, 600, 104, 52, 900, SERIF()); g.fillText(sp.title, 540, 936);
  g.fillStyle = bg ? C.t : INK.ink; g.font = `400 38px ${SANS()}`; const ls = wrapText(g, sp.line || '', 840).slice(0, 3);
  ls.forEach((l, i) => g.fillText(l, 540, 1036 + i * 58));
  const tags = (sp.tags || []).slice(0, 3); g.font = `500 28px ${SANS()}`;
  const tw = tags.map(t => g.measureText(t).width + 52); const total = tw.reduce((a, b) => a + b, 0) + Math.max(0, tags.length - 1) * 16;
  let x = 540 - total / 2; const ty = 1036 + ls.length * 58 + 36;
  tags.forEach((t, i) => { g.fillStyle = C.tagBg; rr(g, x, ty, tw[i], 56, 28); g.fill(); g.fillStyle = C.tagT; g.fillText(t, x + tw[i] / 2, ty + 38); x += tw[i] + 16; });
  g.strokeStyle = C.l; g.lineWidth = 1.5; g.beginPath(); g.moveTo(84, 1296); g.lineTo(W - 84, 1296); g.stroke();
  g.fillStyle = C.m; g.textAlign = 'left'; g.font = `400 28px ${SANS()}`; g.fillText(dot(sp.date || today()), 84, 1358);
  g.textAlign = 'right'; g.fillText(`${FAN}小测试 · AI 出题`, W - 84, 1358);
}
/* 封面：600×340，淡紫底 + 细线图形 + 宋体标题 */
function drawCover(cv, t) {
  const W = 600, H = 340; cv.width = W; cv.height = H; const g = cv.getContext('2d');
  paintPaper(g, W, H, INK.tint, 452, 170, 112);
  drawShape(g, t.shape, 452, 170, 64);
  g.textAlign = 'left'; g.fillStyle = INK.muted; g.font = `400 17px ${SANS()}`; g.fillText(`${FAN}小测试 · ${t.week || WEEK.next} · ${t.qs.length} 题`, 30, 46);
  g.fillStyle = INK.ink; g.font = `600 32px ${SERIF()}`; const ls = wrapText(g, t.title, 290).slice(0, 3); ls.forEach((l, i) => g.fillText(l, 30, 296 - (ls.length - 1 - i) * 42));
}
function paintIcon(cv, r) { const g = cv.getContext('2d'); paintPaper(g, cv.width, cv.height, INK.tint, cv.width / 2, cv.height / 2, cv.height * .38); drawShape(g, r.shape, cv.width / 2, cv.height / 2, cv.height * .26); }

/* 下载 PNG。本地 file:// 打开时，带背景图的画布会被浏览器判为「跨源」不让导出，
   这时改画一张渐变版再下载，返回 'plain'；放到网站上（同源）就是带图版。 */
function downloadCanvas(cv, name, spec) {
  const fire = (c, res, tag) => c.toBlob(b => {
    const url = URL.createObjectURL(b); const a = document.createElement('a');
    a.href = url; a.download = name.replace(/[\\/:*?"<>|\s]+/g, '-') + '.png'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000); res(tag);
  }, 'image/png');
  return new Promise(res => {
    /* 用一张新画布重画再导出：旧画布一旦画过跨源图就永远不能导出 */
    let c = cv; if (spec) { c = document.createElement('canvas'); drawCard(c, { ...spec, _once: true }); }
    try { fire(c, res, 'full'); }
    catch (e) { const c2 = document.createElement('canvas'); drawCard(c2, { ...spec, _noBg: true }); fire(c2, res, 'plain'); }
  });
}
const savedMsg = tag => tag === 'plain' ? '已保存（本地打开时背景图导不出，存的是渐变版）' : '图片已保存';

/* ============================================================
   4. 样式（只用变量）
   ============================================================ */
const CSS = `
.qz-crumb{font-size:13px;color:var(--muted)}.qz-crumb a{color:var(--accent)}
.qz-fine{margin:18px 10px 0;font-size:11.5px;line-height:1.7;color:var(--dim)}
.app .side nav a.qz-sep{pointer-events:none;cursor:default;color:var(--dim);padding:8px 6px 8px 12px;font-size:12.5px}
.qz-intro{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:24px;align-items:center;position:relative;overflow:hidden}
.qz-intro canvas,.qz-cover canvas{display:block;width:100%;height:auto;border-radius:14px}
.qz-intro h3{font-size:30px;letter-spacing:-.02em;margin:10px 0 8px}
.qz-facts{display:flex;flex-wrap:wrap;gap:18px;margin:16px 0 20px}
.qz-facts div b{display:block;font-size:22px;font-variant-numeric:tabular-nums;letter-spacing:-.02em}.qz-facts div span{font-size:12px;color:var(--muted)}
@media (max-width:760px){.qz-intro{grid-template-columns:1fr}.qz-intro h3{font-size:24px}}
.qz-types{display:grid;grid-template-columns:repeat(var(--n,6),minmax(0,1fr));gap:10px}
@media (max-width:900px){.qz-types{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:420px){.qz-types{grid-template-columns:repeat(2,minmax(0,1fr))}}
.qz-types div{padding:10px;border-radius:12px;background:var(--surface);border:1px solid var(--line);font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.qz-types div b{display:block;color:var(--text);font-size:13px;margin:6px 0 0;font-family:var(--sans)}
.qz-types canvas{width:100%;height:auto;display:block;border-radius:8px}
.qz-stage{max-width:760px;margin:0 auto;overflow-x:clip;overflow-clip-margin:14px}
.qz-prog{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.qz-prog .bar{flex:1;height:8px;border-radius:99px;background:var(--surface3);overflow:hidden}
.qz-prog .bar i{display:block;height:100%;border-radius:99px;background:var(--accent);transition:width .5s var(--ease)}
.qz-prog .n{font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}
.qz-q{animation:qzIn .42s var(--ease) both}.qz-q.out{animation:qzOut .26s ease both}
@keyframes qzIn{from{opacity:0;translate:36px 0}}@keyframes qzOut{to{opacity:0;translate:-36px 0}}
.qz-q h3{font-size:22px;line-height:1.4;margin:6px 0 18px}
.qz-opts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:560px){.qz-opts{grid-template-columns:1fr}.qz-q h3{font-size:19px}}
.qz-opt{all:unset;box-sizing:border-box;cursor:pointer;position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;padding:16px 18px;border-radius:16px;background:var(--surface);border:1px solid var(--line2);font-size:15px;line-height:1.45;transition:translate .2s var(--ease),border-color .2s,background .2s,box-shadow .2s}
.qz-opt:hover{translate:0 -2px;border-color:var(--accent-line);background:var(--surface2)}
.qz-opt i{flex:none;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;font-style:normal;font-variant-numeric:tabular-nums;font-size:12px;background:var(--surface3);color:var(--muted);transition:all .2s}
.qz-opt .rp{position:absolute;left:var(--x,50%);top:var(--y,50%);width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:var(--accent);opacity:.12;transform:scale(0);animation:qzRipple .6s ease-out forwards;pointer-events:none}
@keyframes qzRipple{to{transform:scale(40);opacity:0}}
.qz-opt.pick{border-color:var(--accent);background:var(--accent-soft);animation:qzPop .34s var(--ease)}
.qz-opt.pick i{background:var(--accent);color:var(--surface)}
@keyframes qzPop{40%{transform:scale(1.035)}}
.qz-opt.right{border-color:var(--ok);background:var(--ok-soft)}.qz-opt.right i{background:var(--ok);color:var(--surface)}
.qz-opt.wrong{border-color:var(--bad);background:var(--bad-soft)}.qz-opt.wrong i{background:var(--bad);color:var(--surface)}
.qz-opts.lock .qz-opt{pointer-events:none}
.qz-opts.lock .qz-opt:not(.pick):not(.right):not(.wrong){opacity:.45}
.qz-note{margin-top:12px;font-size:13.5px;min-height:22px}
.qz-result{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:28px;align-items:start}
@media (max-width:860px){.qz-result{grid-template-columns:1fr}}
.qz-cardwrap canvas{display:block;width:100%;height:auto;border-radius:20px;box-shadow:var(--shadow),0 0 0 1px var(--line);animation:qzCard .7s var(--ease) both}
@keyframes qzCard{from{opacity:0;transform:translateY(24px) rotate(-2deg) scale(.96)}}
.qz-result h3{font-size:28px;letter-spacing:-.02em;margin:8px 0 8px}
.qz-dist{display:grid;gap:8px;margin-top:6px}
.qz-dist>div{display:grid;grid-template-columns:96px minmax(0,1fr) 44px;align-items:center;gap:10px;font-size:13px;color:var(--muted)}
.qz-dist>div.me{color:var(--accent);font-weight:600}
.qz-dist .meter i{background:var(--dim)}.qz-dist>div.me .meter i{background:var(--accent)}
.qz-dist span:last-child{text-align:right;font-variant-numeric:tabular-nums}
.qz-lib{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
@media (max-width:1100px){.qz-lib{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:560px){.qz-lib{grid-template-columns:1fr}}
.qz-lib .card{display:flex;flex-direction:column;gap:10px;cursor:pointer}
.qz-lib .card h4{font-size:16px}
.qz-lib .nums{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}
.qz-tools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
.qz-tools .search{flex:1;min-width:200px}
.qz-tools .select{width:auto}
.qz-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);gap:24px;align-items:start}
@media (max-width:900px){.qz-form{grid-template-columns:1fr}}
.qz-form label{display:block;font-size:12.5px;color:var(--muted);margin:14px 0 6px}
.qz-shake{animation:qzShake .4s}@keyframes qzShake{25%{translate:-6px 0}75%{translate:6px 0}}
.qz-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-top:8px;max-width:400px}
.qz-cal span{font-size:11px;color:var(--dim);text-align:center;font-variant-numeric:tabular-nums}
.qz-cal button{all:unset;cursor:pointer;aspect-ratio:1;border-radius:9px;display:grid;place-items:center;font-size:12.5px;font-variant-numeric:tabular-nums;background:var(--surface);border:1px solid var(--line);color:var(--muted);transition:all .15s}
.qz-cal button:hover{border-color:var(--accent-line)}
.qz-cal button.on{background:var(--accent);color:var(--surface);border-color:var(--accent)}
.qz-cal button.sel{outline:2px solid var(--text);outline-offset:1px}
.qz-box{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
@media (max-width:1100px){.qz-box{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:640px){.qz-box{grid-template-columns:repeat(2,minmax(0,1fr))}}
.qz-box .card{padding:10px;display:flex;flex-direction:column;gap:8px}
.qz-box canvas{display:block;width:100%;height:auto;border-radius:10px;cursor:zoom-in}
.qz-box b{font-size:13.5px;line-height:1.35}
.qz-draft .cover canvas{display:block;width:100%;height:auto;border-radius:12px}
.qz-draft ol{margin:0;padding-left:18px;font-size:13px;color:var(--muted)}
.qz-draft ol li{margin:3px 0}
.qz-draft.live{border-color:color-mix(in srgb,var(--ok) 45%,transparent)}
.qz-draft.busy{opacity:.6;pointer-events:none}
.qz-tl{list-style:none;margin:0;padding:0}
.qz-tl li{position:relative;padding:0 0 14px 22px;font-size:13.5px}
.qz-tl li::before{content:"";position:absolute;left:5px;top:8px;width:8px;height:8px;border-radius:50%;background:var(--kc,var(--accent))}
.qz-tl li::after{content:"";position:absolute;left:8.5px;top:20px;bottom:0;width:1px;background:var(--line2)}
.qz-tl li:last-child::after{display:none}
.qz-tl time{display:block;font-variant-numeric:tabular-nums;font-size:11.5px;color:var(--dim)}
.qz-g21{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px;margin-top:16px}
@media (max-width:1000px){.qz-g21{grid-template-columns:1fr}}
.qz-chart svg{display:block;width:100%;height:auto}
.qz-legend{display:flex;gap:14px;font-size:12px;color:var(--muted)}
.qz-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.qz-funnel{display:grid;gap:8px}
.qz-funnel div{display:grid;grid-template-columns:84px minmax(0,1fr) 56px;gap:10px;align-items:center;font-size:13px}
.qz-funnel em{display:block;height:26px;border-radius:8px;background:var(--accent);opacity:.85;font-style:normal;transition:width .8s var(--ease)}
.qz-funnel span:last-child{font-variant-numeric:tabular-nums;text-align:right;color:var(--muted)}
.qz-donut{display:flex;gap:18px;align-items:center}
.qz-tbl td:first-child{min-width:150px}
.qz-donut svg{flex:none}
.qz-feed li{font-size:13px;align-items:center}
.qz-feed li.new{animation:fade .5s both}
.qz-set{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--line)}
.qz-set:first-of-type{border-top:0}
.qz-set>div{flex:1;min-width:0}.qz-set small{display:block;color:var(--muted);font-size:12.5px}
.qz-lock{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--surface2);border:1px solid var(--line2);font-size:12px;color:var(--muted);white-space:nowrap}
.qz-lock::before{content:"⊘";color:var(--ok)}
.switch:disabled{opacity:.55;cursor:not-allowed}
`;

/* ============================================================
   5. 产品
   ============================================================ */
let T = { timers: [], rafs: [] };
const later = (fn, ms) => { const id = setTimeout(fn, ms); T.timers.push(id); return id; };

const P = {
  id: 'quiz', accent: 'quiz', demo: 2, name: '桐铃小测试', tag: '粉丝',
  short: '每周一个小测试，你点头才发，粉丝玩完愿意晒。',
  meta: '每周一个新测试 · 不收个人信息',
  blurb: 'AI 每周出一个小测试，你点个头，桐铃们玩完就想晒。',
  pain: '超话里天天是打卡，你能发的互动不多，工作室也想不出那么多新花样；粉丝想晒点什么，只能晒截图。',
  ai: 'AI 每周按桐铃爱聊的话题出 3 个测试，你看一眼、点个头就发；粉丝玩完愿意晒，晒图又把路人带进来。不用你的照片，不收任何个人信息。',

  mount(root, ctx) {
    const { $, $$, esc, fmt, think, toast, modal } = ctx;
    if (!document.getElementById('qz-css')) { const s = document.createElement('style'); s.id = 'qz-css'; s.textContent = CSS; document.head.append(s); }
    const st = loadState(ctx.store);
    const save = () => ctx.store.set('state', st);
    const AIX = ctx.ai || null, PROF = ctx.profile ? ctx.profile.get() : { fan: '桐铃', show: '美人余', name: '李一桐' };
    const aiReady = () => !!(AIX && AIX.ready());
    FAN = PROF.fan || '桐铃';

    /* ---------- 数据助手（包一层模块级的纯函数） ---------- */
    const loc = id => (st.local[id] = st.local[id] || { plays: 0, done: 0, shares: 0 });
    const bump = (id, k, n = 1) => { loc(id)[k] += n; save(); };
    const stat = t => statOf(st, t);
    const pct = x => (x * 100).toFixed(1) + '%';
    const pending = () => pendingOf(st);
    const findTest = id => testById(st, id), allTests = () => libTests(st);
    const resultSpec = (t, out) => {
      if (t.kind === 'score') return { kicker: `答对 ${out.n}/${t.qs.length} · 你是`, title: out.tier.name, line: out.tier.line, tags: out.tier.tags, shape: out.tier.shape, pal: out.tier.pal, sub: t.title, date: today() };
      const r = t.results[out.key];
      return { kicker: t.kicker || (r.sub ? '你最像' : '你是'), title: r.name, line: r.line, tags: r.sub ? [r.sub, ...r.tags] : r.tags, shape: r.shape, pal: r.pal, sub: t.title, date: today() };
    };

    /* ---------- 壳：侧栏 + 主区 ---------- */
    const sub = ctx.sub || '';
    const [page, arg] = sub.split('/');
    const pg = page || 'home';
    const a = (s, label, em) => `<a href="#/quiz/${s}" data-nav="${s || 'home'}" class="${(s || 'home') === pg || (s === 'library' && pg === 'play') ? 'on' : ''}">${label}${em !== undefined ? ` <em>${em}</em>` : ''}</a>`;
    root.innerHTML = `
      <div class="app">
        <aside class="side">
          <div class="brand"><i>✦</i><div style="flex:1"><b>${esc(FAN)}小测试</b><small>粉丝互动</small></div><button class="heart" data-pick="quiz" aria-label="想要">♡</button></div>
          <div class="sec">粉丝玩的</div>
          <nav>${a('', '本周测试', WEEK.now)}${a('library', '测试库', allTests().length)}${a('card', '生日签 / 打卡卡')}${a('box', '卡包', st.results.length)}</nav>
          <div class="sec">你 / 工作室管的</div>
          <nav><a class="qz-sep" aria-hidden="true" tabindex="-1">·　工作室</a>${a('studio', '候选审核', pending())}${a('stats', '数据')}${a('settings', '出题设置')}</nav>
          <p class="qz-fine">玩过人数、晒图率、超话话题条数都是演示用的假数据。测试不收手机号、不要登录，不收集任何个人信息。</p>
        </aside>
        <section class="main" id="qz-main"></section>
      </div>`;
    const main = $('#qz-main', root);
    const setNavCount = (nav, n) => { const e = $(`[data-nav="${nav}"] em`, root); if (e) e.textContent = n; };
    const head = (h, p, actions = '') => `<div class="head"><div><h2>${h}</h2><p>${p}</p></div><div class="row">${actions}</div></div>`;
    const countUp = (el, to, f = fmt, ms = 900) => { const t0 = performance.now(); const step = now => { const p = Math.min(1, (now - t0) / ms); el.textContent = f(p < 1 ? Math.round(to * (1 - Math.pow(1 - p, 3)) * 1000) / 1000 : to); if (p < 1) T.rafs.push(requestAnimationFrame(step)); }; T.rafs.push(requestAnimationFrame(step)); };

    /* ============ 页面：本周测试 / 玩一个测试 ============ */
    function pagePlay(test, weekly) {
      if (!test) { main.innerHTML = head('没找到这个测试', '可能已经下架了。') + `<div class="empty"><b>这个测试不在库里</b><a class="btn btn-sm" href="#/quiz/library" style="margin-top:10px">回测试库</a></div>`; return; }
      main.innerHTML = (weekly
        ? head('本周测试', `第 43 周 · ${WEEK.range} · 每${DAYS[st.settings.day]} ${st.settings.time} 换新`, `<a class="btn btn-sm" href="#/quiz/library">换一个测试</a>`)
        : head(esc(test.title), `<span class="qz-crumb"><a href="#/quiz/library">测试库</a> › ${esc(test.title)}</span>${test.preview ? ' · <span class="tag warn">预览 · 还没发布</span>' : ''}`, `<a class="btn btn-sm" href="#/quiz/${test.preview ? 'studio' : 'library'}">${test.preview ? '回候选审核' : '回测试库'}</a>`))
        + `<div id="qz-stage"></div>`;
      const box = $('#qz-stage', main);
      const N = test.qs.length;
      let ans = [];

      function intro() {
        const s = stat(test);
        const resume = st.play && st.play.id === test.id && st.play.ans.length && st.play.ans.length < N;
        const last = st.results.find(r => r.testId === test.id);
        const rs = test.kind === 'type' ? Object.entries(test.results) : [];
        box.innerHTML = `<div class="card qz-intro">
            <div><canvas id="qz-cv"></canvas></div>
            <div style="position:relative;z-index:1">
              <span class="tag accent">${esc(test.badge || '')} · ${esc(test.week || WEEK.next)}</span> <span class="tag">${esc(test.cat)}</span>
              <h3>${esc(test.title)}</h3><p class="muted">${esc(test.desc)}</p>
              <div class="qz-facts"><div><b>${N}</b><span>道题</span></div><div><b>${test.mins}</b><span>分钟左右</span></div><div><b id="qz-plays">${fmt(s.plays)}</b><span>人玩过</span></div><div><b>${pct(s.shareRate)}</b><span>晒图率</span></div></div>
              <div class="row">
                <button class="btn btn-primary btn-lg" id="qz-start">${resume ? '从头开始' : '开始测试'}</button>
                ${resume ? `<button class="btn btn-lg" id="qz-resume">接着答（第 ${st.play.ans.length + 1} 题）</button>` : ''}
              </div>
              ${last ? `<p class="small muted" style="margin-top:12px">上次结果：<b class="accent">${esc(last.spec.title)}</b> · <a href="#/quiz/box" class="accent">去卡包看</a></p>` : ''}
              <p class="xs dim" style="margin-top:10px">不用登录，不收手机号。结果卡只用文字和图形，带「AI 生成」标识。</p>
            </div></div>
          ${rs.length ? `<div class="card" style="margin-top:16px"><div class="hd"><h4>${test.kicker ? '能抽到的签' : '能测出的类型'}</h4><span class="xs muted">本周占比</span></div>
            <div class="qz-types" style="--n:${rs.length}">${rs.map(([k, r]) => `<div><canvas data-ty="${k}" width="200" height="140"></canvas><b>${esc(r.name)}</b>${r.pct}%</div>`).join('')}</div>
            <div style="margin-top:14px">${Viz.stack(rs.map(([k, r], i) => ({ l: r.name, v: r.pct, c: QZ_PAL[i % QZ_PAL.length] })), { w: 720, pct: true, label: '本周各类型占比' })}</div>
            <p class="xs dim" style="margin-top:6px">${(() => { const top = rs.slice().sort((a, b) => b[1].pct - a[1].pct)[0]; return top ? `测出最多的是「${esc(top[1].name)}」，占 ${top[1].pct}%。` : ''; })()}</p></div>` : ''}`;
        drawCover($('#qz-cv', box), test);
        $$('[data-ty]', box).forEach(c => paintIcon(c, test.results[c.dataset.ty]));
        $('#qz-start', box).onclick = () => { ans = []; bump(test.id, 'plays'); st.play = { id: test.id, ans }; save(); question(); };
        const rb = $('#qz-resume', box); if (rb) rb.onclick = () => { ans = st.play.ans.slice(); st.play = { id: test.id, ans }; question(); };
      }

      function question() {
        const i = ans.length;
        if (i >= N) { finish(); return; }
        const q = test.qs[i]; const opts = test.kind === 'score' ? q[1] : q[1].map(o => o[0]);
        box.innerHTML = `<div class="qz-stage">
          <div class="qz-prog"><div class="bar"><i style="width:${(i / N) * 100}%"></i></div><span class="n">${i + 1} / ${N}</span></div>
          <div class="card qz-q" id="qz-q"><span class="eyebrow">第 ${i + 1} 题</span><h3>${esc(q[0])}</h3>
            <div class="qz-opts">${opts.map((o, k) => `<button class="qz-opt" data-k="${k}"><i>${'ABCD'[k]}</i><span>${esc(o)}</span></button>`).join('')}</div>
            <div class="qz-note" id="qz-note"></div>
            <div class="row between" style="margin-top:8px"><button class="btn btn-sm btn-ghost" id="qz-back" ${i ? '' : 'disabled'}>上一题</button><button class="btn btn-sm btn-ghost" id="qz-quit">先不答了</button></div>
          </div></div>`;
        $$('.qz-opt', box).forEach(b => b.onclick = e => pick(+b.dataset.k, b, e));
        $('#qz-back', box).onclick = () => { ans.pop(); save(); question(); };
        $('#qz-quit', box).onclick = () => { save(); intro(); toast('进度存好了，下次接着答'); };
      }

      function pick(k, btn, e) {
        const wrap = btn.parentElement; wrap.classList.add('lock');
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--x', (e && e.clientX ? e.clientX - r.left : r.width / 2) + 'px'); btn.style.setProperty('--y', (e && e.clientY ? e.clientY - r.top : r.height / 2) + 'px');
        btn.insertAdjacentHTML('beforeend', '<span class="rp"></span>'); btn.classList.add('pick');
        let wait = 420;
        if (test.kind === 'score') {
          const q = test.qs[ans.length], ok = k === q[2];
          btn.classList.add(ok ? 'right' : 'wrong'); if (!ok) $$('.qz-opt', wrap)[q[2]].classList.add('right');
          $('#qz-note', box).innerHTML = `<span style="color:var(--${ok ? 'ok' : 'bad'})">${ok ? '答对了' : '差一点'}</span> <span class="muted">· ${esc(q[3])}</span>`;
          wait = 1000;
        }
        ans.push(k); st.play = { id: test.id, ans }; save();
        $('.bar i', box).style.width = `${(ans.length / N) * 100}%`;
        later(() => { const c = $('#qz-q', box); if (c) c.classList.add('out'); later(question, 240); }, wait);
      }

      async function finish() {
        st.play = null; bump(test.id, 'done');
        let out;
        if (test.kind === 'score') {
          const n = ans.filter((v, i) => v === test.qs[i][2]).length;
          out = { n, tier: [...test.tiers].reverse().find(t => n >= t.min) };
        } else {
          const cnt = {}; let best = null;
          ans.forEach((v, i) => { const key = test.qs[i][1][v][1]; cnt[key] = (cnt[key] || 0) + 1; if (!best || cnt[key] >= cnt[best]) best = key; });
          out = { key: best };
          st.typeLocal[test.id] = st.typeLocal[test.id] || {}; st.typeLocal[test.id][best] = (st.typeLocal[test.id][best] || 0) + 1;
        }
        const spec = resultSpec(test, out);
        st.results.unshift({ id: 'r' + Date.now(), testId: test.id, kind: 'quiz', spec, at: Date.now() });
        st.results = st.results.slice(0, 40); save(); setNavCount('box', st.results.length);
        await think(box, test.kind === 'score' ? ['对答案', `答对 ${out.n} 道，定等级`, '画结果卡'] : ['统计你的选项', '对照结果类型', '画结果卡（只用文字和图形）'], 'AI 正在出结果');
        if (!document.body.contains(box)) return;
        result(out, spec);
      }

      function result(out, spec) {
        const isType = test.kind === 'type';
        const tl = st.typeLocal[test.id] || {};
        const me = isType ? test.results[out.key] : null;
        box.innerHTML = `<div class="qz-result">
          <div class="qz-cardwrap"><canvas id="qz-card"></canvas></div>
          <div class="out">
            <span class="eyebrow">你的结果</span>
            <h3>${esc(spec.kicker)}「${esc(spec.title)}」</h3>
            <p class="muted" style="font-size:16px">${esc(spec.line)}</p>
            <div class="row" style="margin-top:12px">${spec.tags.map(t => `<span class="tag accent">${esc(t)}</span>`).join('')}</div>
            <div class="row" style="margin-top:20px">
              <button class="btn btn-primary" id="qz-dl">保存图片</button>
              <button class="btn" id="qz-again">再测一次</button>
              <a class="btn" href="#/quiz/library" id="qz-switch">换一个测试</a>
              <button class="btn btn-ghost" id="qz-copy">复制晒图文案</button>
            </div>
            <p class="xs dim" style="margin-top:8px">结果卡已经自动放进<a href="#/quiz/box" class="accent">卡包</a>，随时能再下载。</p>
            ${isType ? `<div class="card" style="margin-top:18px"><div class="hd"><h4>本周 ${me.pct}% 的人和你一样</h4>${me.match ? `<span class="xs muted">最合拍：${esc(test.results[me.match].name)}</span>` : ''}</div>
              <div class="qz-dist">${Object.entries(test.results).map(([k, r]) => `<div class="${k === out.key ? 'me' : ''}"><span>${esc(r.name)}</span><div class="meter"><i style="width:${Math.min(100, r.pct * 2.5)}%"></i></div><span>${r.pct}%</span></div>`).join('')}</div>
              ${Object.keys(tl).length ? `<p class="xs dim" style="margin-top:10px">这台设备测过：${Object.entries(tl).map(([k, n]) => `${esc(test.results[k].name)} ×${n}`).join('、')}</p>` : ''}</div>`
            : `<div class="card" style="margin-top:18px"><div class="hd"><h4>对答案</h4><span class="tag ${out.n === N ? 'ok' : 'info'}">${out.n} / ${N}</span></div><ul class="list">${test.qs.map((q, i) => `<li><span class="tag ${ans[i] === q[2] ? 'ok' : 'bad'}">${ans[i] === q[2] ? '✓' : '✗'}</span><div><b style="font-size:13.5px">${esc(q[0])}</b><div class="xs muted">正确答案：${esc(q[1][q[2]])} · ${esc(q[3])}</div></div></li>`).join('')}</ul></div>`}
          </div></div>`;
        const cv = $('#qz-card', box); drawCard(cv, spec);
        [...$('.out', box).children].forEach((c, i) => c.style.setProperty('--i', i));
        $('#qz-dl', box).onclick = async () => { const tag = await downloadCanvas(cv, `${FAN}小测试-${spec.title}`, spec); bump(test.id, 'shares'); toast(tag === 'plain' ? savedMsg(tag) : '图片已保存，可以去超话晒了', 'ok'); };
        $('#qz-again', box).onclick = () => { ans = []; bump(test.id, 'plays'); st.play = { id: test.id, ans }; save(); question(); };
        $('#qz-copy', box).onclick = async () => {
          const text = `#桐铃小测试# 测了「${test.title}」，${spec.kicker}「${spec.title}」：${spec.line} 你也来测测？`;
          try { await navigator.clipboard.writeText(text); toast('文案复制好了', 'ok'); } catch (e) { modal(`<textarea class="textarea" readonly>${esc(text)}</textarea><p class="xs muted" style="margin-top:8px">长按全选复制。</p>`, { title: '晒图文案' }); }
        };
      }

      intro();
      if (weekly) {
        const tick = () => { st.live += 1 + Math.floor(Math.random() * 3); save(); const el = $('#qz-plays', main); if (el) el.textContent = fmt(stat(test).plays); later(tick, 2600); };
        later(tick, 2600);
      }
    }

    /* ============ 页面：测试库 ============ */
    function pageLibrary() {
      const f = Object.assign({ cat: '全部', q: '', sort: 'hot' }, st.libFilter || {});
      main.innerHTML = head('测试库', `本周 + 往期，一共 ${allTests().length} 个。点进去就能玩。`, `<a class="btn btn-sm btn-primary" href="#/quiz/">玩本周的</a>`) + `
        <div class="qz-tools">
          <div class="search"><input class="input" id="qz-q" placeholder="搜测试名，比如「黄蓉」" value="${esc(f.q)}" aria-label="搜索测试"></div>
          <div class="chips" id="qz-cats">${['全部', '性格', '知识', '签'].map(c => `<button class="chip ${c === f.cat ? 'on' : ''}" data-v="${c}">${c}</button>`).join('')}</div>
          <select class="select" id="qz-sort" aria-label="排序"><option value="hot">玩过最多</option><option value="share">晒图率最高</option><option value="new">最新</option></select>
        </div>
        <div id="qz-libviz" style="margin-bottom:14px"></div>
        <div class="qz-lib" id="qz-lib"></div>`;
      $('#qz-sort', main).value = f.sort;
      const draw = () => {
        st.libFilter = f; save();
        const wk = t => +(t.week || 'W99').slice(1);
        const list = allTests().filter(t => (f.cat === '全部' || t.cat === f.cat) && (!f.q || t.title.includes(f.q) || t.desc.includes(f.q)));
        list.sort((x, y) => f.sort === 'hot' ? stat(y).plays - stat(x).plays : f.sort === 'share' ? stat(y).shareRate - stat(x).shareRate : wk(y) - wk(x));
        const el = $('#qz-lib', main);
        const vz = $('#qz-libviz', main);
        if (vz) vz.innerHTML = list.length ? `<div class="viz-grid two"><div class="viz-card"><div class="vh"><b>每个测试多少人玩过</b><span>右边是晒图率</span></div>${Viz.hbars(list.map(t => { const s = stat(t); return { l: t.title, v: s.plays, n: `· 晒图 ${pct(s.shareRate)}`, c: t.id === 'tongling' ? 'var(--accent)' : 'color-mix(in srgb,var(--accent) 55%,transparent)', k: t.id === 'tongling' }; }), { w: 440, lw: 150, vw: 110, maxL: 11, label: '各测试玩过人数' })}</div>
          <div class="viz-card"><div class="vh"><b>玩的人多的，晒得也多吗</b><span>横轴玩过，纵轴晒图率</span></div>${Viz.scatter(list.map(t => { const s = stat(t); return { x: s.plays, y: Math.round(s.shareRate * 100), l: t.title, c: t.cat === '签' ? 'var(--c-fans)' : t.cat === '知识' ? 'var(--c-guard)' : 'var(--accent)' }; }), { w: 440, h: 190, xl: '玩过', yl: '晒图率 %', ymax: 60, yfmt: v => v + '%', label: '玩过人数与晒图率' })}<p class="vn">粉点是签，青点是知识测试，紫点是性格测试。签玩的人少，但最爱晒。</p></div></div>` : '';
        if (!list.length) { el.innerHTML = `<div class="empty" style="grid-column:1/-1"><b>没搜到</b>换个关键词，或者点「全部」。</div>`; return; }
        el.innerHTML = list.map((t, i) => { const s = stat(t); return `<article class="card hover" data-id="${t.id}" style="animation:fade .4s both;animation-delay:${i * 60}ms">
            <div class="qz-cover"><canvas data-cv="${t.id}"></canvas></div>
            <div class="row between"><h4>${esc(t.title)}${t.real ? ' <span class="tag info">AI 真出</span>' : ''}</h4><span class="tag ${t.badge === '本周' ? 'accent' : t.badge === '新' ? 'ok' : t.badge === '限定' ? 'warn' : ''}">${esc(t.badge)}</span></div>
            <p class="small muted" style="flex:1">${esc(t.desc)}</p>
            <div class="nums"><span>${t.qs.length} 题</span><span>${fmt(s.plays)} 人玩过</span><span>晒图 ${pct(s.shareRate)}</span></div>
            <div class="meter"><i style="width:${Math.min(100, s.shareRate * 200)}%"></i></div>
            <button class="btn btn-sm btn-primary">开始玩</button></article>`; }).join('');
        $$('[data-cv]', el).forEach(c => drawCover(c, findTest(c.dataset.cv)));
        $$('[data-id]', el).forEach(c => c.onclick = () => ctx.go(c.dataset.id === 'tongling' ? '' : 'play/' + c.dataset.id));
      };
      $('#qz-q', main).oninput = e => { f.q = e.target.value.trim(); draw(); };
      ctx.chips($('#qz-cats', main), v => { f.cat = v; draw(); });
      $('#qz-sort', main).onchange = e => { f.sort = e.target.value; draw(); };
      draw();
    }

    /* ============ 页面：生日签 / 打卡卡 ============ */
    function pageCard() {
      const F = st.form; if (!F.drama) F.drama = PROF.show || '美人余';
      main.innerHTML = head('生日签 / 追剧打卡卡', '填个昵称、挑个日期，生成一张能存进相册的卡。') + `
        <div class="tabs" id="qz-tabs"><button data-t="bday" class="${F.tab === 'bday' ? 'on' : ''}">生日签</button><button data-t="check" class="${F.tab === 'check' ? 'on' : ''}">追剧打卡卡</button></div>
        <div class="qz-form">
          <div class="card" id="qz-fm"></div>
          <div><div class="qz-cardwrap"><canvas id="qz-pv"></canvas></div>
            <div class="row" style="margin-top:14px"><button class="btn btn-primary" id="qz-dl">保存图片</button><button class="btn" id="qz-keep">存进卡包</button></div>
            <p class="xs dim" style="margin-top:8px">昵称只用来画这张卡，存在这台设备上，不上传、不收集。</p></div>
        </div>`;
      const fm = $('#qz-fm', main), cv = $('#qz-pv', main);
      const streakAt = d => { let n = 0; while (st.checkins.includes(addDays(d, -n))) n++; return n; };
      const spec = () => F.tab === 'bday'
        ? { kicker: '生日签', title: `${F.nick || FAN} 生日快乐`, line: F.wish, tags: [`${FAN}生日签`, dot(F.date).slice(5)], shape: 'cake', tone: CARD_PALS[F.pal][1], sub: '生日签 · 桐铃小测试', date: F.date }
        : { kicker: `${F.nick || FAN} 的追剧打卡`, title: `《${F.drama}》第 ${F.ep} 集`, line: MOODS[F.mood], tags: [`连续打卡 ${streakAt(F.date)} 天`, F.mood], shape: 'calendar', tone: CARD_PALS[F.pal][1], sub: '追剧打卡卡 · 桐铃小测试', date: F.date };
      const paint = () => { save(); drawCard(cv, spec()); };
      const palChips = () => `<label>底色</label><div class="chips" id="qz-pal">${CARD_PALS.map((p, i) => `<button class="chip ${i === F.pal ? 'on' : ''}" data-v="${i}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${p[1]};border:1px solid var(--line2);vertical-align:-1px;margin-right:6px"></span>${p[0]}</button>`).join('')}</div>`;
      const calendar = () => {
        const d = new Date(F.date + 'T00:00:00'); const y = d.getFullYear(), m = d.getMonth();
        const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
        const key = n => ymd(new Date(y, m, n));
        return `<div class="row between" style="margin-top:16px"><b style="font-size:14px">${y} 年 ${m + 1} 月</b><span class="tag ok">连续 ${streakAt(F.date)} 天 · 本月 ${st.checkins.filter(c => c.startsWith(key(1).slice(0, 7))).length} 次</span></div>
          <div class="qz-cal">${['一', '二', '三', '四', '五', '六', '日'].map(w => `<span>${w}</span>`).join('')}${'<span></span>'.repeat(first)}${Array.from({ length: days }, (_, i) => `<button data-day="${key(i + 1)}" class="${st.checkins.includes(key(i + 1)) ? 'on' : ''} ${key(i + 1) === F.date ? 'sel' : ''}" aria-label="${m + 1} 月 ${i + 1} 日">${i + 1}</button>`).join('')}</div>
          <p class="xs dim" style="margin-top:6px">点日期格能补打卡或取消；白框是卡片上的日期。</p>`;
      };
      const form = () => {
        fm.innerHTML = F.tab === 'bday' ? `
          <label for="qz-nick" style="margin-top:0">昵称</label><input class="input" id="qz-nick" maxlength="10" placeholder="比如：小海" value="${esc(F.nick)}">
          <label for="qz-date">生日日期</label><input class="input" type="date" id="qz-date" value="${esc(F.date)}">
          <label for="qz-wish">祝福语</label><textarea class="textarea" id="qz-wish" maxlength="40">${esc(F.wish)}</textarea>
          <div class="row" style="margin-top:8px"><button class="btn btn-sm" id="qz-ai">AI 写一句</button><span class="xs dim">40 字以内，别写真名和电话。</span></div>
          <div id="qz-ai-out" style="margin-top:8px"></div>${palChips()}`
          : `
          <label for="qz-nick" style="margin-top:0">昵称</label><input class="input" id="qz-nick" maxlength="10" placeholder="比如：小海" value="${esc(F.nick)}">
          <div class="grid-2"><div><label for="qz-drama">追的剧</label><select class="select" id="qz-drama">${[...new Set([PROF.show || '美人余', '我不是大师', '云秀行'])].map(d => `<option ${d === F.drama ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
          <div><label for="qz-ep">看到第几集</label><input class="input" type="number" min="1" max="60" id="qz-ep" value="${F.ep}"></div></div>
          <label for="qz-date">打卡日期</label><input class="input" type="date" id="qz-date" value="${esc(F.date)}">
          <label>今天的心情</label><div class="chips" id="qz-mood">${Object.keys(MOODS).map(k => `<button class="chip ${k === F.mood ? 'on' : ''}" data-v="${k}">${k}</button>`).join('')}</div>
          ${palChips()}
          <div class="row" style="margin-top:16px"><button class="btn btn-primary btn-sm" id="qz-checkin">${st.checkins.includes(F.date) ? '这天已打卡 ✓' : '打卡这一天'}</button></div>
          <div id="qz-cal">${calendar()}</div>`;
        const on = (id, ev, fn) => { const el = $(id, fm); if (el) el[ev] = fn; };
        on('#qz-nick', 'oninput', e => { F.nick = e.target.value.trim(); paint(); });
        on('#qz-date', 'onchange', e => { if (e.target.value) { F.date = e.target.value; if (F.tab === 'check') form(); paint(); } });
        on('#qz-wish', 'oninput', e => { F.wish = e.target.value; paint(); });
        on('#qz-drama', 'onchange', e => { F.drama = e.target.value; paint(); });
        on('#qz-ep', 'oninput', e => { F.ep = Math.max(1, Math.min(60, +e.target.value || 1)); paint(); });
        if ($('#qz-mood', fm)) ctx.chips($('#qz-mood', fm), v => { F.mood = v; paint(); });
        ctx.chips($('#qz-pal', fm), v => { F.pal = +v; form(); paint(); });
        on('#qz-ai', 'onclick', async () => {
          const btn = $('#qz-ai', fm); btn.disabled = true;
          await think($('#qz-ai-out', fm), ['看昵称和日期', '挑一句不重样的祝福', '控制在 40 字以内'], 'AI 正在写');
          if (!document.body.contains(fm)) return;
          const pool = WISHES.filter(w => w !== F.wish); F.wish = pool[Math.floor(Math.random() * pool.length)];
          const w = $('#qz-wish', fm); if (w) w.value = F.wish;
          $('#qz-ai-out', fm).innerHTML = `<span class="done-line">✓ 换好了，不满意可以再点，或者直接改</span>`; btn.disabled = false; paint();
        });
        on('#qz-checkin', 'onclick', () => { if (!st.checkins.includes(F.date)) { st.checkins.push(F.date); toast(`打卡成功，连续 ${streakAt(F.date)} 天`, 'ok'); } else toast('这天已经打过卡了'); form(); paint(); });
        $$('[data-day]', fm).forEach(b => b.onclick = () => { const d = b.dataset.day; st.checkins = st.checkins.includes(d) ? st.checkins.filter(x => x !== d) : [...st.checkins, d]; form(); paint(); });
      };
      const needNick = () => { if (F.nick) return true; const n = $('#qz-nick', fm); n.classList.remove('qz-shake'); void n.offsetWidth; n.classList.add('qz-shake'); n.focus(); toast('先填一个昵称', 'bad'); return false; };
      $$('#qz-tabs button', main).forEach(b => b.onclick = () => { F.tab = b.dataset.t; $$('#qz-tabs button', main).forEach(x => x.classList.toggle('on', x === b)); form(); paint(); });
      $('#qz-dl', main).onclick = async () => { if (!needNick()) return; const sp = spec(); const tag = await downloadCanvas(cv, `${sp.sub.split(' ')[0]}-${F.nick}`, sp); toast(savedMsg(tag), 'ok'); };
      $('#qz-keep', main).onclick = () => { if (!needNick()) return; st.results.unshift({ id: 'c' + Date.now(), testId: F.tab, kind: F.tab, spec: spec(), at: Date.now() }); save(); setNavCount('box', st.results.length); toast('放进卡包了', 'ok'); };
      form(); paint();
    }

    /* ============ 页面：卡包 ============ */
    function pageBox() {
      let f = st.boxFilter || 'all';
      const n = v => v === 'all' ? st.results.length : st.results.filter(r => r.kind === v).length;
      main.innerHTML = head('卡包', '测出来的结果卡、做过的生日签和打卡卡都在这里，随时再下载。', `<button class="btn btn-sm btn-danger" id="qz-clear" ${st.results.length ? '' : 'disabled'}>清空卡包</button>`) + `
        <div class="chips" id="qz-bf" style="margin-bottom:16px">${[['all', '全部'], ['quiz', '测试结果'], ['bday', '生日签'], ['check', '打卡卡']].map(([v, name]) => `<button class="chip ${v === f ? 'on' : ''}" data-v="${v}">${name} · ${n(v)}</button>`).join('')}</div>
        <div id="qz-bx"></div>`;
      const dl = async r => { const c = document.createElement('canvas'); drawCard(c, r.spec); const tag = await downloadCanvas(c, `${FAN}小测试-${r.spec.title}`, r.spec); if (r.kind === 'quiz') bump(r.testId, 'shares'); toast(savedMsg(tag), 'ok'); };
      const draw = () => {
        const list = st.results.filter(r => f === 'all' || r.kind === f); const el = $('#qz-bx', main);
        if (!list.length) { el.innerHTML = `<div class="empty"><b>${st.results.length ? '这一类还没有卡' : '卡包是空的'}</b>测一个测试，或者做一张生日签，卡会自动出现在这里。<div class="row" style="justify-content:center;margin-top:12px"><a class="btn btn-sm btn-primary" href="#/quiz/">玩本周测试</a><a class="btn btn-sm" href="#/quiz/card">做生日签</a></div></div>`; return; }
        el.innerHTML = `<div class="qz-box">${list.map((r, i) => `<div class="card" style="animation:fade .4s both;animation-delay:${i * 40}ms"><canvas data-v="${r.id}" role="button" aria-label="查看大图"></canvas><b>${esc(r.spec.title)}</b><span class="xs muted">${esc(r.spec.sub)} · ${dot(r.spec.date)}</span>
          <div class="row"><button class="btn btn-sm" data-dl="${r.id}">下载</button><button class="btn btn-sm btn-ghost" data-del="${r.id}">删除</button></div></div>`).join('')}</div>`;
        $$('canvas[data-v]', el).forEach(c => {
          const r = st.results.find(x => x.id === c.dataset.v); drawCard(c, r.spec, .25);
          c.onclick = () => {
            const d = modal(`<div class="qz-cardwrap" style="max-width:360px;margin:0 auto"><canvas id="qz-big"></canvas></div>`, { title: r.spec.title, foot: `<button class="btn btn-primary" id="qz-mdl">保存图片</button>` });
            drawCard($('#qz-big', d), r.spec); $('#qz-mdl', d).onclick = () => dl(r);
          };
        });
        $$('[data-dl]', el).forEach(b => b.onclick = () => dl(st.results.find(x => x.id === b.dataset.dl)));
        $$('[data-del]', el).forEach(b => b.onclick = () => { st.results = st.results.filter(x => x.id !== b.dataset.del); save(); setNavCount('box', st.results.length); toast('删掉了'); pageBox(); });
      };
      ctx.chips($('#qz-bf', main), v => { f = v; st.boxFilter = v; save(); draw(); });
      $('#qz-clear', main).onclick = () => {
        const d = modal(`<p>卡包里的 ${st.results.length} 张卡都会删掉，已经下载到相册的不受影响。</p>`, { title: '清空卡包？', foot: `<button class="btn" id="qz-no">算了</button><button class="btn btn-danger" id="qz-yes">清空</button>` });
        $('#qz-no', d).onclick = () => d.close();
        $('#qz-yes', d).onclick = () => { st.results = []; save(); d.close(); setNavCount('box', 0); toast('卡包清空了'); pageBox(); };
      };
      draw();
    }

    /* ============ 页面：候选审核（工作室） ============ */
    function pageStudio() {
      const live = st.drafts.filter(d => d.status === 'live').length + st.real.filter(r => r.status === 'live').length;
      const onTopics = TOPICS.filter(t => st.settings.topics[t[0]]);
      setNavCount('studio', pending()); setNavCount('library', allTests().length);
      main.innerHTML = head('候选审核', `AI 出的 ${WEEK.next} 初稿。你点头才发布，打回会按理由重做。上线时间：每${DAYS[st.settings.day]} ${st.settings.time}。`, `<button class="btn btn-sm" id="qz-batch">AI 再出一批</button>`) + `
        <div class="kpis" style="margin-bottom:18px">
          <div class="kpi"><b>${pending()}</b><span>等你看</span></div>
          <div class="kpi"><b>${live}</b><span>已点头发布</span></div>
          <div class="kpi"><b>${st.redo}</b><span>累计打回重做</span></div>
          <div class="kpi"><b>${onTopics.length}</b><span>开着的素材话题</span></div>
        </div>
        <div class="card" id="qz-real" style="margin-bottom:18px">
          <div class="hd"><h4>真出一套</h4>${aiReady() ? '<span class="tag ok">AI 已接入</span>' : '<span class="tag">还没接入 AI</span>'}</div>
          ${aiReady() ? `<label for="qz-plot" class="xs muted" style="display:block;margin-bottom:6px">本周剧情一句话（可空）</label>
            <div class="row" style="flex-wrap:nowrap;align-items:stretch"><input class="input" id="qz-plot" maxlength="60" placeholder="比如：《${esc(PROF.show || '')}》本周两人终于相认" value="${esc(st.plot || '')}"><button class="btn btn-primary" id="qz-real-go">真出一套</button></div>
            <p class="xs dim" style="margin-top:8px">AI 按档案里的作品和粉丝名「${esc(FAN)}」出 8 题、沿用六种类型，进下面的审核：AI 初稿 → 你点头 → 发布。</p>`
          : `<p class="small muted">接入 AI 之后，这里能按本周剧情真出一套 8 道题的测试。现在下面看到的都是演示初稿。<a class="accent" href="#/connect">去接入页填钥匙</a></p>`}
          <div id="qz-real-out"></div>
        </div>
        ${st.real.length ? `<div class="grid-3" id="qz-reals" style="margin-bottom:18px"></div>` : ''}
        <div class="row between" style="margin-bottom:10px"><h4 style="font-size:15px">演示初稿</h4><span class="xs dim">题库里轮换的样稿</span></div>
        <div id="qz-batch-out"></div>
        <div class="grid-3" id="qz-drafts"></div>
        <div class="grid-2" style="margin-top:18px">
          <div class="card"><div class="hd"><h4>操作记录</h4><span class="xs muted">最近 ${Math.min(12, st.log.length)} 条</span></div><ul class="qz-tl">${st.log.slice(-12).reverse().map(l => `<li style="--kc:var(--${l.k === 'ok' ? 'ok' : l.k === 'bad' ? 'warn' : l.k === 'ai' ? 'accent' : 'info'})"><time>${esc(l.t)}</time>${esc(l.x)}</li>`).join('')}</ul></div>
          <div class="card"><div class="hd"><h4>流程</h4></div>
            <div class="steps"><span class="done"><i>1</i>AI 收超话话题</span><span class="done"><i>2</i>出 3 个初稿</span><span class="on"><i>3</i>你点头</span><span><i>4</i>定时上线</span><span><i>5</i>看晒图率</span></div>
            <p class="small muted" style="margin-top:14px">你每周只做一件事：在这 3 个里点一个头。不点头，什么都不会发出去。打回时选个理由，AI 按理由换素材重出一版。</p>
            <p class="xs dim" style="margin-top:10px">素材话题：${onTopics.map(t => esc(t[1])).join('、') || '全关了'} · <a class="accent" href="#/quiz/settings">去设置</a></p></div>
        </div>`;
      const stamp = () => { const d = new Date(); return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
      const log = (k, x) => { st.log.push({ t: stamp(), k, x }); st.log = st.log.slice(-40); };
      const fresh = () => { const used = st.drafts.map(d => d.key); return Object.keys(POOL).filter(k => !used.includes(k) && st.settings.topics[POOL[k].topic]); };
      /* ---------- 真出一套：AI 初稿 → 你点头 → 发布 ---------- */
      const genSet = async (out, extra) => {
        const p = ctx.profile ? ctx.profile.get() : PROF;
        const system = `${ctx.profile ? ctx.profile.brief() : ''}
你是粉丝互动小测试的出题人，给「${p.fan}」出一套「你是哪种${p.fan}」类型测试。规则：
1. 正好 8 道题，每题 4 个选项。每个选项用 k 标出它指向的类型，k 只能是 beauty / company / archive / update / create / overseas；同一题 4 个选项的 k 互不相同；整套题六种类型都要出现。
2. 六种类型：beauty=美颜型（存图、修图、壁纸）；company=陪伴型（每天打卡、生日零点祝福）；archive=考古型（老剧名场面、作品年表）；update=追更型（追在播的《${p.show}》、发弹幕）；create=创作型（剪辑、手书、表情包）；overseas=海外型（字幕、外网安利）。
3. 题目围绕她的作品、在播的《${p.show}》和${p.fan}的日常；可以用本周剧情，但不剧透结局。题干不超过 20 字；选项是一个短动作，不超过 12 字，别用逗号接两件事；口语、轻松、适合晒图。称呼粉丝只用「${p.fan}」，不要自造别的昵称。
4. 不问任何个人信息（真实姓名、城市、学校、年龄、手机号、具体生日）；不碰禁区；不拉踩别的艺人；不用第一人称「我」指代她；不编造她没演过的作品。
5. 每种类型给一句结果文案 line（不超过 22 字，夸粉丝，不油）和 3 个标签 tags（每个不超过 6 字）。
只返回 JSON：{"title":"不超过 12 字","desc":"不超过 40 字","qs":[{"q":"题干","o":[{"t":"选项","k":"beauty"}]}],"types":{"beauty":{"line":"","tags":["","",""]},"company":{},"archive":{},"update":{},"create":{},"overseas":{}}}`;
        const plot = (st.plot || '').trim();
        const prompt = `本周剧情 / 话题：${plot || '（没给，围绕在播剧和代表作出题）'}${extra ? '\n' + extra : ''}\n出题吧。`;
        const job = AIX.chat(prompt, { system, json: true, temperature: .9 });
        job.catch(() => {});
        await think(out, ['读档案：作品、粉丝名、禁区', plot ? `读本周剧情：${plot.slice(0, 20)}` : '没给剧情，围绕在播剧出题', '出 8 道题、配六种类型', '检查：不问个人信息、不碰禁区'], 'AI 正在出题');
        out.insertAdjacentHTML('beforeend', '<div class="card scan" style="margin-top:10px"><div class="skeleton" style="width:60%"></div><div class="skeleton" style="width:85%;margin-top:8px"></div><div class="skeleton" style="width:40%;margin-top:8px"></div><p class="xs dim" style="margin-top:8px">等 AI 写完，一般 5–20 秒。</p></div>');
        return normalizeSet(await job, p.fan || FAN);
      };
      const realBusy = on => { $$('#qz-real button, #qz-reals button', main).forEach(b => b.disabled = on); };
      const goBtn = $('#qz-real-go', main);
      if (goBtn) goBtn.onclick = async () => {
        st.plot = $('#qz-plot', main).value.trim(); save();
        const out = $('#qz-real-out', main); out.style.marginTop = '12px'; realBusy(true);
        try {
          const set = await genSet(out);
          st.real.unshift({ id: 'ai' + Date.now().toString(36), ...set, pal: REAL_PALS[st.real.length % REAL_PALS.length], status: 'review', ver: 1, plot: st.plot, at: Date.now(), real: true });
          log('ai', `AI 真出了一套：「${set.title}」（${set.qs.length} 题），等你点头。`); save();
          if (!document.body.contains(out)) return;
          toast('出好了，等你点头', 'ok'); pageStudio();
        } catch (e) { if (!document.body.contains(out)) return; out.innerHTML = ''; realBusy(false); toast(e.message || 'AI 出错了', 'bad'); }
      };
      const rl = $('#qz-reals', main);
      if (rl) {
        rl.innerHTML = st.real.map(r => {
          const steps = [['AI 初稿', true], ['你点头', r.status === 'live'], ['发布', r.status === 'live']];
          return `<article class="card qz-draft ${r.status === 'live' ? 'live' : ''}" data-real="${r.id}">
            <div class="cover"><canvas data-rcv="${r.id}"></canvas></div>
            <div class="row between" style="margin-top:12px"><h4 style="font-size:16px">${esc(r.title)}</h4><span class="tag">v${r.ver}</span></div>
            <div class="row" style="margin:6px 0 10px"><span class="tag info">AI 真出</span>${r.status === 'live' ? `<span class="tag ok">已发布 · ${WEEK.next} ${DAYS[st.settings.day]}上线</span>` : '<span class="tag warn">等你点头</span>'}<span class="tag">${r.qs.length} 题</span></div>
            <div class="steps" style="margin-bottom:10px">${steps.map(([n, d], i) => `<span class="${d ? 'done' : (i === 1 ? 'on' : '')}"><i>${d ? '✓' : i + 1}</i>${n}</span>`).join('')}</div>
            <p class="small muted">${esc(r.desc)}</p>
            ${r.plot ? `<p class="xs dim" style="margin-top:4px">按剧情：${esc(r.plot)}</p>` : ''}
            <details style="margin-top:10px"><summary class="xs muted" style="cursor:pointer">看全部 ${r.qs.length} 道题</summary>
              <ol style="margin-top:8px">${r.qs.map(q => `<li><b style="color:var(--text)">${esc(q[0])}</b><div class="xs dim">${q[1].map(o => `${esc(o[0])}<span class="accent">·${esc(r.results[o[1]].name.slice(0, 2))}</span>`).join('　')}</div></li>`).join('')}</ol></details>
            <div class="row" style="margin-top:10px">${TYPE_KEYS.map(k => `<span class="tag" title="${esc(r.results[k].line)}">${esc(r.results[k].name)}</span>`).join('')}</div>
            <div class="ft">
              <a class="btn btn-sm btn-ghost" href="#/quiz/play/${r.id}">试玩</a>
              ${r.status === 'live' ? `<button class="btn btn-sm" data-rundo="${r.id}">撤回</button>` : `<button class="btn btn-sm btn-primary" data-rok="${r.id}">点头发布</button>${aiReady() ? `<button class="btn btn-sm btn-danger" data-rredo="${r.id}">打回重做</button>` : ''}`}
              <button class="btn btn-sm btn-ghost" data-rdel="${r.id}">删掉</button>
            </div></article>`;
        }).join('');
        $$('[data-rcv]', rl).forEach(c => { const r = st.real.find(x => x.id === c.dataset.rcv); drawCover(c, { title: r.title, shape: 'bell', pal: r.pal, qs: r.qs, week: WEEK.next }); });
        const R = id => st.real.find(x => x.id === id);
        $$('[data-rok]', rl).forEach(b => b.onclick = () => { const r = R(b.dataset.rok); r.status = 'live'; st.published++; log('ok', `你点头了：AI 真出的「${r.title}」v${r.ver} 发布，${WEEK.next} ${DAYS[st.settings.day]} ${st.settings.time} 上线。`); save(); toast('发布了，测试库里能玩', 'ok'); pageStudio(); });
        $$('[data-rundo]', rl).forEach(b => b.onclick = () => { const r = R(b.dataset.rundo); r.status = 'review'; log('sys', `撤回「${r.title}」，回到等你点头。`); save(); toast('撤回了'); pageStudio(); });
        $$('[data-rdel]', rl).forEach(b => b.onclick = () => { const r = R(b.dataset.rdel); st.real = st.real.filter(x => x !== r); log('sys', `删掉了 AI 真出的「${r.title}」。`); save(); toast('删掉了'); pageStudio(); });
        $$('[data-rredo]', rl).forEach(b => b.onclick = () => {
          const r = R(b.dataset.rredo); const why = ['太难了', '不好晒', '跟剧情不贴', '类型分不开'];
          const m = modal(`<p class="muted small">选一个理由，AI 按理由重出一版。</p><div class="chips" id="qz-rwhy" style="margin-top:12px">${why.map((w, i) => `<button class="chip ${i ? '' : 'on'}" data-v="${w}">${w}</button>`).join('')}</div>`, { title: `打回「${r.title}」`, foot: `<button class="btn" id="qz-rc">算了</button><button class="btn btn-danger" id="qz-rgo">打回重做</button>` });
          let reason = why[0]; ctx.chips($('#qz-rwhy', m), v => { reason = v; });
          $('#qz-rc', m).onclick = () => m.close();
          $('#qz-rgo', m).onclick = async () => {
            m.close(); const out = $('#qz-real-out', main); out.style.marginTop = '12px'; realBusy(true);
            try {
              const set = await genSet(out, `上一版「${r.title}」被打回，理由：${reason}。换个角度重出：标题和题目都要换，别重复上一版。`);
              Object.assign(r, set, { ver: r.ver + 1, status: 'review', reason }); st.redo++;
              log('bad', `AI 真出的「${r.title}」被打回（${reason}），重出成 v${r.ver}。`); save();
              if (!document.body.contains(out)) return; toast('重做好了，等你再看', 'ok'); pageStudio();
            } catch (e) { if (!document.body.contains(out)) return; out.innerHTML = ''; realBusy(false); toast(e.message || 'AI 出错了', 'bad'); }
          };
        });
      }

      const el = $('#qz-drafts', main);
      el.innerHTML = st.drafts.map(d => {
        const t = POOL[d.key]; const topic = TOPICS.find(x => x[0] === t.topic);
        const stTag = d.status === 'live' ? `<span class="tag ok">已发布 · ${WEEK.next} ${DAYS[st.settings.day]}上线</span>` : `<span class="tag warn">等你看</span>`;
        return `<article class="card qz-draft ${d.status === 'live' ? 'live' : ''}" data-slot="${d.slot}">
          <div class="cover"><canvas data-cv="${d.key}"></canvas></div>
          <div class="row between" style="margin-top:12px"><h4 style="font-size:16px">${esc(t.title)}</h4><span class="tag">v${d.ver}</span></div>
          <div class="row" style="margin:6px 0 10px">${stTag}<span class="tag">${esc(t.cat)} · ${t.qs.length} 题</span></div>
          <div class="xs muted" style="margin-bottom:6px">题目预览</div>
          <ol>${t.qs.slice(0, 3).map(q => `<li>${esc(q[0])}</li>`).join('')}</ol>
          <div class="xs muted" style="margin:10px 0 6px">${t.kind === 'score' ? '等级' : '结果类型'}</div>
          <div class="row">${(t.kind === 'score' ? t.tiers.map(x => x.name) : Object.values(t.results).map(x => x.name)).map(nm => `<span class="tag">${esc(nm)}</span>`).join('')}</div>
          <div style="margin-top:12px"><div class="row between xs"><span class="muted">预计晒图率</span><b>${pct(t.est.share)}</b></div><div class="meter" style="margin-top:4px"><i style="width:${t.est.share * 200}%"></i></div></div>
          <div style="margin-top:8px"><div class="row between xs"><span class="muted">预计完成率</span><b>${pct(t.est.done)}</b></div><div class="meter" style="margin-top:4px;--mc:var(--ok)"><i style="width:${t.est.done * 100}%"></i></div></div>
          <p class="xs dim" style="margin-top:10px">素材：超话「${esc(topic[1])}」${topic[2]} 条讨论${d.reason ? ` · 上次打回：${esc(d.reason)}` : ''}</p>
          <div class="ft">
            <a class="btn btn-sm btn-ghost" href="#/quiz/play/${d.key}">试玩</a>
            ${d.status === 'live' ? `<button class="btn btn-sm" data-undo="${d.slot}">撤回</button>` : `<button class="btn btn-sm btn-primary" data-ok="${d.slot}">点头发布</button><button class="btn btn-sm btn-danger" data-redo="${d.slot}">打回重做</button>`}
          </div></article>`;
      }).join('');
      $$('[data-cv]', el).forEach(c => drawCover(c, { ...POOL[c.dataset.cv], week: WEEK.next }));
      const slot = s => st.drafts.find(d => d.slot === +s);
      $$('[data-ok]', el).forEach(b => b.onclick = () => { const d = slot(b.dataset.ok); d.status = 'live'; st.published++; log('ok', `你点头了：「${POOL[d.key].title}」v${d.ver} 发布，${WEEK.next} ${DAYS[st.settings.day]} ${st.settings.time} 上线。`); save(); toast('发布了，测试库里能看到', 'ok'); pageStudio(); });
      $$('[data-undo]', el).forEach(b => b.onclick = () => { const d = slot(b.dataset.undo); d.status = 'review'; log('sys', `撤回「${POOL[d.key].title}」，回到等你看。`); save(); toast('撤回了，测试库里不再显示'); pageStudio(); });
      $$('[data-redo]', el).forEach(b => b.onclick = () => {
        const d = slot(b.dataset.redo); const why = ['太难了', '不好晒', '话题旧了', '和上周重复'];
        const m = modal(`<p class="muted small">选一个理由，AI 按这个理由换素材重出一版。</p><div class="chips" id="qz-why" style="margin-top:12px">${why.map((w, i) => `<button class="chip ${i ? '' : 'on'}" data-v="${w}">${w}</button>`).join('')}</div>`, { title: `打回「${POOL[d.key].title}」`, foot: `<button class="btn" id="qz-c">算了</button><button class="btn btn-danger" id="qz-go">打回重做</button>` });
        let reason = why[0]; ctx.chips($('#qz-why', m), v => { reason = v; });
        $('#qz-c', m).onclick = () => m.close();
        $('#qz-go', m).onclick = async () => {
          m.close();
          const cand = fresh(); if (!cand.length) { toast('开着的话题里没有新题了，去设置多开几个话题', 'bad'); return; }
          const card = $(`[data-slot="${d.slot}"]`, el); card.classList.add('busy', 'scan');
          const old = POOL[d.key].title; const nk = cand[Math.floor(Math.random() * cand.length)];
          const out = $('#qz-batch-out', main); out.style.marginBottom = '16px';
          await think(out, [`读打回理由：${reason}`, `换素材话题：${TOPICS.find(t => t[0] === POOL[nk].topic)[1]}`, `重出 ${POOL[nk].qs.length} 道题和结果卡`, '估算晒图率'], `AI 正在重做「${old}」`);
          d.key = nk; d.ver += 1; d.reason = reason; d.status = 'review'; st.redo++;
          log('bad', `「${old}」被打回（${reason}），AI 重做成「${POOL[nk].title}」v${d.ver}。`); save();
          if (!document.body.contains(el)) return;
          toast('重做好了，等你再看', 'ok'); pageStudio();
        };
      });
      $('#qz-batch', main).onclick = async () => {
        const slots = st.drafts.filter(d => d.status !== 'live'); if (!slots.length) { toast('3 个都发布了，这周不用再出'); return; }
        const cand = fresh(); if (!cand.length) { toast('开着的话题里没有新题了，去设置多开几个话题', 'bad'); return; }
        const out = $('#qz-batch-out', main); out.style.marginBottom = '16px';
        await think(out, ['重新扫一遍超话话题', `只用开着的 ${TOPICS.filter(t => st.settings.topics[t[0]]).length} 个话题`, `出 ${Math.min(slots.length, cand.length)} 个新初稿`, '每个配好结果卡'], 'AI 正在出新一批');
        const names = []; slots.slice(0, cand.length).forEach((d, i) => { d.key = cand[i]; d.ver = 1; d.reason = ''; d.status = 'review'; names.push(POOL[cand[i]].title); });
        log('ai', `AI 出了新一批：${names.join('、')}。`); save();
        if (!document.body.contains(el)) return;
        toast(`换了 ${names.length} 个新初稿`, 'ok'); pageStudio();
      };
    }

    /* ============ 页面：数据 ============ */
    function pageStats() {
      let scope = st.statScope || 'week';
      main.innerHTML = head('数据', '玩过、答完、晒图、路人：看哪个测试真的被晒出去了。', `<div class="chips" id="qz-scope"><button class="chip ${scope === 'week' ? 'on' : ''}" data-v="week">本周测试</button><button class="chip ${scope === 'all' ? 'on' : ''}" data-v="all">全部测试</button></div>`) + `<div id="qz-st"></div>`;
      const draw = () => {
        const tests = scope === 'week' ? [TESTS.tongling] : allTests();
        const sum = tests.reduce((acc, t) => { const s = stat(t); acc.plays += s.plays; acc.done += s.done; acc.shares += s.shares; acc.passer += s.plays * s.passer; return acc; }, { plays: 0, done: 0, shares: 0, passer: 0 });
        const doneR = sum.done / sum.plays, shareR = sum.shares / sum.done, passR = sum.passer / sum.plays;
        const tw = stat(TESTS.tongling);
        const tr = TREND.plays.map((v, i) => i === 7 ? tw.plays : v), ts = TREND.shares.map((v, i) => i === 7 ? tw.shares : v);
        const W = 640, H = 230, px = 44, py = 22, max = Math.max(...tr) * 1.1;
        const X = i => px + i * (W - px - 16) / 7, Y = v => H - py - (v / max) * (H - py * 2);
        const line = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
        const tl = st.typeLocal.tongling || {};
        const R = 54, C = 2 * Math.PI * R;
        $('#qz-st', main).innerHTML = `
          <div class="kpis">
            <div class="kpi"><small>${scope === 'week' ? WEEK.now : '累计'}</small><b data-cu="${sum.plays}" id="qz-k-plays">0</b><span>玩过人数</span></div>
            <div class="kpi"><b data-cp="${doneR}">0</b><span>完成率（答完 ÷ 点开）</span></div>
            <div class="kpi"><b data-cp="${shareR}">0</b><span>晒图率（存卡 ÷ 答完）</span></div>
            <div class="kpi"><b data-cp="${passR}">0</b><span>路人占比（没关注超话）</span></div>
          </div>
          <div class="qz-g21">
            <div class="card qz-chart"><div class="hd"><h4>近 8 周：玩过 vs 晒图</h4><div class="qz-legend"><span><i style="background:var(--accent)"></i>玩过</span><span><i style="background:var(--muted)"></i>晒图</span></div></div>
              <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="近 8 周玩过和晒图人数折线图">
                <defs><linearGradient id="qzA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>
                ${[0, .25, .5, .75, 1].map(fr => `<line x1="${px}" x2="${W - 16}" y1="${Y(max * fr)}" y2="${Y(max * fr)}" style="stroke:var(--line)"/><text x="${px - 8}" y="${Y(max * fr) + 4}" text-anchor="end" style="fill:var(--dim);font:11px var(--sans)">${Math.round(max * fr / 1000)}k</text>`).join('')}
                <path d="${line(tr)} L${X(7)},${H - py} L${X(0)},${H - py} Z" fill="url(#qzA)"/>
                <path d="${line(tr)}" fill="none" style="stroke:var(--accent);stroke-width:2.5"/>
                <path d="${line(ts)}" fill="none" style="stroke:var(--muted);stroke-width:2.5;stroke-dasharray:6 5"/>
                ${tr.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="${i === 7 ? 6 : 3.5}" style="fill:var(--accent)"><title>${TREND.weeks[i]} 玩过 ${fmt(v)}</title></circle><text x="${X(i)}" y="${H - 4}" text-anchor="middle" style="fill:var(--dim);font:11px var(--sans)">${TREND.weeks[i]}</text>`).join('')}
                ${ts.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="3" style="fill:var(--muted)"><title>${TREND.weeks[i]} 晒图 ${fmt(v)}</title></circle>`).join('')}
              </svg></div>
            <div class="card"><div class="hd"><h4>谁在玩</h4></div>
              <div class="qz-donut"><svg viewBox="0 0 140 140" width="120" height="120" role="img" aria-label="路人与桐铃占比">
                <circle cx="70" cy="70" r="${R}" fill="none" style="stroke:var(--surface3);stroke-width:16"/>
                <circle cx="70" cy="70" r="${R}" fill="none" transform="rotate(-90 70 70)" style="stroke:var(--accent);stroke-width:16;stroke-dasharray:${((1 - passR) * C).toFixed(1)} ${C.toFixed(1)}"/>
                <circle cx="70" cy="70" r="${R}" fill="none" transform="rotate(${(-90 + (1 - passR) * 360).toFixed(1)} 70 70)" style="stroke:var(--line2);stroke-width:16;stroke-dasharray:${Math.max(0, passR * C - 4).toFixed(1)} ${C.toFixed(1)}"/>
                <text x="70" y="70" text-anchor="middle" style="fill:var(--text);font:600 22px var(--sans)">${Math.round(passR * 100)}%</text><text x="70" y="90" text-anchor="middle" style="fill:var(--muted);font:12px var(--sans)">路人</text></svg>
                <div class="small"><p><span class="tag accent">桐铃</span> ${Math.round((1 - passR) * 100)}%：关注了超话</p><p style="margin-top:8px"><span class="tag">路人</span> ${Math.round(passR * 100)}%：从朋友晒图点进来</p><p class="xs dim" style="margin-top:8px">路人越多，说明结果卡真被晒出去了。</p></div></div>
              <div class="divider"></div>
              <div class="hd"><h4>漏斗</h4></div>
              <div class="qz-funnel">${[['点开', 1], ['答完', doneR], ['保存结果卡', doneR * shareR], ['路人点进来', doneR * shareR * passR * 1.6]].map(([nm, v]) => `<div><span>${nm}</span><em style="width:${Math.max(4, v * 100)}%"></em><span>${pct(v)}</span></div>`).join('')}</div>
            </div>
          </div>
          <div class="grid-2" style="margin-top:16px">
            <div class="card" style="min-width:0"><div class="hd"><h4>各测试晒图率</h4><span class="xs muted">按晒图率排</span></div>
              <div class="table-wrap"><table class="table qz-tbl"><thead><tr><th>测试</th><th>玩过</th><th>完成</th><th>晒图率</th></tr></thead><tbody>
              ${allTests().map(t => [t, stat(t)]).sort((x, y) => y[1].shareRate - x[1].shareRate).map(([t, s]) => `<tr><td>${esc(t.title)} ${t.badge === '新' ? '<span class="tag ok">新</span>' : ''}</td><td class="num">${fmt(s.plays)}</td><td class="num">${pct(s.doneRate)}</td><td style="min-width:120px"><div class="row" style="flex-wrap:nowrap"><div class="meter" style="flex:1;--mc:var(--muted)"><i style="width:${Math.min(100, s.shareRate * 200)}%"></i></div><span class="num xs">${pct(s.shareRate)}</span></div></td></tr>`).join('')}
              </tbody></table></div></div>
            <div class="card"><div class="hd"><h4>本周类型分布</h4><span class="tag accent">实时</span></div>
              <div class="qz-dist">${Object.values(TESTS.tongling.results).map(r => `<div class="me"><span>${esc(r.name)}</span><div class="meter"><i style="width:${r.pct * 2.5}%"></i></div><span>${r.pct}%</span></div>`).join('')}</div>
              ${Object.keys(tl).length ? `<p class="xs dim" style="margin-top:8px">含这台设备测的 ${Object.values(tl).reduce((x, y) => x + y, 0)} 次。</p>` : ''}
              <div class="divider"></div><div class="hd"><h4>刚刚</h4><span class="xs muted">匿名，只记类型</span></div><ul class="list qz-feed" id="qz-feed"></ul></div>
          </div>
          <p class="xs dim" style="margin-top:14px">以上数字都是演示用的假数据。真实上线只记次数和类型，不记是谁玩的。</p>`;
        $$('[data-cu]', main).forEach(e => countUp(e, +e.dataset.cu, v => fmt(Math.round(v))));
        $$('[data-cp]', main).forEach(e => countUp(e, +e.dataset.cp, v => pct(v)));
        const feed = $('#qz-feed', main); const names = Object.values(TESTS.tongling.results).map(r => r.name);
        const acts = ['测出了', '保存了结果卡：', '晒到超话：'];
        const push = isNew => { const li = document.createElement('li'); if (isNew) li.className = 'new'; li.innerHTML = `<span class="avatar" style="width:26px;height:26px;font-size:11px">✦</span><span style="flex:1">一位${Math.random() < passR ? '路人' : '桐铃'}${acts[Math.floor(Math.random() * 3)]}「${names[Math.floor(Math.random() * names.length)]}」</span><span class="xs dim">刚刚</span>`; feed.prepend(li); while (feed.children.length > 5) feed.lastChild.remove(); };
        for (let i = 0; i < 4; i++) push(false);
        const tick = () => { if (!document.body.contains(feed)) return; st.live += 1 + Math.floor(Math.random() * 3); save(); push(true); const k = $('#qz-k-plays', main); if (k && scope === 'week') k.textContent = fmt(stat(TESTS.tongling).plays); later(tick, 2400); };
        later(tick, 2400);
      };
      ctx.chips($('#qz-scope', main), v => { scope = v; st.statScope = v; save(); T.timers.forEach(clearTimeout); T.timers = []; draw(); });
      draw();
    }

    /* ============ 页面：出题设置 ============ */
    function pageSettings() {
      const S = st.settings;
      main.innerHTML = head('出题设置', 'AI 从哪些话题出题、每周哪天换新；隐私和红线是锁死的。') + `
        <div class="grid-2">
          <div class="card"><div class="hd"><h4>素材话题</h4><span class="xs muted">开着的话题才会拿来出题</span></div>
            ${TOPICS.map(t => `<div class="qz-set"><div><b style="font-size:14px">${esc(t[1])}</b><small>${esc(t[3])} · 本周 ${t[2]} 条</small></div><button class="switch ${S.topics[t[0]] ? 'on' : ''}" data-tp="${t[0]}" role="switch" aria-checked="${!!S.topics[t[0]]}" aria-label="${esc(t[1])}"></button></div>`).join('')}
          </div>
          <div class="stack">
            <div class="card"><div class="hd"><h4>更新节奏</h4></div>
              <div class="qz-set"><div><b style="font-size:14px">每周更新日</b><small>新测试在这天上线，本周测试同时换掉</small></div><select class="select" id="qz-day" style="width:auto" aria-label="每周更新日">${DAYS.map((d, i) => `<option value="${i}" ${i === S.day ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
              <div class="qz-set"><div><b style="font-size:14px">上线时间</b><small>超话人最多的时候</small></div><select class="select" id="qz-time" style="width:auto" aria-label="上线时间">${['12:00', '18:00', '20:00', '21:30'].map(t => `<option ${t === S.time ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
              <div class="qz-set"><div><b style="font-size:14px">每批初稿</b><small>你每周只需要在 3 个里挑</small></div><span class="qz-lock">3 个</span></div>
            </div>
            <div class="card"><div class="hd"><h4>隐私与红线</h4><span class="tag ok">锁定</span></div>
              <div class="qz-set"><div><b style="font-size:14px">收集任何个人信息</b><small>固定「否」，不能改。测试不要登录，不收手机号、微博号、生日、位置；生日签上的昵称只存在粉丝自己的设备上。后台只记「玩了几次、测出什么类型」这种次数，不记是谁。</small></div><span class="qz-lock">否</span><button class="switch" id="qz-pii" disabled aria-label="收集个人信息：否，不可改"></button></div>
              <div class="qz-set"><div><b style="font-size:14px">结果卡用你的照片</b><small>固定「否」。只用文字和图形，不生成你的形象。</small></div><span class="qz-lock">否</span></div>
              <div class="qz-set"><div><b style="font-size:14px">发布前你点头</b><small>固定「是」。不点头，什么都不会发出去。</small></div><span class="qz-lock">是</span></div>
              <div class="qz-set"><div><b style="font-size:14px">结果卡带「AI 生成」标识</b><small>固定「是」，依据《人工智能生成合成内容标识办法》。</small></div><span class="qz-lock">是</span></div>
            </div>
            <div class="card"><div class="hd"><h4>演示数据</h4></div>
              <p class="small muted">玩过人数、晒图率、超话话题条数、操作记录都是演示用的假数据。重置会清空卡包、打卡记录、审核状态和设置，回到第一次打开的样子。</p>
              <button class="btn btn-danger" id="qz-reset" style="margin-top:12px">重置演示数据</button></div>
          </div>
        </div>`;
      $$('[data-tp]', main).forEach(b => b.onclick = () => {
        const k = b.dataset.tp; const n = Object.values(S.topics).filter(Boolean).length;
        if (S.topics[k] && n <= 1) { toast('至少留一个话题，不然 AI 没素材出题', 'bad'); return; }
        S.topics[k] = !S.topics[k]; b.classList.toggle('on', S.topics[k]); b.setAttribute('aria-checked', S.topics[k]); save();
        toast(`${TOPICS.find(t => t[0] === k)[1]}：${S.topics[k] ? '开了' : '关了'}`);
      });
      $('#qz-day', main).onchange = e => { S.day = +e.target.value; save(); toast(`改好了：每${DAYS[S.day]} ${S.time} 上线`, 'ok'); };
      $('#qz-time', main).onchange = e => { S.time = e.target.value; save(); toast(`改好了：每${DAYS[S.day]} ${S.time} 上线`, 'ok'); };
      $('#qz-reset', main).onclick = () => {
        const d = modal(`<p>卡包、打卡记录、审核状态、设置都会回到初始演示数据。</p>`, { title: '重置演示数据？', foot: `<button class="btn" id="qz-no">算了</button><button class="btn btn-danger" id="qz-yes">重置</button>` });
        $('#qz-no', d).onclick = () => d.close();
        $('#qz-yes', d).onclick = () => { ctx.store.del('state'); d.close(); P.unmount(); P.mount(root, ctx); ctx.paintPicks(); toast('演示数据已重置', 'ok'); };
      };
    }

    /* ---------- 分发 ---------- */
    if (pg === 'play') pagePlay(findTest(arg), false);
    else if (pg === 'library') pageLibrary();
    else if (pg === 'card') pageCard();
    else if (pg === 'box') pageBox();
    else if (pg === 'studio') pageStudio();
    else if (pg === 'stats') pageStats();
    else if (pg === 'settings') pageSettings();
    else pagePlay(TESTS.tongling, true);
  },

  /* 「今天」页用：同步、不碰 DOM，只读自己的 store */
  summary(ctx) {
    const st = loadState(ctx.store);
    const fan = (ctx.profile && ctx.profile.get().fan) || '桐铃';
    const n = x => Number(x).toLocaleString('zh-CN');
    const pc = x => Math.round(x * 100) + '%';
    const wk = statOf(st, TESTS.tongling);
    const lib = libTests(st).map(t => [t, statOf(st, t)]);
    const waits = [
      ...(st.real || []).filter(r => r.status === 'review').map(r => ({ title: r.title, real: true })),
      ...st.drafts.filter(d => d.status === 'review').map(d => ({ title: POOL[d.key].title, real: false })),
    ];
    const liveN = st.drafts.filter(d => d.status === 'live').length + (st.real || []).filter(r => r.status === 'live').length;
    const day = `${DAYS[st.settings.day]} ${st.settings.time}`;
    const items = waits.slice(0, 4).map(w => ({ tag: '待点头', text: `看一眼${w.real ? ' AI 真出的' : ''}「${w.title}」，点头就 ${day} 上线`, href: '#/quiz/studio', kind: w.real ? 'warn' : '' }));
    if (!waits.length) items.push({ tag: '已就绪', text: liveN ? `下周的 ${liveN} 个测试都点过头了，${day} 自动上线` : '这周没有等你看的测试', href: '#/quiz/studio', kind: 'ok' });
    const top = lib.slice().sort((x, y) => y[1].shareRate - x[1].shareRate)[0];
    const total = lib.reduce((a, [, s]) => a + s.plays, 0);
    const rs = Object.values(TESTS.tongling.results || {});
    return {
      viz: typeof Viz !== 'undefined' && rs.length ? Viz.stack(rs.map((r, i) => ({ l: r.name.replace(fan, '').replace('型', ''), v: r.pct, c: QZ_PAL[i % QZ_PAL.length] })), { w: 420, pct: true, label: '本周测试各类型占比' }) : '',
      vizLabel: `本周「${TESTS.tongling.title}」测出的类型分布`,
      line: waits.length ? `${waits.length} 个测试等你点头，本周「${TESTS.tongling.title}」已有 ${n(wk.plays)} 人玩过` : `本周「${TESTS.tongling.title}」已有 ${n(wk.plays)} 人玩过，晒图率 ${pc(wk.shareRate)}`,
      kpis: [['等你点头', String(waits.length)], ['本周玩过', n(wk.plays)], ['晒图率', pc(wk.shareRate)], ['路人占比', pc(wk.passer)]],
      items: items.slice(0, 5),
      year: [
        `这一年出了 ${lib.length} 个测试，${fan}们一共玩了 ${n(total)} 次`,
        `你点头发布了 ${liveN + 6} 个，打回重做 ${st.redo} 次${(st.real || []).length ? `，其中 ${(st.real || []).length} 套是 AI 按剧情真出的` : ''}`,
        `晒图最多的是「${top[0].title}」，晒图率 ${pc(top[1].shareRate)}`,
      ],
    };
  },

  unmount() {
    T.timers.forEach(clearTimeout); T.rafs.forEach(cancelAnimationFrame); T = { timers: [], rafs: [] };
    document.querySelectorAll('dialog.modal').forEach(d => d.close());
  },
};

App.register(P);
})();
