import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const materialPath = path.join(
  root,
  'data/materials/liu-rushi-edition/pilot-third-chapter-opening.json',
);
const pilot = JSON.parse(fs.readFileSync(materialPath, 'utf8'));

const decisions = {
  'lrs-ann-u01-interpretation-01': ['retain-editorial-inference', '「史料批判」是編者對陳氏方法的抽象命名，不是原文自稱。'],
  'lrs-ann-u02-interpretation-01': ['author-paraphrase-candidate', '陳氏由嫁女瞿氏、懸掛御書等事，明言顧苓為不忘故國舊君的明末遺老。'],
  'lrs-ann-u03-interpretation-01': ['author-paraphrase-candidate', '原文明言顧苓之見解與當日吳越勝流不同。'],
  'lrs-ann-u03-interpretation-02': ['author-paraphrase-candidate', '原文明言顧苓推重河東君「當與錢柳同心復明一端有關」。'],
  'lrs-ann-u04-interpretation-01': ['author-paraphrase-candidate', '原文以疑問及「俟考」提出兩項可能，轉述保留未決語氣。'],
  'lrs-ann-u05-interpretation-01': ['author-paraphrase-candidate', '原文明列四本，並稱范本最善、據以迻錄。'],
  'lrs-ann-u06-interpretation-01': ['author-paraphrase-candidate', '「雲間孝廉」為陳子龍及「可謂特識」均見寅恪案原文。'],
  'lrs-ann-u06-interpretation-02': ['author-paraphrase-candidate', '三項差誤均由寅恪案逐項列出。'],
  'lrs-ann-u07-interpretation-01': ['author-paraphrase-candidate', '顧傳缺載範圍及「當有所隱諱」均為寅恪案明文。'],
  'lrs-ann-u07-interpretation-02': ['author-paraphrase-candidate', '材料稀少、直接材料為主及間接傳聞補充均為原文方法說明。'],
  'lrs-ann-u08-interpretation-01': ['author-paraphrase-candidate', '原文由王澐與陳氏家庭往來推知其較熟悉柳氏早歲事蹟。'],
  'lrs-ann-u08-interpretation-02': ['author-paraphrase-candidate', '原文明言閱讀王澐著述須「博考而慎取」，並交代門戶立場與知情關係。'],
  'lrs-ann-u09-interpretation-01': ['author-paraphrase-candidate', '張氏掌家、擇妾及不能相容的推斷均由陳氏展開。'],
  'lrs-ann-u09-interpretation-02': ['author-paraphrase-candidate', '兩方情感未改及家庭權力造成分離均為寅恪案明文判斷。'],
  'lrs-ann-u10-interpretation-01': ['author-paraphrase-candidate', '原文依錢肇鼇生年較晚，判定其記述得自輾轉間接傳聞。'],
  'lrs-ann-u10-interpretation-02': ['author-paraphrase-candidate', '原文明列王、錢與陳子龍、宋徵璧材料的主從參證關係。'],
  'lrs-ann-u11-interpretation-01': ['author-paraphrase-candidate', '原文先稱錢說頗與王說相似，再綜合兩說提出婢妾與所屬之家問題。'],
  'lrs-ann-u11-interpretation-02': ['author-paraphrase-candidate', '「何家何人」及年代正是原文明列待考定的兩問。'],
  'lrs-ann-u12-interpretation-01': ['author-paraphrase-candidate', '原文明定白龍潭親聞關係，並稱宋詩為早期事蹟最重要材料之一。'],
  'lrs-ann-u12-interpretation-02': ['author-paraphrase-candidate', '時間與地理兩條辨識條件由陳氏在下一段明確析出。'],
  'lrs-ann-u13-interpretation-01': ['author-paraphrase-candidate', '原文明言檢索崇禎朝宰相籍貫後，惟周道登適合。'],
  'lrs-ann-u13-interpretation-02': ['author-paraphrase-candidate', '五年、六年及「家居一年卒」異文均由原文並列待考。'],
  'lrs-ann-u14-interpretation-01': ['author-paraphrase-candidate', '乾隆志承康熙志、卒年另補及潘氏材料闕載，均為陳氏考證結論。'],
  'lrs-ann-u14-interpretation-02': ['author-paraphrase-candidate', '原文明言五年或六年「未敢確定」。'],
  'lrs-ann-u14-interpretation-03': ['author-paraphrase-candidate', '原文明定崇禎四年，並指向下引詩作作證。'],
  'lrs-ann-u15-interpretation-01': ['author-paraphrase-candidate', '三年前仍可稱「新」及不得泥執數旬數月，均是原文論證。'],
  'lrs-ann-u16-interpretation-01': ['author-paraphrase-candidate', '「平津」「丞相」指周道登及柳氏初為其妾，均為原文明斷。'],
  'lrs-ann-u16-interpretation-02': ['author-paraphrase-candidate', '原文明言婢妾界線難分，並判錢氏「寵姬」說可信。'],
  'lrs-ann-u16-interpretation-03': ['author-paraphrase-candidate', '原文對周母在世明言可能但無證據、未敢確定。'],
};

