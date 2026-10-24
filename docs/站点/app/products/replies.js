/* 评论挑信 —— 她每天花 5 分钟用的「回粉收件箱」。
   子页面：今天（实时评论流 + 收工前挑好的卡片 + 再挑一轮）/ 待发 / 历史 / 粉丝档案 / 设置。
   全部数据是演示用假数据；AI 只起草，她点头才进待发，产品不替她发。 */
(() => {
  /* ---------- 类别 ---------- */
  const CATS = {
    birthday: { n: '生日', why: '今天生日，当天回一句最有分量', base: 28 },
    exam:     { n: '高考 · 考试', why: '正在备考，一句加油正当时', base: 24 },
    sick:     { n: '生病', why: '身体不舒服，最需要被看见', base: 30 },
    years:    { n: '多年陪伴', why: '陪伴多年，还提到了人生节点', base: 22 },
    overseas: { n: '海外粉丝', why: '隔着语言留言，更容易被淹没', base: 20 },
    art:      { n: '同人创作', why: '花了很久做的作品，值得被认真看一眼', base: 20 },
  };
  const CAT_KEYS = Object.keys(CATS);
  const TONES = { w: '温暖', s: '简短', l: '活泼' };
  const SHORT2 = { years: '谢谢你一直在。', birthday: '生日快乐呀！', exam: '加油，一定可以。', sick: '抱抱你，早日康复。', overseas: '谢谢你远道而来！', art: '好用心，谢谢你！' };
  const LIVELY2 = { years: '这么多年还在，是最闪亮的桐铃！', birthday: '寿星今天最大，生日快乐～', exam: '冲冲冲，好消息在路上！', sick: '快快好起来，剧在等你～', overseas: '跨越山海的喜欢，收到啦！', art: '大触请收下膝盖！' };

  /* ---------- 粉丝：陪伴年数 / 来自 / 互动次数 ---------- */
  const FAN = {
    '桐铃·小海': [9, '广州', 214], '桐铃·十一': [8, '成都', 386], '南风知我意7': [7, '杭州', 128], '豆豆妈妈': [6, '武汉', 77],
    '北岛的白日梦': [10, '哈尔滨', 340], '桐铃·阿柚': [5, '南京', 96], '阿九在追剧': [9, '石家庄', 152], '等风来的鹿': [5, '兰州', 1],
    '桐学录': [4, '西安', 63], '小满不吃香菜': [3, '长沙', 88], '甜酒酿': [2, '苏州', 41], '晚星': [5, '青岛', 59],
    '月亮邮差': [5, '大连', 112], '桃桃乌龙': [1, '佛山', 23], '橘子汽水不加冰': [2, '郑州', 57], '一颗柠檬糖': [1, '合肥', 19],
    '小鱼干儿': [3, '昆明', 71], '听雨的夏天': [2, '济南', 34], '糯米团子': [2, '贵阳', 28], '一只慢吞吞': [4, '重庆', 66],
    '雨天的猫': [6, '上海', 143], '栗子味的秋': [2, '天津', 37], '熬夜冠军': [3, '深圳', 90], '青团子': [1, '福州', 12],
    'Mai·河内': [3, '越南 · 河内', 45], 'Yuki·大阪': [4, '日本 · 大阪', 52], 'Sarah·温哥华': [5, '加拿大 · 温哥华', 61],
    '金秀妍·首尔': [2, '韩国 · 首尔', 24], 'Nok·曼谷': [3, '泰国 · 曼谷', 33], 'Lucía·马德里': [1, '西班牙 · 马德里', 8],
    '画画的阿宁': [5, '北京', 118], '剪辑师阿北': [4, '厦门', 95], '桐铃·小鹿': [3, '南昌', 79], '画个月亮': [2, '沈阳', 26],
    '半夏': [6, '长春', 101], '是阿桐的铃铛': [7, '太原', 134],
  };

  /* ---------- 今天评论池里「值得亲自回」的候选（AI 从几万条里找出来的） ----------
     w：温暖两版；s / l：简短 / 活泼各一版专属，第二版用类别通用句 */
  const SP = [
    { f: '桐铃·小海', c: 'years', src: '评论', t: '从黄蓉追到现在九年了，今天毕业答辩过了，想第一个告诉你。',
      w: ['九年啦，谢谢你一直在。答辩顺利，恭喜毕业！下一站也要闪闪发光。', '毕业快乐！从黄蓉陪到现在，辛苦你啦，也恭喜你。'], s: '恭喜毕业！九年，谢谢你。', l: '答辩通关！九年老桐铃毕业快乐，撒花撒花～' },
    { f: '桐铃·十一', c: 'years', src: '超话', t: '打卡第 2,920 天。八年了，从学生变成上班族，每天下班第一件事还是来这里。',
      w: ['2,920 天，每一天都被看见了。上班辛苦，下班记得先好好吃饭。', '八年的打卡，比什么礼物都珍贵。谢谢你把下班后的时间分给这里。'], s: '2,920 天，看到了，谢谢你。', l: '打卡 2,920 天的毅力，上班一定也是最靠谱的那个！' },
    { f: '南风知我意7', c: 'years', src: '评论', t: '《美人余》第 12 集哭到停不下来，七年前看你的第一部剧也是这样哭的。',
      w: ['七年前和七年后，都谢谢你愿意为角色掉眼泪。纸巾备好，后面还有。', '原来七年前就在了。谢谢你一直替角色心疼。'], s: '七年，谢谢你一直心疼她。', l: '第 12 集确实顶不住！纸巾已备好，后面还有～' },
    { f: '豆豆妈妈', c: 'years', src: '私信', t: '追你的剧的时候还没结婚，现在女儿都会喊「桐桐姐姐」了。',
      w: ['帮忙向小朋友问声好！六年里日子变了好多，谢谢你一直带着这份喜欢。', '好可爱！等她再长大一点，可以一起看剧啦。谢谢你这六年。'], s: '向小朋友问好！谢谢这六年。', l: '「桐桐姐姐」收到！也跟小朋友挥挥手～' },
    { f: '北岛的白日梦', c: 'years', src: '超话', t: '十年了，搬了四次家，海报一直跟着。',
      w: ['十年、四次搬家，海报还在，这份心意收到了。新家也要住得开心。', '谢谢你把海报带了十年。每一个新家都顺顺利利。'], s: '十年，谢谢你。新家顺利。', l: '海报跟着搬了四次家，是最资深的室友了！' },
    { f: '桐铃·阿柚', c: 'years', src: '私信', t: '五年前在剧组外面等了一下午，你给每个人都递了水。一直记得。',
      w: ['那天太阳很大吧，谢谢你等了那么久。五年了还记得，真的很暖。', '一瓶水被记了五年，谢谢你。以后别在外面晒太久啦。'], s: '五年还记得，谢谢你。', l: '五年前的那瓶水，原来一直被好好记着！' },
    { f: '阿九在追剧', c: 'years', src: '评论', t: '高中追黄蓉，大学接着追，现在当老师了，班里学生也在追《美人余》。',
      w: ['从学生到老师，谢谢你一路都在。上课辛苦，也帮忙向同学们问好。', '九年，从课桌到讲台。谢谢你，也谢谢你的学生们。'], s: '从课桌到讲台，谢谢你。', l: '阿九老师好！下课铃响了就可以追剧啦～' },
    { f: '等风来的鹿', c: 'years', src: '私信', t: '五年里第一次留言，就想说一句：谢谢你认真拍每一部戏。',
      w: ['第一次留言就被看见了。也谢谢你五年里认真看每一部戏。', '这句话很珍贵，收到了。会继续认真拍的。'], s: '收到了，谢谢你五年。', l: '五年来的第一条留言，被翻到啦！' },
    { f: '桐学录', c: 'birthday', src: '评论', t: '今天是我生日，许愿你能看到这条。',
      w: ['看到啦！生日快乐，愿望都会实现的。', '生日快乐呀，这条被翻到了，愿望已签收～'], s: '看到啦，生日快乐！', l: '叮！生日愿望已送达，请查收一句生日快乐～' },
    { f: '小满不吃香菜', c: 'birthday', src: '超话', t: '18 岁生日！成年第一件事是来超话说一声。',
      w: ['成年快乐！18 岁的第一天，愿你勇敢又自在。', '18 岁生日快乐！新的一岁，想做的事都大胆去试。'], s: '18 岁生日快乐！', l: '成年第一件事选了这里，好有排面！18 岁快乐～' },
    { f: '甜酒酿', c: 'birthday', src: '私信', t: '今天生日还加班到十点，路上刷到《美人余》的新花絮，突然就不累了。',
      w: ['生日快乐！加班辛苦了，回家路上注意安全，蛋糕记得补上。', '辛苦啦，生日也要给自己留一口甜的。生日快乐！'], s: '生日快乐，早点休息。', l: '加班的寿星最辛苦！今晚蛋糕不限量～' },
    { f: '晚星', c: 'birthday', src: '评论', t: '妈妈今天 50 岁生日，她也是桐铃，能祝她一句吗？',
      w: ['阿姨 50 岁生日快乐！谢谢你们母女一起陪着，祝阿姨身体健康。', '祝阿姨生日快乐、天天开心！也谢谢你替妈妈来说一声。'], s: '阿姨生日快乐，身体健康！', l: '母女双桐铃！祝阿姨 50 岁生日快乐，越活越年轻～' },
    { f: '月亮邮差', c: 'birthday', src: '超话', t: '今天是我的生日，也是认识你的第五年，两个纪念日撞在一起啦。',
      w: ['双倍纪念日快乐！五年了，谢谢你把生日也分给这里。', '生日快乐，第五年也快乐，谢谢你一直在。'], s: '双倍快乐，生日快乐！', l: '两个纪念日撞车，今天快乐翻倍！' },
    { f: '桃桃乌龙', c: 'birthday', src: '评论', t: '生日愿望是在机场见你一面，下周几点的航班呀？',
      w: ['生日快乐！机场人多又挤，别为了等一面耽误自己，屏幕前也能见。', '生日快乐呀，愿望换一个吧，好好照顾自己最重要。'], s: '生日快乐，别去机场等啦。', l: '生日快乐！机场太挤，咱们屏幕前见～' },
    { f: '橘子汽水不加冰', c: 'exam', src: '私信', t: '高三了，离高考还有 227 天。每天写完卷子看一集《美人余》当奖励，能给我一句加油吗？',
      w: ['227 天，一天一天来。卷子写完再看剧，这个奖励很好，加油！', '你已经很努力了。睡够觉、吃好饭，明年六月等你的好消息。'], s: '高考加油，稳稳的。', l: '高三战士冲鸭！写完卷子的那一集最香～' },
    { f: '一颗柠檬糖', c: 'exam', src: '评论', t: '考研倒计时 60 天，二战，快撑不下去了。',
      w: ['二战的你很勇敢。最后 60 天，累了就歇一下，再接着走。', '撑不下去的时候，就先只管今天。60 天后见分晓，加油。'], s: '最后 60 天，加油。', l: '二战的人最有韧劲！60 天，冲！' },
    { f: '小鱼干儿', c: 'exam', src: '超话', t: '月考从年级 200 名进到 80 名！答应自己进步了就来留言。',
      w: ['进步 120 名，太厉害了！说到做到，这份留言收到了。', '从 200 到 80，是你一题一题写出来的。继续加油！'], s: '进步 120 名，厉害！', l: '120 名的大跨越！下次来报喜是不是要进前 50 啦？' },
    { f: '听雨的夏天', c: 'exam', src: '私信', t: '下周教资面试，抽到的题目是讲古诗词，想起你演过的才女角色。',
      w: ['面试加油！讲古诗词的你，一定也很有气质。', '祝下周面试顺利，台下的学生会喜欢你的。'], s: '教资面试顺利！', l: '未来的老师好！古诗词这题稳了～' },
    { f: '糯米团子', c: 'exam', src: '评论', t: '雅思出分 7 分！备考那三个月，每天睡前看一集你的剧放松。',
      w: ['7 分！恭喜恭喜，三个月的努力没有白费。', '太棒了！好好放松几天，下一站一定也顺利。'], s: '7 分，恭喜！', l: '7 分大佬！睡前那一集功不可没～' },
    { f: '一只慢吞吞', c: 'sick', src: '私信', t: '做完手术躺在病床上，靠刷你的剧止痛。',
      w: ['抱抱你，好好休息，剧慢慢看，等你康复。', '辛苦了！剧会一直在，先把身体养好。'], s: '好好休息，早日康复。', l: '病床追剧也要按时睡觉哦，早日出院！' },
    { f: '雨天的猫', c: 'sick', src: '评论', t: '第三次化疗了，头发掉光了，但看到新造型还是很开心。',
      w: ['抱抱你。你比任何造型都勇敢，好好休息，等你回来聊剧。', '辛苦了，每一次都撑过来了。剧和大家都在，你慢慢来。'], s: '抱抱你，慢慢来。', l: '等你好起来，一起看下一套新造型！' },
    { f: '栗子味的秋', c: 'sick', src: '超话', t: '陪床第十天，妈妈睡着了，在医院走廊里看你的剧。',
      w: ['陪床最累，你也要记得吃饭睡觉。祝阿姨早日康复。', '辛苦你了。照顾好妈妈，也照顾好自己。'], s: '辛苦了，祝阿姨早日康复。', l: '祝阿姨快快好起来，你也要按时吃饭！' },
    { f: '熬夜冠军', c: 'sick', src: '私信', t: '抑郁症复诊，医生说好转了，想跟你说一声，这两年是你的剧陪着熬过来的。',
      w: ['真为你高兴。走到今天是你自己的功劳，接着慢慢来。', '好消息收到了！谢谢你愿意说出来，以后也要好好照顾自己。'], s: '真为你高兴，慢慢来。', l: '好消息！今天值得给自己买束花～' },
    { f: '青团子', c: 'sick', src: '评论', t: '发烧 39 度请假在家，把《云秀行》从头刷了一遍。',
      w: ['39 度太难受了，多喝水多睡觉，剧等退烧了再看。', '快好起来！刷剧可以，觉也要睡够。'], s: '多喝水，早点退烧。', l: '退烧了再刷二遍！先去喝水～' },
    { f: 'Mai·河内', c: 'overseas', src: '私信', lang: '越南语', t: 'Chị ơi, em học tiếng Trung vì xem phim của chị!', tr: '姐姐，我是因为看你的剧才开始学中文的！',
      w: ['你的中文一定会越来越好！谢谢你从河内来看剧。', '下次用中文留言吧，等着看～'], s: '中文加油！', l: '河内的中文学习者，下次留言挑战全中文！' },
    { f: 'Yuki·大阪', c: 'overseas', src: '评论', lang: '日语', t: '「美人余」を字幕なしで見たくて、中国語を勉強中です！', tr: '想不看字幕看《美人余》，正在学中文！',
      w: ['不看字幕的那一天一定会来的，加油！谢谢你从大阪来看。', '你的中文已经在路上了。谢谢你喜欢《美人余》。'], s: '学中文加油！', l: '大阪的同学，期待你的第一条中文弹幕！' },
    { f: 'Sarah·温哥华', c: 'overseas', src: '超话', lang: '英语', t: 'Watching Mei Ren Yu at 3am because of the time difference. Totally worth it!', tr: '因为时差，凌晨 3 点在看《美人余》，完全值得！',
      w: ['凌晨 3 点太辛苦了，看完快去睡。谢谢你隔着时差来看。', '温哥华的凌晨也被《美人余》点亮了，谢谢你，记得补觉。'], s: '谢谢你，快去睡！', l: '跨时差追剧冠军！看完这集立刻睡觉～' },
    { f: '金秀妍·首尔', c: 'overseas', src: '评论', lang: '韩语', t: '언니 드라마 보고 처음으로 한푸를 입어 봤어요!', tr: '看了姐姐的剧，第一次试穿了汉服！',
      w: ['第一次穿汉服就很好看吧！谢谢你从首尔分享这份喜欢。', '汉服很适合你！有照片可以发在超话里。'], s: '汉服很好看！', l: '首尔汉服初体验，好期待超话返图！' },
    { f: 'Nok·曼谷', c: 'overseas', src: '评论', lang: '泰语', t: 'พี่สวยมากค่ะ รอดูละครเรื่องใหม่อยู่นะคะ', tr: '姐姐好美，在等新剧哦！',
      w: ['谢谢你从曼谷来！新剧很快就能见面了。', '收到曼谷的问候，谢谢你一直等着。'], s: '谢谢你，新剧见！', l: '曼谷的问候已送达，新剧见～' },
    { f: 'Lucía·马德里', c: 'overseas', src: '私信', lang: '西班牙语', t: '¡Mi primera serie china fue la tuya! Ahora las veo todas.', tr: '我看的第一部中国剧就是你的！现在全都在追。',
      w: ['谢谢你从马德里来！第一部中国剧就是这部，好有缘分。', '欢迎入坑！希望每一部都能陪你学一点中文。'], s: '谢谢你，欢迎入坑！', l: '马德里新桐铃，欢迎入坑～' },
    { f: '画画的阿宁', c: 'art', src: '超话', t: '画了三个晚上的古装造型，送给你！',
      w: ['画得好细！这套发饰很喜欢，已经存下来了。', '三个晚上！谢谢你，衣服的纹样都画出来了，好用心。'], s: '画得好细，存了！', l: '这套发饰画得好仙！已存图～' },
    { f: '剪辑师阿北', c: 'art', src: '评论', t: '剪了一个从黄蓉到《美人余》的九年混剪，12 分钟，剪了一个月。',
      w: ['12 分钟、一个月，每一帧都是心意。看完很感动，谢谢你。', '九年被剪进了 12 分钟，谢谢你记得这么多角色。'], s: '看完了，谢谢你。', l: '九年混剪太燃了！一个月的工夫都看到了～' },
    { f: '桐铃·小鹿', c: 'art', src: '超话', t: '写了一篇《美人余》番外，三万字，结局让他们好好在一起了。',
      w: ['三万字！谢谢你给他们写了一个好结局。', '番外看到了，结局好温柔，谢谢你。'], s: '三万字，辛苦了！', l: '三万字番外！HE 党狂喜～' },
    { f: '画个月亮', c: 'art', src: '私信', t: '用黏土捏了一个 Q 版古装小人，第一次捏，手都酸了。',
      w: ['第一次捏就这么可爱！手酸了记得揉一揉。', 'Q 版好可爱，谢谢你花这么多心思。'], s: '好可爱，谢谢你！', l: 'Q 版小人可爱暴击！手艺满分～' },
    { f: '半夏', c: 'art', src: '超话', t: '给《美人余》的主题曲填了一版粤语词，录了 demo。',
      w: ['粤语版好有味道！谢谢你花心思填词。', '听完了，词填得很美，谢谢你。'], s: '粤语版好听！', l: '粤语版一出，单曲循环预定！' },
    { f: '是阿桐的铃铛', c: 'art', src: '评论', t: '绣了一幅十字绣，绣的是黄蓉，用了八个月。',
      w: ['八个月，一针一线，太珍贵了，谢谢你。', '十字绣好用心！八个月的时间，都在这幅画里了。'], s: '八个月，太用心了！', l: '八个月的十字绣，传家宝级别！' },
  ].map((s, i) => ({ ...s, id: 's' + String(i + 1).padStart(2, '0') }));
  const SPM = Object.fromEntries(SP.map(s => [s.id, s]));

  /* ---------- 历史种子：过去几天她已回过的（天数前、粉丝、类别、原评论、回复、点赞、回复数、译文） ---------- */
  const HSEED = [
    [0, '画个月亮', 'art', '早上好！今天也带着黏土小人去上班了。', '早上好，小人今天也很精神！', 860, 74],
    [1, '北岛的白日梦', 'years', '今天是第 3,650 天，十年整。', '十年整，谢谢你，每一天都算数。', 3120, 412],
    [1, '晚星', 'years', '和妈妈一起追了五年，今天首播是一起看的。', '五年母女档，谢谢你们，一起看剧的晚上最好了。', 1860, 203],
    [1, 'Yuki·大阪', 'overseas', 'はじめまして、大阪から応援しています！', '你好呀，谢谢你从大阪来，欢迎常来留言。', 1210, 166, '你好，从大阪为你加油！'],
    [2, '画画的阿宁', 'art', '临摹了《我不是大师》里的五个身份造型。', '五个身份都画出来了，好厉害，谢谢你。', 2210, 264],
    [2, '小鱼干儿', 'exam', '期中考试前来许个愿。', '考试加油，题题都会！', 1580, 149],
    [2, '雨天的猫', 'sick', '明天开始化疗，有点怕。', '抱抱你。怕也没关系，一步一步来，大家都在。', 2780, 520],
    [3, '桐学录', 'years', '追到第四年，第一次去了剧里的取景地。', '取景地好看吧！谢谢你这四年。', 1340, 121],
    [3, '剪辑师阿北', 'art', '做了一条《云秀行》的角色混剪。', '剪得好有节奏感，谢谢你。', 1990, 233],
    [3, '豆豆妈妈', 'years', '带女儿去看了剧照展，她说长大也要当演员。', '带小朋友一起来，谢谢你们，祝她梦想成真。', 1290, 110],
    [4, '甜酒酿', 'birthday', '闺蜜今天生日，她也是桐铃，帮她许个愿。', '祝你的闺蜜生日快乐！愿望都会实现。', 1720, 176],
    [4, 'Mai·河内', 'overseas', 'Em đã xem hết 《云秀行》 rồi!', '看完啦！谢谢你从河内一路追过来。', 1150, 98, '《云秀行》我全部看完了！'],
    [5, '是阿桐的铃铛', 'years', '七年前第一次见面会的门票，到今天还留着。', '七年的门票还留着，太珍贵了，谢谢你。', 2950, 388],
    [5, '一只慢吞吞', 'sick', '下周住院做手术，来报个到。', '手术顺利！等你的好消息。', 1630, 201],
    [6, '半夏', 'art', '手抄了一整本《美人余》台词本。', '一整本！字好漂亮，谢谢你。', 1880, 190],
    [6, '小满不吃香菜', 'exam', '中考那年是你的剧陪着复习的，今天高中开学。', '开学快乐！新学校新开始，加油。', 1420, 132],
    [6, 'Sarah·温哥华', 'overseas', 'First time leaving a comment here!', '第一次留言就被看到啦，欢迎！', 990, 87, '第一次在这里留言！'],
  ];

  /* ---------- 评论流素材 ---------- */
  const ORD = ['姐姐好美！！！', '期待新剧', '这个造型绝了', '今天也是爱桐桐的一天', '求路透', '姐姐看看我', '冲冲冲', '好想见你一面', '太好看了', '这条先赞', '美貌暴击', '晚安～',
    '《美人余》今天更新了吗', '第 8 集那场雨戏太好哭了', '追更打卡', '这个发型好适合', '声音好温柔', '笑起来太甜了', '弹幕都在夸', '演技好细腻', '会员没白充', '二刷中',
    '这集台词好戳', '同款发簪在哪买', '每天都在等更新', '这个眼神杀', '《我不是大师》五个身份切换太强了', '江飞燕好飒', '求高清剧照', '今天也打卡了', '吃饭时看的，饭都凉了',
    '妈妈问我在笑什么', '安利给室友了，室友也入坑', '这身红衣好绝', '求同款妆容教程', '又被片尾曲戳到', '片尾曲单曲循环', '花絮好可爱', '下雨天适合看《美人余》', '今天的预告好甜',
    '给配角也加点戏吧', '剧情越来越好看了', '有没有人一起追', '第一次看就被圈粉', '老粉报到', '新粉报到', '截图当壁纸了', '希望多拍几部古装', '这一集能看十遍', '好喜欢这段对白',
    '夏天追《云秀行》，秋天追《美人余》', '超话签到 ✓', '这个转身好美', '今天的花絮笑死', '求出原声带', '这集节奏好好', '刚下班，开追'];
  const BLK = ['求下周行程', '有没有人出机场代拍图', '住哪家酒店有人知道吗', '代拍图包私我', '二手票有人要吗', '下周几点的航班'];
  const CTRL = ['李一桐美人余 收视长虹', '美人余热播 李一桐演技在线', '李一桐 新剧大爆 好评如潮', '#李一桐美人余# 好剧推荐', '李一桐 闪耀荧屏 未来可期', '李一桐 美人余 口碑炸裂'];
  const NICK_A = ['小', '阿', '是', '一只', '今天也', '桐铃', '爱吃', '橙子', '晚风', '星星', '奶茶', '云朵'];
  const NICK_B = ['桐桐', '铃铛', '追剧中', '不熬夜', '糯米', '小狗', '的猫', '的海', '鱼丸', '在发呆', '加点糖', '向前冲'];

  /* ---------- 小工具 ---------- */
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pad = n => String(n).padStart(2, '0');
  const dayKey = (off = 0) => { const d = new Date(); d.setDate(d.getDate() - off); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const WK = '日一二三四五六';
  const dayLabel = k => { const d = new Date(k + 'T12:00'); return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${WK[d.getDay()]}`; };
  const daysAgo = k => Math.round((new Date(dayKey() + 'T12:00') - new Date(k + 'T12:00')) / 864e5);
  const agoText = k => { const n = daysAgo(k); return n <= 0 ? '今天' : n === 1 ? '昨天' : `${n} 天前`; };
  const hhmm = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const spTime = id => { const r = rng(hash(id))(); const m = Math.floor(7 * 60 + r * 11 * 60); return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
  const simLikes = (cat, id) => { const avg = { years: 2300, birthday: 1700, exam: 1600, sick: 2200, overseas: 1150, art: 1900 }[cat]; const r = rng(hash(id + 'lk')); const likes = Math.round(avg * (0.75 + r() * 0.5)); return [likes, Math.round(likes * (0.08 + r() * 0.07))]; };

  let timer = null;

  App.register({
    id: 'replies', accent: 'fans', demo: 0, name: '评论挑信', tag: '粉丝',
    short: '几万条评论里，每天挑出最值得女演员亲自回的几条，草稿起好，女演员点头才发。',
    meta: '每天 5 分钟 · AI 只起草',
    blurb: '每天替女演员从几万条评论里，挑出最值得亲自回的几条。',
    pain: '评论和私信每天上万条，女演员想回也看不过来。后援会说对接群里常常是「一个人自言自语」，真正需要一句话的人被淹没了。',
    ai: '每天收工后打开，6 到 8 条已经挑好、草稿起好。女演员花 5 分钟点头回 1 到 2 条；周末看一眼哪类回复粉丝最开心。',

    mount(root, ctx) {
      const { $, $$, esc, fmt, store, toast, think, show, modal, go } = ctx;
      const sub = (ctx.sub || '').split('/')[0];
      const ai = ctx.ai, profile = ctx.profile;
      const prof = profile ? profile.get() : { name: '李一桐', fan: '桐铃', show: '美人余' };
      /* 演示文案里的名字、粉丝名、剧名跟着「她的档案」走 */
      const P = x => String(x ?? '').replace(/美人余/g, prof.show).replace(/李一桐/g, prof.name).replace(/桐铃(?!·)/g, prof.fan);
      const aiOn = () => !!(ai && ai.ready && ai.ready());

      /* ---------- 状态 ---------- */
      const seed = () => ({
        v: 1, day: dayKey(), received: 28436, ran: false, picks: [], skip: [], queue: [], stars: [], seq: 1,
        hist: HSEED.map((h, i) => ({ id: 'h' + i, fan: h[1], cat: h[2], text: h[3], reply: h[4], likes: h[5], rep: h[6], tr: h[7] || '', day: dayKey(h[0]), at: `${pad(20 + (i % 4))}:${pad((i * 17) % 60)}` })),
        set: { cats: Object.fromEntries(CAT_KEYS.map(k => [k, true])), n: 6, tone: 'w', block: ['行程', '酒店', '代拍', '航班', '二手票'] },
      });
      let st = store.get('st', null);
      if (!st || st.v !== 1) st = seed();
      if (st.day !== dayKey()) { st.day = dayKey(); st.ran = false; st.picks = []; st.skip = []; st.received = 9000 + Math.floor(Math.random() * 4000); }
      if (!st.real) st.real = [];
      const save = () => store.set('st', st);
      save();
      const getS = id => SPM[id] || st.real.find(x => x.id === id);
      const fanInfo = name => FAN[name] || [0, '真评论', st.hist.filter(h => h.fan === name).length + 1];

      /* ---------- 派生 ---------- */
      const today = dayKey();
      const sentToday = () => st.hist.filter(h => h.day === today).length;
      const pendingCards = () => st.picks.filter(p => p.st === 'new').length;
      const blockedBy = text => st.set.block.find(w => w && text.includes(w));
      const fanLast = name => st.hist.filter(h => h.fan === name).map(h => h.day).sort().pop() || null;
      const isUsed = id => st.picks.some(p => p.cid === id) || st.queue.some(q => q.cid === id) || st.hist.some(h => h.cid === id) || st.skip.includes(id);
      const score = s => { if (s.real) return s.sc; const f = FAN[s.f]; const last = fanLast(s.f); return Math.min(99, 40 + CATS[s.c].base + f[0] * 2 + (last ? Math.min(daysAgo(last), 6) : 10) + (hash(s.id) % 9)); };
      const candidates = (extra = [], real = false) => (real ? st.real : SP).filter(s => st.set.cats[s.c] && !blockedBy(s.t) && !isUsed(s.id) && !extra.includes(s.id)).sort((a, b) => score(b) - score(a));
      const two = (v, fb) => Array.isArray(v) ? v : [v, fb];
      const drafts = (s, tone) => (tone === 's' ? two(s.s, SHORT2[s.c]) : tone === 'l' ? two(s.l, LIVELY2[s.c]) : s.w).map(P);
      const draftText = p => p.ed != null ? p.ed : drafts(getS(p.cid), p.tone)[p.v];
      const diversePick = (pool, n) => {
        // 先每类挑最暖的一条，再每类最多两条，最后按分数补满
        const out = [], per = {};
        for (const cap of [1, 2]) for (const s of pool) { if (out.length >= n) break; if (!out.includes(s) && (per[s.c] || 0) < cap) { out.push(s); per[s.c] = (per[s.c] || 0) + 1; } }
        for (const s of pool) { if (out.length >= n) break; if (!out.includes(s)) out.push(s); }
        return out;
      };

      if (!st.ran && !st.picks.length) {
        st.picks = diversePick(candidates(), st.set.n).map(s => ({ cid: s.id, v: 0, tone: st.set.tone, ed: null, st: 'new' }));
        st.ran = true; st.auto = true; save();
      }

      /* ---------- 骨架 ---------- */
      const NAV = [['', '今天', () => pendingCards() || ''], ['queue', '待发', () => st.queue.length || ''], ['history', '历史', () => ''], ['fans', '粉丝档案', () => '']];
      root.innerHTML = `
      <div class="app rp">
        <style>
          .rp .lay{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:16px;align-items:start;margin-top:16px}
          @media (max-width:1180px){.rp .lay{grid-template-columns:1fr}.rp #rp-scan{position:static!important}}
          .rp .live{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--bad)}
          .rp .live i{width:7px;height:7px;border-radius:50%;background:var(--bad)}
          .rp .live.off{color:var(--dim)}.rp .live.off i{background:var(--dim)}
          .rp .stream{height:520px;overflow:auto;margin:0 -6px;padding:0 6px;mask-image:linear-gradient(#000 88%,transparent)}
          @media (max-width:1180px){.rp .stream{height:360px}}
          .rp .si{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px;padding:9px 2px;border-top:1px solid var(--line);font-size:13px;line-height:1.5}
          .rp .si:first-child{border-top:0}
          .rp .si.new{animation:rpin .5s var(--ease) both}
          @keyframes rpin{from{opacity:0;translate:0 -10px;background:var(--accent-soft)}}
          .rp .si .sc{font-size:11px;padding:1px 6px;border-radius:6px;background:var(--surface2);color:var(--muted);height:fit-content;margin-top:2px}
          .rp .si .nm{color:var(--muted);font-size:12px;overflow-wrap:anywhere}.rp .si .tm{color:var(--dim);font-size:11.5px;font-variant-numeric:tabular-nums;margin-left:6px}
          .rp .si .tx{overflow-wrap:anywhere}
          .rp .si.ctrl .tx,.rp .si.ctrl .nm{color:var(--dim)}.rp .si.ctrl .tx{text-decoration:line-through;text-decoration-color:var(--line2)}
          .rp .si.blk .tx{color:var(--muted)}
          .rp .si.flag{background:var(--accent-soft);border-radius:8px;padding-left:8px;padding-right:8px}
          .rp .si .fl{display:inline-block;margin-left:6px;font-size:11px;color:var(--accent)}
          .rp .pick blockquote{margin:12px 0 6px;padding:10px 14px;border-left:2px solid var(--accent);background:var(--tint);border-radius:0 10px 10px 0;font-size:15px;overflow-wrap:anywhere}
          .rp .pick .tr{font-size:12.5px;color:var(--info);margin:0 0 6px}
          .rp .pick .why{font-size:12.5px;color:var(--muted);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
          .rp .pick .why .meter{flex:1;min-width:80px;max-width:160px}
          .rp .pick.st-new:hover{border-color:var(--accent-line)}
          .rp .draft{margin-top:12px;padding:12px;border-radius:12px;background:var(--surface2);border:1px dashed var(--accent-line)}
          .rp .draft .k{font-size:12px;color:var(--accent)}
          .rp .draft .textarea{min-height:74px;margin-top:8px;font-size:14.5px}
          .rp .seg{display:inline-flex;border:1px solid var(--line2);border-radius:999px;overflow:hidden}
          .rp .seg button{all:unset;cursor:pointer;padding:3px 11px;font-size:12px;color:var(--muted)}
          .rp .seg button.on{background:var(--accent-soft);color:var(--accent)}
          .rp .pick.st-queued{border-color:var(--ok)}
          .rp .pick.st-sent{border-color:var(--info)}
          .rp .pick.st-skip{background:var(--surface2);padding:12px 18px}
          .rp .pick .stamp{font-size:13px;padding:10px 12px;border-radius:10px;background:var(--ok-soft);color:var(--ok);margin-top:10px}
          .rp .fan-link{cursor:pointer;border-bottom:1px dashed var(--line2)}.rp .fan-link:hover{color:var(--accent);border-color:var(--accent)}
          .rp .note{font-size:12.5px;color:var(--muted);padding:10px 14px;border-radius:10px;background:var(--surface2);border:1px solid var(--line)}
          .rp .rp-foot{font-size:12px;color:var(--dim);margin-top:28px;padding-top:14px;border-top:1px solid var(--line)}
          .rp .ch-l{fill:var(--muted);font-size:13px}.rp .ch-v{fill:var(--text);font-size:13px;font-variant-numeric:tabular-nums}
          .rp .ch-bar{fill:var(--surface3)}.rp .ch-bar.best{fill:var(--accent)}
          .rp .ch-grid{stroke:var(--line);stroke-dasharray:3 4}
          .rp .day-h{font-size:12.5px;color:var(--accent);font-variant-numeric:tabular-nums;margin:18px 0 6px}
          .rp .hrec{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;padding:12px 0;border-top:1px solid var(--line)}
          .rp .hrec .q{font-size:12.5px;color:var(--muted);margin-top:4px;overflow-wrap:anywhere}
          .rp .hrec .re{font-size:14px;margin-top:4px}
          .rp .hrec .nums{font-variant-numeric:tabular-nums;font-size:12.5px;color:var(--muted);text-align:right;white-space:nowrap}
          .rp .hrec .nums b{color:var(--accent);font-weight:600}
          .rp .tl{list-style:none;margin:0 0 0 6px;padding:0;border-left:1px solid var(--line2)}
          .rp .tl li{position:relative;padding:0 0 16px 18px}
          .rp .tl li::before{content:"";position:absolute;left:-5px;top:7px;width:9px;height:9px;border-radius:50%;background:var(--surface3);border:1px solid var(--line2)}
          .rp .tl li.hot::before{background:var(--accent);border-color:var(--accent)}
          .rp .tl .d{font-size:12px;font-variant-numeric:tabular-nums;color:var(--dim)}
          .rp .tl .rp-re{margin-top:6px;padding:8px 10px;border-radius:8px;background:var(--accent-soft);font-size:13px}
          .rp .setrow{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 0;border-top:1px solid var(--line)}
          .rp .setrow:first-of-type{border-top:0}
          .rp .wchip{display:inline-flex;align-items:center;gap:6px;padding:5px 6px 5px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line2);font-size:13px}
          .rp .wchip button{all:unset;cursor:pointer;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:var(--muted)}
          .rp .wchip button:hover{background:var(--bad-soft);color:var(--bad)}
          .rp .range{width:100%;accent-color:var(--accent)}
          .rp tr.click{cursor:pointer}
          .rp .tag,.rp .table th,.rp.app .side .sec{font-family:var(--sans);letter-spacing:.02em}
          .rp .doneln{font-size:13.5px;color:var(--ok);font-variant-numeric:tabular-nums}
          .rp .doneln b{font-weight:600}
          .rp .sfchips{flex-wrap:nowrap;overflow-x:auto;gap:6px;scrollbar-width:none;margin:0 -2px;padding:0 2px}
          .rp .sfchips::-webkit-scrollbar{display:none}
          .rp .sfchips .chip{flex:none;padding:6px 11px;font-size:13px}
        </style>
        <aside class="side">
          <div class="brand"><i>✉</i><div><b>评论挑信</b><small>回粉收件箱 · 演示数据</small></div></div>
          <nav id="rp-nav">${NAV.map(([k, n, c]) => `<a href="#/replies${k ? '/' + k : ''}" class="${sub === k ? 'on' : ''}" data-k="${k}">${n}${c() ? ` <em>${c()}</em>` : ''}</a>`).join('')}</nav>
          <div class="sec">设置</div>
          <nav><a href="#/replies/settings" class="${sub === 'settings' ? 'on' : ''}">挑选偏好</a></nav>
          </aside>
        <section class="main"><div id="rp-main"></div><p class="rp-foot">AI 只起草，女演员点头才进待发；产品不替女演员发任何一条。页面上所有评论、粉丝名、数字都是演示用假数据。</p></section>
      </div>`;
      const app = $('.rp', root), main = $('#rp-main', root);

      const paintNav = () => {
        $$('#rp-nav a', app).forEach(a => {
          const item = NAV.find(n => n[0] === a.dataset.k); const c = item[2]();
          a.innerHTML = `${item[1]}${c ? ` <em>${c}</em>` : ''}`;
        });
      };
      const roll = (el, to) => {
        if (!el) return; const from = +el.dataset.v || 0; el.dataset.v = to; if (from === to) { el.textContent = fmt(to); return; }
        const t0 = performance.now();
        const f = now => { const k = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(f); };
        requestAnimationFrame(f);
      };
      const copy = async text => {
        try { await navigator.clipboard.writeText(text); toast('复制好了，去微博粘贴', 'ok'); }
        catch (e) {
          const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.append(ta); ta.select();
          let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
          ta.remove(); ok ? toast('复制好了，去微博粘贴', 'ok') : window.prompt('全选复制：', text);
        }
      };
      const head = (title, desc, actions = '') => `<div class="head"><div><h2>${title}</h2><p>${desc}</p></div><div class="row">${actions}<button class="btn btn-ghost btn-icon" data-pick="replies" aria-label="想要">♡</button></div></div>`;
      const catTag = c => `<span class="tag accent">${esc(CATS[c].n)}</span>`;
      const avatar = name => `<span class="avatar">${esc([...name.replace(/^桐铃·/, '')][0])}</span>`;

      /* ---------- 粉丝抽屉 ---------- */
      function openFan(name) {
        const f = fanInfo(name), isReal = !FAN[name];
        const recs = st.hist.filter(h => h.fan === name);
        const sps = [...SP, ...st.real].filter(s => s.f === name);
        const r = rng(hash(name));
        const old = isReal ? [] : [0, 1].map(i => ({ d: dayKey(8 + Math.floor(r() * 30) + i * 14), t: ORD[Math.floor(r() * ORD.length)] }));
        const items = [
          ...sps.map(s => {
            const p = st.picks.find(x => x.cid === s.id), q = st.queue.find(x => x.cid === s.id), h = st.hist.find(x => x.cid === s.id);
            const stt = h ? '女演员已回' : q ? '在待发里' : p ? (p.st === 'skip' ? '今天跳过了' : '今天被挑出') : '还在评论池里';
            return { d: today, t: P(s.t), tr: s.tr, re: h ? '女演员回：' + h.reply : q ? '草稿：' + q.text : '', tag: stt, hot: true };
          }),
          ...recs.filter(h => !h.cid).map(h => ({ d: h.day, t: P(h.text), tr: h.tr, re: '女演员回：' + P(h.reply), tag: `♥ ${fmt(h.likes)}`, hot: true })),
          ...old.map(o => ({ d: o.d, t: P(o.t), tag: '没被挑' })),
        ].sort((a, b) => b.d.localeCompare(a.d));
        const starred = st.stars.includes(name);
        const last = fanLast(name);
        const addable = sps.find(s => !isUsed(s.id) && st.set.cats[s.c] && !blockedBy(s.t));
        const d = modal(`
          <div class="row">${avatar(name)}<div><b style="font-size:17px">${esc(name)}</b><div class="small muted">${isReal ? '来自贴进来的真评论 · 只存在这台电脑' : '来自 ' + esc(f[1])}</div></div></div>
          <div class="grid-3" style="margin-top:16px">
            <div class="kpi"><b>${isReal ? '—' : f[0]}</b><span>陪伴年数</span></div>
            <div class="kpi"><b>${fmt(isReal ? f[2] : f[2] + recs.length)}</b><span>互动次数</span></div>
            <div class="kpi"><b style="font-size:20px">${last ? agoText(last) : '从没'}</b><span>上次被女演员回</span></div>
          </div>
          <div class="eyebrow" style="margin:20px 0 12px">TA 的评论</div>
          <ul class="tl">${items.map(it => `<li class="${it.hot ? 'hot' : ''}"><div class="row between"><span class="d">${esc(agoText(it.d))} · ${esc(it.d.slice(5))}</span><span class="tag">${esc(it.tag)}</span></div>
            <div style="margin-top:4px">${esc(it.t)}</div>${it.tr ? `<div class="xs" style="color:var(--info)">AI 翻译：${esc(it.tr)}</div>` : ''}
            ${it.re ? `<div class="rp-re">${esc(it.re)}</div>` : ''}</li>`).join('')}</ul>`,
          { title: '粉丝档案', drawer: true, foot: `${addable ? `<button class="btn" data-x="add">把 TA 今天这条加进挑选</button>` : ''}<button class="btn ${starred ? 'btn-primary' : ''}" data-x="star">${starred ? '★ 已星标' : '☆ 星标'}</button>` });
        d.classList.add('rp');
        const sb = $('[data-x="star"]', d);
        sb.onclick = () => {
          const on = st.stars.includes(name);
          st.stars = on ? st.stars.filter(x => x !== name) : [...st.stars, name]; save();
          sb.className = 'btn ' + (on ? '' : 'btn-primary'); sb.textContent = on ? '☆ 星标' : '★ 已星标';
          toast(on ? '取消星标' : '星标了，粉丝档案里可以只看星标', 'ok');
          if (sub === 'fans') renderFans();
        };
        const ab = $('[data-x="add"]', d);
        if (ab) ab.onclick = () => {
          st.picks.unshift({ cid: addable.id, v: 0, tone: st.set.tone, ed: null, st: 'new' }); st.ran = true; save();
          d.close(); toast('加进今天的挑选了', 'ok');
          if (sub === '') renderToday(); else go('');
        };
      }

      /* ======================= 今天 ======================= */
      let streamItems = [], streamFilter = 'all', paused = false, shown = 80;
      const genItem = (r, at) => {
        const x = r(), y = r(), src = y < .55 ? '评论' : y < .85 ? '超话' : '私信';
        const nick = r() < .45 ? `${prof.fan}${1000 + Math.floor(r() * 9000)}` : NICK_A[Math.floor(r() * NICK_A.length)] + NICK_B[Math.floor(r() * NICK_B.length)];
        if (x < .16) return { k: 'ctrl', src: '评论', n: nick, t: CTRL[Math.floor(r() * CTRL.length)], at };
        if (x < .21) return { k: 'blk', src, n: nick, t: BLK[Math.floor(r() * BLK.length)], at };
        if (x < .25) { const s = SP[Math.floor(r() * SP.length)]; return { k: 'sp', src: s.src, n: s.f, t: s.t, c: s.c, at }; }
        return { k: 'ord', src, n: nick, t: ORD[Math.floor(r() * ORD.length)], at };
      };
      const initStream = () => {
        const r = rng(hash(today)); let t = Date.now();
        streamItems = [];
        for (let i = 0; i < 320; i++) { t -= 8000 + r() * 40000; streamItems.push(genItem(r, t)); }
      };
      const siHTML = (it, isNew) => {
        const b = it.k !== 'ctrl' && blockedBy(it.t);
        const cls = it.k === 'ctrl' ? 'ctrl' : b ? 'blk' : it.k === 'sp' ? 'flag' : '';
        const text = b ? `已屏蔽一条（命中「${esc(b)}」）` : esc(P(it.t));
        return `<div class="si ${cls}${isNew ? ' new' : ''}"><span class="sc">${esc(it.src)}</span><div><div class="nm">@${esc(it.n)}<span class="tm">${hhmm(new Date(it.at))}</span>${it.k === 'ctrl' ? '<span class="fl" style="color:var(--dim)">控评模板</span>' : ''}${it.k === 'sp' && !b ? `<span class="fl">✦ AI 标记 · ${esc(CATS[it.c].n)}</span>` : ''}</div><div class="tx">${text}</div></div></div>`;
      };
      const passFilter = it => streamFilter === 'all' || (streamFilter === 'flag' ? it.k === 'sp' : it.src === streamFilter);
      const paintStream = () => {
        const box = $('#rp-stream', main); if (!box) return;
        const list = streamItems.filter(passFilter);
        box.innerHTML = list.slice(0, shown).map(it => siHTML(it)).join('') +
          (list.length > shown ? `<div style="text-align:center;padding:12px"><button class="btn btn-sm btn-ghost" data-act="more">再看 50 条更早的（共 ${fmt(list.length)} 条样本）</button></div>` : '');
      };
      const tick = () => {
        if (paused) return;
        const r = rng(Date.now() & 0x7fffffff);
        const it = genItem(r, Date.now()); streamItems.unshift(it); if (streamItems.length > 600) streamItems.pop();
        st.received += 3 + Math.floor(r() * 15); save();
        roll($('#k-recv', main), st.received);
        const box = $('#rp-stream', main);
        if (box && passFilter(it)) { box.insertAdjacentHTML('afterbegin', siHTML(it, true)); const kids = box.querySelectorAll('.si'); if (kids.length > shown + 1) kids[kids.length - 1].remove(); }
      };

      const cardHTML = (p, i) => {
        const s = getS(p.cid); const f = fanInfo(s.f); const last = fanLast(s.f);
        const meta = s.real ? `贴进来的真评论 · ${esc(s.at)}` : `${esc(s.src)} · ${spTime(s.id)} · 陪伴 ${f[0]} 年 · ${esc(f[1])}`;
        const top = `<div class="row between"><div class="row" style="gap:10px">${avatar(s.f)}<div><b class="fan-link" data-act="fan" data-fan="${esc(s.f)}">${esc(s.f)}</b><div class="xs muted">${meta}</div></div></div><div class="row" style="gap:6px">${s.real ? '<span class="tag ok">真实</span>' : ''}${catTag(s.c)}</div></div>`;
        if (p.st === 'skip') return `<article class="card pick st-skip" data-i="${i}"><div class="row between"><span class="small muted">已跳过 · ${esc(s.f)}：${esc([...P(s.t)].slice(0, 18).join(''))}…</span><button class="btn btn-sm btn-ghost" data-act="unskip">撤销</button></div></article>`;
        const quote = `<blockquote>${esc(P(s.t))}</blockquote>${s.tr ? `<p class="tr">AI 翻译${s.lang ? `（${esc(s.lang)}）` : ''}：${esc(s.tr)}</p>` : ''}`;
        if (p.st === 'queued' || p.st === 'sent') {
          const q = st.queue.find(x => x.cid === s.id), h = st.hist.find(x => x.cid === s.id);
          return `<article class="card pick st-${p.st}" data-i="${i}">${top}${quote}
            <div class="stamp">${p.st === 'sent' ? `✓ 已标记发出 · ♥ ${fmt(h ? h.likes : 0)} · ↩ ${fmt(h ? h.rep : 0)}（模拟反应）` : '✓ 女演员点头了，已进待发'}<div style="color:var(--text);margin-top:4px">${esc(h ? h.reply : q ? q.text : draftText(p))}</div></div>
            <div class="ft">${p.st === 'queued' ? `<a class="btn btn-sm btn-primary" href="#/replies/queue">去待发</a><button class="btn btn-sm btn-ghost" data-act="unqueue">撤回</button>` : `<a class="btn btn-sm" href="#/replies/history">看历史</a>`}</div></article>`;
        }
        const sc = score(s);
        return `<article class="card pick st-new" data-i="${i}">${top}${quote}
          <div class="why"><span>为什么挑它：${s.real ? esc(s.why) : `${esc(CATS[s.c].why)} · ${last ? `上次被回是${agoText(last)}` : '从没被回过'}`}</span><span class="row" style="gap:6px;flex:1;min-width:140px;flex-wrap:nowrap"><span class="xs">暖度 <b style="font-variant-numeric:tabular-nums">${sc}</b></span><span class="meter"><i style="width:${sc}%"></i></span></span></div>
          <div class="draft">
            <div class="row between"><span class="k">回复草稿${p.ed != null ? ' · 已改过' : ''}</span>
              <div class="row" style="gap:6px"><span class="seg">${['A', 'B'].map((x, k) => `<button class="${p.v === k && p.ed == null ? 'on' : ''}" data-act="ver" data-v="${k}">版本 ${x}</button>`).join('')}</span>
              <span class="seg">${Object.entries(TONES).map(([k, n]) => `<button class="${p.tone === k ? 'on' : ''}" data-act="tone" data-v="${k}">${n}</button>`).join('')}</span></div></div>
            <textarea class="textarea" data-act="edit" aria-label="回复草稿，可以直接改">${esc(draftText(p))}</textarea>
            ${s.tr ? `<div class="xs muted" style="margin-top:6px">发出时会附上${esc(s.lang || '原文语言的')}译文，女演员先看中文就行。</div>` : ''}
            ${p.ed != null ? `<button class="btn btn-sm btn-ghost" style="margin-top:8px" data-act="restore">恢复 AI 草稿</button>` : ''}
          </div>
          <div class="ft"><button class="btn btn-sm btn-primary" data-act="ok">就它了</button><button class="btn btn-sm" data-act="swap">换一条</button><button class="btn btn-sm btn-ghost" data-act="skip">跳过</button></div></article>`;
      };
      const paintCard = i => { const el = $(`.pick[data-i="${i}"]`, main); if (el) el.outerHTML = cardHTML(st.picks[i], i); };
      const flowHTML = () => {
        const done = [st.ran, st.picks.some(p => p.st === 'queued' || p.st === 'sent'), st.picks.some(p => p.st === 'sent'), false]; // 只看这一批卡片
        const cur = done.indexOf(false);
        return ['AI 挑好', '女演员点头', '女演员亲自发出', '周末看反应'].map((n, i) => `<span class="${done[i] ? 'done' : i === cur ? 'on' : ''}"><i>${done[i] ? '✓' : i + 1}</i>${n}</span>`).join('');
      };
      /* 一眼看：几万条怎么变成几条；今天的评论什么时候来、挑出来的是哪几类时刻 */
      const vizHTML = () => {
        const recv = st.received, kept = Math.round(recv * .58), flagged = Math.max(st.picks.length, Math.round(recv * .0021));
        const funnel = Viz.funnel([{ l: '今天收到', v: recv }, { l: '去掉控评和重复', v: kept }, { l: 'AI 标记值得看', v: flagged }, { l: '挑给女演员', v: st.picks.length }, { l: '女演员亲自回', v: sentToday() }], { w: 460, lw: 110, vw: 110, vw2: 56, c: 'var(--accent)', label: '评论怎么挑出来的' });
        const shape = [1, .6, .4, .3, .3, .4, .8, 1.6, 2.2, 2.4, 2.3, 2.6, 2.8, 2.4, 2.3, 2.4, 2.7, 3.1, 3.6, 4.2, 7.5, 6.8, 4.6, 2.4];
        const hourNow = new Date().getHours(), sum = shape.slice(0, hourNow + 1).reduce((a, b) => a + b, 0) || 1;
        const hours = shape.map((s, i) => i <= hourNow ? Math.round(s / sum * recv) : 0);
        const cats = CAT_KEYS.map(k => ({ l: CATS[k].n, v: st.picks.filter(p => { const s = getS(p.cid); return s && s.c === k; }).length })).filter(x => x.v);
        return `<div class="viz-card"><div class="vh"><b>${fmt(recv)} 条怎么变成 ${st.picks.length} 条</b><span>只有最后一步是女演员</span></div>${funnel}<p class="vn">中间两步的数字按今天的量推算；接入 AI 后贴真评论，这里就是真数。</p></div>
          <div class="viz-card"><div class="vh"><b>评论什么时候来</b><span>每小时 · 到现在 ${hourNow} 点</span></div>${Viz.cols(hours, { w: 460, h: 110, labels: shape.map((_, i) => i % 6 ? '' : i + '点'), hi: 20, hc: 'var(--accent)', c: 'var(--surface3)', label: '今天每小时收到的评论数' })}<p class="vn">20 点更新后是高峰，所以收工后挑最准。</p>
            ${cats.length ? `<div class="vh" style="margin-top:14px"><b>挑出来的是哪几类时刻</b><span>${st.picks.length} 条</span></div>${Viz.stack(cats.map((c, i) => ({ ...c, c: ['var(--accent)', 'var(--c-quiz)', 'var(--c-guard)', 'var(--c-vibe)', 'var(--warn)', 'var(--dim)'][i] })), { w: 460, label: '挑出的评论按类别' })}` : ''}</div>`;
      };
      const paintKpis = () => {
        roll($('#k-recv', main), st.received); roll($('#k-pick', main), st.picks.length);
        roll($('#k-sent', main), sentToday()); roll($('#k-q', main), st.queue.length);
        const fl = $('#rp-flow', main); if (fl) fl.innerHTML = flowHTML();
        const vz = $('#rp-viz', main); if (vz) vz.innerHTML = vizHTML();
        paintNav();
      };
      const paintPicksArea = () => {
        const box = $('#rp-out', main);
        if (!st.ran || !st.picks.length) {
          box.innerHTML = `<div class="empty"><b>今天还没挑</b>按右上角「再挑一轮」，AI 会读完今天的 ${fmt(st.received)} 条，挑出 ${st.set.n} 条值得亲自回的。</div>`; return;
        }
        const left = st.picks.filter(p => p.st === 'new').length;
        const lead = st.mode === 'real' && st.realStats ? `AI 从贴进来的 <b>${st.realStats.total}</b> 条真评论里挑出` : st.auto ? '收工前 AI 已挑好' : '挑出';
        show(box, `<p class="doneln">✓ ${lead} <b>${st.picks.length}</b> 条 · 还有 <b>${left}</b> 条等女演员看 · 语气偏好「${TONES[st.set.tone]}」</p>` + st.picks.map(cardHTML).join('') +
          `<p class="note">AI 只起草。回不回、怎么改，女演员说了算；点「就它了」只是放进待发，发出去的仍然是女演员本人。</p>`);
      };

      async function runPick(btn) {
        if (!candidates().length && !st.picks.some(p => p.st === 'new' || p.st === 'skip')) { toast('今天值得回的都挑完了，明天再来'); return; }
        btn.disabled = true;
        const scan = $('#rp-scan', main); scan && scan.classList.add('scan');
        const total = st.received, ctrl = Math.round(total * .61), dup = Math.round(total * .17);
        const blkN = st.set.block.length ? Math.round(total * .012) : 0;
        const counts = CAT_KEYS.filter(k => st.set.cats[k]).map(k => `${CATS[k].n} ${SP.filter(s => s.c === k).length * 7 + hash(k + today) % 9}`).join(' · ');
        // 已点头 / 已发的卡留着，其余换新；跳过的不再出现
        const keep = st.picks.filter(p => p.st === 'queued' || p.st === 'sent');
        st.skip = [...new Set([...st.skip, ...st.picks.filter(p => p.st === 'skip').map(p => p.cid)])];
        st.picks = keep;
        await think($('#rp-out', main), [
          `读完今天的 ${fmt(total)} 条（超话 · 评论 · 私信）`,
          `去掉控评模板 ${fmt(ctrl)} 条、重复内容 ${fmt(dup)} 条`,
          st.set.block.length ? `屏蔽词命中 ${fmt(blkN)} 条（${st.set.block.join('、')}）` : '屏蔽词：没有设置',
          `找出特别时刻：${counts}`,
          '按「回了最暖」排序：特别时刻 × 陪伴年数 × 多久没被回过',
          `按「${TONES[st.set.tone]}」语气，每条起草两版`,
        ], 'AI 正在挑');
        scan && scan.classList.remove('scan');
        const chosen = diversePick(candidates(), st.set.n);
        st.picks = [...chosen.map(s => ({ cid: s.id, v: 0, tone: st.set.tone, ed: null, st: 'new' })), ...keep];
        st.ran = true; st.auto = false; st.mode = 'demo'; save();
        btn.disabled = false;
        paintPicksArea(); paintKpis();
        toast(chosen.length ? `挑好了 ${chosen.length} 条` : '池子里没有新的了', chosen.length ? 'ok' : '');
      }

      function renderToday() {
        if (!streamItems.length) initStream();
        main.innerHTML = head('今天', `${dayLabel(today)} · 收工后花 5 分钟，挑 1 到 2 条亲自回。`, `${aiOn() ? '<button class="btn" data-act="paste">贴真评论</button>' : ''}<button class="btn btn-primary" id="rp-go">再挑一轮</button>`) + `
          <div class="kpis">
            <div class="kpi"><small>LIVE</small><b id="k-recv" data-v="0">0</b><span>今天收到</span></div>
            <div class="kpi" style="--kc:var(--accent)"><b id="k-pick" data-v="0">0</b><span>AI 挑出</span></div>
            <div class="kpi" style="--kc:var(--ok)"><b id="k-sent" data-v="0">0</b><span>女演员已回</span></div>
            <div class="kpi" style="--kc:var(--warn)"><b id="k-q" data-v="0">0</b><span>待发</span></div>
          </div>
          <div class="steps" id="rp-flow" style="margin-top:14px"></div>
          <div class="viz-grid two" id="rp-viz" style="margin-top:16px"></div>
          <div class="lay">
            <div class="out" id="rp-out" style="display:grid;gap:14px;min-width:0"></div>
            <div class="card" id="rp-scan" style="position:sticky;top:76px;min-width:0">
              <div class="hd"><h3>评论流</h3><span class="live ${paused ? 'off' : ''}" id="rp-live"><i></i>${paused ? '已暂停' : '实时'}</span></div>
              <div class="chips sfchips" id="rp-sf" style="margin-bottom:10px">${[['all', '全部'], ['超话', '超话'], ['评论', '评论'], ['私信', '私信'], ['flag', '✦ AI 标记']].map(([k, n]) => `<button class="chip ${streamFilter === k ? 'on' : ''}" data-v="${k}">${n}</button>`).join('')}</div>
              <div class="stream" id="rp-stream"></div>
              <div class="ft"><button class="btn btn-sm" data-act="pause">${paused ? '继续滚动' : '暂停滚动'}</button><span class="xs dim">每几秒抽样显示一条；灰掉的是控评模板，挑选时会去掉。</span></div>
            </div>
          </div>`;
        paintKpis(); paintStream(); paintPicksArea();
        $('#rp-go', main).onclick = e => runPick(e.currentTarget);
        ctx.chips($('#rp-sf', main), v => { streamFilter = v; shown = 80; paintStream(); });
        clearInterval(timer); timer = setInterval(tick, 2600);
      }

      /* ---------- 真评论：贴进来 → ai.chat 真挑真起草 ---------- */
      function openPaste() {
        if (!aiOn()) { toast('还没接入 AI：去「接入」页填钥匙'); return; }
        const d = modal(`
          <p class="small muted">从微博、超话或私信里复制评论，一行一条。支持「昵称：内容」，也可以只贴内容。最多 300 条。</p>
          <textarea class="textarea" id="rp-paste" style="min-height:240px;margin-top:10px" placeholder="小海：从黄蓉追到现在九年了，今天答辩过了&#10;今天生日，许愿能被看到"></textarea>
          <p class="xs muted" style="margin-top:6px" id="rp-pc">0 条</p>
          <div class="note" style="margin-top:12px">粉丝隐私：真评论只存在这台电脑的浏览器里，不上传到别处；只在点「AI 帮挑」的这一次发给 AI 挑选。含屏蔽词的行在本机就去掉，不发出去。「重置演示数据」或「清掉真评论」会一并删掉。</div>`,
          { title: '贴真评论', foot: `${st.real.length ? '<button class="btn btn-ghost" data-x="clear">清掉真评论</button>' : ''}<button class="btn" data-x="no">取消</button><button class="btn btn-primary" data-x="go">AI 帮挑</button>` });
        d.classList.add('rp');
        const ta = $('#rp-paste', d), pc = $('#rp-pc', d);
        ta.oninput = () => { pc.textContent = `${ta.value.split('\n').filter(x => x.trim()).length} 条`; };
        $('[data-x="no"]', d).onclick = () => d.close();
        const cl = $('[data-x="clear"]', d); if (cl) cl.onclick = () => { clearReal(); d.close(); };
        $('[data-x="go"]', d).onclick = () => {
          const raw = ta.value; if (!raw.trim()) { toast('先贴几条评论'); return; }
          d.close(); runReal(raw);
        };
        setTimeout(() => ta.focus(), 50);
      }
      function clearReal() {
        const isX = id => !SPM[id];
        st.real = []; st.picks = st.picks.filter(p => !isX(p.cid)); st.queue = st.queue.filter(q => !isX(q.cid));
        st.hist = st.hist.filter(h => !h.real); st.skip = st.skip.filter(id => !isX(id));
        if (st.mode === 'real') st.mode = 'demo';
        save(); toast('真评论清掉了，只剩演示数据', 'ok');
        if (sub === '') renderToday(); else go('');
      }
      async function runReal(raw) {
        const box = $('#rp-out', main); if (!box) return;
        const btns = [$('#rp-go', main), $('[data-act="paste"]', main)].filter(Boolean);
        btns.forEach(b => b.disabled = true);
        // 本机先过一遍：拆昵称、去屏蔽词、去重复
        const seen = new Set(); let dup = 0, blk = 0; const rows = [];
        const lines = raw.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 300);
        lines.forEach(line => {
          const m = line.match(/^@?([^：:\s][^：:]{0,19})[：:]\s*(.+)$/);
          const nick = m ? m[1].trim() : '', text = (m ? m[2] : line).trim();
          if (!text) return;
          if (blockedBy(text)) { blk++; return; }
          const k = text.replace(/\s+/g, '');
          if (seen.has(k)) { dup++; return; }
          seen.add(k); rows.push({ nick: nick || '匿名粉丝', text: text.slice(0, 400) });
        });
        if (!rows.length) { btns.forEach(b => b.disabled = false); toast('去掉屏蔽词和重复后，没剩下评论', 'bad'); return; }
        const cats = CAT_KEYS.filter(k => st.set.cats[k]);
        const n = st.set.n;
        const system = `${profile ? profile.brief() : ''}
你是她的回粉助手，只负责从粉丝评论里挑出最值得她亲自回的几条，并起草回复。她本人点头才会发，你不替她发任何东西。
挑选规则：
1. 去掉控评模板（刷屏口号、带话题标签的统一句式、「收视长虹」「演技在线」这类）、广告、黑评、空话（只有「好美」「冲」）。
2. 只挑这几类特别时刻（cat 用英文键）：${cats.map(k => `${k}=${CATS[k].n}`).join('；')}。
   birthday=今天生日（本人或家人）；exam=高考、考研、面试、考试出分；sick=本人或家人生病、住院、手术、陪床、正在看病（失恋、心情不好不算）；years=陪伴多年并提到人生节点；overseas=外语评论或海外粉丝；art=同人画、剪辑、写文、手工、填词等创作。
3. 涉及行程、住处、航班、见面要求、合同通告商务的，不挑。
4. 按「回了最暖」从高到低排，最多给 ${n + 2} 条，每类最多 3 条。没有合适的就少给，不要硬凑。
5. 每条起草回复：w 温暖两版，s 简短两版（12 字以内），l 活泼两版。都用她的口吻对粉丝说话，但不用「我」字；每版 40 字以内；不承诺见面、不谈工作、不用感叹号连发、不用网络烂梗；不猜粉丝的性别、年龄和身份，只用评论里写明的信息。默认偏好是「${TONES[st.set.tone]}」。
6. 外语评论：lang 写语言名（如「越南语」），tr 写中文翻译；中文评论 lang 和 tr 留空。
7. why：一句话说为什么挑它（30 字以内，具体到这条评论）。score：60 到 99 的暖度分。
只返回 JSON：{"ctrl":去掉的控评模板条数,"noise":去掉的空话广告条数,"picks":[{"i":评论编号,"cat":"类别键","why":"","score":0,"lang":"","tr":"","w":["",""],"s":["",""],"l":["",""]}]}`;
        const prompt = `下面是今天贴进来的 ${rows.length} 条评论，格式「编号: 昵称｜内容」：\n${rows.map((r, i) => `${i}: ${r.nick}｜${r.text}`).join('\n')}`;
        const job = ai.chat(prompt, { system, json: true, temperature: 0.6 });
        job.catch(() => {});
        const scan = $('#rp-scan', main); scan && scan.classList.add('scan');
        await think(box, [
          `贴进来 ${lines.length} 条，本机去掉屏蔽词 ${blk} 条、重复 ${dup} 条`,
          `把剩下的 ${rows.length} 条交给 AI（带上女演员的档案和挑选规则）`,
          '去掉控评模板、广告和空话',
          `找出特别时刻：${cats.map(k => CATS[k].n).join('、')}`,
          '按「回了最暖」排序，每条起草温暖、简短、活泼各两版',
        ], 'AI 正在挑真评论');
        const tk = $('.think', box); if (tk) tk.insertAdjacentHTML('beforeend', '<div class="step">等 AI 写完草稿，评论多时要 20 到 40 秒</div>');
        let res;
        try { res = await job; }
        catch (e) { scan && scan.classList.remove('scan'); btns.forEach(b => b.disabled = false); paintPicksArea(); toast(e.message, 'bad'); return; }
        scan && scan.classList.remove('scan');
        const arr = Array.isArray(res) ? res : (res && res.picks) || [];
        const pair = (v, fb) => { const a = (Array.isArray(v) ? v : [v]).map(x => String(x ?? '').trim()).filter(Boolean).slice(0, 2); if (!a.length) a.push(fb); if (a.length < 2) a.push(a[0]); return a; };
        const per = {}, fresh = [], used = new Set();
        for (const x of arr) {
          const r = rows[+x.i]; if (!r || used.has(+x.i) || !cats.includes(x.cat) || (per[x.cat] || 0) >= 3) continue;
          used.add(+x.i); per[x.cat] = (per[x.cat] || 0) + 1;
          fresh.push({ id: 'x' + (st.seq++), real: true, f: r.nick.slice(0, 20), c: x.cat, src: '真评论', at: hhmm(), t: r.text,
            lang: String(x.lang || '').trim().slice(0, 10), tr: String(x.tr || '').trim().slice(0, 300),
            w: pair(x.w, CATS[x.cat].why), s: pair(x.s, SHORT2[x.cat]), l: pair(x.l, LIVELY2[x.cat]),
            why: String(x.why || '').trim().slice(0, 60) || CATS[x.cat].why, sc: Math.max(50, Math.min(99, Math.round(+x.score) || 80)) });
        }
        // 保留已点头 / 已发的；旧的真评论只留被待发、历史引用的
        const keep = st.picks.filter(p => p.st === 'queued' || p.st === 'sent');
        const ref = new Set([...keep.map(p => p.cid), ...st.queue.map(q => q.cid), ...st.hist.map(h => h.cid)]);
        st.real = [...st.real.filter(x => ref.has(x.id)), ...fresh];
        const chosen = diversePick(candidates([], true).filter(x => fresh.includes(x)), n);
        st.picks = [...chosen.map(x => ({ cid: x.id, v: 0, tone: st.set.tone, ed: null, st: 'new' })), ...keep];
        st.ran = true; st.auto = false; st.mode = 'real';
        st.realStats = { total: lines.length, blk, dup, sent: rows.length, ctrl: +(res && res.ctrl) || 0, noise: +(res && res.noise) || 0, picked: fresh.length, at: hhmm() };
        save();
        btns.forEach(b => b.disabled = false);
        paintPicksArea(); paintKpis();
        toast(chosen.length ? `从真评论里挑出 ${chosen.length} 条` : '这批评论里没有特别值得亲自回的', chosen.length ? 'ok' : '');
      }

      /* ======================= 待发 ======================= */
      function markSent(qi) {
        const q = st.queue[qi]; if (!q) return; const s = getS(q.cid);
        const [likes, rep] = simLikes(s.c, s.id + q.text.length);
        st.hist.unshift({ id: 'r' + (st.seq++), cid: s.id, fan: s.f, cat: s.c, text: s.t, tr: s.tr || '', reply: q.text, likes, rep, day: today, at: hhmm(), sim: true, real: !!s.real });
        st.queue.splice(qi, 1);
        const p = st.picks.find(x => x.cid === s.id); if (p) p.st = 'sent';
        save();
      }
      function renderQueue() {
        main.innerHTML = head('待发', '女演员点过头的回复。改一改、复制，由女演员本人去微博发出，再回来标记。',
          st.queue.length ? `<button class="btn" data-act="copyall">全部复制</button><button class="btn btn-primary" data-act="sentall">全部标记已发</button>` : '') + `
          <p class="note" style="margin-bottom:16px">产品不替女演员发任何一条。「标记已发」只是记一笔：女演员已经亲自发出去了，这条会进历史，用来统计哪类回复粉丝最开心。</p>
          <div class="stack out" id="rp-q">${st.queue.length ? st.queue.map((q, i) => {
            const s = getS(q.cid);
            return `<article class="card" data-qi="${i}">
              <div class="row between"><div class="row" style="gap:10px">${avatar(s.f)}<div><b class="fan-link" data-act="fan" data-fan="${esc(s.f)}">${esc(s.f)}</b><div class="xs muted">${esc(s.src)} · 点头于 ${esc(q.at)}</div></div></div>${catTag(s.c)}</div>
              <p class="small muted" style="margin:10px 0 0;overflow-wrap:anywhere">${s.real ? '<span class="tag ok">真实</span> ' : ''}原评论：${esc(P(s.t))}${s.tr ? `<br><span style="color:var(--info)">AI 翻译：${esc(s.tr)}</span>` : ''}</p>
              <textarea class="textarea" style="margin-top:10px;min-height:70px" data-act="qedit" aria-label="待发回复">${esc(q.text)}</textarea>
              <div class="ft"><button class="btn btn-sm" data-act="qcopy">复制</button><button class="btn btn-sm btn-primary" data-act="qsent">标记已发</button><button class="btn btn-sm btn-danger" data-act="qdel">删除</button><span class="xs dim" style="margin-left:auto">${q.text.length} 字</span></div>
            </article>`;
          }).join('') : `<div class="empty"><b>待发是空的</b>在「今天」里给喜欢的草稿点「就它了」，就会出现在这里。<div style="margin-top:14px"><a class="btn btn-primary" href="#/replies">去今天</a></div></div>`}</div>`;
      }

      /* ======================= 历史 ======================= */
      let histCat = 'all', histQ = '';
      function hbars(rows) {
        const W = 440, rh = 38, L = 96, R = 64, H = rows.length * rh + 6, max = Math.max(...rows.map(r => r.v), 1);
        return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="各类回复平均点赞">${rows.map((r, i) => {
          const y = i * rh + 6, w = Math.max(4, (W - L - R) * r.v / max);
          return `<text class="ch-l" x="0" y="${y + 18}">${esc(r.n)}</text><rect class="ch-bar ${r.best ? 'best' : ''}" x="${L}" y="${y + 4}" rx="6" height="20" width="${w}"><animate attributeName="width" from="0" to="${w}" dur=".7s" fill="freeze"/></rect><text class="ch-v" x="${L + w + 8}" y="${y + 19}">${fmt(r.v)}</text>`;
        }).join('')}</svg>`;
      }
      function cols(rows) {
        const W = 440, H = 170, B = 26, top = 18, max = Math.max(...rows.map(r => r.v), 1), cw = W / rows.length;
        return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="近 7 天每天回了几条">
          ${[0.5, 1].map(k => `<line class="ch-grid" x1="0" x2="${W}" y1="${H - B - (H - B - top) * k}" y2="${H - B - (H - B - top) * k}"/>`).join('')}
          ${rows.map((r, i) => { const h = Math.max(2, (H - B - top) * r.v / max), x = i * cw + cw * .22; return `<rect class="ch-bar ${r.today ? 'best' : ''}" x="${x}" y="${H - B - h}" width="${cw * .56}" height="${h}" rx="5"/><text class="ch-v" text-anchor="middle" x="${x + cw * .28}" y="${H - B - h - 5}">${r.v}</text><text class="ch-l" text-anchor="middle" x="${x + cw * .28}" y="${H - 6}">${esc(r.n)}</text>`; }).join('')}
        </svg>`;
      }
      function renderHistory() {
        const H = st.hist;
        const byCat = CAT_KEYS.map(k => { const xs = H.filter(h => h.cat === k); return { k, n: CATS[k].n, cnt: xs.length, v: xs.length ? Math.round(xs.reduce((a, h) => a + h.likes, 0) / xs.length) : 0 }; }).filter(r => r.cnt).sort((a, b) => b.v - a.v);
        if (byCat[0]) byCat[0].best = true;
        const second = byCat[1];
        const week = Array.from({ length: 7 }, (_, i) => { const k = dayKey(6 - i); return { n: i === 6 ? '今天' : k.slice(5).replace('-', '/'), v: H.filter(h => h.day === k).length, today: i === 6 }; });
        const totalLikes = H.reduce((a, h) => a + h.likes, 0);
        const list = H.filter(h => (histCat === 'all' || h.cat === histCat) && (!histQ || (h.fan + h.text + h.reply).includes(histQ)));
        const days = [...new Set(list.map(h => h.day))].sort().reverse();
        main.innerHTML = head('历史', '按天归档女演员回过的评论，看看哪类回复粉丝最开心。') + `
          <div class="kpis">
            <div class="kpi"><b id="h1" data-v="0">0</b><span>累计回了</span></div>
            <div class="kpi" style="--kc:var(--ok)"><b id="h2" data-v="0">0</b><span>近 7 天</span></div>
            <div class="kpi" style="--kc:var(--accent)"><b id="h3" data-v="0">0</b><span>平均点赞</span></div>
            <div class="kpi" style="--kc:var(--warn)"><b style="font-size:22px;padding:4px 0">${byCat[0] ? esc(byCat[0].n) : '—'}</b><span>反应最好的一类</span></div>
          </div>
          <div class="grid-2" style="margin-top:16px">
            <div class="card"><div class="hd"><h3>哪类回复粉丝反应最好</h3><span class="xs dim">平均点赞</span></div>${byCat.length ? hbars(byCat) : '<div class="empty">还没有记录</div>'}
              ${byCat[0] && second ? `<p class="small" style="margin-top:10px">「${esc(byCat[0].n)}」类回复平均点赞 ${fmt(byCat[0].v)}，比第二名「${esc(second.n)}」高 ${Math.round((byCat[0].v / second.v - 1) * 100)}%。可以在设置里只留这几类，挑得更准。</p>` : ''}</div>
            <div class="card"><div class="hd"><h3>近 7 天每天回了几条</h3><span class="xs dim">目标：每天 1 到 2 条</span></div>${cols(week)}</div>
          </div>
          <div class="card" style="margin-top:16px">
            <div class="row between" style="margin-bottom:6px"><div class="chips" id="rp-hc">${[['all', '全部'], ...CAT_KEYS.map(k => [k, CATS[k].n])].map(([k, n]) => `<button class="chip ${histCat === k ? 'on' : ''}" data-v="${k}">${n}</button>`).join('')}</div>
              <label class="search" style="flex:1;min-width:180px;max-width:280px"><input class="input" id="rp-hq" placeholder="搜粉丝名或内容" value="${esc(histQ)}"></label></div>
            ${days.length ? days.map(d => `<div class="day-h">${esc(dayLabel(d))} · ${agoText(d)} · ${list.filter(h => h.day === d).length} 条</div>` + list.filter(h => h.day === d).map(h => `
              <div class="hrec"><div><div class="row" style="gap:8px"><b class="fan-link" data-act="fan" data-fan="${esc(h.fan)}">${esc(h.fan)}</b>${h.real ? '<span class="tag ok">真实</span>' : ''}${catTag(h.cat)}<span class="xs dim" style="font-variant-numeric:tabular-nums">${esc(h.at)}</span></div>
                <div class="q">「${esc(P(h.text))}」${h.tr ? `<span style="color:var(--info)"> AI 翻译：${esc(h.tr)}</span>` : ''}</div><div class="re">↳ ${esc(P(h.reply))}</div></div>
                <div class="nums"><b>♥ ${fmt(h.likes)}</b><br>↩ ${fmt(h.rep)}${h.sim ? '<br><span class="xs dim">模拟反应</span>' : ''}</div></div>`).join('')).join('')
              : '<div class="empty" style="margin-top:10px"><b>没有符合的记录</b>换个类别或关键词试试。</div>'}
          </div>
          <p class="xs dim" style="margin-top:12px">点赞和回复数是演示用假数据；新标记已发的那几条，反应数是模拟出来的。</p>`;
        roll($('#h1', main), H.length); roll($('#h2', main), week.reduce((a, w) => a + w.v, 0)); roll($('#h3', main), H.length ? Math.round(totalLikes / H.length) : 0);
        ctx.chips($('#rp-hc', main), v => { histCat = v; renderHistory(); });
        const q = $('#rp-hq', main); q.oninput = () => { histQ = q.value.trim(); clearTimeout(q._t); q._t = setTimeout(() => { renderHistory(); const n = $('#rp-hq', main); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
      }

      /* ======================= 粉丝档案 ======================= */
      let fanQ = '', fanSort = 'years', fanStar = false;
      function renderFans() {
        const names = [...new Set([...st.hist.map(h => h.fan), ...st.queue.map(q => getS(q.cid).f), ...st.picks.map(p => getS(p.cid).f)])];
        let rows = names.map(n => { const f = fanInfo(n), isReal = !FAN[n]; const recs = st.hist.filter(h => h.fan === n); const cats = [...new Set([...recs.map(h => h.cat), ...[...SP, ...st.real].filter(s => s.f === n && isUsed(s.id)).map(s => s.c)])]; return { n, isReal, y: f[0], from: f[1], cnt: isReal ? f[2] : f[2] + recs.length, last: fanLast(n), cats, star: st.stars.includes(n) }; });
        rows = rows.filter(r => (!fanStar || r.star) && (!fanQ || (r.n + r.from).includes(fanQ)));
        rows.sort((a, b) => fanSort === 'years' ? b.y - a.y : fanSort === 'cnt' ? b.cnt - a.cnt : (b.last || '').localeCompare(a.last || ''));
        const all = names.length, known = names.filter(n => FAN[n]), overseas = known.filter(n => / · /.test(FAN[n][1])).length, avgY = known.length ? (known.reduce((a, n) => a + FAN[n][0], 0) / known.length).toFixed(1) : 0;
        main.innerHTML = head('粉丝档案', '被 AI 挑出过的粉丝。点一行，看 TA 的历史评论和女演员回过的话。') + `
          <div class="kpis">
            <div class="kpi"><b>${all}</b><span>被挑出过的粉丝</span></div>
            <div class="kpi" style="--kc:var(--accent)"><b>${avgY}</b><span>平均陪伴年数</span></div>
            <div class="kpi" style="--kc:var(--info)"><b>${overseas}</b><span>海外粉丝</span></div>
            <div class="kpi" style="--kc:var(--warn)"><b>${st.stars.length}</b><span>星标</span></div>
          </div>
          ${(() => {
            const kn = rows.filter(r => !r.isReal);
            if (!kn.length) return '';
            const yrs = Array.from({ length: 10 }, (_, i) => kn.filter(r => r.y === i + 1).length);
            const home = kn.filter(r => !/ · /.test(r.from)), away = kn.filter(r => / · /.test(r.from));
            const pts = kn.map(r => ({ x: r.y, y: r.cnt, l: r.n, c: / · /.test(r.from) ? 'var(--info)' : r.star ? 'var(--warn)' : 'var(--accent)' }));
            return `<div class="viz-grid two" style="margin-top:16px">
              <div class="viz-card"><div class="vh"><b>陪了女演员几年</b><span>${kn.length} 位 · 平均 ${avgY} 年</span></div>${Viz.cols(yrs, { w: 420, h: 110, labels: yrs.map((_, i) => `${i + 1} 年`), vals: true, every: 3, c: 'var(--accent)', label: '粉丝按陪伴年数' })}<p class="vn">${home.length} 位在国内，${away.length} 位在海外（${[...new Set(away.map(r => r.from.split(' · ')[0]))].join('、')}）。</p></div>
              <div class="viz-card"><div class="vh"><b>陪得久的，话也多</b><span>横轴年数，纵轴互动次数</span></div>${Viz.scatter(pts, { w: 420, h: 200, xl: '陪伴年数', yl: '互动次数', xmin: 0, xmax: 10.5, xfmt: v => v + ' 年', labelTop: 3, label: '陪伴年数与互动次数' })}<p class="vn">蓝点是海外粉丝，黄点是你星标过的；只标了互动最多的 3 位，其余点上去能看名字。</p></div>
            </div>`;
          })()}
          <div class="card pad-0" style="margin-top:16px">
            <div class="row" style="padding:14px 16px;border-bottom:1px solid var(--line)">
              <label class="search" style="flex:1;min-width:160px"><input class="input" id="rp-fq" placeholder="搜粉丝名或城市" value="${esc(fanQ)}"></label>
              <select class="select" id="rp-fs" style="width:auto"><option value="years" ${fanSort === 'years' ? 'selected' : ''}>按陪伴年数</option><option value="cnt" ${fanSort === 'cnt' ? 'selected' : ''}>按互动次数</option><option value="last" ${fanSort === 'last' ? 'selected' : ''}>按上次被回</option></select>
              <button class="chip ${fanStar ? 'on' : ''}" id="rp-fst">★ 只看星标</button>
            </div>
            <div class="table-wrap"><table class="table"><thead><tr><th>粉丝</th><th>陪伴</th><th>来自</th><th>互动</th><th>上次被回</th><th class="hide-m">被挑出的类别</th></tr></thead><tbody>
            ${rows.map(r => `<tr class="click" data-act="fan" data-fan="${esc(r.n)}"><td><div class="row" style="gap:8px;flex-wrap:nowrap">${avatar(r.n)}<b style="white-space:nowrap">${esc(r.n)}</b>${r.star ? '<span class="accent">★</span>' : ''}</div></td><td class="num" style="white-space:nowrap">${r.isReal ? '—' : r.y + ' 年'}</td><td style="white-space:nowrap">${esc(r.from)}</td><td class="num">${fmt(r.cnt)}</td><td style="white-space:nowrap">${r.last ? agoText(r.last) : '<span class="dim">还没回</span>'}</td><td class="hide-m"><div class="row" style="gap:4px">${r.cats.map(catTag).join('')}</div></td></tr>`).join('')}
            </tbody></table></div>
            ${rows.length ? '' : '<div class="empty" style="margin:16px"><b>没有符合的粉丝</b>换个关键词，或关掉「只看星标」。</div>'}
          </div>`;
        const q = $('#rp-fq', main); q.oninput = () => { fanQ = q.value.trim(); clearTimeout(q._t); q._t = setTimeout(() => { renderFans(); const n = $('#rp-fq', main); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
        $('#rp-fs', main).onchange = e => { fanSort = e.target.value; renderFans(); };
        $('#rp-fst', main).onclick = () => { fanStar = !fanStar; renderFans(); };
      }

      /* ======================= 设置 ======================= */
      function renderSettings() {
        const S = st.set;
        main.innerHTML = head('挑选偏好', '决定 AI 每天挑什么、挑几条、草稿用什么语气。改完立刻生效，下一次「再挑一轮」就按这里来。') + `
          <div class="grid-2">
            <div class="card"><div class="hd"><h3>优先挑这几类</h3><span class="xs dim">关掉的类别不会出现在挑选里</span></div>
              ${CAT_KEYS.map(k => `<div class="setrow"><div><b>${esc(CATS[k].n)}</b><div class="xs muted">${esc(CATS[k].why)}</div></div><button class="switch ${S.cats[k] ? 'on' : ''}" data-act="cat" data-v="${k}" aria-label="${esc(CATS[k].n)}" aria-pressed="${S.cats[k]}"></button></div>`).join('')}
              <p class="xs muted" id="rp-avail" style="margin-top:10px">按现在的设置，今天的池子里还能挑出 ${candidates().length} 条。</p>
            </div>
            <div class="stack">
              <div class="card"><div class="hd"><h3>每天挑几条</h3><b class="accent" id="rp-nv" style="font-size:22px;font-variant-numeric:tabular-nums">${S.n}</b></div>
                <input type="range" class="range" min="4" max="10" value="${S.n}" id="rp-n" aria-label="每天挑几条">
                <p class="xs muted" style="margin-top:6px">建议 6 到 8 条：女演员看完只需要 5 分钟，挑 1 到 2 条回。</p></div>
              <div class="card"><div class="hd"><h3>草稿语气</h3></div>
                <div class="chips" id="rp-tone">${Object.entries(TONES).map(([k, n]) => `<button class="chip ${S.tone === k ? 'on' : ''}" data-v="${k}">${n}</button>`).join('')}</div>
                <div class="panel" style="margin-top:12px"><div class="xs muted">预览 · 回给 @桐学录「今天是我生日，许愿你能看到这条。」</div><div id="rp-tprev" style="margin-top:6px">${esc(drafts(SPM.s09, S.tone)[0])}</div></div></div>
              <div class="card"><div class="hd"><h3>屏蔽词</h3><span class="xs dim">含这些词的评论不挑，评论流里折叠</span></div>
                <div class="row" id="rp-bw">${S.block.map((w, i) => `<span class="wchip">${esc(w)}<button data-act="unblock" data-v="${i}" aria-label="删除屏蔽词 ${esc(w)}">×</button></span>`).join('') || '<span class="xs dim">还没有屏蔽词</span>'}</div>
                <div class="row" style="margin-top:12px;flex-wrap:nowrap"><input class="input" id="rp-bin" placeholder="比如：私生" maxlength="12"><button class="btn" data-act="block">添加</button></div></div>
            </div>
          </div>
          <div class="card" style="margin-top:16px">
            <div class="hd"><h3>边界与声明</h3></div>
            <ul class="small muted" style="margin:0;padding-left:18px;line-height:1.9">
              <li>AI 只起草，女演员点头才进待发；不点头，什么都不会发生。</li>
              <li>产品不替女演员发任何一条，不模仿女演员的口吻自动回复，不用女演员的脸和声音。</li>
              <li>私信内容只用来挑选，不外传，不做别的用途。</li>
              <li>本页所有评论、粉丝名、点赞数都是演示用假数据，不对应任何真实账号。</li>
            </ul>
            <div class="ft"><button class="btn btn-danger" data-act="reset">重置演示数据</button><span class="xs dim">清空今天的挑选、待发、星标和新记录，回到初始状态。</span></div>
          </div>`;
        const n = $('#rp-n', main);
        n.oninput = () => { $('#rp-nv', main).textContent = n.value; };
        n.onchange = () => { S.n = +n.value; save(); toast(`以后每天挑 ${S.n} 条`, 'ok'); };
        ctx.chips($('#rp-tone', main), v => { S.tone = v; save(); $('#rp-tprev', main).textContent = drafts(SPM.s09, v)[0]; toast(`草稿语气改成「${TONES[v]}」`, 'ok'); });
        $('#rp-bin', main).onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('[data-act="block"]', main).click(); } };
      }

      /* ---------- 事件（委托在 .rp 上，换页时随 DOM 一起销毁） ---------- */
      app.addEventListener('input', e => {
        const t = e.target;
        if (t.dataset.act === 'edit') { const i = +t.closest('.pick').dataset.i; st.picks[i].ed = t.value; save(); const k = t.closest('.draft').querySelector('.k'); if (k && !/已改过/.test(k.textContent)) k.textContent = '回复草稿 · 已改过'; }
        if (t.dataset.act === 'qedit') { const i = +t.closest('[data-qi]').dataset.qi; st.queue[i].text = t.value; save(); const c = t.closest('[data-qi]').querySelector('.ft .xs'); if (c) c.textContent = `${t.value.length} 字`; }
      });
      app.addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b || !app.contains(b) || b.tagName === 'TEXTAREA') return;
        const act = b.dataset.act;
        if (act === 'fan') { openFan(b.dataset.fan); return; }
        const pk = b.closest('.pick'), i = pk ? +pk.dataset.i : -1, p = st.picks[i];
        switch (act) {
          case 'ver': p.v = +b.dataset.v; p.ed = null; save(); paintCard(i); break;
          case 'tone': p.tone = b.dataset.v; p.ed = null; save(); paintCard(i); toast(`换成「${TONES[p.tone]}」语气`); break;
          case 'restore': p.ed = null; save(); paintCard(i); break;
          case 'ok': {
            const text = draftText(p).trim(); if (!text) { toast('草稿是空的，先写一句', 'bad'); return; }
            st.queue.push({ id: 'q' + (st.seq++), cid: p.cid, text, at: hhmm() }); p.st = 'queued'; save(); paintCard(i); paintKpis();
            toast('放进待发了，女演员亲自发出后再标记', 'ok'); break;
          }
          case 'unqueue': st.queue = st.queue.filter(q => q.cid !== p.cid); p.st = 'new'; save(); paintCard(i); paintKpis(); toast('撤回了'); break;
          case 'skip': p.st = 'skip'; save(); paintCard(i); paintKpis(); break;
          case 'unskip': p.st = 'new'; save(); paintCard(i); paintKpis(); break;
          case 'swap': {
            const cur = getS(p.cid);
            const pool = candidates([p.cid], !!cur.real); const next = pool.find(s => s.c === cur.c) || pool[0];
            if (!next) { toast(cur.real ? '这批真评论里没有更多候选了' : '今天的池子里没有更多候选了'); return; }
            st.skip.push(p.cid); st.picks[i] = { cid: next.id, v: 0, tone: p.tone, ed: null, st: 'new' }; save(); paintCard(i);
            const el = $(`.pick[data-i="${i}"]`, main); if (el && el.animate) el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
            toast(`换成了 @${next.f}`); break;
          }
          case 'paste': openPaste(); break;
          case 'pause': { paused = !paused; b.textContent = paused ? '继续滚动' : '暂停滚动'; const l = $('#rp-live', main); l.className = 'live' + (paused ? ' off' : ''); l.innerHTML = `<i></i>${paused ? '已暂停' : '实时'}`; break; }
          case 'more': shown += 50; paintStream(); break;
          /* 待发 */
          case 'qcopy': copy(st.queue[+b.closest('[data-qi]').dataset.qi].text); break;
          case 'qsent': { const qi = +b.closest('[data-qi]').dataset.qi; const f = getS(st.queue[qi].cid).f; markSent(qi); renderQueue(); paintNav(); toast(`已标记：回了 @${f}，进历史了`, 'ok'); break; }
          case 'qdel': {
            const qi = +b.closest('[data-qi]').dataset.qi, q = st.queue[qi];
            st.queue.splice(qi, 1); const pp = st.picks.find(x => x.cid === q.cid); if (pp) pp.st = 'new'; save(); renderQueue(); paintNav(); toast('删掉了，那条评论回到今天的卡片里'); break;
          }
          case 'copyall': copy(st.queue.map(q => `@${getS(q.cid).f} ${q.text}`).join('\n\n')); break;
          case 'sentall': { const n = st.queue.length; while (st.queue.length) markSent(0); renderQueue(); paintNav(); toast(`${n} 条都标记已发了`, 'ok'); break; }
          /* 设置 */
          case 'cat': {
            const k = b.dataset.v; st.set.cats[k] = !st.set.cats[k];
            if (!CAT_KEYS.some(x => st.set.cats[x])) { st.set.cats[k] = true; toast('至少留一类', 'bad'); return; }
            save(); b.classList.toggle('on', st.set.cats[k]); b.setAttribute('aria-pressed', st.set.cats[k]);
            const av = $('#rp-avail', main); if (av) av.textContent = `按现在的设置，今天的池子里还能挑出 ${candidates().length} 条。`;
            toast(`${CATS[k].n}：${st.set.cats[k] ? '会挑' : '不挑了'}`); break;
          }
          case 'block': {
            const inp = $('#rp-bin', main), w = inp.value.trim();
            if (!w) { toast('先输入一个词'); return; } if (st.set.block.includes(w)) { toast('已经有这个词了'); return; }
            st.set.block.push(w); save(); renderSettings(); toast(`以后含「${w}」的评论不挑`, 'ok'); break;
          }
          case 'unblock': { const w = st.set.block.splice(+b.dataset.v, 1)[0]; save(); renderSettings(); toast(`「${w}」不再屏蔽`); break; }
          case 'reset': {
            const d = modal('<p>今天的挑选、待发、星标、新标记的历史、设置都会回到初始状态。只影响这台电脑上的演示数据。</p>', { title: '重置演示数据？', foot: '<button class="btn" data-x="no">算了</button><button class="btn btn-danger" data-x="yes">重置</button>' });
            $('[data-x="no"]', d).onclick = () => d.close();
            $('[data-x="yes"]', d).onclick = () => { store.del('st'); st = seed(); save(); d.close(); streamItems = []; toast('重置好了', 'ok'); go(''); };
            break;
          }
        }
      });

      /* ---------- 子路由 ---------- */
      clearInterval(timer); timer = null;
      window.scrollTo(0, 0);
      if (sub === 'queue') renderQueue();
      else if (sub === 'history') renderHistory();
      else if (sub === 'fans') renderFans();
      else if (sub === 'settings') renderSettings();
      else renderToday();
    },
    unmount() { clearInterval(timer); timer = null; },

    /* 「今天」页用：只读 store，不碰 DOM，node 里也能调 */
    summary(ctx) {
      const st = ctx && ctx.store ? ctx.store.get('st', null) : null;
      const n = st && st.set ? st.set.n : 6;
      const num = x => Number(x).toLocaleString('zh-CN');
      const today = dayKey();
      const year = (hist) => {
        const H = hist || HSEED.map(h => ({ fan: h[1], cat: h[2], likes: h[5] }));
        const by = CAT_KEYS.map(k => { const xs = H.filter(h => h.cat === k); return [k, xs.length ? xs.reduce((a, h) => a + h.likes, 0) / xs.length : 0]; }).sort((a, b) => b[1] - a[1]);
        const longest = [...new Set(H.map(h => h.fan))].filter(f => FAN[f]).sort((a, b) => FAN[b][0] - FAN[a][0])[0];
        const out = [`女演员亲自回了 ${H.length} 条粉丝评论，每一条都是女演员点头后自己发出的`];
        if (by[0] && by[0][1]) out.push(`粉丝反应最好的是「${CATS[by[0][0]].n}」类回复，平均每条 ${num(Math.round(by[0][1]))} 个赞`);
        if (longest) out.push(`回过的人里，陪伴最久的是 @${longest}，${FAN[longest][0]} 年`);
        return out;
      };
      const weekViz = (hist) => {
        if (typeof Viz === 'undefined') return '';
        const H = hist || HSEED.map(h => ({ day: dayKey(h[0]) }));
        const week = Array.from({ length: 7 }, (_, i) => { const k = dayKey(6 - i); return H.filter(h => h.day === k).length; });
        return `<div class="row" style="gap:14px;flex-wrap:nowrap">${Viz.cols(week, { w: 200, h: 44, inline: true, c: 'var(--c-fans)', hi: 6, hc: 'var(--ink)', label: '近 7 天每天回了几条' })}<span class="small muted">近 7 天每天回了几条，目标每天 1 到 2 条</span></div>`;
      };
      if (!st) return {
        viz: weekViz(null),
        line: `收工前 AI 已挑好 ${n} 条，等女演员点头`,
        kpis: [['今天收到', '28,436'], ['AI 挑出', String(n)], ['女演员已回', '1'], ['待发', '0']],
        items: [{ tag: '待点头', text: `${n} 条粉丝评论等女演员看一眼，挑 1 到 2 条回`, href: '#/replies', kind: 'warn' }],
        year: year(null),
      };
      const fresh = st.day === today;
      const picks = fresh ? (st.picks || []) : [];
      const pending = fresh ? picks.filter(p => p.st === 'new').length : n;
      const realPending = picks.filter(p => p.st === 'new' && !SPM[p.cid]).length;
      const queue = (st.queue || []).length;
      const sent = (st.hist || []).filter(h => h.day === today).length;
      const items = [];
      if (realPending) items.push({ tag: '真评论', text: `贴进来的真评论里挑出 ${realPending} 条，等女演员点头`, href: '#/replies', kind: 'warn' });
      if (pending - realPending > 0) items.push({ tag: '待点头', text: `${pending - realPending} 条粉丝评论等女演员看一眼，挑 1 到 2 条回`, href: '#/replies', kind: 'warn' });
      if (queue) items.push({ tag: '待发', text: `${queue} 条女演员点过头的回复还没发出，复制去微博发`, href: '#/replies/queue', kind: '' });
      if (!items.length) items.push({ tag: '已回', text: `今天回了 ${sent} 条，没有要女演员做的了`, href: '#/replies/history', kind: 'ok' });
      const bits = [pending && `${pending} 条等女演员点头`, queue && `${queue} 条待发`, sent && `${sent} 条已回`].filter(Boolean);
      return {
        viz: weekViz(st.hist || []),
        line: bits.length ? bits.join('，') : '今天的都处理完了',
        kpis: [['今天收到', num(fresh ? st.received : 0)], ['AI 挑出', String(fresh ? picks.length : n)], ['女演员已回', String(sent)], ['待发', String(queue)]],
        items: items.slice(0, 5),
        year: year(st.hist || []),
      };
    },
  });
})();
