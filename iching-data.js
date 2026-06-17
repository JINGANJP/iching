// ============================================================
// I Ching Data Engine — 64 Hexagrams, Trigrams, Calculation
// ============================================================

var IChing = (function() {
  'use strict';

  // ---- 8 Trigrams (八卦) ----
  const TRIGRAMS = {
    qian: { name: '乾', nameEn: 'Heaven', symbol: '☰', binary: '111' },
    dui:  { name: '兌', nameEn: 'Lake',   symbol: '☱', binary: '110' },
    li:   { name: '離', nameEn: 'Fire',   symbol: '☲', binary: '101' },
    zhen: { name: '震', nameEn: 'Thunder',symbol: '☳', binary: '100' },
    xun:  { name: '巽', nameEn: 'Wind',   symbol: '☴', binary: '011' },
    kan:  { name: '坎', nameEn: 'Water',  symbol: '☵', binary: '010' },
    gen:  { name: '艮', nameEn: 'Mountain',symbol: '☶', binary: '001' },
    kun:  { name: '坤', nameEn: 'Earth',  symbol: '☷', binary: '000' }
  };

  // Binary pattern to trigram key
  const BINARY_TO_TRIGRAM = {};
  Object.keys(TRIGRAMS).forEach(k => {
    BINARY_TO_TRIGRAM[TRIGRAMS[k].binary] = k;
  });

  // ---- Five Elements (五行) mapping for 8 Trigrams ----
  // 乾兑属金, 坤艮属土, 震巽属木, 坎属水, 离属火
  const FIVE_ELEMENTS = {
    qian: { element: '金', name: 'Metal', nature: '刚健' },
    dui:  { element: '金', name: 'Metal', nature: '喜悦' },
    li:   { element: '火', name: 'Fire',   nature: '光明' },
    zhen: { element: '木', name: 'Wood',   nature: '震动' },
    xun:  { element: '木', name: 'Wood',   nature: '渗透' },
    kan:  { element: '水', name: 'Water',  nature: '险陷' },
    gen:  { element: '土', name: 'Earth',  nature: '静止' },
    kun:  { element: '土', name: 'Earth',  nature: '柔顺' }
  };

  // Five-element generating (生) and overcoming (克) relationships
  // 生: 木→火→土→金→水→木  (wood→fire→earth→metal→water→wood)
  // 克: 木→土→水→火→金→木  (wood→earth→water→fire→metal→wood)
  const GENERATING = { '木':'火', '火':'土', '土':'金', '金':'水', '水':'木' };
  const OVERCOMING = { '木':'土', '土':'水', '水':'火', '火':'金', '金':'木' };

  // Position significance for each line (from bottom, 0-indexed)
  const LINE_POSITIONS = [
    { name: '初爻', role: '根基之位', meaning: '代表事情的初始阶段与根基。此爻动，说明事情刚刚起步，或问题的根源在底层。' },
    { name: '二爻', role: '内中位', meaning: '代表当事人自身状态与能力。此爻动，反思自身条件是否充足，内在准备是否到位。' },
    { name: '三爻', role: '内卦之极', meaning: '处于内外的交界点。此爻动，意味着即将从内部走向外部，面临转折与选择。' },
    { name: '四爻', role: '外卦之始', meaning: '代表外部环境的影响初现。此爻动，外部因素开始介入，需观察周围的变化。' },
    { name: '五爻', role: '君位', meaning: '代表事情的核心地位或关键人物。此爻动，事情到了最关键的阶段，成败在此一举。' },
    { name: '上爻', role: '终结之位', meaning: '代表事情的结局或最终阶段。此爻动，事情接近尾声，需关注收尾与后续影响。' }
  ];

  // ---- 64 Hexagrams (King Wen order) ----
  const HEXAGRAMS = [
    { // 1
      number: 1, name: '乾', pinyin: 'Qián', english: 'The Creative',
      upperTrigram: 'qian', lowerTrigram: 'qian',
      judgment: '元亨利贞。',
      image: '天行健，君子以自强不息。',
      description: '乾卦六爻纯阳，象征天道运行不息，万物创生之始。此卦代表创造、主动、领导与强健之力。得此卦者，当知天时已至，宜勇往直前，积极进取。然阳极则阴生，刚健之中需知进退之机。',
      themes: ['creation','leadership','initiative','strength','action','power','heaven'],
      lines: [
        { text: '初九：潜龙勿用。', meaning: '时机未至，需潜伏蓄力，不宜轻举妄动。' },
        { text: '九二：见龙在田，利见大人。', meaning: '才能初显，适宜寻求贵人指引。' },
        { text: '九三：君子终日乾乾，夕惕若厉，无咎。', meaning: '勤勉不懈，日夜警惕，可免过失。' },
        { text: '九四：或跃在渊，无咎。', meaning: '面临跃升或守成的抉择，审时度势则无过。' },
        { text: '九五：飞龙在天，利见大人。', meaning: '事业鼎盛，如飞龙在天，利于大展宏图。' },
        { text: '上九：亢龙有悔。', meaning: '刚强过甚，盛极而衰，当知谦退之道。' }
      ]
    },
    { // 2
      number: 2, name: '坤', pinyin: 'Kūn', english: 'The Receptive',
      upperTrigram: 'kun', lowerTrigram: 'kun',
      judgment: '元亨，利牝马之贞。君子有攸往，先迷后得主，利西南得朋，东北丧朋。安贞吉。',
      image: '地势坤，君子以厚德载物。',
      description: '坤卦六爻纯阴，象征大地之德，承载万物、柔顺包容。得此卦者，当以柔克刚，以静制动，顺势而为。不宜主动出击，而应辅佐他人，以厚德载物之心待人处事，终得善果。',
      themes: ['receptivity','patience','nurturing','yielding','service','earth','flexibility'],
      lines: [
        { text: '初六：履霜，坚冰至。', meaning: '见微知著，从细微迹象预判未来趋势。' },
        { text: '六二：直方大，不习无不利。', meaning: '本性正直宽厚，不刻意修炼亦无所不利。' },
        { text: '六三：含章可贞，或从王事，无成有终。', meaning: '内含才华而不炫耀，辅佐他人虽无显功却有善终。' },
        { text: '六四：括囊，无咎无誉。', meaning: '谨言慎行，如扎紧袋口，不惹是非。' },
        { text: '六五：黄裳，元吉。', meaning: '以谦逊中庸之道处事，大吉大利。' },
        { text: '上六：龙战于野，其血玄黄。', meaning: '阴柔至极而与阳刚相争，两败俱伤。' }
      ]
    },
    { // 3
      number: 3, name: '屯', pinyin: 'Zhūn', english: 'Difficulty at the Beginning',
      upperTrigram: 'kan', lowerTrigram: 'zhen',
      judgment: '元亨利贞。勿用有攸往，利建侯。',
      image: '云雷屯，君子以经纶。',
      description: '屯卦象征万物初生之艰难。上坎为水为险，下震为雷为动，动而遇险，故有初始之困。得此卦者，正处事业初创或新阶段开端，万事开头难，不宜冒进，应耐心经营，步步为营。',
      themes: ['beginning','struggle','perseverance','planning','new-venture','caution'],
      lines: [
        { text: '初九：磐桓，利居贞，利建侯。', meaning: '徘徊难进之时，宜坚守正道，建立根基。' },
        { text: '六二：屯如邅如，乘马班如。匪寇婚媾，女子贞不字，十年乃字。', meaning: '困难重重，须有耐心，好事多磨。' },
        { text: '六三：即鹿无虞，惟入于林中，君子几不如舍，往吝。', meaning: '盲目追逐目标而无人引导，不如暂时放弃。' },
        { text: '六四：乘马班如，求婚媾，往吉，无不利。', meaning: '主动寻求合作，前进有利。' },
        { text: '九五：屯其膏，小贞吉，大贞凶。', meaning: '资源有限时，做小事可成，贪大则败。' },
        { text: '上六：乘马班如，泣血涟如。', meaning: '困顿至极，需反思调整，不可一味强求。' }
      ]
    },
    { // 4
      number: 4, name: '蒙', pinyin: 'Méng', english: 'Youthful Folly',
      upperTrigram: 'gen', lowerTrigram: 'kan',
      judgment: '亨。匪我求童蒙，童蒙求我。初筮告，再三渎，渎则不告。利贞。',
      image: '山下出泉，蒙。君子以果行育德。',
      description: '蒙卦象征蒙昧与启蒙。上艮为山，下坎为水，山下出泉，如蒙昧初开之象。得此卦者，或处学习阶段，或面临需要虚心求教的情境。当以赤子之心求知，但不可反复无常、缺乏诚意。',
      themes: ['learning','education','ignorance','guidance','student','mentor','discovery'],
      lines: [
        { text: '初六：发蒙，利用刑人，用说桎梏，以往吝。', meaning: '启蒙之初需适当规范，但不可过于严厉。' },
        { text: '九二：包蒙，吉。纳妇，吉。子克家。', meaning: '包容蒙昧者，宽厚待人，万事吉祥。' },
        { text: '六三：勿用取女，见金夫，不有躬，无攸利。', meaning: '勿被表面诱惑所迷，保持本心。' },
        { text: '六四：困蒙，吝。', meaning: '困于无知而不求教，必然遗憾。' },
        { text: '六五：童蒙，吉。', meaning: '以纯真心态求学，吉祥如意。' },
        { text: '上九：击蒙，不利为寇，利御寇。', meaning: '纠正蒙昧需有度，宜防守而非攻击。' }
      ]
    },
    { // 5
      number: 5, name: '需', pinyin: 'Xū', english: 'Waiting (Nourishment)',
      upperTrigram: 'kan', lowerTrigram: 'qian',
      judgment: '有孚，光亨，贞吉。利涉大川。',
      image: '云上于天，需。君子以饮食宴乐。',
      description: '需卦象征等待与需求。上坎为水为云，下乾为天，云在天上，等待降雨之象。得此卦者，时机尚未成熟，需耐心等待。等待不是无所作为，而是积蓄力量、做好准备，时机一到便可大展身手。',
      themes: ['waiting','patience','preparation','timing','nourishment','trust'],
      lines: [
        { text: '初九：需于郊，利用恒，无咎。', meaning: '在边缘等待，保持恒心，可免过失。' },
        { text: '九二：需于沙，小有言，终吉。', meaning: '接近目标时或有小纷扰，但终局吉祥。' },
        { text: '九三：需于泥，致寇至。', meaning: '陷入泥潭般的等待，需警惕外患。' },
        { text: '六四：需于血，出自穴。', meaning: '经历痛苦等待后，终将脱离困境。' },
        { text: '九五：需于酒食，贞吉。', meaning: '在丰裕中等待，坚守正道则吉。' },
        { text: '上六：入于穴，有不速之客三人来，敬之终吉。', meaning: '陷入困境时会有意外之人相助，以敬待之则吉。' }
      ]
    },
    { // 6
      number: 6, name: '讼', pinyin: 'Sòng', english: 'Conflict',
      upperTrigram: 'qian', lowerTrigram: 'kan',
      judgment: '有孚，窒惕，中吉，终凶。利见大人，不利涉大川。',
      image: '天与水违行，讼。君子以作事谋始。',
      description: '讼卦象征争讼与冲突。上乾为天，下坎为水，天与水相违而行，故有纷争。得此卦者，正面临矛盾或纠纷，宜寻求公正调解，不宜固执己见、坚持到底。退一步海阔天空，争讼到底则双方受损。',
      themes: ['conflict','dispute','lawsuit','disagreement','mediation','compromise'],
      lines: [
        { text: '初六：不永所事，小有言，终吉。', meaning: '不纠缠争端，虽有口舌之争，终局可吉。' },
        { text: '九二：不克讼，归而逋，其邑人三百户，无眚。', meaning: '争讼不胜，退而归隐，可保平安。' },
        { text: '六三：食旧德，贞厉，终吉。或从王事，无成。', meaning: '依靠旧有德行，虽经历艰险终得吉祥。' },
        { text: '九四：不克讼，复即命，渝安贞，吉。', meaning: '争讼不胜而回头顺应天命，安守正道则吉。' },
        { text: '九五：讼，元吉。', meaning: '公正明断地处理纠纷，大吉大利。' },
        { text: '上九：或锡之鞶带，终朝三褫之。', meaning: '争讼即便获胜，所得亦难长久。' }
      ]
    },
    { // 7
      number: 7, name: '师', pinyin: 'Shī', english: 'The Army',
      upperTrigram: 'kun', lowerTrigram: 'kan',
      judgment: '贞，丈人吉，无咎。',
      image: '地中有水，师。君子以容民畜众。',
      description: '师卦象征军队与组织。上坤为地，下坎为水，地中蓄水如军队集结。得此卦者，需以严明纪律组织团队，选贤任能方能取胜。领导者需公正无私，善待部属，方能得人心、成大业。',
      themes: ['organization','leadership','discipline','teamwork','strategy','military','collective'],
      lines: [
        { text: '初六：师出以律，否臧凶。', meaning: '团队行动须有纪律，失律则凶。' },
        { text: '九二：在师中，吉无咎，王三锡命。', meaning: '居核心之位，得到上级多次嘉奖。' },
        { text: '六三：师或舆尸，凶。', meaning: '决策失误可致惨重损失，须谨慎行事。' },
        { text: '六四：师左次，无咎。', meaning: '适时撤退或调整，可避免损失。' },
        { text: '六五：田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶。', meaning: '用人得当则胜，用人不当则败。' },
        { text: '上六：大君有命，开国承家，小人勿用。', meaning: '功成之后需谨慎用人，不可重用小人。' }
      ]
    },
    { // 8
      number: 8, name: '比', pinyin: 'Bǐ', english: 'Holding Together (Union)',
      upperTrigram: 'kan', lowerTrigram: 'kun',
      judgment: '吉。原筮，元永贞，无咎。不宁方来，后夫凶。',
      image: '地上有水，比。先王以建万国，亲诸侯。',
      description: '比卦象征亲和与团结。上坎为水，下坤为地，水附大地而行，相互依存。得此卦者，宜主动亲近他人，寻求合作与联盟。但需真诚以待，若迟疑不决或虚情假意，则错失良机。',
      themes: ['union','partnership','harmony','cooperation','connection','belonging'],
      lines: [
        { text: '初六：有孚比之，无咎。有孚盈缶，终来有它，吉。', meaning: '以诚信结交他人，无有过失，终获吉祥。' },
        { text: '六二：比之自内，贞吉。', meaning: '发自内心地亲近他人，坚守正道则吉。' },
        { text: '六三：比之匪人。', meaning: '与不当之人结盟，必有后患。' },
        { text: '六四：外比之，贞吉。', meaning: '向外部贤者靠拢，坚守正道则吉。' },
        { text: '九五：显比。王用三驱，失前禽。邑人不诫，吉。', meaning: '光明正大地团结他人，顺其自然，来者不拒去者不追。' },
        { text: '上六：比之无首，凶。', meaning: '结盟而无领导者，散沙一盘，凶险。' }
      ]
    },
    { // 9
      number: 9, name: '小畜', pinyin: 'Xiǎo Xù', english: 'The Taming Power of the Small',
      upperTrigram: 'xun', lowerTrigram: 'qian',
      judgment: '亨。密云不雨，自我西郊。',
      image: '风行天上，小畜。君子以懿文德。',
      description: '小畜卦象征小有积蓄、以柔克刚。上巽为风，下乾为天，风行天上，力量尚微。得此卦者，正处于积累阶段，力量尚不足以成大事。如同密云不雨，仍需等待。宜从小处着手，修养文德，积少成多。',
      themes: ['accumulation','small-steps','patience','restraint','cultivation','gentle-power'],
      lines: [
        { text: '初九：复自道，何其咎？吉。', meaning: '回归本来道路，有何过失？吉祥。' },
        { text: '九二：牵复，吉。', meaning: '与人一起回归正道，吉祥。' },
        { text: '九三：舆说辐，夫妻反目。', meaning: '内部不和则如车轮脱落，难以前行。' },
        { text: '六四：有孚，血去惕出，无咎。', meaning: '以诚信化解危机，脱险而出。' },
        { text: '九五：有孚挛如，富以其邻。', meaning: '以诚信团结，与人共富。' },
        { text: '上九：既雨既处，尚德载。妇贞厉，月几望，君子征凶。', meaning: '积累已成，但仍需谨慎，不可贸然行事。' }
      ]
    },
    { // 10
      number: 10, name: '履', pinyin: 'Lǚ', english: 'Treading (Conduct)',
      upperTrigram: 'qian', lowerTrigram: 'dui',
      judgment: '履虎尾，不咥人，亨。',
      image: '上天下泽，履。君子以辩上下，定民志。',
      description: '履卦象征谨慎行事与礼仪规范。上乾为天，下兑为泽，天在上泽在下，各安其位。得此卦者，如履虎尾，需小心谨慎，遵守规则。言行举止宜合乎礼仪，不逾矩，虽处险境亦能安然无恙。',
      themes: ['caution','conduct','etiquette','carefulness','propriety','protocol'],
      lines: [
        { text: '初九：素履，往无咎。', meaning: '以朴素真诚的态度行事，往前无害。' },
        { text: '九二：履道坦坦，幽人贞吉。', meaning: '道路平坦，保持内在宁静则吉。' },
        { text: '六三：眇能视，跛能履，履虎尾，咥人，凶。武人为于大君。', meaning: '不自量力而行险，凶险临头。' },
        { text: '九四：履虎尾，愬愬终吉。', meaning: '虽处险境，保持敬畏谨慎，终得吉祥。' },
        { text: '九五：夬履，贞厉。', meaning: '果断行事虽正当，但仍需谨慎。' },
        { text: '上九：视履考祥，其旋元吉。', meaning: '回顾过往，总结经验，最为吉祥。' }
      ]
    },
    { // 11
      number: 11, name: '泰', pinyin: 'Tài', english: 'Peace',
      upperTrigram: 'kun', lowerTrigram: 'qian',
      judgment: '小往大来，吉亨。',
      image: '天地交，泰。后以财成天地之道，辅相天地之宜，以左右民。',
      description: '泰卦象征通达与和谐。上坤为地，下乾为天，天地交泰，阴阳和合。得此卦者，正处顺境，万事亨通。天地之气相交，上下之心相通，事业与人际关系皆处于最佳状态。然而盛极必衰，居安思危方长久。',
      themes: ['peace','harmony','prosperity','balance','flourishing','connection'],
      lines: [
        { text: '初九：拔茅茹，以其汇，征吉。', meaning: '如拔茅草连及同类，众人齐心出征则吉。' },
        { text: '九二：包荒，用冯河，不遐遗，朋亡，得尚于中行。', meaning: '心胸开阔，包容一切，坚守中道。' },
        { text: '九三：无平不陂，无往不复，艰贞无咎。勿恤其孚，于食有福。', meaning: '世间无常平之路，警觉坚守可免过失。' },
        { text: '六四：翩翩不富，以其邻，不戒以孚。', meaning: '轻率而不踏实，需警惕失信于人。' },
        { text: '六五：帝乙归妹，以祉元吉。', meaning: '美好的结合带来福祉，大吉。' },
        { text: '上六：城复于隍，勿用师。自邑告命，贞吝。', meaning: '盛极而衰，城墙倒塌，不宜再行动。' }
      ]
    },
    { // 12
      number: 12, name: '否', pinyin: 'Pǐ', english: 'Standstill (Stagnation)',
      upperTrigram: 'qian', lowerTrigram: 'kun',
      judgment: '否之匪人，不利君子贞。大往小来。',
      image: '天地不交，否。君子以俭德辟难，不可荣以禄。',
      description: '否卦象征闭塞与不通。上乾为天，下坤为地，天地不交，万事阻塞。得此卦者，时运不济，上下不沟通，好人难出头，小人得势。此时不宜冒进，应收敛锋芒、俭德避难，静待时机转变。',
      themes: ['stagnation','blockage','obstruction','retreat','conservation','waiting'],
      lines: [
        { text: '初六：拔茅茹，以其汇，贞吉亨。', meaning: '退隐守正，与志同道合者共进退。' },
        { text: '六二：包承，小人吉，大人否亨。', meaning: '在小人当道之时，君子暂时受挫。' },
        { text: '六三：包羞。', meaning: '忍受委屈，积蓄力量。' },
        { text: '九四：有命无咎，畴离祉。', meaning: '天命在身，无有过失，众人皆受其福。' },
        { text: '九五：休否，大人吉。其亡其亡，系于苞桑。', meaning: '阻塞将终，时刻警惕则大人吉。' },
        { text: '上九：倾否，先否后喜。', meaning: '阻塞终于倾覆，先困后喜。' }
      ]
    },
    { // 13
      number: 13, name: '同人', pinyin: 'Tóng Rén', english: 'Fellowship with Men',
      upperTrigram: 'qian', lowerTrigram: 'li',
      judgment: '同人于野，亨。利涉大川，利君子贞。',
      image: '天与火，同人。君子以类族辨物。',
      description: '同人卦象征志同道合与大同精神。上乾为天，下离为火，天与火同为光明向上之物。得此卦者，宜寻求志同道合的伙伴，以开阔胸怀接纳众人。公平公正、无私无偏，方能团结众人完成大事。',
      themes: ['fellowship','community','collaboration','equality','unity','openness'],
      lines: [
        { text: '初九：同人于门，无咎。', meaning: '从身边开始团结他人，没有过失。' },
        { text: '六二：同人于宗，吝。', meaning: '只在小圈子里团结，视野狭隘则有遗憾。' },
        { text: '九三：伏戎于莽，升其高陵，三岁不兴。', meaning: '暗中设防，升至高处以观形势，三年不贸然行动。' },
        { text: '九四：乘其墉，弗克攻，吉。', meaning: '占据有利位置但不强攻，适可而止则吉。' },
        { text: '九五：同人先号咷而后笑，大师克相遇。', meaning: '团结历经波折，先哭后笑，终能相会。' },
        { text: '上九：同人于郊，无悔。', meaning: '在更广阔的天地寻求志同道合者，无悔。' }
      ]
    },
    { // 14
      number: 14, name: '大有', pinyin: 'Dà Yǒu', english: 'Possession in Great Measure',
      upperTrigram: 'li', lowerTrigram: 'qian',
      judgment: '元亨。',
      image: '火在天上，大有。君子以遏恶扬善，顺天休命。',
      description: '大有卦象征丰收与富足。上离为火为日，下乾为天，日在天上，光照万物，丰盛之象。得此卦者，事业丰收，财富充裕，处于鼎盛时期。然而富足之际更当遏恶扬善，以德配位，方得长久。',
      themes: ['abundance','wealth','prosperity','success','harvest','gratitude','generosity'],
      lines: [
        { text: '初九：无交害，匪咎，艰则无咎。', meaning: '不互相伤害则无咎，艰难中保持谨慎可免过失。' },
        { text: '九二：大车以载，有攸往，无咎。', meaning: '如大车载物，承载丰厚，前行无忧。' },
        { text: '九三：公用亨于天子，小人弗克。', meaning: '君子可享尊荣，小人则无力承受。' },
        { text: '九四：匪其彭，无咎。', meaning: '不炫耀张扬，可免过失。' },
        { text: '六五：厥孚交如，威如，吉。', meaning: '以诚信交往，保持威严，吉祥。' },
        { text: '上九：自天佑之，吉无不利。', meaning: '上天庇佑，吉祥无所不利。' }
      ]
    },
    { // 15
      number: 15, name: '谦', pinyin: 'Qiān', english: 'Modesty',
      upperTrigram: 'kun', lowerTrigram: 'gen',
      judgment: '亨，君子有终。',
      image: '地中有山，谦。君子以裒多益寡，称物平施。',
      description: '谦卦象征谦虚与谦让。上坤为地，下艮为山，山在地下，高而不显，谦逊之象。得此卦者，当以谦逊态度处世，虽有大才而不自傲。谦虚使人受益，骄傲使人受损。此卦六爻皆吉，可见谦德之可贵。',
      themes: ['humility','modesty','restraint','understatement','balance','fairness'],
      lines: [
        { text: '初六：谦谦君子，用涉大川，吉。', meaning: '极其谦逊的君子，可涉大川，吉祥。' },
        { text: '六二：鸣谦，贞吉。', meaning: '谦逊之名远播，坚守正道则吉。' },
        { text: '九三：劳谦君子，有终吉。', meaning: '有功劳而仍谦虚的君子，终得吉祥。' },
        { text: '六四：无不利，撝谦。', meaning: '发扬谦虚美德，无所不利。' },
        { text: '六五：不富以其邻，利用侵伐，无不利。', meaning: '不以财富自傲，谦逊待人，无所不利。' },
        { text: '上六：鸣谦，利用行师，征邑国。', meaning: '谦逊之名远扬，行动亦能成功。' }
      ]
    },
    { // 16
      number: 16, name: '豫', pinyin: 'Yù', english: 'Enthusiasm',
      upperTrigram: 'zhen', lowerTrigram: 'kun',
      judgment: '利建侯行师。',
      image: '雷出地奋，豫。先王以作乐崇德，殷荐之上帝，以配祖考。',
      description: '豫卦象征喜悦与豫备。上震为雷，下坤为地，雷出地上，万物振奋。得此卦者，心情愉悦，士气高昂，利于行动。然而乐极生悲，喜悦之中当知节制，提前准备方能长久。',
      themes: ['enthusiasm','joy','preparation','music','motivation','celebration'],
      lines: [
        { text: '初六：鸣豫，凶。', meaning: '过早宣扬喜悦，得意忘形则凶。' },
        { text: '六二：介于石，不终日，贞吉。', meaning: '坚如磐石，但不固执到底，灵活则吉。' },
        { text: '六三：盱豫，悔。迟有悔。', meaning: '迟疑观望而错过时机，迟则有悔。' },
        { text: '九四：由豫，大有得。勿疑，朋盍簪。', meaning: '因喜悦而行动，大有所获。不疑，朋友自会聚集。' },
        { text: '六五：贞疾，恒不死。', meaning: '虽有疾患但坚守正道，则长久不灭。' },
        { text: '上六：冥豫，成有渝，无咎。', meaning: '在昏暗中寻乐，事情有变化也无可厚非。' }
      ]
    },
    { // 17
      number: 17, name: '随', pinyin: 'Suí', english: 'Following',
      upperTrigram: 'dui', lowerTrigram: 'zhen',
      judgment: '元亨利贞，无咎。',
      image: '泽中有雷，随。君子以向晦入宴息。',
      description: '随卦象征随从与顺应。上兑为泽，下震为雷，雷入泽中，随势而动。得此卦者，当顺势而为，灵活应变，不宜固执己见。选择正确的方向去随从，则大吉大利。同时也要懂得何时该休养生息。',
      themes: ['following','adaptability','flexibility','compliance','timing','rest'],
      lines: [
        { text: '初九：官有渝，贞吉。出门交有功。', meaning: '角色可变，坚守正道则吉。出门交往有收获。' },
        { text: '六二：系小子，失丈夫。', meaning: '依附小人则失去君子，取舍之道。' },
        { text: '六三：系丈夫，失小子。随有求得，利居贞。', meaning: '依附贤人，随从而有所得，宜安守正道。' },
        { text: '九四：随有获，贞凶。有孚在道，以明，何咎？', meaning: '随从而获，若动机不纯则凶。诚信在道则无咎。' },
        { text: '九五：孚于嘉，吉。', meaning: '诚信于善道，吉祥。' },
        { text: '上六：拘系之，乃从维之。王用亨于西山。', meaning: '紧密追随，如被束缚般坚定。王者以此心祭祀。' }
      ]
    },
    { // 18
      number: 18, name: '蛊', pinyin: 'Gǔ', english: 'Work on What Has Been Spoiled (Decay)',
      upperTrigram: 'gen', lowerTrigram: 'xun',
      judgment: '元亨，利涉大川。先甲三日，后甲三日。',
      image: '山下有风，蛊。君子以振民育德。',
      description: '蛊卦象征腐败与整治。上艮为山，下巽为风，山风受阻，万物腐败。得此卦者，宜正视积弊与问题，勇于革新、拨乱反正。亡羊补牢，尤为未晚。整顿旧事，开创未来，先难后易。',
      themes: ['corruption','reform','cleanup','renewal','correction','decay','restoration'],
      lines: [
        { text: '初六：干父之蛊，有子，考无咎。厉终吉。', meaning: '整治前人遗留问题，有承担者则无咎。' },
        { text: '九二：干母之蛊，不可贞。', meaning: '处理更柔性的旧弊，不宜过于刚直。' },
        { text: '九三：干父之蛊，小有悔，无大咎。', meaning: '整治旧弊有小遗憾，但无大过失。' },
        { text: '六四：裕父之蛊，往见吝。', meaning: '对旧弊宽容迁就，继续下去必有遗憾。' },
        { text: '六五：干父之蛊，用誉。', meaning: '整治旧弊，获得赞誉。' },
        { text: '上九：不事王侯，高尚其事。', meaning: '不事权贵而专心治事，志向高尚。' }
      ]
    },
    { // 19
      number: 19, name: '临', pinyin: 'Lín', english: 'Approach',
      upperTrigram: 'kun', lowerTrigram: 'dui',
      judgment: '元亨利贞。至于八月有凶。',
      image: '泽上有地，临。君子以教思无穷，容保民无疆。',
      description: '临卦象征临近与监督指导。上坤为地，下兑为泽，大地临于泽上，居高临下。得此卦者，事物正向好的方向发展，贵人将至，事业临近成功。然而盛极而衰，当思八月之戒，凡事不可过度。',
      themes: ['approach','supervision','guidance','arrival','nearness','leadership','teaching'],
      lines: [
        { text: '初九：咸临，贞吉。', meaning: '以感化之心临之，坚守正道则吉。' },
        { text: '九二：咸临，吉无不利。', meaning: '以感召力临事，吉祥无所不利。' },
        { text: '六三：甘临，无攸利。既忧之，无咎。', meaning: '以甜言蜜语临事无益，知忧虑则可免咎。' },
        { text: '六四：至临，无咎。', meaning: '亲临现场，没有过失。' },
        { text: '六五：知临，大君之宜，吉。', meaning: '以智慧临事，是大人物应有的态度，吉祥。' },
        { text: '上六：敦临，吉无咎。', meaning: '以敦厚之心临事，吉祥无咎。' }
      ]
    },
    { // 20
      number: 20, name: '观', pinyin: 'Guān', english: 'Contemplation (View)',
      upperTrigram: 'xun', lowerTrigram: 'kun',
      judgment: '盥而不荐，有孚颙若。',
      image: '风行地上，观。先王以省方，观民设教。',
      description: '观卦象征观察与省视。上巽为风，下坤为地，风行地上，无所不观。得此卦者，宜静观其变，深入思考。从不同的角度审视问题，方能看到事物的全貌。作为领导者，更应以身作则，为众人所观仰。',
      themes: ['observation','contemplation','reflection','perspective','insight','awareness'],
      lines: [
        { text: '初六：童观，小人无咎，君子吝。', meaning: '幼稚的观察方式，对常人无碍，对君子则不足。' },
        { text: '六二：窥观，利女贞。', meaning: '从缝隙中窥视，只适合有限的情况。' },
        { text: '六三：观我生，进退。', meaning: '审视自身状态，决定进退。' },
        { text: '六四：观国之光，利用宾于王。', meaning: '观察更大的格局，有利于辅佐王者。' },
        { text: '九五：观我生，君子无咎。', meaning: '审视自身，君子无有过失。' },
        { text: '上九：观其生，君子无咎。', meaning: '观察众生万物，君子无所过失。' }
      ]
    },
    { // 21
      number: 21, name: '噬嗑', pinyin: 'Shì Kè', english: 'Biting Through',
      upperTrigram: 'li', lowerTrigram: 'zhen',
      judgment: '亨，利用狱。',
      image: '雷电，噬嗑。先王以明罚敕法。',
      description: '噬嗑卦象征刑罚与决断。上离为火为电，下震为雷，雷电交加，惩戒之象。得此卦者，面临需要果断处理的问题，如口中咬到硬物，须用力咬碎才能咽下。宜以公正之心明辨是非，果断行动。',
      themes: ['decisiveness','judgment','justice','resolution','breaking-through','enforcement'],
      lines: [
        { text: '初九：屦校灭趾，无咎。', meaning: '脚戴刑具伤及脚趾，小惩罚以防大过失。' },
        { text: '六二：噬肤灭鼻，无咎。', meaning: '处理问题如咬到柔软物，较易解决。' },
        { text: '六三：噬腊肉，遇毒。小吝，无咎。', meaning: '处理顽固问题如咬腊肉，可能遇阻力，但无大碍。' },
        { text: '九四：噬干胏，得金矢。利艰贞，吉。', meaning: '处理更难的问题如咬带骨之肉，需坚忍，但终有所获。' },
        { text: '六五：噬干肉，得黄金。贞厉，无咎。', meaning: '处理难题获得宝贵经验，坚守警惕可免过失。' },
        { text: '上九：何校灭耳，凶。', meaning: '肩上刑具伤及耳朵，惩罚过重则凶。' }
      ]
    },
    { // 22
      number: 22, name: '贲', pinyin: 'Bì', english: 'Grace',
      upperTrigram: 'gen', lowerTrigram: 'li',
      judgment: '亨。小利有攸往。',
      image: '山下有火，贲。君子以明庶政，无敢折狱。',
      description: '贲卦象征文饰与美化。上艮为山，下离为火，火光照耀山体，华美之象。得此卦者，宜注重外在形式与形象，但不可舍本逐末。形式服务于内容，过分的装饰反而掩盖本质。小事情可以讲究形式，大事情则需回归本真。',
      themes: ['beauty','aesthetics','form','adornment','style','appearance','culture'],
      lines: [
        { text: '初九：贲其趾，舍车而徒。', meaning: '从基础开始美化，宁步行不乘车。' },
        { text: '六二：贲其须。', meaning: '装饰细节部分。' },
        { text: '九三：贲如濡如，永贞吉。', meaning: '华丽温润，永远坚守正道则吉。' },
        { text: '六四：贲如皤如，白马翰如，匪寇婚媾。', meaning: '朴素无华，如白马奔驰，来者非寇而是良缘。' },
        { text: '六五：贲于丘园，束帛戋戋，吝，终吉。', meaning: '虽礼物微薄，朴实无华，最终吉祥。' },
        { text: '上九：白贲，无咎。', meaning: '返璞归真，素白为最美，无有过失。' }
      ]
    },
    { // 23
      number: 23, name: '剥', pinyin: 'Bō', english: 'Splitting Apart',
      upperTrigram: 'gen', lowerTrigram: 'kun',
      judgment: '不利有攸往。',
      image: '山附于地，剥。上以厚下安宅。',
      description: '剥卦象征剥落与衰败。上艮为山，下坤为地，山体剥落于地，衰败之象。得此卦者，正面临衰退或失去的境况。此时不宜妄动，当稳固根基、厚待下属，等待衰败周期的结束。阴阳消长乃自然规律，衰败之后必是新生。',
      themes: ['decline','loss','deterioration','collapse','instability','foundation'],
      lines: [
        { text: '初六：剥床以足，蔑贞凶。', meaning: '床脚被剥蚀，根基开始动摇，轻视正道则凶。' },
        { text: '六二：剥床以辨，蔑贞凶。', meaning: '剥蚀达到床面，进一步恶化。' },
        { text: '六三：剥之，无咎。', meaning: '历经剥蚀之难，反而无咎。' },
        { text: '六四：剥床以肤，凶。', meaning: '剥蚀已达肌肤，凶险已至。' },
        { text: '六五：贯鱼，以宫人宠，无不利。', meaning: '如穿鱼般有序排列，以柔和方式应对，无所不利。' },
        { text: '上九：硕果不食，君子得舆，小人剥庐。', meaning: '大果实无人食用，君子得车，小人损屋。' }
      ]
    },
    { // 24
      number: 24, name: '复', pinyin: 'Fù', english: 'Return (The Turning Point)',
      upperTrigram: 'kun', lowerTrigram: 'zhen',
      judgment: '亨。出入无疾，朋来无咎。反复其道，七日来复，利有攸往。',
      image: '雷在地中，复。先王以至日闭关，商旅不行，后不省方。',
      description: '复卦象征回复与重生。上坤为地，下震为雷，雷在地中，阳气初复。得此卦者，时运将转，冬去春来。经历低谷之后，事物开始向好。一阳来复，万象更新。宜把握转机，但也不可操之过急，循序渐进方得始终。',
      themes: ['return','renewal','rebirth','recovery','turning-point','cycle','restoration'],
      lines: [
        { text: '初九：不远复，无祗悔，元吉。', meaning: '偏离不远即回归，没有大的悔恨，大吉。' },
        { text: '六二：休复，吉。', meaning: '美好的回归，吉祥。' },
        { text: '六三：频复，厉无咎。', meaning: '多次反复，虽有艰险但无咎。' },
        { text: '六四：中行独复。', meaning: '在众人之中独自行于回归之路。' },
        { text: '六五：敦复，无悔。', meaning: '敦厚地回归，没有悔恨。' },
        { text: '上六：迷复，凶，有灾眚。用行师，终有大败。', meaning: '迷途而不知返，凶险有灾。此时行动必败。' }
      ]
    },
    { // 25
      number: 25, name: '无妄', pinyin: 'Wú Wàng', english: 'Innocence (The Unexpected)',
      upperTrigram: 'qian', lowerTrigram: 'zhen',
      judgment: '元亨利贞。其匪正有眚，不利有攸往。',
      image: '天下雷行，物与无妄。先王以茂对时，育万物。',
      description: '无妄卦象征真诚无妄与意外。上乾为天，下震为雷，天下雷行，自然无妄。得此卦者，当保持真诚，不存妄念。同时需警惕意外之事的发生。守正不偏，则无所不利；若动机不纯，则易招灾祸。',
      themes: ['innocence','authenticity','unexpected','sincerity','purity','naturalness'],
      lines: [
        { text: '初九：无妄，往吉。', meaning: '无妄念地前行，吉祥。' },
        { text: '六二：不耕获，不菑畬，则利有攸往。', meaning: '不妄求不劳而获，则前进有利。' },
        { text: '六三：无妄之灾，或系之牛，行人之得，邑人之灾。', meaning: '无妄之灾，意外得失不由人。' },
        { text: '九四：可贞，无咎。', meaning: '可坚守正道，无有过失。' },
        { text: '九五：无妄之疾，勿药有喜。', meaning: '无端的疾患，不药而愈，自得喜悦。' },
        { text: '上九：无妄，行有眚，无攸利。', meaning: '无妄念但时机不对，行动有害无益。' }
      ]
    },
    { // 26
      number: 26, name: '大畜', pinyin: 'Dà Chù', english: 'The Taming Power of the Great',
      upperTrigram: 'gen', lowerTrigram: 'qian',
      judgment: '利贞。不家食吉，利涉大川。',
      image: '天在山中，大畜。君子以多识前言往行，以畜其德。',
      description: '大畜卦象征大的积蓄与储备。上艮为山，下乾为天，天藏于山之中，蓄势待发。得此卦者，正处于积蓄力量的阶段。宜博学多闻，涵养德行，积累资源和能量。时机未到之前，潜心修习，待时而动则一鸣惊人。',
      themes: ['accumulation','reserve','learning','preparation','potential','restraint'],
      lines: [
        { text: '初九：有厉，利已。', meaning: '有危险时，宜暂时停止。' },
        { text: '九二：舆说輹。', meaning: '车轮脱落，暂时不能前行。' },
        { text: '九三：良马逐，利艰贞。曰闲舆卫，利有攸往。', meaning: '良马奔驰，宜艰难坚守。先练好车技再前进。' },
        { text: '六四：童牛之牿，元吉。', meaning: '如小牛角上加木，防患于未然，大吉。' },
        { text: '六五：豮豕之牙，吉。', meaning: '去势之猪的尖牙，威胁已消，吉祥。' },
        { text: '上九：何天之衢，亨。', meaning: '走上通天大道，万事亨通。' }
      ]
    },
    { // 27
      number: 27, name: '颐', pinyin: 'Yí', english: 'The Corners of the Mouth (Providing Nourishment)',
      upperTrigram: 'gen', lowerTrigram: 'zhen',
      judgment: '贞吉。观颐，自求口实。',
      image: '山下有雷，颐。君子以慎言语，节饮食。',
      description: '颐卦象征颐养与滋养。上艮为山，下震为雷，山下有雷，如口之咀嚼。得此卦者，当关注养生、修养与经济自足。君子以慎言语、节饮食为要。同时也需审视自己如何获取滋养，是否正当合理。',
      themes: ['nourishment','sustenance','health','moderation','self-reliance','provision'],
      lines: [
        { text: '初九：舍尔灵龟，观我朵颐，凶。', meaning: '放弃自己的灵龟，羡慕他人的食物则凶。' },
        { text: '六二：颠颐，拂经于丘颐，征凶。', meaning: '违背常理寻求滋养，前行则凶。' },
        { text: '六三：拂颐，贞凶。十年勿用，无攸利。', meaning: '违背养生之道，坚守不变则凶，长时间无所作为。' },
        { text: '六四：颠颐，吉。虎视眈眈，其欲逐逐，无咎。', meaning: '从高处获取滋养，如虎般专注，无咎。' },
        { text: '六五：拂经，居贞吉。不可涉大川。', meaning: '虽违常理但守正则吉。不可冒大险。' },
        { text: '上九：由颐，厉吉，利涉大川。', meaning: '由此获得滋养，虽历艰险而吉祥，可涉大川。' }
      ]
    },
    { // 28
      number: 28, name: '大过', pinyin: 'Dà Guò', english: 'Preponderance of the Great',
      upperTrigram: 'dui', lowerTrigram: 'xun',
      judgment: '栋桡，利有攸往，亨。',
      image: '泽灭木，大过。君子以独立不惧，遁世无闷。',
      description: '大过卦象征过度与非常之时。上兑为泽，下巽为木，泽水淹没树木，大过之象。得此卦者，面临超出常态的局面，需要非常手段。如栋梁弯曲，虽处险境，独立不惧、从容应对者可以化险为夷。',
      themes: ['excess','extreme','crisis','independence','unconventional','overwhelming'],
      lines: [
        { text: '初六：藉用白茅，无咎。', meaning: '用洁白的茅草铺垫，谨慎行事则无咎。' },
        { text: '九二：枯杨生稊，老夫得其女妻，无不利。', meaning: '枯杨生新芽，非常之时有非常之喜。' },
        { text: '九三：栋桡，凶。', meaning: '栋梁弯曲，承受不住则凶。' },
        { text: '九四：栋隆，吉。有它吝。', meaning: '栋梁隆起恢复，吉祥，但其他方面仍有小遗憾。' },
        { text: '九五：枯杨生华，老妇得其士夫，无咎无誉。', meaning: '枯杨开花，非常之合，无害亦无誉。' },
        { text: '上六：过涉灭顶，凶，无咎。', meaning: '涉水过深淹没头顶，虽凶而无咎（因已尽全力）。' }
      ]
    },
    { // 29
      number: 29, name: '坎', pinyin: 'Kǎn', english: 'The Abysmal (Water)',
      upperTrigram: 'kan', lowerTrigram: 'kan',
      judgment: '习坎，有孚，维心亨，行有尚。',
      image: '水洊至，习坎。君子以常德行，习教事。',
      description: '坎卦象征险阻与深渊。上下皆坎为水，水势重重，危险重重。得此卦者，正面临困难与危险，如陷深渊。然而危险之中蕴含机会。以诚信之心面对，保持内心通达，行为端正，则可以化险为夷，获得尊重。',
      themes: ['danger','adversity','depth','water','crisis','perseverance','inner-strength'],
      lines: [
        { text: '初六：习坎，入于坎窞，凶。', meaning: '陷入重险之中，越陷越深则凶。' },
        { text: '九二：坎有险，求小得。', meaning: '危险中有小收获。' },
        { text: '六三：来之坎坎，险且枕，入于坎窞，勿用。', meaning: '前后来路皆险，暂停勿动。' },
        { text: '六四：樽酒簋贰，用缶，纳约自牖，终无咎。', meaning: '以简朴的方式应对，虽有约束，终无咎。' },
        { text: '九五：坎不盈，祗既平，无咎。', meaning: '险坑未满，水平如初，无咎。' },
        { text: '上六：系用徽纆，寘于丛棘，三岁不得，凶。', meaning: '被绳索捆缚于荆棘中，三年不得解脱，凶险。' }
      ]
    },
    { // 30
      number: 30, name: '离', pinyin: 'Lí', english: 'The Clinging (Fire)',
      upperTrigram: 'li', lowerTrigram: 'li',
      judgment: '利贞，亨。畜牝牛，吉。',
      image: '明两作，离。大人以继明照于四方。',
      description: '离卦象征光明与依附。上下皆离为火，光明相续，照耀四方。得此卦者，宜依附正道，借光明之力前行。如火焰依附燃料而燃烧，人也需找到可供依托的事业或人群。柔顺中正则无所不利。',
      themes: ['light','clarity','attachment','fire','illumination','dependence','beauty'],
      lines: [
        { text: '初九：履错然，敬之无咎。', meaning: '步履交错，保持敬畏则无咎。' },
        { text: '六二：黄离，元吉。', meaning: '黄色的光明，中和之美，大吉。' },
        { text: '九三：日昃之离，不鼓缶而歌，则大耋之嗟，凶。', meaning: '日落西山，若不及时行乐，则年老徒叹。' },
        { text: '九四：突如其来如，焚如，死如，弃如。', meaning: '突然而来，如火燃烧，速来速去。' },
        { text: '六五：出涕沱若，戚嗟若，吉。', meaning: '泪流满面、忧伤叹息，最终吉祥。' },
        { text: '上九：王用出征，有嘉折首，获匪其丑，无咎。', meaning: '王者出征，斩获有嘉，清除祸害，无咎。' }
      ]
    },
    { // 31
      number: 31, name: '咸', pinyin: 'Xián', english: 'Influence (Wooing)',
      upperTrigram: 'dui', lowerTrigram: 'gen',
      judgment: '亨，利贞。取女吉。',
      image: '山上有泽，咸。君子以虚受人。',
      description: '咸卦象征感应与影响。上兑为泽，下艮为山，山上有泽，泽水浸润山体，相互感应。得此卦者，宜以虚怀若谷之心接纳他人，以真诚之情感化对方。男女感应、人际交往，皆需发自内心的真诚。',
      themes: ['influence','attraction','connection','sensing','romance','mutuality','openness'],
      lines: [
        { text: '初六：咸其拇。', meaning: '感应从脚趾开始，感情初萌。' },
        { text: '六二：咸其腓，凶。居吉。', meaning: '感应到小腿，躁进则凶，安住则吉。' },
        { text: '九三：咸其股，执其随，往吝。', meaning: '感应到大腿，盲目追随则遗憾。' },
        { text: '九四：贞吉悔亡。憧憧往来，朋从尔思。', meaning: '坚守正道，悔恨消散。思想交流，朋友追随。' },
        { text: '九五：咸其脢，无悔。', meaning: '感应到背部，心神相通，无有悔恨。' },
        { text: '上六：咸其辅颊舌。', meaning: '感应到面颊舌，言语沟通，感情交流。' }
      ]
    },
    { // 32
      number: 32, name: '恒', pinyin: 'Héng', english: 'Duration',
      upperTrigram: 'zhen', lowerTrigram: 'xun',
      judgment: '亨，无咎，利贞。利有攸往。',
      image: '雷风，恒。君子以立不易方。',
      description: '恒卦象征恒久与持久。上震为雷，下巽为风，雷风相伴，恒久之道。得此卦者，贵在坚持。万事之道，贵乎恒久，不因一时得失而改变方向。婚姻、事业、学习皆需持之以恒。但也要注意，恒久不等于僵化不变。',
      themes: ['perseverance','endurance','consistency','longevity','commitment','stability','marriage'],
      lines: [
        { text: '初六：浚恒，贞凶，无攸利。', meaning: '过于深入追求恒久，反而凶险无益。' },
        { text: '九二：悔亡。', meaning: '悔恨消散。' },
        { text: '九三：不恒其德，或承之羞，贞吝。', meaning: '德行不恒，或受羞辱，虽守正亦有遗憾。' },
        { text: '九四：田无禽。', meaning: '狩猎无获，努力未必即时见效。' },
        { text: '六五：恒其德，贞。妇人吉，夫子凶。', meaning: '恒守其德，柔者吉，刚者不宜。' },
        { text: '上六：振恒，凶。', meaning: '动荡不安却勉强持久，凶险。' }
      ]
    },
    { // 33
      number: 33, name: '遁', pinyin: 'Dùn', english: 'Retreat',
      upperTrigram: 'qian', lowerTrigram: 'gen',
      judgment: '亨。小利贞。',
      image: '天下有山，遁。君子以远小人，不恶而严。',
      description: '遁卦象征退避与隐退。上乾为天，下艮为山，山在天下，退隐之象。得此卦者，时势不利，小人势盛，宜暂避锋芒。退不是逃跑，而是战略性的保存实力。以尊严的方式退出，不与小人纠缠，以待来日。',
      themes: ['retreat','withdrawal','avoidance','prudence','timing','self-preservation'],
      lines: [
        { text: '初六：遁尾，厉。勿用有攸往。', meaning: '退避在最后面，有危险。不宜冒进。' },
        { text: '六二：执之用黄牛之革，莫之胜说。', meaning: '如黄牛皮绳般牢牢捆住，坚定不移。' },
        { text: '九三：系遁，有疾厉。畜臣妾吉。', meaning: '被牵绊而难退，有危险。处理小事尚可。' },
        { text: '九四：好遁，君子吉，小人否。', meaning: '愉快地退避，君子吉祥，小人则不然。' },
        { text: '九五：嘉遁，贞吉。', meaning: '美好地退隐，坚守正道则吉。' },
        { text: '上九：肥遁，无不利。', meaning: '宽裕自在地退避，无所不利。' }
      ]
    },
    { // 34
      number: 34, name: '大壮', pinyin: 'Dà Zhuàng', english: 'The Power of the Great',
      upperTrigram: 'zhen', lowerTrigram: 'qian',
      judgment: '利贞。',
      image: '雷在天上，大壮。君子以非礼勿履。',
      description: '大壮卦象征强壮与力量。上震为雷，下乾为天，雷在天上，声势浩大。得此卦者，力量强盛，势头正猛。然而力量越大，越须以礼自持。非礼勿动、非礼勿行，否则强而易折。真正的强大在于自我约束。',
      themes: ['strength','power','vigor','assertiveness','self-discipline','restraint'],
      lines: [
        { text: '初九：壮于趾，征凶。有孚。', meaning: '力量只在脚趾，轻举妄动则凶。' },
        { text: '九二：贞吉。', meaning: '坚守正道则吉。' },
        { text: '九三：小人用壮，君子用罔。贞厉。羝羊触藩，羸其角。', meaning: '小人滥用力量，君子慎用。如公羊触篱笆卡住角。' },
        { text: '九四：贞吉悔亡。藩决不羸，壮于大舆之輹。', meaning: '突破阻碍，力量如大车之辐般坚固。' },
        { text: '六五：丧羊于易，无悔。', meaning: '在边界失去羊群，不以为悔。' },
        { text: '上六：羝羊触藩，不能退，不能遂，无攸利。艰则吉。', meaning: '进退两难之时，唯有艰难坚守方得吉祥。' }
      ]
    },
    { // 35
      number: 35, name: '晋', pinyin: 'Jìn', english: 'Progress',
      upperTrigram: 'li', lowerTrigram: 'kun',
      judgment: '康侯用锡马蕃庶，昼日三接。',
      image: '明出地上，晋。君子以自昭明德。',
      description: '晋卦象征前进与晋升。上离为火为日，下坤为地，太阳升出地面，蒸蒸日上。得此卦者，事业正在向上发展，如旭日东升。宜自我彰显，以明德照耀四方。但上升之中也要保持谦逊，方能持续进步。',
      themes: ['progress','advancement','promotion','growth','rising','career','development'],
      lines: [
        { text: '初六：晋如摧如，贞吉。罔孚，裕无咎。', meaning: '前进受阻时守正则吉。未得信任时放宽心态。' },
        { text: '六二：晋如愁如，贞吉。受兹介福，于其王母。', meaning: '前进中带忧虑，守正则吉。从长辈处获得大福。' },
        { text: '六三：众允，悔亡。', meaning: '获得众人认可，悔恨消散。' },
        { text: '九四：晋如鼫鼠，贞厉。', meaning: '前进如大老鼠般贪婪，虽守正亦有危险。' },
        { text: '六五：悔亡，失得勿恤。往吉，无不利。', meaning: '悔恨消散，不计得失。前进则吉，无不利。' },
        { text: '上九：晋其角，维用伐邑。厉吉无咎，贞吝。', meaning: '前进如牛角顶撞，宜征伐不服。有惊无险。' }
      ]
    },
    { // 36
      number: 36, name: '明夷', pinyin: 'Míng Yí', english: 'Darkening of the Light',
      upperTrigram: 'kun', lowerTrigram: 'li',
      judgment: '利艰贞。',
      image: '明入地中，明夷。君子以莅众，用晦而明。',
      description: '明夷卦象征光明受伤与晦暗。上坤为地，下离为火为日，太阳入于地中，光明被遮蔽。得此卦者，正处艰难时刻，才华被埋没，光明被遮掩。此时宜韬光养晦，以晦为明，在逆境中保持内在光明，等待重见天日。',
      themes: ['darkness','adversity','concealment','hardship','patience','inner-light'],
      lines: [
        { text: '初九：明夷于飞，垂其翼。君子于行，三日不食。有攸往，主人有言。', meaning: '受伤之鸟垂翼而飞，君子行路三日不食，前行遇阻。' },
        { text: '六二：明夷，夷于左股，用拯马壮，吉。', meaning: '左腿受伤，借壮马之力可得救，吉祥。' },
        { text: '九三：明夷于南狩，得其大首。不可疾贞。', meaning: '在南方猎获大首，但不可操之过急。' },
        { text: '六四：入于左腹，获明夷之心，于出门庭。', meaning: '深入内部，了解黑暗之心，然后离开。' },
        { text: '六五：箕子之明夷，利贞。', meaning: '如箕子般在黑暗中保持光明，宜坚守正道。' },
        { text: '上六：不明晦，初登于天，后入于地。', meaning: '光明尽失，起初登天，后来入地，盛衰无常。' }
      ]
    },
    { // 37
      number: 37, name: '家人', pinyin: 'Jiā Rén', english: 'The Family (The Clan)',
      upperTrigram: 'xun', lowerTrigram: 'li',
      judgment: '利女贞。',
      image: '风自火出，家人。君子以言有物，而行有恒。',
      description: '家人卦象征家庭与内部关系。上巽为风，下离为火，风从火出，如家道自内而外。得此卦者，宜关注家庭、内部团队或亲密关系的事务。家道正，则天下定。各司其职、各尽其责，家庭和睦则万事兴旺。',
      themes: ['family','home','relationships','internal','domestic','harmony','roles'],
      lines: [
        { text: '初九：闲有家，悔亡。', meaning: '管好家庭内部，悔恨消散。' },
        { text: '六二：无攸遂，在中馈，贞吉。', meaning: '不外出追逐，在内持家，守正则吉。' },
        { text: '九三：家人嗃嗃，悔厉吉。妇子嘻嘻，终吝。', meaning: '家人严厉则虽悔而吉，过于嬉笑则终有憾。' },
        { text: '六四：富家，大吉。', meaning: '使家庭富足，大吉大利。' },
        { text: '九五：王假有家，勿恤，吉。', meaning: '王者关注家族，不用忧虑，吉祥。' },
        { text: '上九：有孚威如，终吉。', meaning: '有诚信而威严，终获吉祥。' }
      ]
    },
    { // 38
      number: 38, name: '睽', pinyin: 'Kuí', english: 'Opposition',
      upperTrigram: 'li', lowerTrigram: 'dui',
      judgment: '小事吉。',
      image: '上火下泽，睽。君子以同而异。',
      description: '睽卦象征乖离与对立。上离为火，下兑为泽，火在上泽在下，相互背离。得此卦者，正处于分歧或对立之中。大事不利，小事尚可。君子求同存异，在差异中寻找共同点。过分的分歧会导致分裂，适当的差异反而能促进发展。',
      themes: ['opposition','disagreement','difference','estrangement','diversity','compromise'],
      lines: [
        { text: '初九：悔亡。丧马勿逐，自复。见恶人，无咎。', meaning: '悔恨消散。失去的马不追自回。见不善之人也可坦然面对。' },
        { text: '九二：遇主于巷，无咎。', meaning: '在小巷中遇见主人，出乎意料，无咎。' },
        { text: '六三：见舆曳，其牛掣，其人天且劓，无初有终。', meaning: '车被拖住、牛被牵制，开始不顺但终有结果。' },
        { text: '九四：睽孤。遇元夫，交孚，厉无咎。', meaning: '孤独中遇见好人，以诚信相交，虽险无咎。' },
        { text: '六五：悔亡。厥宗噬肤，往何咎？', meaning: '悔恨消散。同宗之人相助，前行何咎？' },
        { text: '上九：睽孤。见豕负涂，载鬼一车。先张之弧，后说之弧。匪寇婚媾。往遇雨则吉。', meaning: '猜疑最甚之时，终于看清真相，化敌为友。' }
      ]
    },
    { // 39
      number: 39, name: '蹇', pinyin: 'Jiǎn', english: 'Obstruction',
      upperTrigram: 'kan', lowerTrigram: 'gen',
      judgment: '利西南，不利东北。利见大人，贞吉。',
      image: '山上有水，蹇。君子以反身修德。',
      description: '蹇卦象征艰难与障碍。上坎为水，下艮为山，山上有水，举步维艰。得此卦者，前行遇到重重阻碍。此时不宜强行，应选择有利的方向，反身修德，寻求贤人帮助。障碍不是终点，而是转弯的契机。',
      themes: ['obstruction','difficulty','hardship','self-reflection','seeking-help','adaptation'],
      lines: [
        { text: '初六：往蹇，来誉。', meaning: '前往则遇阻，归来则获赞誉。' },
        { text: '六二：王臣蹇蹇，匪躬之故。', meaning: '王之臣仆屡遭困难，并非自身原因。' },
        { text: '九三：往蹇，来反。', meaning: '前往遇阻则返回。' },
        { text: '六四：往蹇，来连。', meaning: '前往遇阻，回来则连得好处。' },
        { text: '九五：大蹇，朋来。', meaning: '遇到大困难时，朋友自会来助。' },
        { text: '上六：往蹇，来硕，吉。利见大人。', meaning: '前遇大阻，回来有大收获。利于拜见贵人。' }
      ]
    },
    { // 40
      number: 40, name: '解', pinyin: 'Xiè', english: 'Deliverance',
      upperTrigram: 'zhen', lowerTrigram: 'kan',
      judgment: '利西南。无所往，其来复吉。有攸往，夙吉。',
      image: '雷雨作，解。君子以赦过宥罪。',
      description: '解卦象征解脱与化解。上震为雷，下坎为雨，雷雨交作，万物得以解脱。得此卦者，困难即将化解，束缚即将解除。宜以宽容之心对待他人之过。事情解决后，宜回归平静，不宜再掀波澜。',
      themes: ['relief','resolution','liberation','release','forgiveness','solution','freedom'],
      lines: [
        { text: '初六：无咎。', meaning: '没有过失。' },
        { text: '九二：田获三狐，得黄矢，贞吉。', meaning: '狩猎获三狐，得黄金之箭，守正则吉。' },
        { text: '六三：负且乘，致寇至。贞吝。', meaning: '背着东西又坐在车上，招致盗贼。守正亦有憾。' },
        { text: '九四：解而拇，朋至斯孚。', meaning: '解开束缚，朋友到来，诚信相待。' },
        { text: '六五：君子维有解，吉。有孚于小人。', meaning: '君子得以解脱，吉祥。对小人也以诚信相待。' },
        { text: '上六：公用射隼于高墉之上，获之，无不利。', meaning: '在高墙上射中鹰隼，大有收获，无不利。' }
      ]
    },
    { // 41
      number: 41, name: '损', pinyin: 'Sǔn', english: 'Decrease',
      upperTrigram: 'gen', lowerTrigram: 'dui',
      judgment: '有孚，元吉，无咎，可贞，利有攸往。曷之用？二簋可用享。',
      image: '山下有泽，损。君子以惩忿窒欲。',
      description: '损卦象征减损与舍弃。上艮为山，下兑为泽，山下有泽，损下益上。得此卦者，需做出牺牲与减法。减少欲望、控制情绪、简化生活。适当的减损是为了更大的增益。二簋虽简，可以祭祀，真诚比丰盛更重要。',
      themes: ['decrease','sacrifice','simplification','restraint','letting-go','austerity'],
      lines: [
        { text: '初九：已事遄往，无咎。酌损之。', meaning: '事毕速往，无咎。适当减损。' },
        { text: '九二：利贞，征凶。弗损益之。', meaning: '坚守正道有利，出征则凶。不减而增。' },
        { text: '六三：三人行，则损一人。一人行，则得其友。', meaning: '三人行则少一人，一人行则得一友。' },
        { text: '六四：损其疾，使遄有喜，无咎。', meaning: '减去缺点，迅速有喜，无咎。' },
        { text: '六五：或益之十朋之龟，弗克违，元吉。', meaning: '有人赠送价值十朋的大龟，不必拒绝，大吉。' },
        { text: '上九：弗损益之，无咎。贞吉。利有攸往，得臣无家。', meaning: '不减反增，无咎。守正则吉。前进可得无家室牵绊之臣。' }
      ]
    },
    { // 42
      number: 42, name: '益', pinyin: 'Yì', english: 'Increase',
      upperTrigram: 'xun', lowerTrigram: 'zhen',
      judgment: '利有攸往，利涉大川。',
      image: '风雷，益。君子以见善则迁，有过则改。',
      description: '益卦象征增益与利益。上巽为风，下震为雷，风雷相助，彼此增益。得此卦者，好运降临，利于前进。见善则从之，有过则改之，自我增益无穷。天时地利人和，是行动的大好时机。',
      themes: ['increase','gain','improvement','growth','benefit','opportunity','progress'],
      lines: [
        { text: '初九：利用为大作，元吉，无咎。', meaning: '利于有大的作为，大吉无咎。' },
        { text: '六二：或益之十朋之龟，弗克违，永贞吉。王用享于帝，吉。', meaning: '有人赠大宝，不必推辞。永远守正则吉。' },
        { text: '六三：益之用凶事，无咎。有孚中行，告公用圭。', meaning: '在困难中也能获益。诚信中道，以圭玉禀告公侯。' },
        { text: '六四：中行，告公从。利用为依迁国。', meaning: '以中道行事，公侯听从。利于辅佐迁都大事。' },
        { text: '九五：有孚惠心，勿问元吉。有孚惠我德。', meaning: '诚信惠爱之心，不问而知大吉。诚信惠我德行。' },
        { text: '上九：莫益之，或击之，立心勿恒，凶。', meaning: '无人相助，反遭攻击，心志不恒则凶。' }
      ]
    },
    { // 43
      number: 43, name: '夬', pinyin: 'Guài', english: 'Break-through (Resoluteness)',
      upperTrigram: 'dui', lowerTrigram: 'qian',
      judgment: '扬于王庭，孚号有厉。告自邑，不利即戎。利有攸往。',
      image: '泽上于天，夬。君子以施禄及下，居德则忌。',
      description: '夬卦象征决断与突破。上兑为泽，下乾为天，泽在天上，决堤之象。得此卦者，面临重大决断。宜公开公正地处理，不宜诉诸武力。果断但不莽撞，坚决但不偏激。决断之后，惠及下属，方得长久。',
      themes: ['decision','breakthrough','resolution','determination','decisive-action','justice'],
      lines: [
        { text: '初九：壮于前趾，往不胜，为咎。', meaning: '趾高气扬，前进不能取胜，反而有过失。' },
        { text: '九二：惕号，莫夜有戎，勿恤。', meaning: '警惕呼叫，夜晚有军情也不必忧虑。' },
        { text: '九三：壮于頄，有凶。君子夬夬，独行遇雨，若濡有愠，无咎。', meaning: '表现在脸上则有凶。君子独自决断而行，遇雨被淋，虽有不快但无咎。' },
        { text: '九四：臀无肤，其行次且。牵羊悔亡，闻言不信。', meaning: '臀部受伤行走困难。若能顺从则悔恨消散。' },
        { text: '九五：苋陆夬夬，中行无咎。', meaning: '如植物般柔中带刚地决断，行中道则无咎。' },
        { text: '上六：无号，终有凶。', meaning: '沉默不呼号，终有凶险。' }
      ]
    },
    { // 44
      number: 44, name: '姤', pinyin: 'Gòu', english: 'Coming to Meet',
      upperTrigram: 'qian', lowerTrigram: 'xun',
      judgment: '女壮，勿用取女。',
      image: '天下有风，姤。后以施命诰四方。',
      description: '姤卦象征邂逅与相遇。上乾为天，下巽为风，天下有风，遇合之象。得此卦者，将遇到新的关系或机遇。然而需审慎选择，并非所有的相遇都是良缘。一阴初生，不可忽视微小的征兆，它可能影响深远。',
      themes: ['encounter','meeting','opportunity','attraction','caution','new-relationship'],
      lines: [
        { text: '初六：系于金柅，贞吉。有攸往，见凶。羸豕孚蹢躅。', meaning: '绑在金属刹车器上，守正则吉。前有危险，如瘦猪徘徊。' },
        { text: '九二：包有鱼，无咎。不利宾。', meaning: '包中有鱼，无咎，但不利于宾客。' },
        { text: '九三：臀无肤，其行次且。厉，无大咎。', meaning: '臀部受伤，行走困难。有险但无大咎。' },
        { text: '九四：包无鱼，起凶。', meaning: '包中无鱼，行动则有凶。' },
        { text: '九五：以杞包瓜，含章，有陨自天。', meaning: '以杞柳包瓜，内含文采，有福自天降。' },
        { text: '上九：姤其角，吝，无咎。', meaning: '相遇如角碰角，虽有憾但无咎。' }
      ]
    },
    { // 45
      number: 45, name: '萃', pinyin: 'Cuì', english: 'Gathering Together (Massing)',
      upperTrigram: 'dui', lowerTrigram: 'kun',
      judgment: '亨。王假有庙。利见大人，亨，利贞。用大牲吉，利有攸往。',
      image: '泽上于地，萃。君子以除戎器，戒不虞。',
      description: '萃卦象征聚集与会合。上兑为泽，下坤为地，泽水汇聚于大地之上。得此卦者，众人将聚集在一起，共谋大事。然而人群聚集也需警惕意外之事的发生。做好充分准备，团结一致方能成就大业。',
      themes: ['gathering','assembly','community','unity','collective','preparation','vigilance'],
      lines: [
        { text: '初六：有孚不终，乃乱乃萃。若号，一握为笑。勿恤，往无咎。', meaning: '诚信不始终则生乱。一声呼喊，握手为笑。不必忧虑。' },
        { text: '六二：引吉，无咎。孚乃利用禴。', meaning: '被引入吉祥，无咎。诚信可用于禴祭。' },
        { text: '六三：萃如嗟如，无攸利。往无咎，小吝。', meaning: '聚集而叹息，无所利。前去无咎，小有遗憾。' },
        { text: '九四：大吉，无咎。', meaning: '大吉大利，没有过失。' },
        { text: '九五：萃有位，无咎。匪孚，元永贞，悔亡。', meaning: '聚集中有地位，无咎。若未得信任，长久守正则悔恨消散。' },
        { text: '上六：赍咨涕洟，无咎。', meaning: '叹息哭泣，但无咎。' }
      ]
    },
    { // 46
      number: 46, name: '升', pinyin: 'Shēng', english: 'Pushing Upward',
      upperTrigram: 'kun', lowerTrigram: 'xun',
      judgment: '元亨。用见大人，勿恤。南征吉。',
      image: '地中生木，升。君子以顺德，积小以高大。',
      description: '升卦象征上升与成长。上坤为地，下巽为木，树木从地中生出，不断上升。得此卦者，事业将稳步上升。积小成大，循序渐进，如树木成长不宜操之过急。保持柔顺之德，自然步步高升。',
      themes: ['ascending','growth','promotion','climbing','progress','patience','development'],
      lines: [
        { text: '初六：允升，大吉。', meaning: '确实地上进，大吉大利。' },
        { text: '九二：孚乃利用禴，无咎。', meaning: '诚信可用于禴祭，无咎。' },
        { text: '九三：升虚邑。', meaning: '进入空虚的城邑，一切皆有可能。' },
        { text: '六四：王用亨于岐山，吉无咎。', meaning: '王者登岐山祭祀，吉祥无咎。' },
        { text: '六五：贞吉，升阶。', meaning: '坚守正道则吉，步步高升。' },
        { text: '上六：冥升，利于不息之贞。', meaning: '在昏暗中仍上升，利于永不停息地坚守正道。' }
      ]
    },
    { // 47
      number: 47, name: '困', pinyin: 'Kùn', english: 'Oppression (Exhaustion)',
      upperTrigram: 'dui', lowerTrigram: 'kan',
      judgment: '亨。贞，大人吉，无咎。有言不信。',
      image: '泽无水，困。君子以致命遂志。',
      description: '困卦象征困境与困顿。上兑为泽，下坎为水，泽中无水，枯竭之象。得此卦者，正处困境，资源匮乏，说再多也难得信任。此时宜以行动代替言语，以致命遂志的决心面对困难。困境中能守正不阿的，才是真正的大人。',
      themes: ['oppression','hardship','exhaustion','adversity','perseverance','inner-strength'],
      lines: [
        { text: '初六：臀困于株木，入于幽谷，三岁不觌。', meaning: '被困于树桩之间，进入幽谷，三年不见天日。' },
        { text: '九二：困于酒食，朱绂方来。利用享祀。征凶，无咎。', meaning: '困于饮食酒宴，红袍加身。利于祭祀，出征则凶。' },
        { text: '六三：困于石，据于蒺藜。入于其宫，不见其妻，凶。', meaning: '困于石上，坐在蒺藜中。回到家里，不见妻子，凶。' },
        { text: '九四：来徐徐，困于金车，吝，有终。', meaning: '缓缓而来，困于金车之中，虽有遗憾但有好结果。' },
        { text: '九五：劓刖，困于赤绂。乃徐有说，利用祭祀。', meaning: '遭受刑罚，困于红袍之中。慢慢解脱，利于祭祀。' },
        { text: '上六：困于葛藟，于臲兀。曰动悔有悔，征吉。', meaning: '困于藤蔓之中，环境危脆。行动则有悔，但出征仍吉。' }
      ]
    },
    { // 48
      number: 48, name: '井', pinyin: 'Jǐng', english: 'The Well',
      upperTrigram: 'kan', lowerTrigram: 'xun',
      judgment: '改邑不改井，无丧无得。往来井井。汔至亦未繘井，羸其瓶，凶。',
      image: '木上有水，井。君子以劳民劝相。',
      description: '井卦象征水井与滋养之道。上坎为水，下巽为木，以木桶汲水之象。城乡可改，井不可移。得此卦者，当思考根本之道。水井滋养万物，人也应找到自己的根基所在。同时注意，若功亏一篑（打水未出井口而打破瓦罐），则凶。',
      themes: ['foundation','nourishment','roots','constancy','infrastructure','community','essentials'],
      lines: [
        { text: '初六：井泥不食，旧井无禽。', meaning: '井中有泥不能饮用，旧井连鸟都不来。' },
        { text: '九二：井谷射鲋，瓮敝漏。', meaning: '井底有鱼可射，但瓦瓮破损漏水。' },
        { text: '九三：井渫不食，为我心恻。可用汲，王明，并受其福。', meaning: '井已淘净却无人饮用，令人心恻。明王在时众人受福。' },
        { text: '六四：井甃，无咎。', meaning: '井壁修砌完好，无咎。' },
        { text: '九五：井洌，寒泉食。', meaning: '井水清冽如寒泉，可以饮用。' },
        { text: '上六：井收勿幕，有孚元吉。', meaning: '井口敞开不盖，有诚信则大吉。' }
      ]
    },
    { // 49
      number: 49, name: '革', pinyin: 'Gé', english: 'Revolution (Molting)',
      upperTrigram: 'dui', lowerTrigram: 'li',
      judgment: '己日乃孚，元亨利贞。悔亡。',
      image: '泽中有火，革。君子以治历明时。',
      description: '革卦象征变革与革新。上兑为泽，下离为火，水火相克，变革之象。得此卦者，时局将发生重大变化。变革需要天时地利人和，时机成熟方能取信于人。变革不是破坏，而是如动物蜕皮般的自然重生。',
      themes: ['revolution','change','transformation','reform','renewal','timing'],
      lines: [
        { text: '初九：巩用黄牛之革。', meaning: '用黄牛皮牢牢加固。' },
        { text: '六二：己日乃革之，征吉，无咎。', meaning: '到了合适的时机才发动变革，前行则吉。' },
        { text: '九三：征凶，贞厉。革言三就，有孚。', meaning: '前行有凶险。变革需再三讨论，取得信任。' },
        { text: '九四：悔亡，有孚改命，吉。', meaning: '悔恨消散，诚信变革天命，吉祥。' },
        { text: '九五：大人虎变，未占有孚。', meaning: '大人如虎般华丽变化，不需占卜即知有信。' },
        { text: '上六：君子豹变，小人革面。征凶，居贞吉。', meaning: '君子如豹般改变，小人只改表面。出征则凶，安居守正则吉。' }
      ]
    },
    { // 50
      number: 50, name: '鼎', pinyin: 'Dǐng', english: 'The Caldron',
      upperTrigram: 'li', lowerTrigram: 'xun',
      judgment: '元吉，亨。',
      image: '木上有火，鼎。君子以正位凝命。',
      description: '鼎卦象征鼎器与建立新秩序。上离为火，下巽为木，木上有火，烹煮食物，鼎之象。得此卦者，象征着新时代的建立。鼎是国之重器，不正则倾。君子当正其位、凝其命，以稳固的根基开创事业。',
      themes: ['establishment','foundation','order','nourishment','civilization','culture','stability'],
      lines: [
        { text: '初六：鼎颠趾，利出否。得妾以其子，无咎。', meaning: '鼎足颠倒，利于倒出腐败之物。得妾因有子，无咎。' },
        { text: '九二：鼎有实，我仇有疾，不我能即，吉。', meaning: '鼎中有食物，对手有病不能扰我，吉祥。' },
        { text: '九三：鼎耳革，其行塞，雉膏不食。方雨亏悔，终吉。', meaning: '鼎耳变形，运行不畅，美味难食。雨后亏损，终得吉祥。' },
        { text: '九四：鼎折足，覆公餗，其形渥，凶。', meaning: '鼎足折断，打翻了美食，形状狼狈则凶。' },
        { text: '六五：鼎黄耳金铉，利贞。', meaning: '鼎有黄耳金环，利于坚守正道。' },
        { text: '上九：鼎玉铉，大吉，无不利。', meaning: '鼎有玉环，大吉无不利。' }
      ]
    },
    { // 51
      number: 51, name: '震', pinyin: 'Zhèn', english: 'The Arousing (Shock, Thunder)',
      upperTrigram: 'zhen', lowerTrigram: 'zhen',
      judgment: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。',
      image: '洊雷，震。君子以恐惧修省。',
      description: '震卦象征震动与惊雷。上下皆震为雷，雷声阵阵，震动之象。得此卦者，将面临突发事件或重大变故。雷声惊醒，令人恐惧而后欢笑。君子因恐惧而修身自省，虽震惊百里，手中祭器不落。',
      themes: ['shock','awakening','sudden-change','alertness','self-reflection','emergency'],
      lines: [
        { text: '初九：震来虩虩，后笑言哑哑，吉。', meaning: '惊雷来时恐惧，之后欢笑交谈，吉祥。' },
        { text: '六二：震来厉，亿丧贝。跻于九陵，勿逐，七日得。', meaning: '雷霆猛烈，损失贵重。登高避之，七日后失而复得。' },
        { text: '六三：震苏苏，震行无眚。', meaning: '雷声阵阵令人苏醒，行动则无害。' },
        { text: '九四：震遂泥。', meaning: '雷入泥中，声势受阻。' },
        { text: '六五：震往来厉，亿无丧，有事。', meaning: '雷霆往来猛烈，无大损失，但有事发生。' },
        { text: '上六：震索索，视矍矍，征凶。震不于其躬，于其邻，无咎。婚媾有言。', meaning: '雷声索索令人惊恐四顾，行动则凶。雷不及己而及邻人，无咎。' }
      ]
    },
    { // 52
      number: 52, name: '艮', pinyin: 'Gèn', english: 'Keeping Still (Mountain)',
      upperTrigram: 'gen', lowerTrigram: 'gen',
      judgment: '艮其背，不获其身。行其庭，不见其人。无咎。',
      image: '兼山，艮。君子以思不出其位。',
      description: '艮卦象征静止与止步。上下皆艮为山，重山叠嶂，静止之象。得此卦者，宜知止不殆。思不出其位，行不越其界。当静止时静止，不被外物所扰。知止是一种智慧，如背后之人不可见，庭中之人不可寻。',
      themes: ['stillness','stopping','meditation','boundaries','restraint','inner-peace','contentment'],
      lines: [
        { text: '初六：艮其趾，无咎。利永贞。', meaning: '止于脚趾，防微杜渐，无咎。利于长久守正。' },
        { text: '六二：艮其腓，不拯其随，其心不快。', meaning: '止于小腿，想救而不能随，心中不快。' },
        { text: '九三：艮其限，列其夤，厉薰心。', meaning: '止于腰际，如分裂脊肉，危险熏心。' },
        { text: '六四：艮其身，无咎。', meaning: '止于身体，无有过失。' },
        { text: '六五：艮其辅，言有序，悔亡。', meaning: '止于口辅，言语有条不紊，悔恨消散。' },
        { text: '上九：敦艮，吉。', meaning: '敦厚地止于至善，吉祥。' }
      ]
    },
    { // 53
      number: 53, name: '渐', pinyin: 'Jiàn', english: 'Development (Gradual Progress)',
      upperTrigram: 'xun', lowerTrigram: 'gen',
      judgment: '女归吉，利贞。',
      image: '山上有木，渐。君子以居贤德善俗。',
      description: '渐卦象征渐进与逐步发展。上巽为木，下艮为山，山上有木，徐徐生长。得此卦者，事情将缓慢而稳定地发展。如女子出嫁，需按步骤循序渐进。不急不躁，以贤德润物无声。渐进的改变最为持久。',
      themes: ['gradual','slow-progress','development','patience','steady','marriage','cultivation'],
      lines: [
        { text: '初六：鸿渐于干，小子厉，有言，无咎。', meaning: '鸿雁渐近岸边，年轻人有危险，有言语纷扰但无咎。' },
        { text: '六二：鸿渐于磐，饮食衎衎，吉。', meaning: '鸿雁渐至磐石，饮食欢乐，吉祥。' },
        { text: '九三：鸿渐于陆，夫征不复，妇孕不育，凶。利御寇。', meaning: '鸿雁渐至陆地，丈夫出征不归，不利但可防御。' },
        { text: '六四：鸿渐于木，或得其桷，无咎。', meaning: '鸿雁渐至树上，找到好的枝干栖身，无咎。' },
        { text: '九五：鸿渐于陵，妇三岁不孕，终莫之胜，吉。', meaning: '鸿雁渐至高陵，长久无果但终无人能胜，吉祥。' },
        { text: '上九：鸿渐于逵，其羽可用为仪，吉。', meaning: '鸿雁渐至大道，其羽毛可用作礼仪装饰，吉祥。' }
      ]
    },
    { // 54
      number: 54, name: '归妹', pinyin: 'Guī Mèi', english: 'The Marrying Maiden',
      upperTrigram: 'zhen', lowerTrigram: 'dui',
      judgment: '征凶，无攸利。',
      image: '泽上有雷，归妹。君子以永终知敝。',
      description: '归妹卦象征婚嫁与结合。上震为雷，下兑为泽，雷动泽上，婚姻之象。得此卦者，涉及合作、婚姻、契约等结合之事。然而此卦提示要谨慎：若不当的结合，征凶无利。君子要永终知敝，预见到可能的弊端。',
      themes: ['marriage','union','partnership','contract','caution','commitment','foresight'],
      lines: [
        { text: '初九：归妹以娣，跛能履，征吉。', meaning: '以妹代姊出嫁，如跛足尚能行走，前行则吉。' },
        { text: '九二：眇能视，利幽人之贞。', meaning: '一只眼尚能看见，利于幽居者之守正。' },
        { text: '六三：归妹以须，反归以娣。', meaning: '嫁妹等待不得，回头以娣陪嫁。' },
        { text: '九四：归妹愆期，迟归有时。', meaning: '嫁妹延期，但终有出嫁之时。' },
        { text: '六五：帝乙归妹，其君之袂，不如其娣之袂良。月几望，吉。', meaning: '帝乙嫁妹，虽衣着不如陪嫁之娣华美，但月将圆满，吉祥。' },
        { text: '上六：女承筐无实，士刲羊无血，无攸利。', meaning: '女子提筐无果，男子杀羊无血，空有其表，无所利。' }
      ]
    },
    { // 55
      number: 55, name: '丰', pinyin: 'Fēng', english: 'Abundance (Fullness)',
      upperTrigram: 'zhen', lowerTrigram: 'li',
      judgment: '亨，王假之。勿忧，宜日中。',
      image: '雷电皆至，丰。君子以折狱致刑。',
      description: '丰卦象征丰盛与充实。上震为雷，下离为火为日，雷电交加，丰盛之象。得此卦者，正处于鼎盛时期，如日中天。丰盛之时宜明察秋毫，公正决断。然而日中最短，盛极必衰，需珍惜当下，居安思危。',
      themes: ['abundance','fullness','prosperity','peak','clarity','justice','appreciation'],
      lines: [
        { text: '初九：遇其配主，虽旬无咎。往有尚。', meaning: '遇到配得上的主人，十天之内无咎，前进有嘉赏。' },
        { text: '六二：丰其蔀，日中见斗。往得疑疾，有孚发若，吉。', meaning: '丰盛中现阴影，日中见星斗。前往可能会被怀疑，诚信则吉。' },
        { text: '九三：丰其沛，日中见沬。折其右肱，无咎。', meaning: '丰盛中现黑暗，如日中见小星。右臂折断，无咎。' },
        { text: '九四：丰其蔀，日中见斗。遇其夷主，吉。', meaning: '丰盛中的阴影，日中见斗。遇到平易的主人，吉祥。' },
        { text: '六五：来章，有庆誉，吉。', meaning: '文采到来，有庆贺与赞誉，吉祥。' },
        { text: '上六：丰其屋，蔀其家。窥其户，阒其无人，三岁不觌，凶。', meaning: '屋宇高大却门户深蔽，窥视其内无人，三年不见，凶。' }
      ]
    },
    { // 56
      number: 56, name: '旅', pinyin: 'Lǚ', english: 'The Wanderer',
      upperTrigram: 'li', lowerTrigram: 'gen',
      judgment: '小亨。旅贞吉。',
      image: '山上有火，旅。君子以明慎用刑，而不留狱。',
      description: '旅卦象征旅行与客居。上离为火，下艮为山，山上燃火，旅行之象。得此卦者，正处于过渡期或客居他乡的状态。旅人宜明慎行事，不滞留、不逾矩。小有亨通，但毕竟身处异乡，不可自以为是。',
      themes: ['travel','transition','temporary','wandering','adaptation','caution','foreign'],
      lines: [
        { text: '初六：旅琐琐，斯其所取灾。', meaning: '旅途中斤斤计较，自取灾祸。' },
        { text: '六二：旅即次，怀其资，得童仆贞。', meaning: '旅人住进客栈，怀中带钱，得到忠心的童仆。' },
        { text: '九三：旅焚其次，丧其童仆，贞厉。', meaning: '客栈失火，童仆离去，坚守亦危险。' },
        { text: '九四：旅于处，得其资斧，我心不快。', meaning: '旅途中安顿下来，得钱斧却心中不快。' },
        { text: '六五：射雉，一矢亡，终以誉命。', meaning: '射野鸡而一箭命中，最终获得荣誉。' },
        { text: '上九：鸟焚其巢，旅人先笑后号咷。丧牛于易，凶。', meaning: '鸟巢被焚，旅人先笑后哭。在边界失去牛，凶险。' }
      ]
    },
    { // 57
      number: 57, name: '巽', pinyin: 'Xùn', english: 'The Gentle (The Penetrating, Wind)',
      upperTrigram: 'xun', lowerTrigram: 'xun',
      judgment: '小亨。利有攸往，利见大人。',
      image: '随风，巽。君子以申命行事。',
      description: '巽卦象征柔顺与渗透。上下皆巽为风，风随风，无孔不入。得此卦者，以柔克刚是最佳策略。如风一般温和而坚定地渗透，不急不躁。善于听从命令并执行，同时也善于下达命令，以柔顺之道行事。',
      themes: ['gentleness','penetration','adaptability','persuasion','subtlety','compliance','influence'],
      lines: [
        { text: '初六：进退，利武人之贞。', meaning: '进退不定时，宜以武人的果断来守正。' },
        { text: '九二：巽在床下，用史巫纷若，吉无咎。', meaning: '谦卑到床下，用史巫之虔诚，吉无咎。' },
        { text: '九三：频巽，吝。', meaning: '频繁改变态度，有遗憾。' },
        { text: '六四：悔亡，田获三品。', meaning: '悔恨消散，田猎获得三种猎物。' },
        { text: '九五：贞吉悔亡，无不利。无初有终。先庚三日，后庚三日，吉。', meaning: '守正则吉，悔恨消散，无不利。开头不顺但结局良好。' },
        { text: '上九：巽在床下，丧其资斧，贞凶。', meaning: '过度谦卑至床下，失去钱财利器，守之也凶。' }
      ]
    },
    { // 58
      number: 58, name: '兑', pinyin: 'Duì', english: 'The Joyous (Lake)',
      upperTrigram: 'dui', lowerTrigram: 'dui',
      judgment: '亨，利贞。',
      image: '丽泽，兑。君子以朋友讲习。',
      description: '兑卦象征喜悦与交流。上下皆兑为泽，两泽相连，相互滋润。得此卦者，心情愉快，人际关系和谐。适宜与朋友交流学习，分享快乐。然而求悦于人需有底线，不可以谄媚苟合。真诚的喜悦来自内心。',
      themes: ['joy','pleasure','communication','friendship','sharing','harmony','social'],
      lines: [
        { text: '初九：和兑，吉。', meaning: '和悦待人，吉祥。' },
        { text: '九二：孚兑，吉，悔亡。', meaning: '诚信而悦，吉祥，悔恨消散。' },
        { text: '六三：来兑，凶。', meaning: '刻意求悦于人，凶险。' },
        { text: '九四：商兑未宁，介疾有喜。', meaning: '在喜悦中商议未定，小病很快有喜。' },
        { text: '九五：孚于剥，有厉。', meaning: '诚信被剥蚀之时，有危险。' },
        { text: '上六：引兑。', meaning: '被动地被引入喜悦之中。' }
      ]
    },
    { // 59
      number: 59, name: '涣', pinyin: 'Huàn', english: 'Dispersion (Dissolution)',
      upperTrigram: 'xun', lowerTrigram: 'kan',
      judgment: '亨。王假有庙。利涉大川，利贞。',
      image: '风行水上，涣。先王以享于帝立庙。',
      description: '涣卦象征涣散与分散。上巽为风，下坎为水，风行水上，涣散冰释之象。得此卦者，固结的事物开始消解，冰封的局面开始流动。涣散既是挑战也是机遇——可以利用这股力量化解旧有的僵局，建立新的秩序。',
      themes: ['dissolution','dispersion','release','reorganization','flow','renewal'],
      lines: [
        { text: '初六：用拯马壮，吉。', meaning: '借助壮马之力挽救，吉祥。' },
        { text: '九二：涣奔其机，悔亡。', meaning: '涣散时抓住关键的时机，悔恨消散。' },
        { text: '六三：涣其躬，无悔。', meaning: '涣及自身，无有悔恨。' },
        { text: '六四：涣其群，元吉。涣有丘，匪夷所思。', meaning: '涣散狭隘的群体，大吉。新的汇聚超出想象。' },
        { text: '九五：涣汗其大号，涣王居，无咎。', meaning: '涣散中发出号令，重整王居，无咎。' },
        { text: '上九：涣其血，去逖出，无咎。', meaning: '涣散脱离危险，远远离去，无咎。' }
      ]
    },
    { // 60
      number: 60, name: '节', pinyin: 'Jié', english: 'Limitation',
      upperTrigram: 'kan', lowerTrigram: 'dui',
      judgment: '亨。苦节不可贞。',
      image: '泽上有水，节。君子以制数度，议德行。',
      description: '节卦象征节制与节度。上坎为水，下兑为泽，泽上有水，需有所节制才不会泛滥。得此卦者，宜有度有节，凡事适可而止。过分的节制（苦节）则不可长久，适度的节制才能亨通。建立合理的制度规范，方得始终。',
      themes: ['moderation','restraint','limitation','discipline','regulation','balance','boundaries'],
      lines: [
        { text: '初九：不出户庭，无咎。', meaning: '不走出庭院，无咎。' },
        { text: '九二：不出门庭，凶。', meaning: '该出去时不出门庭，反而凶险。' },
        { text: '六三：不节若，则嗟若，无咎。', meaning: '不知节制就会叹息，但认识到这一点便无咎。' },
        { text: '六四：安节，亨。', meaning: '安于节制之道，亨通。' },
        { text: '九五：甘节，吉。往有尚。', meaning: '甘美适度的节制，吉祥，前进有嘉赏。' },
        { text: '上六：苦节，贞凶。悔亡。', meaning: '过分苦涩的节制，坚持也凶。但悔恨终消散。' }
      ]
    },
    { // 61
      number: 61, name: '中孚', pinyin: 'Zhōng Fú', english: 'Inner Truth',
      upperTrigram: 'xun', lowerTrigram: 'dui',
      judgment: '豚鱼吉。利涉大川，利贞。',
      image: '泽上有风，中孚。君子以议狱缓死。',
      description: '中孚卦象征诚信与内心真实。上巽为风，下兑为泽，风行泽上，真诚感化之象。得此卦者，以诚信为本，可以感化万物，即使如豚鱼般微小之物。诚信发自内心，不需外饰。以真诚信待人，大事可成。',
      themes: ['sincerity','trust','authenticity','inner-truth','faith','integrity','connection'],
      lines: [
        { text: '初九：虞吉，有它不燕。', meaning: '安然则吉，若另有图谋则不安。' },
        { text: '九二：鸣鹤在阴，其子和之。我有好爵，吾与尔靡之。', meaning: '鹤鸣于阴，子鹤和之。我有好酒，与你共享。' },
        { text: '六三：得敌，或鼓或罢，或泣或歌。', meaning: '遇到对手，时而前进时而停止，时而哭泣时而歌唱。' },
        { text: '六四：月几望，马匹亡，无咎。', meaning: '月将圆满，马匹丢失，却无咎。' },
        { text: '九五：有孚挛如，无咎。', meaning: '诚信紧密相连，无咎。' },
        { text: '上九：翰音登于天，贞凶。', meaning: '鸟鸣之声升于天，守之也凶。' }
      ]
    },
    { // 62
      number: 62, name: '小过', pinyin: 'Xiǎo Guò', english: 'Preponderance of the Small',
      upperTrigram: 'zhen', lowerTrigram: 'gen',
      judgment: '亨，利贞。可小事，不可大事。飞鸟遗之音，不宜上，宜下。大吉。',
      image: '山上有雷，小过。君子以行过乎恭，丧过乎哀，用过乎俭。',
      description: '小过卦象征小有过度。上震为雷，下艮为山，山上有雷，小有过越之象。得此卦者，小事可为，大事不宜。如同飞鸟鸣叫声留在空中，不宜高飞，宜向下。在小事上稍微超出常规是可以的，但在大事上要谨慎。',
      themes: ['small-excess','modesty','humility','caution','downward','small-matters','restraint'],
      lines: [
        { text: '初六：飞鸟以凶。', meaning: '飞鸟高飞有凶险。' },
        { text: '六二：过其祖，遇其妣。不及其君，遇其臣。无咎。', meaning: '走过祖父而遇祖母，未到君王处而遇臣子。无咎。' },
        { text: '九三：弗过防之，从或戕之，凶。', meaning: '不过分设防，可能被伤害，凶险。' },
        { text: '九四：无咎。弗过遇之。往厉必戒。勿用永贞。', meaning: '无咎。不过分而去相遇。前去有危险须戒惧。' },
        { text: '六五：密云不雨，自我西郊。公弋取彼在穴。', meaning: '密云不雨，从西郊而起。公侯射猎取那边穴中之物。' },
        { text: '上六：弗遇过之，飞鸟离之，凶。是谓灾眚。', meaning: '不相遇而错过，飞鸟闯入罗网，凶，这叫做灾祸。' }
      ]
    },
    { // 63
      number: 63, name: '既济', pinyin: 'Jì Jì', english: 'After Completion',
      upperTrigram: 'kan', lowerTrigram: 'li',
      judgment: '亨小，利贞。初吉终乱。',
      image: '水在火上，既济。君子以思患而预防之。',
      description: '既济卦象征已经完成。上坎为水，下离为火，水在火上，烹煮完成之象。得此卦者，事物已成定局。然而完美之中蕴含危机：初吉终乱。成功之后更要居安思危，预防潜在的问题。守成比开创更难。',
      themes: ['completion','achievement','success','caution','maintenance','vigilance','completion'],
      lines: [
        { text: '初九：曳其轮，濡其尾，无咎。', meaning: '拖住车轮、浸湿尾巴，无咎。' },
        { text: '六二：妇丧其茀，勿逐，七日得。', meaning: '妇人失去车帘，不必追，七日自得。' },
        { text: '九三：高宗伐鬼方，三年克之。小人勿用。', meaning: '高宗征伐鬼方，三年才胜利。不可重用小人。' },
        { text: '六四：繻有衣袽，终日戒。', meaning: '衣物破旧，终日警惕。' },
        { text: '九五：东邻杀牛，不如西邻之禴祭，实受其福。', meaning: '东邻杀牛大祭，不如西邻简朴的禴祭真正受福。' },
        { text: '上六：濡其首，厉。', meaning: '浸湿了头，有危险。' }
      ]
    },
    { // 64
      number: 64, name: '未济', pinyin: 'Wèi Jì', english: 'Before Completion',
      upperTrigram: 'li', lowerTrigram: 'kan',
      judgment: '亨。小狐汔济，濡其尾，无攸利。',
      image: '火在水上，未济。君子以慎辨物居方。',
      description: '未济卦象征尚未完成。上离为火，下坎为水，火在水上，事物未成之象。64卦以此结束，寓意一切皆在变化之中，没有真正的终点。得此卦者，事情尚未完成，如小狐狸差一点就要过河却浸湿了尾巴。不宜急躁，需审慎安排每一步。',
      themes: ['incompletion','transition','potential','caution','preparation','patience','hope'],
      lines: [
        { text: '初六：濡其尾，吝。', meaning: '浸湿了尾巴，有遗憾。' },
        { text: '九二：曳其轮，贞吉。', meaning: '拖住车轮缓慢前行，守正则吉。' },
        { text: '六三：未济，征凶。利涉大川。', meaning: '事尚未成，贸然出征有凶，但可涉大川。' },
        { text: '九四：贞吉悔亡。震用伐鬼方，三年有赏于大国。', meaning: '守正则吉，悔恨消散。如征伐鬼方三年后获大国封赏。' },
        { text: '六五：贞吉无悔。君子之光，有孚，吉。', meaning: '守正则吉，无有悔恨。君子光辉，有诚信则吉祥。' },
        { text: '上九：有孚于饮酒，无咎。濡其首，有孚失是。', meaning: '有诚信地饮酒，无咎。但沉溺于酒则失其道。' }
      ]
    }
  ];

  // ---- Build Hexagram Lookup Table ----
  const HEXAGRAM_INDEX = new Map();
  HEXAGRAMS.forEach(h => {
    HEXAGRAM_INDEX.set(`${h.upperTrigram}-${h.lowerTrigram}`, h);
  });

  // ---- Public API ----

  /**
   * Simulate tossing 3 coins.
   * Returns the line value (6,7,8,9), heads count, and line type.
   * 3 heads (3+3+3=9): Old Yang  — solid becoming broken
   * 2 heads (3+3+2=8): Young Yin — broken stable
   * 1 head  (3+2+2=7): Young Yang — solid stable
   * 0 heads (2+2+2=6): Old Yin   — broken becoming solid
   */
  function simulateCoinToss() {
    const c1 = Math.random() < 0.5 ? 3 : 2;
    const c2 = Math.random() < 0.5 ? 3 : 2;
    const c3 = Math.random() < 0.5 ? 3 : 2;
    const value = c1 + c2 + c3;
    const heads = (c1 === 3 ? 1 : 0) + (c2 === 3 ? 1 : 0) + (c3 === 3 ? 1 : 0);
    let lineType;
    if (value === 6) lineType = 'old-yin';
    else if (value === 7) lineType = 'young-yang';
    else if (value === 8) lineType = 'young-yin';
    else lineType = 'old-yang';
    return { heads, value, lineType };
  }

  /**
   * Determine trigram key from 3 lines (bottom-up).
   * Each line: yang=1, yin=0 -> 3-bit string -> trigram key.
   */
  function trigramFromLines(lines) {
    const bits = lines.map(l =>
      (l.lineType === 'old-yang' || l.lineType === 'young-yang') ? '1' : '0'
    ).join('');
    return BINARY_TO_TRIGRAM[bits];
  }

  /**
   * Build hexagram from 6 lines (index 0 = line 1, bottom).
   * Returns { primary, changingIndices, transformed }.
   */
  function buildHexagram(lines) {
    const lowerTrigramKey = trigramFromLines(lines.slice(0, 3));
    const upperTrigramKey = trigramFromLines(lines.slice(3, 6));
    const primary = HEXAGRAM_INDEX.get(`${upperTrigramKey}-${lowerTrigramKey}`);

    const changingIndices = [];
    lines.forEach((line, i) => {
      if (line.lineType === 'old-yang' || line.lineType === 'old-yin') {
        changingIndices.push(i);
      }
    });

    let transformed = null;
    if (changingIndices.length > 0) {
      const transformedLines = lines.map(line => {
        if (line.lineType === 'old-yang') return { lineType: 'young-yin' };
        if (line.lineType === 'old-yin') return { lineType: 'young-yang' };
        return { lineType: line.lineType };
      });
      const tLower = trigramFromLines(transformedLines.slice(0, 3));
      const tUpper = trigramFromLines(transformedLines.slice(3, 6));
      transformed = HEXAGRAM_INDEX.get(`${tUpper}-${tLower}`);
    }

    return { primary, changingIndices, transformed };
  }

  function lookupByTrigrams(upper, lower) {
    return HEXAGRAM_INDEX.get(`${upper}-${lower}`);
  }

  function getHexagram(number) {
    return HEXAGRAMS[number - 1] || null;
  }

  function getTrigram(key) {
    return TRIGRAMS[key] || null;
  }

  function getAllHexagrams() {
    return HEXAGRAMS;
  }

  function getAllTrigrams() {
    return TRIGRAMS;
  }

  // ---- Interpretation Engine ----

  /**
   * Analyze body-usage (体用生克) relationship.
   * 体卦 (body) = lower trigram = the questioner
   * 用卦 (usage) = upper trigram = the situation
   * Returns detailed relationship analysis.
   */
  function analyzeBodyUsage(lowerTrigramKey, upperTrigramKey) {
    const bodyTri = TRIGRAMS[lowerTrigramKey];
    const usageTri = TRIGRAMS[upperTrigramKey];
    const bodyElem = FIVE_ELEMENTS[lowerTrigramKey];
    const usageElem = FIVE_ELEMENTS[upperTrigramKey];

    if (!bodyElem || !usageElem) return null;

    const bodyEl = bodyElem.element;
    const usageEl = usageElem.element;
    const bodyNat = bodyElem.nature;
    const usageNat = usageElem.nature;

    let relationship, fortune, explanation;

    // 用生体: usage generates body → very auspicious
    if (GENERATING[usageEl] === bodyEl) {
      relationship = '用生体';
      fortune = '大吉';
      explanation = `体卦${bodyTri.name}属${bodyEl}（${bodyNat}），用卦${usageTri.name}属${usageEl}（${usageNat}），${usageEl}生${bodyEl}。外部环境主动滋养你，事情会自然顺利发展，不需要太费力就能得到好结果。你现在要做的是顺势而为，把握好时机。`;
    }
    // 体用比和: same element → harmonious
    else if (bodyEl === usageEl) {
      relationship = '比和';
      fortune = '吉';
      explanation = `体卦${bodyTri.name}和用卦${usageTri.name}同属${bodyEl}（${bodyNat}），内外和谐一致。你与当前的环境非常契合，内心所想与外部所遇相呼应。这是一个如鱼得水的局面，保持现在的状态和节奏即可。`;
    }
    // 体生用: body generates usage → draining, small misfortune
    else if (GENERATING[bodyEl] === usageEl) {
      relationship = '体生用';
      fortune = '小凶';
      explanation = `体卦${bodyTri.name}属${bodyEl}（${bodyNat}），用卦${usageTri.name}属${usageEl}（${usageNat}），${bodyEl}生${usageEl}。你在消耗自己的能量去滋养外部环境，付出多而回报少。事情虽然能推进，但你会感到疲惫。建议放慢节奏，不要过度投入，照顾好自己再顾其他。`;
    }
    // 体克用: body overcomes usage → effortful but achievable
    else if (OVERCOMING[bodyEl] === usageEl) {
      relationship = '体克用';
      fortune = '中吉';
      explanation = `体卦${bodyTri.name}属${bodyEl}（${bodyNat}），用卦${usageTri.name}属${usageEl}（${usageNat}），${bodyEl}克${usageEl}。你能掌控当前局面，但需要付出相当的努力。好比砍树需要挥斧，事情能成，但不会轻松。保持耐心和毅力，成功在于坚持。`;
    }
    // 用克体: usage overcomes body → unfavorable
    else if (OVERCOMING[usageEl] === bodyEl) {
      relationship = '用克体';
      fortune = '凶';
      explanation = `体卦${bodyTri.name}属${bodyEl}（${bodyNat}），用卦${usageTri.name}属${usageEl}（${usageNat}），${usageEl}克${bodyEl}。外部环境对你形成了压制，你可能感到处处受阻、力不从心。这并非你做错了什么，而是时机未到。建议暂时退让一步，先保全自己，静待困境过去再行动。`;
    }

    return {
      bodyTrigram: bodyTri.name,
      usageTrigram: usageTri.name,
      bodyElement: bodyEl,
      usageElement: usageEl,
      relationship,
      fortune,
      explanation
    };
  }

  /**
   * Analyze changing line position significance.
   */
  function analyzeLinePositions(changingIndices, hexNumber) {
    const hex = getHexagram(hexNumber);
    if (!hex || changingIndices.length === 0) return [];

    return changingIndices.map(idx => {
      const pos = LINE_POSITIONS[idx];
      const lineData = hex.lines[idx];
      return {
        lineNumber: idx + 1,
        position: pos.name,
        role: pos.role,
        positionMeaning: pos.meaning,
        lineText: lineData.text,
        lineMeaning: lineData.meaning
      };
    });
  }

  /**
   * Get the five-element of a trigram.
   */
  function getElement(trigramKey) {
    return FIVE_ELEMENTS[trigramKey] || null;
  }

  // Public API
  var api = {
    simulateCoinToss,
    trigramFromLines,
    buildHexagram,
    lookupByTrigrams,
    getHexagram,
    getTrigram,
    getAllHexagrams,
    getAllTrigrams,
    analyzeBodyUsage,
    analyzeLinePositions,
    getElement,
    FIVE_ELEMENTS,
    LINE_POSITIONS,
    TRIGRAMS,
    HEXAGRAMS
  };
  console.log('[iching] iching-data module loaded');
  return api;

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IChing;
}
