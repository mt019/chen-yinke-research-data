import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const materialPath = path.join(
  root,
  'data/materials/liu-rushi-edition/pilot-third-chapter-opening.json',
);
const pilot = JSON.parse(fs.readFileSync(materialPath, 'utf8'));
pilot.workAuthor = '陳寅恪';
pilot.textAttribution = {
  assertionOwner: 'chen-yinke',
  displayLabel: '陳寅恪',
  representation: 'author-text',
};

const blockId = (sequence) => `lrs-f156-b${String(sequence).padStart(4, '0')}`;
const range = (from, to) => Array.from(
  { length: to - from + 1 },
  (_, index) => blockId(from + index),
);
const attribution = (representation) => ({
  assertionOwner: 'project-editor',
  wordingBy: 'project-editor',
  representation,
});
const review = {
  status: 'draft-disclosed',
  authorizedBy: 'user',
  authorizedAt: '2026-07-29',
};
const annotation = (unitNumber, suffix, annotationType, displayLabel, text, placement, basis, sourceStance) => ({
  id: `lrs-ann-u${unitNumber}-${suffix}`,
  annotationType,
  displayLabel,
  text,
  target: {
    unitId: `lrs-pilot-${unitNumber}`,
    placement,
  },
  attribution: attribution(annotationType),
  ...(sourceStance ? { sourceStance } : {}),
  basis,
  review,
  publicStatus: 'public',
});

const units = [
  { number: '17', from: 75, to: 75, function: 'interpretive-caveat' },
  { number: '18', from: 76, to: 87, function: 'age-and-spring-poems' },
  { number: '19', from: 88, to: 102, function: 'early-residence-location' },
  { number: '20', from: 103, to: 107, function: 'xu-to-zhou-transition' },
  { number: '21', from: 108, to: 112, function: 'expulsion-from-zhou-household' },
  { number: '22', from: 113, to: 117, function: 'bailongtan-encounter' },
  { number: '23', from: 118, to: 120, function: 'poem-closing-stanza' },
  { number: '24', from: 121, to: 126, function: 'chen-jiru-poem-and-calligraphy' },
  { number: '25', from: 127, to: 133, function: 'bailongtan-participants' },
  { number: '26', from: 134, to: 141, function: 'late-anecdote-and-1632-anchor' },
  { number: '27', from: 142, to: 158, function: 'li-daiwen-relationship' },
  { number: '28', from: 159, to: 190, function: 'song-zhengyu-relationship-and-chronology' },
  { number: '29', from: 191, to: 201, function: 'hostile-source-criticism' },
  { number: '30', from: 202, to: 213, function: 'chen-liu-direct-poetry' },
  { number: '31', from: 214, to: 222, function: '1632-new-years-eve-anchor' },
  { number: '32', from: 223, to: 244, function: 'first-meeting-window-and-seshan-context' },
];

pilot.scope.toBlock = blockId(244);
pilot.scope.status = 'third editorial pass';
pilot.readingUnits = [
  ...pilot.readingUnits.filter((unit) => Number(unit.id.slice(-2)) < 17),
  ...units.map((unit) => ({
    id: `lrs-pilot-${unit.number}`,
    blocks: range(unit.from, unit.to),
  })),
];
pilot.editorialDrafts.units = [
  ...pilot.editorialDrafts.units.filter((unit) => Number(unit.id.slice(-2)) < 17),
  ...units.map((unit) => ({
    id: `lrs-pilot-${unit.number}`,
    function: unit.function,
  })),
];

const oldTransition = pilot.publicAnnotations.find(
  (item) => item.id === 'lrs-ann-u16-note',
);
if (oldTransition) {
  oldTransition.text = '本段完成「吳江故相」的人物辨識；下段起依〈秋塘曲〉次序逐節檢驗柳如是早歲經歷。';
}

