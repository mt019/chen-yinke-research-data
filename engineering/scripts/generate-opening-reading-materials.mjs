import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const materialRoot = new URL('data/materials/liu-rushi-edition/', root);
const processedRoot = new URL('data/processed/liu-rushi-edition/files/', root);

const publisher = {
  assertionOwner: 'shanghai-ancient-books-press',
  displayLabel: '上海古籍出版社',
  representation: 'publisher-preface',
};
const chen = {
  assertionOwner: 'chen-yinke',
  displayLabel: '陳寅恪',
  representation: 'author-text',
};
const people = {
  chen: { id: 'person-chen-yinke', label: '陳寅恪', type: 'person', aliases: ['陳寅恪先生', '陳先生', '寅恪'] },
  jiang: { id: 'person-jiang-tianshu', label: '蔣天樞', type: 'person', aliases: ['蔣天樞教授', '蔣天樞先生'] },
  qian: { id: 'person-qian-qianyi', label: '錢謙益', type: 'person', aliases: ['牧齋', '牧翁'] },
  liu: { id: 'person-liu-rushi', label: '柳如是', type: 'person', aliases: ['河東君', '阿雲'] },
  gu: { id: 'person-gu-ling', label: '顧苓', type: 'person', aliases: ['顧云美', '云美'] },
  chenZilong: { id: 'person-chen-zilong', label: '陳子龍', type: 'person', aliases: ['陳臥子'] },
  cheng: { id: 'person-cheng-jiashui', label: '程嘉燧', type: 'person', aliases: ['程孟陽'] },
  xie: { id: 'person-xie-sanbin', label: '謝三賓', type: 'person', aliases: ['謝象三'] },
  song: { id: 'person-song-zhengyu', label: '宋徵輿', type: 'person', aliases: ['宋轅文', '宋讓木'] },
  li: { id: 'person-li-daiwen', label: '李待問', type: 'person', aliases: ['李存我'] },
  yu: { id: 'person-yu-mingzhen', label: '俞明震', type: 'person', aliases: ['俞觚齋先生', '俞先生'] },
};
const publicNote = (id, unitId, text, basis) => ({
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
const blockId = (file, sequence) => `lrs-f${file}-b${String(sequence).padStart(4, '0')}`;

const specs = [
  {
    id: 'front-matter-1980-publisher-note',
    filename: 'front-matter-1980-publisher-note.json',
    label: '卷前・一九八〇年出版説明',
    section: '卷前・一九八〇年出版説明',
    sectionId: 'front-matter',
    sectionOrder: 0,
    sourceFileOrder: 1,
    file: 144,
    to: 5,
    attribution: publisher,
    function: 'publisher-edition-statement',
    entities: [people.chen, people.jiang],
    note: {
      id: 'lrs-ann-front-1980-attribution',
      text: '本篇以「編輯部」「我們」自稱，末署上海古籍出版社；是出版社的一九八〇年出版說明，不是陳寅恪正文。',
      basis: [blockId(144, 4), blockId(144, 5)],
    },
  },
  {
    id: 'front-matter-author-chronology-note',
    filename: 'front-matter-author-chronology-note.json',
    label: '卷前・附記',
    section: '卷前・附記',
    sectionId: 'front-matter',
    sectionOrder: 0,
    sourceFileOrder: 2,
    file: 145,
    to: 3,
    attribution: chen,
    function: 'author-chronology-principles',
    entities: [people.chen],
    completesSection: true,
  },
  {
    id: 'chapter-1-red-bean-poem',
    filename: 'chapter-1-red-bean-poem.json',
    label: '第一章・詠紅豆并序',
    section: '第一章　緣起・詠紅豆并序',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 0,
    file: 146,
    to: 4,
    attribution: chen,
    function: 'opening-poem-and-preface',
    entities: [people.chen, people.qian, people.liu],
  },
  {
    id: 'chapter-1-writing-origin',
    filename: 'chapter-1-writing-origin.json',
    label: '第一章・題牧齋初學集與撰著緣起',
    section: '第一章　緣起・題牧齋初學集與撰著緣起',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 1,
    file: 147,
    to: 5,
    attribution: chen,
    function: 'second-opening-poem-and-writing-origin',
    entities: [
      people.chen, people.qian, people.liu, people.gu, people.chenZilong,
      people.cheng, people.xie, people.song, people.li, people.yu,
    ],
    note: {
      id: 'lrs-ann-chapter-1-mixed-quotation',
      text: '本選段的序、詩與論述屬陳寅恪；其中明引錢謙益、顧苓等人的詩文仍是引文，不因選段主要文字責任而改歸陳氏。',
      basis: [blockId(147, 2), blockId(147, 3), blockId(147, 5)],
    },
  },
  {
    id: 'chapter-1-poems-1955',
    filename: 'chapter-1-poems-1955.json',
    label: '第一章・乙未著書感懷',
    section: '第一章　緣起・乙未著書感懷',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 2,
    file: 148,
    to: 3,
    attribution: chen,
    function: 'writing-reflection-poems',
    entities: [people.qian, people.liu, people.chenZilong, people.song],
  },
  {
    id: 'chapter-1-poem-old-calendar-new-year',
    filename: 'chapter-1-poem-old-calendar-new-year.json',
    label: '第一章・乙未舊曆元旦',
    section: '第一章　緣起・乙未舊曆元旦',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 3,
    file: 149,
    to: 2,
    attribution: chen,
    function: 'writing-reflection-poem',
    entities: [people.qian, people.liu],
  },
  {
    id: 'chapter-1-poem-huang-yuqi',
    filename: 'chapter-1-poem-huang-yuqi.json',
    label: '第一章・完稿無期感賦',
    section: '第一章　緣起・完稿無期感賦',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 4,
    file: 150,
    to: 2,
    attribution: chen,
    function: 'writing-reflection-poem',
    entities: [people.qian, people.liu],
  },
  {
    id: 'chapter-1-poem-age-67',
    filename: 'chapter-1-poem-age-67.json',
    label: '第一章・六十七歲生日',
    section: '第一章　緣起・六十七歲生日',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 5,
    file: 151,
    to: 2,
    attribution: chen,
    function: 'writing-reflection-poem',
    entities: [],
  },
  {
    id: 'chapter-1-poem-age-68',
    filename: 'chapter-1-poem-age-68.json',
    label: '第一章・六十八初度',
    section: '第一章　緣起・六十八初度',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 6,
    file: 152,
    to: 2,
    attribution: chen,
    function: 'writing-reflection-poem',
    entities: [people.qian, people.liu],
  },
  {
    id: 'chapter-1-poem-second-response',
    filename: 'chapter-1-poem-second-response.json',
    label: '第一章・用前題意再賦',
    section: '第一章　緣起・用前題意再賦',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 7,
    file: 153,
    to: 2,
    attribution: chen,
    function: 'writing-reflection-poem',
    entities: [people.qian, people.liu],
  },
  {
    id: 'chapter-1-poems-completion',
    filename: 'chapter-1-poems-completion.json',
    label: '第一章・粗告完畢感賦',
    section: '第一章　緣起・粗告完畢感賦',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 8,
    file: 154,
    to: 3,
    attribution: chen,
    function: 'writing-completion-poems',
    entities: [people.chen, people.qian, people.liu],
  },
  {
    id: 'chapter-1-method-and-examples',
    filename: 'chapter-1-method-and-examples.json',
    label: '第一章・釋證範圍與義例',
    section: '第一章　緣起・釋證範圍與義例',
    sectionId: 'chapter-1',
    sectionOrder: 1,
    sourceFileOrder: 9,
    file: 154,
    from: 4,
    to: 29,
    attribution: chen,
    function: 'research-scope-method-and-examples',
    entities: [people.chen, people.qian, people.liu],
    completesSection: true,
  },
];

for (const spec of specs) {
  const sourceFile = `OEBPS/text00${spec.file}.html`;
  const unitId = `lrs-f${spec.file}-unit-01`;
  const from = spec.from ?? 1;
  const payload = {
    schemaVersion: '2.1.0',
    work: '柳如是別傳',
    workAuthor: '陳寅恪',
    textAttribution: spec.attribution,
    section: spec.section,
    scope: {
      sourceFile,
      fromBlock: blockId(spec.file, from),
      contentFromBlock: blockId(spec.file, from),
      toBlock: blockId(spec.file, spec.to),
      status: 'first editorial pass',
    },
    readingUnits: [{
      id: unitId,
      blocks: Array.from(
        { length: spec.to - from + 1 },
        (_, index) => blockId(spec.file, from + index),
      ),
    }],
    editorialDraftPolicy: {
      status: 'machine-drafted',
      publicStatus: 'withhold',
      wordingBy: 'project-editor',
      appliesTo: ['editorialDrafts'],
    },
    editorialDrafts: {
      units: [{ id: unitId, function: spec.function }],
      sourceBridges: [],
      chronology: [],
      entities: spec.entities,
      readerBehaviors: [],
    },
    publicAnnotations: spec.note
      ? [publicNote(spec.note.id, unitId, spec.note.text, spec.note.basis)]
      : [],
    annotationAudits: [],
  };
  await writeFile(new URL(spec.filename, materialRoot), `${JSON.stringify(payload, null, 2)}\n`);
}

const manifestUrl = new URL('reading-views.json', materialRoot);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
const generatedIds = new Set(specs.map((spec) => spec.id));
const retained = manifest.selections.filter((selection) => !generatedIds.has(selection.id));
manifest.selections = [
  ...retained,
  ...specs.map(({
    id, filename: material, label, sectionId, sectionOrder, sourceFileOrder, completesSection = false,
  }) => ({
    id, label, sectionId, sectionOrder, sourceFileOrder, completesSection, material,
  })),
].filter(Boolean);
manifest.selections.sort((a, b) => (
  a.sectionOrder - b.sectionOrder || a.sourceFileOrder - b.sourceFileOrder
));
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Wrote ${specs.length} opening materials and ${manifest.selections.length} ordered selections.`);
