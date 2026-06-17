// ============================================================
// I Ching — Local Advice Engine
// Natural-language interpretation from hexagram data.
// All functions are scoped inside this IIFE; only the public
// API is exposed on window.IChing.AdviceEngine.
// ============================================================
(function() {
  'use strict';
  var ns = window.IChing || {};
  window.IChing = ns;

  /* ────── Domain keywords ────── */
  var DOMAINS = {
    career:    { label: '事业与工作', keywords: ['工作','职业','事业','求职','面试','升职','加薪','跳槽','老板','同事','公司','行业','创业','生意','经商','客户','项目','任务','上班','办公','职场'] },
    love:      { label: '感情与关系', keywords: ['感情','爱情','恋爱','爱','喜欢','表白','分手','复合','婚姻','结婚','对象','恋人','男朋友','女朋友','暧昧','暗恋','相思','情侣','伴侣','夫妻','离婚','出轨','追','追求','她','他','暗恋'] },
    family:    { label: '家庭与亲情', keywords: ['家庭','家人','父母','父亲','母亲','爸爸','妈妈','孩子','儿子','女儿','兄弟姐妹','哥哥','姐姐','弟弟','妹妹','亲戚','亲子','育儿','家务'] },
    health:    { label: '健康与身心', keywords: ['健康','身体','生病','疾病','恢复','康复','疼痛','疲劳','累','睡眠','失眠','运动','锻炼','减肥','饮食','养生','体检'] },
    wealth:    { label: '财富与财务', keywords: ['钱','财运','财富','收入','投资','理财','股票','基金','债务','贷款','亏','赚','资产','财务','消费','支出','省','花销'] },
    decision:  { label: '决策与选择', keywords: ['选择','决定','决策','抉择','怎么办','要不要','该不该','是否','能不能','如何是好','方向','出路','迷茫','犹豫','纠结'] },
    study:     { label: '学业与成长', keywords: ['学习','学校','考试','成绩','大学','专业','毕业','考研','留学','读书','知识','学位','论文','研究','升学','复习'] },
    travel:    { label: '出行与迁移', keywords: ['旅行','旅游','出国','出行','搬家','迁移','远方','外地','旅途','行程','签证','航班','出发'] },
    creative:  { label: '创造与发展', keywords: ['创造','创新','艺术','写作','设计','音乐','创作','灵感','项目','启动','开始','新','尝试','改变','突破'] },
    conflict:  { label: '冲突与纠纷', keywords: ['矛盾','争吵','纠纷','吵架','冲突','争执','对抗','不满','生气','愤怒','敌对','竞争','对手'] },
    spiritual: { label: '精神与人生', keywords: ['人生','命运','意义','目标','理想','梦想','信仰','追求','未来','前途','方向','道路','意义','修行','心灵','生活','状态','近况','怎么样','如何'] },
    social:    { label: '人际与社交', keywords: ['朋友','社交','人际关系','人脉','交往','信任','合作','合伙','团队','邻居','同事','同学','知己','闺蜜'] }
  };

  /* ────── Question categorization ────── */
  function categorize(question) {
    var q = question;
    var scores = {};
    var keys = Object.keys(DOMAINS);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      scores[k] = 0;
      var kws = DOMAINS[k].keywords;
      for (var j = 0; j < kws.length; j++) {
        if (q.indexOf(kws[j]) !== -1) scores[k] += 1;
      }
    }
    var best = 'spiritual';
    var bestScore = 0;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (scores[k] > bestScore) { bestScore = scores[k]; best = k; }
    }
    return { primaryDomain: best, scores: scores };
  }

  /* ────── Top domains (for richer blending) ────── */
  function topDomains(scores) {
    var entries = [];
    var ks = Object.keys(scores);
    for (var i = 0; i < ks.length; i++) {
      if (scores[ks[i]] > 0) entries.push([ks[i], scores[ks[i]]]);
    }
    entries.sort(function(a, b) { return b[1] - a[1]; });
    var result = [];
    for (var i = 0; i < Math.min(3, entries.length); i++) {
      result.push(entries[i][0]);
    }
    if (result.length === 0) result.push('spiritual');
    return result;
  }

  /* ────── Main entry point ────── */
  function generate(question, hex, changingIndices, transformed) {
    var cat = categorize(question);
    var domainInfo = DOMAINS[cat.primaryDomain];
    var tops = topDomains(cat.scores);

    var bu = ns.analyzeBodyUsage(hex.lowerTrigram, hex.upperTrigram);
    var tbu = transformed ? ns.analyzeBodyUsage(transformed.lowerTrigram, transformed.upperTrigram) : null;
    var lineAnalysis = ns.analyzeLinePositions(changingIndices, hex.number);

    var parts = [];
    parts.push(buildOpening(question, hex, transformed, changingIndices, bu, tbu, domainInfo, tops));
    parts.push('');
    parts.push(buildBody(hex, transformed, changingIndices, bu, tbu, lineAnalysis, cat.primaryDomain, domainInfo, tops));
    parts.push('');
    parts.push(buildClosing(hex, transformed, bu, tbu, changingIndices, cat.primaryDomain, domainInfo));
    return parts.join('\n');
  }

  /* ────── Opening ────── */
  function buildOpening(question, hex, transformed, changingIndices, bu, tbu, domainInfo, tops) {
    var lines = [];
    var fortuneWord = bu ? bu.fortune : '';
    var adjective = fortuneWord === '大吉' ? '非常好的' : fortuneWord === '吉' ? '不错的' : fortuneWord === '中吉' ? '需要你上点心的' : '需要你多加留意的';
    lines.push('你问的是「' + domainInfo.label + '」的问题。起卦得到第' + hex.number + '卦"' + hex.name + '"（' + hex.pinyin + '，' + hex.english + '），整体来看是一个' + adjective + '卦象。');
    lines.push(getOneLiner(hex));
    if (changingIndices.length > 0 && transformed) {
      lines.push('卦中有' + changingIndices.length + '个爻在变动，说明你现在正处在一个变化的时间点上——本卦代表你当下的状态，变卦（之卦）指向未来的走向。下面我为你一层一层解开。');
    } else if (changingIndices.length === 0) {
      lines.push('六爻安静，说明这件事目前处于一个相对平稳的阶段。不一定是坏事——有时候没消息就是好消息。');
    }
    return lines.join('\n');
  }

  /* ────── 64 one-line summaries ────── */
  function getOneLiner(hex) {
    var map = {
      1: '乾卦六爻纯阳，是六十四卦中最刚健的一卦——天行健，自强不息，这是老天在跟你说"你可以"。',
      2: '坤卦六爻纯阴，大地之德，厚德载物——它不是让你不动，是让你用柔韧和耐心去承载。',
      3: '屯卦是万物初生之象——万事开头难，你现在可能正处在一个新的起步阶段，有点吃力是正常的。',
      4: '蒙卦是启蒙之象——你可能正处在学习、摸索的阶段，别怕不懂，怕的是不懂还不问。',
      5: '需卦是等待之象——云在天上还没下雨，你需要再等一等。但等待不等于什么都不做，而是要趁这个时间做好准备。',
      6: '讼卦是争讼之象——天和水方向相反，意见不合。但易经告诉你：争到底对谁都没好处，见好就收。',
      7: '师卦是军队之象——你需要像指挥一支队伍一样去组织你的事情。纪律、用人、策略缺一不可。',
      8: '比卦是亲和之象——水依附大地而行，你现在需要靠近对的人、加入对的圈子。抱团取暖比单打独斗更有效。',
      9: '小畜卦是小有积蓄——力量还不够大，就像乌云密布但还没下雨。继续积累，别急着出成果。',
      10: '履卦是小心行事——像踩在老虎尾巴上一样，谨慎一点没坏处。守规矩、不走偏就不会被咬。',
      11: '泰卦是天地交泰——天和地和谐沟通，你的内外环境都比较顺畅。但泰卦也提醒：盛极会衰，顺境中要保持清醒。',
      12: '否卦是天地不通——上下不沟通，好事难成。这不是你的问题，是大环境不好。先守住，等风来。',
      13: '同人卦是志同道合——火和天都是向上的，你需要找到和你方向一致的人。单打独斗不如抱团。',
      14: '大有卦是丰收之象——太阳在天上照耀万物，你正处在一个收获期。但富了更要懂得分享和节制。',
      15: '谦卦六爻皆吉——山藏在地下，有能力但不张扬。这是易经中唯一六爻全吉的卦，谦虚的好处可见一斑。',
      16: '豫卦是喜悦振奋——雷出地上，万物复苏。你心情不错，但别乐极生悲，高兴之余也要脚踏实地。',
      17: '随卦是顺应——雷在泽中，顺势而动。你现在不需要逆风硬上，跟着对的趋势走就好。',
      18: '蛊卦是整治腐败——山下有风不通，积弊需要清理。你正在或即将面对一些需要"拨乱反正"的事。',
      19: '临卦是临近——大地在湖水上俯瞰，好事正在靠近。但同时也要知道，靠近意味着你站在高处，责任也更大。',
      20: '观卦是观察——风行大地，遍览无遗。你现在需要的是一个更广阔的视角，站高一点看问题。',
      21: '噬嗑卦是咬碎障碍——雷电交加，果断出击。你遇到了必须"咬碎"才能解决的事情，不要犹豫。',
      22: '贲卦是文饰——山下有火照亮山体，一切都看起来很美好。但不要只看表面，本质比形式重要。',
      23: '剥卦是剥落衰退——山体被剥蚀，根基不稳。现在不是往前冲的时候，先把地基打牢。',
      24: '复卦是冬至阳生——雷在地中，阳气初复。最坏的时候已经过去了，一阳来复，万象更新。',
      25: '无妄卦是真诚不妄——天下雷行，万物不敢妄动。保持真实，别耍小聪明，但也警惕无妄之灾。',
      26: '大畜卦是大积蓄——天藏于山中，能量在蓄积。你现在在学习、积累的阶段，等爆发的那一天。',
      27: '颐卦是颐养——山下有雷如口咀嚼，养生、养德、养自己。关注你怎么"获取滋养"，方式对不对。',
      28: '大过卦是过度——泽水淹没了树木，超出了正常范围。你可能正面临一个非常规的局面，需要非常规的手段。',
      29: '坎卦是险阻——水和水的叠加，危险重重。但水有诚信（满而不溢），保持内心的诚实，险中亦有路。',
      30: '离卦是光明依附——火与火相连，照耀四方。你需要找到一个可以依附的正道，如火焰需要燃料。',
      31: '咸卦是感应——山上有泽，相互浸润。这是人与人之间的磁场感应，感情、合作、理解都从"感"开始。',
      32: '恒卦是恒久——雷与风相伴而行。长久之道在于坚持，但恒不等于死板——方向对了才值得坚持。',
      33: '遁卦是退避——山在天之下，君子退隐以避小人。战略性撤退不丢人，保存实力等翻盘。',
      34: '大壮卦是强盛——雷在天上声势浩大。你很有力量，但易经警告：非礼勿履，力量越大越要守规矩。',
      35: '晋卦是晋升——太阳从地面升起，蒸蒸日上。事业在上升期，以明德照亮前路。',
      36: '明夷卦是光明受伤——太阳落入地下，才华被埋没。在黑暗中守住内心的光，等待重见天日。',
      37: '家人卦是家庭——风从火出，家道自内而外。关注你身边的人和内部关系，家治好了外面才能好。',
      38: '睽卦是乖离——火在上泽在下互相背离。你遇到了分歧，求同存异比强求一致更明智。',
      39: '蹇卦是险阻——山上有水举步维艰。前面路不好走，不妨回头看看，换个方向可能有更好的风景。',
      40: '解卦是解脱——雷雨交作，万物得以解脱。困难正在化解，宽容待人，早点把包袱放下。',
      41: '损卦是减损——山下有泽，损下益上。你现在需要做减法：减少欲望、简化生活、放下一些东西。',
      42: '益卦是增益——风雷相激彼此增益。好运来了，见善则从、见过则改，自我增益无穷尽。',
      43: '夬卦是决断——泽在天上即将决堤。你面临一个必须做的决定，果断但不莽撞，公开公正地处理。',
      44: '姤卦是邂逅——天下有风，遇合之象。新的关系或机会出现了，但一阴初生，注意微小的信号。',
      45: '萃卦是聚集——泽水汇聚于大地。众人聚集共谋大事，但人群聚集也要警惕意外，做好万全准备。',
      46: '升卦是上升——地中生木步步成长。积小成大、循序渐进，像树一样慢慢长，根基才稳。',
      47: '困卦是困境——泽中无水，枯竭之象。你现在可能觉得说什么都没人信，那就用行动证明。困境中的坚守才显真本事。',
      48: '井卦是水井——木上有水，滋养之道。城市可以变迁，井不会挪走——找到你的根基所在，别人离不开你。',
      49: '革卦是变革——泽中有火，水火相克生变。时机到了就该变，变革不是破坏，而是像蜕皮一样自然重生。',
      50: '鼎卦是鼎器——木上有火烹煮食物。建立新秩序的时候到了，鼎不正则倾，先正位凝命。',
      51: '震卦是惊雷——雷声阵阵震动之象。突发事件让你警醒，恐惧之后会有欢笑，手中祭器别掉。',
      52: '艮卦是静止——两座山叠在一起。知止不殆，思不出其位。该停下来的时候就停下来，不被外物所扰。',
      53: '渐卦是渐进——山上有木徐徐生长。事情在缓慢而稳定地发展，不急不躁，渐进的改变最持久。',
      54: '归妹卦是婚姻合作——雷动泽上，结合之象。涉及合作或契约的事，要谨慎，预见到可能的弊端。',
      55: '丰卦是丰盛——雷电交加日正当午。你正处在鼎盛时期，但日中最短，盛极必衰，珍惜当下。',
      56: '旅卦是旅行——山上燃起篝火，人在旅途。你正处在一个过渡期或客居状态，小心行事、勿滞留。',
      57: '巽卦是柔顺渗透——风随风无孔不入。以柔克刚是最好的策略，像风一样温和而坚定地渗透。',
      58: '兑卦是喜悦——两泽相连相互滋润。心情好、人缘好、适合交流分享。但取悦于人要有底线。',
      59: '涣卦是涣散消解——风行水上冰释溶解。固结的东西开始化开了，旧的格局被打破，新秩序在建立。',
      60: '节卦是节制——泽上有水需要堤防。凡事有度，适可而止。过分的节制（苦节）不可长久。',
      61: '中孚卦是诚信——风行泽上真诚感化。发自内心的诚信可以感化万物，大事可成。',
      62: '小过卦是小有过越——山上有雷小有越轨。小事可以稍微放一放，大事则要谨慎。宜下不宜上。',
      63: '既济卦是已经完成——水在火上烹煮完成。事情成了，但初吉终乱，成功之后更要居安思危。',
      64: '未济卦是尚未完成——火在水上事物未成。最后一卦以此结束，寓意一切在变化中没有终点。别急，慢慢来。'
    };
    return map[hex.number] || hex.name + '卦：' + (hex.description ? hex.description.substring(0, 50) + '…' : '');
  }

  /* ────── Body section ────── */
  function buildBody(hex, transformed, changingIndices, bu, tbu, lineAnalysis, domain, domainInfo, tops) {
    var lines = [];
    lines.push('《卦象解读》');
    lines.push('');
    lines.push(hex.description);
    lines.push('');
    if (bu) {
      lines.push(writeBodyUsage(bu, hex));
      lines.push('');
    }
    lines.push(writeDomain(domain, hex, bu, changingIndices, transformed));
    lines.push('');

    if (lineAnalysis.length > 0) {
      lines.push('《变爻的启示》');
      lines.push('');
      for (var i = 0; i < lineAnalysis.length; i++) {
        lines.push(writeLine(lineAnalysis[i], hex, i, lineAnalysis.length, domain));
        lines.push('');
      }
    }

    if (transformed) {
      lines.push('《未来的走向》');
      lines.push('');
      lines.push('变爻的出现让卦象发生了变化——从"' + hex.name + '"变成了"' + transformed.name + '"。在易经中，本卦代表现在，之卦代表未来的发展趋势。');
      lines.push('');
      lines.push(transformed.name + '卦说：' + transformed.description);
      lines.push('');
      if (tbu) {
        lines.push(writeTrend(bu, tbu, hex, transformed));
        lines.push('');
      }
    }
    return lines.join('\n');
  }

  /* ────── Body-usage paragraph ────── */
  function writeBodyUsage(bu, hex) {
    var bodyTri = ns.getTrigram(hex.lowerTrigram);
    var usageTri = ns.getTrigram(hex.upperTrigram);
    var tpl = {
      '用生体': '从五行来看，你现在的情况是"用生体"——体卦' + bodyTri.name + '（代表你）属' + bu.bodyElement + '，用卦' + usageTri.name + '（代表外部环境）属' + bu.usageElement + '，' + bu.usageElement + '生' + bu.bodyElement + '。大白话就是：环境在滋养你，你不用太费力，事情自然而然会往好的方向发展。这就像顺水推舟，把握好方向就行。',
      '比和': '从五行来看，你现在的情况是"比和"——体卦' + bodyTri.name + '（代表你）和用卦' + usageTri.name + '（代表外部环境）都属' + bu.bodyElement + '，内外一致、相互呼应。大白话就是：你现在做的事和周围环境是合拍的，你内心想什么，外部就在回应什么。这种状态很难得，保持就好。',
      '体生用': '从五行来看，你现在的情况是"体生用"——体卦' + bodyTri.name + '（代表你）属' + bu.bodyElement + '，用卦' + usageTri.name + '（代表外部环境）属' + bu.usageElement + '，' + bu.bodyElement + '生' + bu.usageElement + '。大白话就是：你在往外掏能量滋养环境，付出多、回报少。就像你在浇水，但花开在别人家。这不是说这事不能做，而是提醒你别掏空自己。放慢节奏，照顾好自己再顾其他。',
      '体克用': '从五行来看，你现在的情况是"体克用"——体卦' + bodyTri.name + '（代表你）属' + bu.bodyElement + '，用卦' + usageTri.name + '（代表外部环境）属' + bu.usageElement + '，' + bu.bodyElement + '克' + bu.usageElement + '。大白话就是：事情在你的掌控之中，但需要你持续用力。好比砍一棵树，斧子在你手里，但每一斧都得你自己挥。能成，但不会轻松。',
      '用克体': '从五行来看，你现在的情况是"用克体"——体卦' + bodyTri.name + '（代表你）属' + bu.bodyElement + '，用卦' + usageTri.name + '（代表外部环境）属' + bu.usageElement + '，' + bu.usageElement + '克' + bu.bodyElement + '。大白话就是：外部环境在给你压力，你可能会感到束手束脚、有劲使不出。这不是你做错了什么，而是时机未到、环境不太好。与其硬拼，不如先避一避、等一等。'
    };
    return tpl[bu.relationship] || bu.explanation;
  }

  /* ────── Domain-specific paragraph ────── */
  function writeDomain(domain, hex, bu, changingIndices, transformed) {
    var hname = hex.name;
    var fortune = bu ? bu.fortune : '吉';
    var buRel = bu ? bu.relationship : '';
    var fn = DOMAIN_PARAGRAPHS[domain];
    if (fn) return fn(hname, fortune, buRel, changingIndices, transformed);
    return DOMAIN_PARAGRAPHS.spiritual(hname, fortune, buRel, changingIndices, transformed, hex);
  }

  var DOMAIN_PARAGRAPHS = {
    career: function(hname, fortune, buRel) {
      var base = '放到你的工作上来看——' + hname + '卦给你的信息很明确。';
      if (fortune === '大吉') return base + ' 当前的外部环境对你的事业是比较有利的，就像顺风划船。如果你最近有换工作、争取晋升、或者创业的打算，可以认真考虑了。但你的卦也提醒你：运势好不代表可以躺赢。你该做的准备——更新简历、提升技能、了解市场——一样不能少。运气是锦上添花，实力才是雪中送炭。';
      if (fortune === '吉') return base + ' 你目前在工作中的状态和环境是相匹配的——就像你擅长的事正好是公司需要的。这种时候不用急着折腾，把已有的优势发挥到极致，机会会自然找上门。如果有什么技能是你一直想学但拖着没学的，现在是个好时候。';
      if (fortune === '中吉') return base + ' 这件事是能成的，但你要做好付出实际努力的准备。升职加薪不是等来的，是做出来的。' + (buRel === '体克用' ? '你现在是"体克用"——在主导局面但推得很辛苦。这种感觉就像你在推一辆重车上坡，累归累，但方向是对的。' : '') + '沉下心把手头的事做到极致，坚持就是胜利。';
      return base + ' 坦白说，目前可能不是你主动出击的最佳时机。' + (buRel === '用克体' ? '从卦象看，外部环境目前对你不利——可能公司形势不好、行业不景气、或者遇到了不太好沟通的上级。' : '') + '建议你利用这段时间先沉淀：学习新技能、观察行业动向、维护好人脉。等风来了再扬帆，比现在硬闯要好得多。';
    },
    love: function(hname, fortune, buRel) {
      var base = '放到你的感情上来看——' + hname + '卦是这么说的。';
      if (fortune === '大吉' || fortune === '吉') return base + ' 整体气息是向上的。' + (buRel === '用生体' ? '环境在帮你——你可能不需要太刻意地去做什么，缘分或对方的善意会主动向你靠近。' : '你和对方的磁场目前比较合拍，相处起来自然舒服。') + '单身的你，多参加一些活动、多见一些人，机会就藏在日常中，别老宅着。已经在关系里的你，这是往前推进的好时机——可能是搬到一起住、见家长、或者解决一个你们拖了很久的问题。记住：好卦是顺水推舟，不是让你被动等待。';
      if (fortune === '中吉') return base + ' 这段关系需要你花心思去经营，不是顺其自然就能好的。' + (buRel === '体克用' ? '目前你在关系中可能承担了更多——你在主导，但也很累。' : '') + '建议找个彼此都放松的时间，认真沟通一次。很多问题其实说开了就没事了，就怕各自憋在心里。';
      return base + ' 目前的感情状态可能需要你冷静下来想一想。' + (buRel === '用克体' ? '外部压力或对方的情绪在压着你，你可能会感到有些委屈或无力。' : '你可能正在消耗自己来维持这段关系，付出的比得到的多。') + '不急着做决定，但有一句话可以先放在心里：好的关系是互相成就，不是互相消耗。如果一段关系让你长期感到累和不安，那不是你的问题，是这段关系本身需要重新审视。';
    },
    health: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '放在健康上来看——' + hname + '卦显示你的身体底子还不错。该运动就运动，该睡觉就睡觉，别仗着底子好就熬夜透支。如果你正在恢复期，这个卦暗示恢复会比较顺利，但仍需按部就班地休养。';
      if (fortune === '中吉') return '放在健康上来看——身体在给你发信号了。你可能一直很忙，把"等有空再说"的小毛病一推再推。' + hname + '卦提醒你：小病不治，大病上身。安排个时间去体检，把那些一直拖着的小问题处理掉。身体不是机器，不能只跑不保养。';
      return '放在健康上来看——' + hname + '卦在提醒你多加注意。你的身体可能已经在抗议了：太累、睡不好、容易生病。现在不是逞强的时候，该看医生看医生，该请假休息就请假。老祖宗有句话叫"留得青山在，不怕没柴烧"，身体就是那座青山。';
    },
    wealth: function(hname, fortune, buRel) {
      if (fortune === '大吉' || fortune === '吉') return '放在财运上来看——' + hname + '卦显示财运处于上升期。' + (buRel === '用生体' ? '可能会有意外之财或好的投资机会找上门。' : '你的财务状况和外部环境比较搭，适合做稳健的规划。') + '但好财运不是让你一把梭哈的——稳扎稳打、分散风险才是长久之道。';
      if (fortune === '中吉') return '放在财运上来看——钱是有的，但需要你实实在在去挣。' + (buRel === '体克用' ? '每一分钱可能都是辛苦换来的，不是轻轻松松的偏财。' : '') + '当前不适合做高风险的投资，也不要借钱给别人。稳扎稳打，积少成多。';
      return '放在财运上来看——' + hname + '卦提醒你最近财运不太理想。外部环境可能有波动，建议收紧支出，不要在这段时间做大额投资决策。有时候不亏就是赚，守住本金等待时机。';
    },
    decision: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '关于你的选择和决定——' + hname + '卦的态度是比较积极的。你内心其实已经有了倾向，只是需要一些外部的确认。这个卦就是那个确认：条件基本成熟了，选那条让你心里更踏实、做起来更有动力的路。选完之后就别再回头想了，往前走。';
      if (fortune === '中吉') return '关于你的选择——' + hname + '卦说：选了就坚持到底。两个选项可能各有利弊，没有完美的答案。重要的是你选了之后能不能坚定地走下去。最怕的不是选错，而是选了A又一直惦记B——那样的内耗比选错本身更损耗你。';
      return '关于你的选择——' + hname + '卦建议你再等一等。目前的外部条件可能还不够明朗，你掌握的信息也不够全面。如果不是非今天决定不可的事，给自己多一点时间。等环境和你自己都静下来了，答案会自己浮出来。';
    },
    study: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '放到学业上来说——' + hname + '卦显示学习运势不错。你目前的状态和环境都有利于学习，如果有考试或面试在眼前，正常发挥就不会差。每天坚持学一点，长期积累比考前突击有用得多。';
      if (fortune === '中吉') return '放到学业上来说——' + hname + '卦告诉你学习没有捷径。你可能需要比别人多花一些时间才能拿到同样的成绩，但这不一定是坏事——扎扎实实学到的东西才是真正属于你的。如果最近考得不理想，不是能力问题，是功夫还没下到位。';
      return '放到学业上来说——目前的状态可能需要调整。干扰比较多，或者你自己有些疲惫倦怠了。换个学习环境、换个方法、或者干脆给自己放个短假。状态不好的时候硬学效率很低，调整好了再出发。';
    },
    family: function(hname) {
      return '放到家庭关系上来看——' + hname + '卦提醒你，家人之间的关系是需要用心经营的。好的时候多珍惜，有矛盾的时候多沟通。家庭成员之间往往没有绝对的对错，只有理解与不理解。如果你和某个家人最近有点别扭，主动迈出第一步不丢人——在家人面前，爱比面子重要。';
    },
    travel: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '放到出行或迁移上来看——' + hname + '卦显示行程会比较顺利。提前做好攻略和计划，途中的小插曲其实也是旅途的一部分。如果是搬家或换城市，"动"比"不动"更有利。';
      return '放到出行或迁移上来看——' + hname + '卦建议你多做准备、多确认细节。如果行程不是非去不可，推迟也无妨。如果必须要走，那就把该确认的东西再检查一遍，稳当一点总没错。';
    },
    creative: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '放到创作和发展上来看——' + hname + '卦暗示灵感正在来的路上。你的创造力处于上升期，适合启动新项目或尝试新方向。别想太多，先动手。完美的作品是在不断修改中诞生的，不是一开始就在脑子里想好的。';
      return '放到创作上来看——' + hname + '卦说你可能正在经历一个"酝酿期"。看起来没什么产出，但其实很多东西在底下发酵。别逼自己一定要出结果，出去走走、看看别人的作品。灵感往往在你彻底放松的时候来敲门。';
    },
    conflict: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '关于你遇到的矛盾和纠纷——' + hname + '卦显示有化解的空间。先伸出手的那个人不是输了，是格局更大。如果涉及调解或判决，结果大概率对你有利。但自己也要拿出诚意，诚意是化解矛盾最好的润滑剂。';
      return '关于你遇到的矛盾——' + hname + '卦建议不要硬碰硬。你可能觉得"凭什么我要让"——但继续斗下去，消耗的是彼此的精力、时间和好心情，到头来谁都没赢。如果能找到中间人调停最好，如果暂时不行，先搁置。很多事情，放一放就过去了。';
    },
    spiritual: function(hname, fortune, buRel, changingIndices, transformed, hex) {
      var brief = hex.description ? hex.description.substring(0, 80) : '';
      if (fortune === '大吉') return '回到你的问题本身——你问的是关于自己的整体状态。' + hname + '卦给了一个很正面的回应：' + brief + '…具体到你个人，这个卦告诉你，你目前在大方向上是顺利的，只是偶尔会在某些瞬间突然感到迷茫——这太正常了。卦象不是说你什么烦恼都没有了，而是说你的大底盘是稳的。在这个基础上，别被偶尔的情绪波动带偏。';
      if (fortune === '吉') return '回到你的问题本身——你问的是关于自己的整体状态。' + hname + '卦给出的信息是：' + brief + '…整体来说，你现在做的事情和周围的环境是匹配的，可能没什么惊天动地的大事，但也没有大的波折。这种"平顺"本身就是一种福气，只是我们很容易在平顺中忘记它的珍贵。安住当下，享受这份平顺。';
      if (fortune === '中吉') return '回到你的问题本身——你问的是关于自己的整体状态。' + hname + '卦显示：' + brief + '…你现在可能处在一个"需要使劲"的阶段。事情在往前走，但你要推着它走，不是它带着你走。这种状态虽然累，但比完全停滞要好得多。关键是别把劲使在不对的地方——花点时间想清楚自己在忙什么、值不值得。';
      return '回到你的问题本身——你问的是关于自己的整体状态。' + hname + '卦坦率地显示了当前的一些不顺：' + brief + '…你可能正处在比较低迷的阶段，感觉做什么都不太对。但这就是易经最根本的智慧——"变"。不好的局面不会永远不变。你现在需要做的不是拼命翻盘，而是先稳住自己。给自己一点时间，不用急。';
    },
    social: function(hname, fortune) {
      if (fortune === '大吉' || fortune === '吉') return '放到人际关系上来看——' + hname + '卦显示你的人缘在上升期。最近适合多参加一些社交活动，可能会遇到对你有帮助的人。朋友找你帮忙的时候能帮就帮，善缘就是这样一点一点种下的——你不知道哪颗种子以后会长成大树。';
      return '放到人际关系上来看——' + hname + '卦在提醒你：不是所有人际关系都值得无条件维护。如果有些人让你长期感到消耗、疲惫甚至自我怀疑，适当地拉开一点距离不是冷漠，而是对你自己的尊重和保护。真正的好关系是双向的、舒服的。';
    }
  };

  /* ────── Changing line paragraph ────── */
  function writeLine(la, hex, index, total, domain) {
    var lines = [];
    lines.push('第' + la.lineNumber + '爻（' + la.position + '·' + la.role + '）是变爻——');
    lines.push('  易经说："' + la.lineText + '"');
    lines.push('  大白话的意思是：' + la.lineMeaning);
    var posAdvice = {
      '初爻': '这个变爻在最底层，说明变化的起点在根基上——可能是一个新的习惯、新的想法、或者一件刚开始的事。注意小苗头，别让它长歪了。',
      '二爻': '这个变爻在内卦的中间，关乎你自身。你可能需要审视一下自己的能力、状态或者态度——是不是准备好了？是不是方向对了？',
      '三爻': '这个变爻在内外交界处，说明你正从"自己的世界"走向"外面的世界"。这是一个转折点，小心走好这一步。',
      '四爻': '这个变爻在外卦的底层，外部环境开始介入了。你可能会发现周围的人和事开始对你产生影响——观察清楚再反应。',
      '五爻': '这个变爻在君王的位置，是六个爻中最关键的。事情到了核心环节，你做的每一个决定都举足轻重。这也是最需要智慧和担当的时候。',
      '上爻': '这个变爻在最顶层，事情接近尾声。变动出现在末尾，说明结局可能和你预想的不太一样。注意收尾，别在最后一步翻车。'
    };
    if (posAdvice[la.position]) {
      lines.push('  在你当前处境里的含义：' + posAdvice[la.position]);
    }
    return lines.join('\n');
  }

  /* ────── Trend paragraph ────── */
  function writeTrend(buCur, buFut, hex, transformed) {
    var cf = buCur.fortune;
    var ff = buFut.fortune;
    if (ff === '大吉' || ff === '吉') {
      if (cf === '大吉' || cf === '吉') return '关于发展趋势：本卦和之卦的体用关系都比较好——这意味着你现在做的是对的，继续走下去会有更好的结果。就像你已经走上了一条上坡路，虽然可能会累，但每走一步都是在往上。';
      return '关键的趋势变化：本卦的体用关系是「' + buCur.relationship + '」（' + cf + '），但之卦变成了「' + buFut.relationship + '」（' + ff + '）。这说明——虽然现在看起来不太顺，但情况正在好转。你现在的策略应该是"熬过这一段"，坚持住，后面会轻松很多。';
    }
    if (ff === '中吉') {
      if (cf === '大吉' || cf === '吉') return '趋势提醒：目前形势不错（本卦' + cf + '），但未来的方向（之卦' + ff + '）在提醒你——好运气不会自动持续。接下来需要你更主动地去把控局面，不能一直靠顺风。把现在的好状态转化为实际的积累和准备。';
      if (cf === '中吉') return '趋势上，需要保持定力：本卦和之卦都是"中吉"——事情从头到尾都需要你持续发力，没有一劳永逸的捷径。但这也不完全是坏事：靠自己实力拿到的结果，比靠运气的更扎实。';
      return '趋势在好转：本卦是「' + buCur.relationship + '」（' + cf + '），之卦是「' + buFut.relationship + '」（' + ff + '）。虽然挑战还在，但你已经从完全被动的状态进入了可以主动作为的阶段。这是关键转折，把握住。';
    }
    if (cf === '大吉' || cf === '吉') return '未来趋势预警：现在的局面是不错的（本卦' + cf + '），但之卦（' + ff + '）显示未来的方向需要你多加小心。好时光不会永远持续，趁着现在顺风顺水，做一些准备和储备，为后面可能的困难打好基础。居安思危，不是杞人忧天，是成熟。';
    if (cf === '中吉') return '趋势上需要注意：本卦是「' + buCur.relationship + '」（' + cf + '），但之卦变成了「' + buFut.relationship + '」（' + ff + '）。这说明如果你继续按现在的方式走下去，可能会越来越吃力。调整策略的时候到了——不是放弃，是换一种方式。';
    return '坦率地说，目前和未来的体用关系都不太理想。但这恰恰是易经最有价值的地方——它让你提前看到风险。知道前面有坑，就可以绕着走。现在的策略应该以守为主：减少消耗、保存实力、静观其变。';
  }

  /* ────── Closing ────── */
  function buildClosing(hex, transformed, bu, tbu, changingIndices, domain, domainInfo) {
    var lines = [];
    lines.push('《给你的建议》');
    lines.push('');

    var hasChange = changingIndices.length > 0;
    var summary;
    if (bu && bu.fortune === '大吉') {
      summary = hex.name + '卦是一个相当好的卦象。用易经的术语说叫"元亨利贞"——大通、有利、宜守正。翻译成大白话就是：天时地利都在你这边，但你自己也要靠谱。好运气配上好行动，才是最好的结果。眼下是你有所作为的好时候——别浪费了。';
    } else if (bu && bu.fortune === '吉') {
      summary = '整体来看，' + hex.name + '卦是一个比较顺利的卦象。易经讲究"阴阳平衡"，而你现在内外环境相对和谐，事情大概率会按正常的节奏推进。不需要什么惊天动地的操作，保持现在的状态就是最好的策略。平平顺顺就是福。';
    } else if (bu && bu.fortune === '中吉') {
      if (hasChange && tbu && (tbu.fortune === '大吉' || tbu.fortune === '吉')) {
        summary = hex.name + '卦告诉你：眼下是有些吃力的，需要你实实在在地下功夫。但好消息是——变卦的方向是好的。也就是说，你现在的努力是有奔头的，它会带你走到一个更轻松、更好的境地。咬咬牙，坚持到那个拐点。';
      } else {
        summary = hex.name + '卦告诉你：事情是能成的，但你的付出和回报大致成正比。没有捷径，也没有贵人空降。靠自己的双手一寸一寸地推进，虽然慢，但踏实。最怕的不是慢，是做着做着不做了。坚持，是这个卦给你最重要的词。';
      }
    } else {
      if (hasChange && tbu && (tbu.fortune === '大吉' || tbu.fortune === '吉')) {
        summary = hex.name + '卦在当下确实不算好卦，但关键是——变卦指的是好的方向。易经最核心的精神就是"变"，不好是会过去的。你现在的任务不是反败为胜（现在做不了），而是稳住自己、别在黎明前倒下。';
      } else {
        summary = '坦率地说，' + hex.name + '卦在当前阶段不算一个理想的卦象。但这就是易经的价值所在——不是每次占卜都说你好话，而是让你看到真实的处境。不好的局面不会永远不好，所有的困境都有期限。你现在要做的就是：接受现状，减少不必要的消耗，保护好自己，等待转机。';
      }
    }
    lines.push(summary);

    var closings = {
      career: '不管卦的好坏，永远别忘了：工作是生活的一部分，不是你生活的全部。',
      love: '易经讲阴阳相济——好的关系从来不是一个人占了上风，而是两个人都舒服。',
      health: '卦象是参考，身体是根本。别等到病了才想起来要对自己好一点。',
      wealth: '君子爱财，取之有道。卦的好坏是一时的，理财的习惯是一辈子的。',
      decision: '不管你怎么选，记住：选择决定方向，行动决定结果。与其纠结选哪个，不如选了之后好好走。',
      study: '学习这件事，卦象告诉你的只是时机——真正决定你能走多远的，是每一天的坚持。',
      family: '家不是一个讲理的地方，是一个讲爱的地方。',
      travel: '旅途中的每一个意外，回过头看都是故事。',
      creative: '灵感不会一直在线，但习惯会。每天都做一点，比等灵感可靠一百倍。',
      conflict: '退一步不是认输，是为了走得更远。',
      spiritual: '你已经做了很多人不会做的事——停下来、问一问自己。这份觉察本身，就是这个卦给你最好的礼物。',
      social: '真正的人脉不是你认识多少人，而是多少人觉得跟你在一起是舒服的。'
    };
    if (closings[domain]) {
      lines.push('');
      lines.push(closings[domain]);
    }
    lines.push('');
    lines.push('—— 第' + hex.number + '卦 · ' + hex.name + '（' + hex.pinyin + '）');
    return lines.join('\n');
  }

  /* ────── Public API ────── */
  ns.AdviceEngine = { generate: generate, categorize: categorize, DOMAINS: DOMAINS };
  console.log('[iching] advice-engine module loaded');
})();
