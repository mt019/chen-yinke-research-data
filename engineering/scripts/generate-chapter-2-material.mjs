import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const materialRoot = new URL('data/materials/liu-rushi-edition/', root);
const pilot = JSON.parse(await readFile(new URL('pilot-third-chapter-opening.json', materialRoot), 'utf8'));
const safeEntityIds = new Set([
  'person-liu-rushi', 'person-gu-ling', 'person-qian-qianyi', 'person-chen-zilong',
  'person-song-zhengbi', 'person-zhou-daodeng', 'person-pan-chengzhang',
  'person-xu-fo', 'person-li-wen', 'place-shengze',
]);
const entities = [
  { id: 'person-chen-yinke', label: '陳寅恪', type: 'person', aliases: ['寅恪'] },
  ...pilot.editorialDrafts.entities.filter((entity) => safeEntityIds.has(entity.id)),
];
const block = (sequence) => `lrs-f155-b${String(sequence).padStart(4, '0')}`;
const ranges = [
  [1, 2, 'chapter-question-and-method'],
  [3, 13, 'hidden-name-reading-convention'],
  [14, 29, 'beauty-as-specific-appellation'],
  [30, 48, 'evidence-for-yun-name'],
  [49, 65, 'yang-zhao-chaoyun-yunjuan-hypothesis'],
  [66, 77, 'explanatory-test-of-yunjuan-hypothesis'],
  [78, 84, 'evidence-for-yang-surname'],
  [85, 90, 'change-to-liu-yang-ai-yinglian'],
  [91, 97, 'yinwen-liuyin-and-yin-variant'],
  [98, 101, 'ayun-date-anchor-and-conclusion'],
];
const headings = [
  '問題、假設與證明方法',
  '詩文暗藏姓名的解碼慣例',
  '「美人」作為專稱',
  '由〈縆雲詩〉推出初名含「雲」',
  '從「楊朝／朝雲」到「雲娟」假說',
  '以「有美」「絳雲」檢驗假說',
  '本姓楊氏的證據',
  '改姓柳與「楊愛／影憐」',
  '「隱雯」「柳隱」與「柳因」',
  '「阿雲」年代錨點與章末補證',
];
const note = (id, unitId, text, basis) => ({
  id,
  annotationType: 'editorial-note',
  displayLabel: '編者說明',
  text,
  target: { unitId, placement: 'note' },
  attribution: {
    assertionOwner: 'project-editor',
    wordingBy: 'project-editor',
    representation: 'editorial-note',
  },
  basis,
  review: {
    status: 'draft-disclosed',
    authorizedBy: 'user',
    authorizedAt: '2026-07-29',
  },
  publicStatus: 'public',
});
const heading = (index, unitId, basis) => ({
  id: `lrs-ann-ch2-u${String(index + 1).padStart(2, '0')}-heading`,
  annotationType: 'editorial-heading',
  displayLabel: '編者分段',
  text: headings[index],
  target: { unitId, placement: 'heading' },
  attribution: {
    assertionOwner: 'project-editor',
    wordingBy: 'project-editor',
    representation: 'editorial-heading',
  },
  basis,
  review: {
    status: 'draft-disclosed',
    authorizedBy: 'user',
    authorizedAt: '2026-07-29',
  },
  publicStatus: 'public',
});
const ref = (author, work, item) => ({ author, work, ...(item ? { item } : {}) });
const publicQuoteAttributions = {
  [block(4)]: ref('吳偉業', '梅村家藏稿', '詩話'),
  [block(6)]: ref('鄧漢儀', '天下名家詩觀', '黃媛介條'),
  [block(8)]: ref('王士禛', '池北偶談', '黃媛介詩條'),
  [block(10)]: ref('吳偉業', '清河家法述'),
  [block(12)]: ref('錢謙益', '題張天如立嗣議'),
  ...Object.fromEntries([16, 18, 20, 22, 24, 26, 28].map(
    (sequence, index) => [block(sequence), ref('錢謙益', '觀美人手跡', `其${index + 1}`)],
  )),
  [block(31)]: ref('王昶編本原案', '陳忠裕全集'),
  [block(33)]: ref('王昶編本原案', '陳忠裕全集'),
  [block(35)]: ref('朱鶴齡（徐釚轉引）', '縆雲詩題注'),
  [block(37)]: ref('錢謙益', '吳江朱氏杜詩輯注序'),
  [block(39)]: ref('錢謙益', '歸玄恭恒軒集序'),
  [block(41)]: ref('錢謙益', '與毛子晉書'),
  [block(43)]: ref('錢謙益', '與朱長孺書'),
  [block(45)]: ref('朱鶴齡', '與吳梅村祭酒書'),
  [block(47)]: ref('潘檉章', '松陵文獻', '周道登傳'),
  [block(50)]: ref('程嘉燧', '今夕行', '序'),
  [block(52)]: ref('李白', '長相思'),
  ...Object.fromEntries([54, 56, 58, 60, 62, 64].map(
    (sequence) => [block(sequence), ref('陳子龍', '陳忠裕全集')],
  )),
  [block(67)]: ref('《詩經》', '鄭風・野有蔓草', '上章'),
  [block(68)]: ref('《詩經》', '鄭風・野有蔓草', '下章'),
  [block(70)]: ref('錢謙益自注／《真誥》', '絳雲樓上梁'),
  [block(72)]: ref('錢謙益自注／《真誥》', '絳雲樓上梁'),
  [block(74)]: ref('錢謙益自注／《真誥》', '絳雲樓上梁'),
  [block(76)]: ref('作者未詳（錢謙益詩注轉引）', '西湖詩'),
  [block(79)]: ref('李雯', '坐中戲言分贈諸妓', '其四'),
  [block(81)]: ref('《真誥》', '萼綠華條'),
  [block(83)]: ref('《真誥》', '萼綠華條原注'),
  [block(86)]: ref('沈虬', '河東君傳'),
  [block(89)]: ref('乾隆《吳江縣志》', '周燦條'),
  [block(93)]: ref('作者未詳', '牧齋遺事'),
  [block(95)]: ref('鄧漢儀', '天下名家詩觀', '柳因條'),
  [block(96)]: ref('鄧漢儀', '天下名家詩觀', '柳因條'),
  [block(99)]: ref('李雯', '與臥子書'),
};
const readingUnits = ranges.map(([from, to], index) => ({
  id: `lrs-ch2-u${String(index + 1).padStart(2, '0')}`,
  blocks: Array.from({ length: to - from + 1 }, (_, offset) => block(from + offset)),
}));
const publicAnnotations = readingUnits.flatMap((unit, index) => [
  heading(index, unit.id, [unit.blocks[0], unit.blocks.at(-1)]),
  ...(index === 0 ? [note(
    'lrs-ann-ch2-text-responsibility',
    unit.id,
    '本章正文為陳寅恪所撰。章中整段排錄多種詩文、筆記與方志；引文內的「寅恪案」及「某字可注意」仍是陳寅恪按語，不屬原引作者。',
    [block(2), block(4), block(60), block(70), block(100)],
  )] : []),
  ...(index === 4 ? [note(
    'lrs-ann-ch2-yunjuan-caution',
    unit.id,
    '「雲娟」是陳寅恪以「竊疑」提出的初名假說；後續材料用來檢驗其解釋力，不能改標為已確證姓名。',
    [block(53), block(65), block(66)],
  )] : []),
]);
const material = {
  schemaVersion: '2.1.0',
  work: '柳如是別傳',
  workAuthor: '陳寅恪',
  textAttribution: {
    assertionOwner: 'chen-yinke',
    displayLabel: '陳寅恪',
    representation: 'author-text',
  },
  section: '第二章　河東君最初姓氏名字之推測及其附帶問題',
  scope: {
    sourceFile: 'OEBPS/text00155.html',
    fromBlock: block(1),
    contentFromBlock: block(1),
    toBlock: block(101),
    status: 'first editorial pass',
  },
  readingUnits,
  editorialDraftPolicy: {
    status: 'machine-drafted',
    publicStatus: 'withhold',
    wordingBy: 'project-editor',
    appliesTo: ['editorialDrafts'],
  },
  editorialDrafts: {
    units: readingUnits.map((unit, index) => ({ id: unit.id, function: ranges[index][2] })),
    sourceBridges: [],
    chronology: [],
    entities,
    readerBehaviors: [],
  },
  publicQuoteAttributions,
  publicAnnotations,
  annotationAudits: [],
};
await writeFile(new URL('chapter-2-complete.json', materialRoot), `${JSON.stringify(material, null, 2)}\n`);

const manifestUrl = new URL('reading-views.json', materialRoot);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
manifest.selections = manifest.selections.filter((selection) => selection.id !== 'chapter-2-complete');
manifest.selections.push({
  id: 'chapter-2-complete',
  label: '第二章・姓氏名字之推測',
  sectionId: 'chapter-2',
  sectionOrder: 2,
  sourceFileOrder: 0,
  completesSection: true,
  material: 'chapter-2-complete.json',
});
manifest.selections.sort((a, b) => (
  a.sectionOrder - b.sectionOrder || a.sourceFileOrder - b.sourceFileOrder
));
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Wrote complete second chapter: 101 blocks, 10 units, 44 quote attributions.');