const repairs = {
  'lrs-ann-u02-interpretation-01': {
    text: '陳寅恪據顧苓嫁女瞿氏、懸掛崇禎帝御書等事，認為顧苓是不忘故國舊君的明末遺老。',
    addBasis: ['lrs-f156-b0008'],
  },
  'lrs-ann-u10-interpretation-01': {
    text: '錢肇鼇生年較晚，其《質直談耳》所述柳如是早歲事蹟得自輾轉間接傳聞。',
  },
  'lrs-ann-u11-interpretation-01': {
    text: '陳寅恪指出錢肇鼇所述頗有與王澐相似之處，並綜合兩說追問柳如是最初所屬何家、身分為婢或妾。',
    addBasis: ['lrs-f156-b0033', 'lrs-f156-b0045'],
  },
  'lrs-ann-u12-interpretation-01': {
    addBasis: ['lrs-f156-b0053'],
  },
  'lrs-ann-u12-interpretation-02': {
    text: '陳寅恪把「吳江故相」拆成兩項人物辨識條件：距崇禎六年不久曾任宰輔，且籍貫吳江。',
    addBasis: ['lrs-f156-b0053'],
  },
};

const autumnPondCandidateIds = new Set([
  'lrs-ann-u17-interpretation-01',
  'lrs-ann-u18-interpretation-01',
  'lrs-ann-u18-interpretation-02',
  'lrs-ann-u19-interpretation-01',
  'lrs-ann-u19-interpretation-02',
  'lrs-ann-u20-interpretation-01',
  'lrs-ann-u20-interpretation-02',
  'lrs-ann-u20-interpretation-03',
  'lrs-ann-u21-interpretation-01',
  'lrs-ann-u21-interpretation-02',
  'lrs-ann-u22-interpretation-01',
  'lrs-ann-u22-interpretation-02',
  'lrs-ann-u23-interpretation-01',
  'lrs-ann-u24-interpretation-01',
  'lrs-ann-u24-interpretation-02',
  'lrs-ann-u25-interpretation-01',
  'lrs-ann-u25-interpretation-02',
  'lrs-ann-u26-interpretation-01',
  'lrs-ann-u27-interpretation-01',
  'lrs-ann-u28-interpretation-01',
  'lrs-ann-u28-interpretation-02',
  'lrs-ann-u29-interpretation-01',
  'lrs-ann-u30-interpretation-01',
  'lrs-ann-u30-interpretation-02',
  'lrs-ann-u31-interpretation-01',
  'lrs-ann-u32-interpretation-01',
  'lrs-ann-u32-interpretation-02',
]);
const rationaleForStance = {
  explicit: '原文直接作此說明；預審確認轉述沒有提高命題強度。',
  argued: '原文在所列區塊展開同一論證；預審確認轉述未加入原文以外的新事實。',
  inferred: '原文本身以推論方式提出此說；預審確認轉述保留推論語氣。',
  'open-question': '原文明示疑問、可能或未能確定；預審確認轉述保留未決狀態。',
};
const inferences = pilot.publicAnnotations.filter(
  (annotation) => annotation.annotationType === 'editorial-inference',
);
for (const annotation of inferences) {
  if (autumnPondCandidateIds.has(annotation.id)) {
    decisions[annotation.id] = [
      'author-paraphrase-candidate',
      rationaleForStance[annotation.sourceStance],
    ];
  }
}
if (inferences.length !== Object.keys(decisions).length) {
  throw new Error(
    `Expected ${Object.keys(decisions).length} audited editorial inferences, found ${inferences.length}`,
  );
}
for (const annotation of inferences) {
  const decision = decisions[annotation.id];
  if (!decision) throw new Error(`Missing audit decision: ${annotation.id}`);
  const repair = repairs[annotation.id];
  if (repair?.text) annotation.text = repair.text;
  if (repair?.addBasis) {
    annotation.basis = [...new Set([...annotation.basis, ...repair.addBasis])];
  }
}

pilot.annotationAudits = inferences.map((annotation) => {
  const [recommendation, rationale] = decisions[annotation.id];
  return {
    annotationId: annotation.id,
    auditedAt: '2026-07-29',
    auditedBy: 'codex-editorial-audit',
    auditKind: 'machine-assisted-editorial-audit',
    recommendation,
    rationale,
    basisChecked: annotation.basis,
    humanApprovalRequired: recommendation === 'author-paraphrase-candidate',
  };
});

fs.writeFileSync(materialPath, `${JSON.stringify(pilot, null, 2)}\n`);
console.log(
  `Audited ${inferences.length} annotations: `
  + `${pilot.annotationAudits.filter((item) => item.recommendation === 'author-paraphrase-candidate').length} author-paraphrase candidates, `
  + `${pilot.annotationAudits.filter((item) => item.recommendation === 'retain-editorial-inference').length} retained editorial inference.`,
);