const newAnnotations = [
  annotation('17', 'heading', 'editorial-heading', '編者分段', '逐句推測的起點', 'heading', [blockId(75)]),
  annotation('17', 'note', 'editorial-note', '編者說明', '陳寅恪先提醒詩語隱晦，以下解釋含有推測；閱讀時須保留各條判斷的強弱差別。', 'note', [blockId(75)]),
  annotation('17', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪明示以下逐句解釋屬其「鄙見」與推測，不能把後續每項判斷一概視為確證。', 'interpretation', [blockId(75)], 'explicit'),

  annotation('18', 'heading', 'editorial-heading', '編者分段', '十六歲與風雨詩證', 'heading', [blockId(77), blockId(78)]),
  annotation('18', 'note', 'editorial-note', '編者說明', '本節以柳如是、陳子龍同時期的風雨詩互證〈秋塘曲〉首四句，並追問柳、宋關係的變化。', 'note', [blockId(77), blockId(86), blockId(87)]),
  annotation('18', 'interpretation-01', 'editorial-inference', '編者解讀', '「年十六」被陳寅恪視為崇禎六年柳如是年齡的實錄，而非文學性的泛稱。', 'interpretation', [blockId(77), blockId(78)], 'explicit'),
  annotation('18', 'interpretation-02', 'editorial-inference', '編者解讀', '陳寅恪以柳如是、陳子龍同用風雨與窈娘典故，論證「雨雨風風能痛哭」指崇禎六年春的相關詩作。', 'interpretation', [blockId(79), blockId(81), blockId(83), blockId(85), blockId(86)], 'argued'),

  annotation('19', 'heading', 'editorial-heading', '編者分段', '「橫塘」究在何處', 'heading', [blockId(89), blockId(90)]),
  annotation('19', 'note', 'editorial-note', '編者說明', '「橫塘」可同時是古典語彙與吳越實地名稱；陳寅恪在嘉興、盛澤之間保留推測。', 'note', [blockId(89), blockId(90), blockId(102)]),
  annotation('19', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪不把「橫塘」限定於嘉興，轉而懷疑它指吳江盛澤鎮歸家院，但明示其地仍難確定。', 'interpretation', [blockId(90), blockId(102)], 'open-question'),
  annotation('19', 'interpretation-02', 'editorial-inference', '編者解讀', '他把「橫塘」「官渡」「宛轉橋」「相思樹」合讀為柳如是早年居處的環境線索。', 'interpretation', [blockId(89), blockId(90), blockId(93), blockId(95), blockId(97), blockId(101), blockId(102)], 'argued'),

  annotation('20', 'heading', 'editorial-heading', '編者分段', '由徐佛家轉入周家', 'heading', [blockId(104), blockId(105)]),
  annotation('20', 'note', 'editorial-note', '編者說明', '本節由四句詩重建「徐佛家婢女→周道登家」的移轉，但部分細節只是假設。', 'note', [blockId(104), blockId(105), blockId(107)]),
  annotation('20', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪把「初將……早信……」解作柳如是先入徐佛家為婢，後由徐氏轉入周道登家。', 'interpretation', [blockId(104), blockId(105)], 'argued'),
  annotation('20', 'interpretation-02', 'editorial-inference', '編者解讀', '他以鳳仙染指、又名「菊婢」的典故解「玉指醉流霞」，認為詩句暗寓柳如是早年為婢。', 'interpretation', [blockId(104), blockId(106), blockId(107)], 'argued'),
  annotation('20', 'interpretation-03', 'editorial-inference', '編者解讀', '「青鳥」是否暗指周母命人購婢、再由周道登納為妾，是陳寅恪提出的假設，並非已證事實。', 'interpretation', [blockId(104), blockId(107)], 'open-question'),

  annotation('21', 'heading', 'editorial-heading', '編者分段', '群妾讒逐與離周家', 'heading', [blockId(109), blockId(110)]),
  annotation('21', 'note', 'editorial-note', '編者說明', '這一節直接解釋柳如是遭周家放逐的原因，是前段「崇禎四年離周家」論證的詩內證據。', 'note', [blockId(109), blockId(110), blockId(112)]),
  annotation('21', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪把「十二雲屏」「丞相嗔」解作周道登姬妾眾多、柳如是遭群妾嫉忌讒逐。', 'interpretation', [blockId(109), blockId(110), blockId(112)], 'argued'),
  annotation('21', 'interpretation-02', 'editorial-inference', '編者解讀', '依陳寅恪的讀法，柳如是自述周僕不解事，自己與僕無涉；這是對錢肇鼇「與僕通」說的修正。', 'interpretation', [blockId(109), blockId(110)], 'argued'),

  annotation('22', 'heading', 'editorial-heading', '編者分段', '白龍潭今夕與陳柳因緣', 'heading', [blockId(114), blockId(115)]),
  annotation('22', 'note', 'editorial-note', '編者說明', '詩句由白龍潭當夜所見轉入陳子龍、柳如是的情感與學問關係。', 'note', [blockId(114), blockId(115), blockId(117)]),
  annotation('22', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪認為柳如是當夜向同舟者出示詩稿，四句兼寫白龍潭泛舟與陳柳因緣。', 'interpretation', [blockId(114), blockId(115)], 'argued'),
  annotation('22', 'interpretation-02', 'editorial-inference', '編者解讀', '柳如是接觸《真誥》是否始於此時，以及「難諧紫府仙人夢」是否成為詩讖，均是陳寅恪保留疑問的推測。', 'interpretation', [blockId(115), blockId(116), blockId(117)], 'open-question'),

  annotation('23', 'heading', 'editorial-heading', '編者分段', '末四句收束〈秋塘曲〉', 'heading', [blockId(119), blockId(120)]),
  annotation('23', 'note', 'editorial-note', '編者說明', '〈秋塘曲〉逐句解釋在此完整收束；下一段轉入陳眉公壽詩及書法旁證，另屬後續考證。', 'note', [blockId(119), blockId(120)]),
  annotation('23', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪以末四句呼應詩序「感慨激昂，絕不類閨房語」，據以概括柳如是的平日氣概。', 'interpretation', [blockId(119), blockId(120)], 'explicit'),

  annotation('24', 'heading', 'editorial-heading', '編者分段', '壽眉公詩與書法旁證', 'heading', [blockId(121), blockId(124)]),
  annotation('24', 'note', 'editorial-note', '編者說明', '逐句詩解結束後，陳寅恪轉查壽陳繼儒詩的年代、問字傳聞與柳如是書法。', 'note', [blockId(121), blockId(126)]),
  annotation('24', 'interpretation-01', 'editorial-inference', '編者解讀', '柳如是壽陳繼儒詩可能作於崇禎四年或五年冬，但陳寅恪明示無法確定。', 'interpretation', [blockId(121)], 'open-question'),
  annotation('24', 'interpretation-02', 'editorial-inference', '編者解讀', '柳如是以書法著稱有同時記載及翁同龢所見作品旁證，但陳寅恪未敢判定現存手跡真偽。', 'interpretation', [blockId(124), blockId(125), blockId(126)], 'argued'),

  annotation('25', 'heading', 'editorial-heading', '編者分段', '白龍潭同遊者與流落松江', 'heading', [blockId(127), blockId(133)]),
  annotation('25', 'note', 'editorial-note', '編者說明', '本節解釋李雯、宋徵輿何以未參與白龍潭之遊，並把柳如是由周家流落松江接回社交網絡。', 'note', [blockId(127), blockId(133)]),
  annotation('25', 'interpretation-01', 'editorial-inference', '編者解讀', '李雯、宋徵輿可能因崇禎六年秋赴鄉試而缺席白龍潭及楊姬館集會；原文只作推測。', 'interpretation', [blockId(127), blockId(128), blockId(129), blockId(130), blockId(131), blockId(132)], 'open-question'),
  annotation('25', 'interpretation-02', 'editorial-inference', '編者解讀', '陳寅恪將李雯「夢落吳江」之句理解為柳如是離周家後以楊影憐之名活動於松江。', 'interpretation', [blockId(133)], 'argued'),

  annotation('26', 'heading', 'editorial-heading', '編者分段', '晚出軼事與崇禎五年除夕', 'heading', [blockId(134), blockId(141)]),
  annotation('26', 'note', 'editorial-note', '編者說明', '《質直談耳》提供徐三公子與宋徵輿軼事，但陳寅恪多次提醒其中有晚出傳聞與誇張。', 'note', [blockId(134), blockId(135), blockId(136), blockId(138), blockId(141)]),
  annotation('26', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪把徐三公子赴約定位在崇禎五年除夕，但對晚出軼事的其他細節不盡採信。', 'interpretation', [blockId(135), blockId(136), blockId(138), blockId(141)], 'argued'),

  annotation('27', 'heading', 'editorial-heading', '編者分段', '李待問舊約與書法關係', 'heading', [blockId(142), blockId(146)]),
  annotation('27', 'note', 'editorial-note', '編者說明', '本節由「問郎」玉篆辨識李待問，轉入柳如是與松江名士的書法交流。', 'note', [blockId(143), blockId(145), blockId(146), blockId(156)]),
  annotation('27', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪辨定王澐所稱「隴西君」為李待問，並主張柳如是書法受到李氏影響。', 'interpretation', [blockId(143), blockId(145), blockId(146), blockId(156)], 'argued'),

  annotation('28', 'heading', 'editorial-heading', '編者分段', '宋徵輿關係與年代降格', 'heading', [blockId(159), blockId(190)]),
  annotation('28', 'note', 'editorial-note', '編者說明', '這一節是年代證據的關鍵反轉：前文的崇禎四年斷語，在此降為最早可能，崇禎五年反成最可能。', 'note', [blockId(159), blockId(182), blockId(190)]),
  annotation('28', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪認為柳如是離周家、流落松江至早可能在崇禎四年，而最可能是在崇禎五年。', 'interpretation', [blockId(190)], 'open-question'),
  annotation('28', 'interpretation-02', 'editorial-inference', '編者解讀', '宋徵輿與柳如是決裂的時間及方岳貢驅逐令是否實際執行，陳寅恪均未能確定。', 'interpretation', [blockId(182), blockId(190)], 'open-question'),

  annotation('29', 'heading', 'editorial-heading', '編者分段', '敵意材料的來源位置', 'heading', [blockId(191), blockId(193)]),
  annotation('29', 'note', 'editorial-note', '編者說明', '陳寅恪把宋徵輿後來攻擊錢謙益，解釋為早年與柳如是決裂後的私怨；此為作者的史料立場判斷。', 'note', [blockId(191), blockId(193), blockId(197)]),
  annotation('29', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪認為宋徵輿攻擊錢謙益出於私人舊恨，並以朱鶴齡的反駁保存另一方材料。', 'interpretation', [blockId(191), blockId(193), blockId(197), blockId(198), blockId(201)], 'argued'),

  annotation('30', 'heading', 'editorial-heading', '編者分段', '轉入陳子龍與柳如是', 'heading', [blockId(202), blockId(206)]),
  annotation('30', 'note', 'editorial-note', '編者說明', '本節開始用明著「楊姬」的陳子龍詩，反駁「陳子龍拒見柳如是」的通行傳說。', 'note', [blockId(202), blockId(204), blockId(205), blockId(206)]),
  annotation('30', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪判定「陳子龍拒見柳如是」是偽傳，並以〈秋潭曲〉及楊姬館詩作為直接反證。', 'interpretation', [blockId(202), blockId(203), blockId(204), blockId(205), blockId(206), blockId(207), blockId(208), blockId(209), blockId(210), blockId(211)], 'argued'),
  annotation('30', 'interpretation-02', 'editorial-inference', '編者解讀', '〈中秋風雨懷人〉可能為柳如是而作，但具體作年與對象仍待考。', 'interpretation', [blockId(212), blockId(213)], 'open-question'),

  annotation('31', 'heading', 'editorial-heading', '編者分段', '崇禎五年除夕的時間錨', 'heading', [blockId(214), blockId(220)]),
  annotation('31', 'note', 'editorial-note', '編者說明', '李雯書信與〈癸酉長安除夕〉把陳、柳相遇推回崇禎五年，這是本段最穩固的年代下限。', 'note', [blockId(215), blockId(220), blockId(221), blockId(222)]),
  annotation('31', 'interpretation-01', 'editorial-inference', '編者解讀', '〈癸酉長安除夕〉證明陳子龍在崇禎五年除夕曾見一位「紅妝綺袖」女子；陳寅恪論證此人極可能是柳如是。', 'interpretation', [blockId(220), blockId(221), blockId(222)], 'argued'),

  annotation('32', 'heading', 'editorial-heading', '編者分段', '初遇仍在四、五年之間', 'heading', [blockId(223), blockId(226)]),
  annotation('32', 'note', 'editorial-note', '編者說明', '本組旁證只能把初遇範圍推到崇禎五年春、甚至四年冬；無法把四年離周家固定為已證事實。', 'note', [blockId(223), blockId(224), blockId(225), blockId(226), blockId(244)]),
  annotation('32', 'interpretation-01', 'editorial-inference', '編者解讀', '陳寅恪認為陳、柳初次相遇可能在崇禎五年春，或早至四年冬，但明言「未可知」。', 'interpretation', [blockId(223), blockId(224), blockId(225), blockId(226)], 'open-question'),
  annotation('32', 'interpretation-02', 'editorial-inference', '編者解讀', '李雯所說「阿雲」可與柳如是相聯，但「張三」究指張昂之或其他人，陳寅恪仍無法確定。', 'interpretation', [blockId(215), blockId(226), blockId(227), blockId(232), blockId(233), blockId(237), blockId(243), blockId(244)], 'open-question'),
];
pilot.publicAnnotations = [
  ...pilot.publicAnnotations.filter(
    (item) => Number(item.target?.unitId?.slice(-2)) < 17,
  ),
  ...newAnnotations,
];

const newEntities = [
  { id: 'person-xu-fo', label: '徐佛', type: 'person', aliases: ['雲翾'] },
  { id: 'person-song-zhengyu', label: '宋徵輿', type: 'person', aliases: ['宋轅文', '轅文'] },
  { id: 'person-li-wen', label: '李雯', type: 'person', aliases: ['李舒章', '舒章'] },
  { id: 'person-chen-jiru', label: '陳繼儒', type: 'person', aliases: ['陳眉公', '眉公'] },
  { id: 'person-li-daiwen', label: '李待問', type: 'person', aliases: ['李存我', '存我'] },
  { id: 'person-fang-yuegong', label: '方岳貢', type: 'person', aliases: ['方四長', '禹修'] },
  { id: 'person-zhang-angzhi', label: '張昂之', type: 'person', aliases: ['張冷石', '冷石'] },
  { id: 'person-shi-shaoxin', label: '施紹莘', type: 'person', aliases: ['施子野', '子野'] },
  { id: 'person-cai-shi', label: '蔡氏', type: 'person', aliases: [] },
  { id: 'place-shengze', label: '盛澤鎮', type: 'place', aliases: ['歸家院'] },
];
const newEntityIds = new Set(newEntities.map((entity) => entity.id));
pilot.editorialDrafts.entities = [
  ...pilot.editorialDrafts.entities.filter((entity) => !newEntityIds.has(entity.id)),
  ...newEntities,
];

pilot.editorialDrafts.chronology = [
  ...pilot.editorialDrafts.chronology
    .filter((event) => !['event-1631-liu-leaves-zhou', 'event-1632-liu-in-songjiang'].includes(event.id)),
  {
    id: 'event-1631-liu-leaves-zhou',
    era: '崇禎四年',
    ganzhi: '辛未',
    ceYear: 1631,
    description: '柳如是離開周家、流落松江的最早可能年份；陳寅恪後文改稱崇禎五年最可能。',
    basis: [blockId(69), blockId(190), blockId(226)],
    certainty: 'open-question',
    verificationStatus: 'revised-by-later-author-discussion',
  },
  {
    id: 'event-1632-liu-in-songjiang',
    era: '崇禎五年',
    ganzhi: '壬申',
    ceYear: 1632,
    description: '陳寅恪認為柳如是此年最可能已離周家、流落松江；除夕與陳子龍相見的論證較強。',
    basis: [blockId(141), blockId(190), blockId(220), blockId(221), blockId(222), blockId(226)],
    certainty: 'argued',
    verificationStatus: 'most-likely-not-exactly-settled',
  },
];

// Audits are rebuilt by audit-pilot-annotations.mjs after the public
// annotations change. Keeping stale audit rows would make validation fail.
pilot.annotationAudits = [];

fs.writeFileSync(materialPath, `${JSON.stringify(pilot, null, 2)}\n`);
console.log('Expanded pilot to b0244: 32 units, 243 contiguous blocks.');
