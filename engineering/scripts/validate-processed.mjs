import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
  publicBlockAllowedKeys,
  publicUnitAllowedKeys,
  validateLosslessTranscription,
  validatePublicAnnotation,
} from '../lib/provenance-policy.mjs';

const privatePattern = /\/Users\/|Documents\/NTU|file:\/\/|\\\\Users\\\\|\/home\/|z-library|1lib\.sk|z-lib\.sk/i;
const assertPublic = (text, label) => {
  if (privatePattern.test(text)) throw new Error(`${label} contains a private reference.`);
};
const readJson = async (url, label) => {
  const text = await readFile(url, 'utf8');
  assertPublic(text, label);
  return [JSON.parse(text), text];
};

const [app] = await readJson(new URL('../../data/processed/chen-yinke-app.json', import.meta.url), 'App JSON');
if (!Array.isArray(app.volumes) || app.volumes.length !== 7) throw new Error('Expected seven volumes.');

const corpusRoot = new URL('../../data/processed/liu-rushi/', import.meta.url);
const [corpus] = await readJson(new URL('index.json', corpusRoot), 'Corpus index');
const corpusIds = new Set();
let paragraphTotal = 0;
for (const section of corpus.sections ?? []) {
  const [payload] = await readJson(new URL(section.file, corpusRoot), section.file);
  if (payload.section?.id !== section.id || payload.paragraphs?.length !== section.paragraphCount) {
    throw new Error(`Corpus section mismatch: ${section.file}`);
  }
  for (const [index, paragraph] of payload.paragraphs.entries()) {
    if (!paragraph.id || corpusIds.has(paragraph.id) || paragraph.sequence !== index + 1 || !paragraph.text?.trim()) {
      throw new Error(`Invalid corpus paragraph: ${paragraph.id}`);
    }
    corpusIds.add(paragraph.id);
    paragraphTotal += 1;
  }
}
if (paragraphTotal !== corpus.totals?.paragraphCount) throw new Error('Corpus total mismatch.');

const editionRoot = new URL('../../data/processed/liu-rushi-edition/', import.meta.url);
const [editionIndex] = await readJson(new URL('index.json', editionRoot), 'Edition index');
const sourceByName = new Map();
const editionIds = new Set();
let editionBlockTotal = 0;
let editionCharacterTotal = 0;
let editionImageTotal = 0;
for (const file of editionIndex.files ?? []) {
  const [payload] = await readJson(new URL(file.file, editionRoot), file.file);
  if (payload.blocks?.length !== file.blockCount) throw new Error(`Edition count mismatch: ${file.file}`);
  sourceByName.set(file.sourceFile, payload);
  for (const [index, block] of payload.blocks.entries()) {
    if (!block.id || editionIds.has(block.id) || block.sequence !== index + 1) {
      throw new Error(`Invalid edition block: ${block.id}`);
    }
    editionIds.add(block.id);
    editionBlockTotal += 1;
    editionCharacterTotal += block.text.length;
    editionImageTotal += block.nodes.filter((node) => node.type === 'image').length;
  }
}
if (
  editionBlockTotal !== editionIndex.totals?.blockCount
  || editionCharacterTotal !== editionIndex.totals?.characterCount
  || editionImageTotal !== editionIndex.totals?.imageOccurrenceCount
) throw new Error('Edition totals mismatch.');
const [glyphInventory] = await readJson(new URL('glyph-inventory.json', editionRoot), 'Glyph inventory');
if (glyphInventory.assets?.length !== editionIndex.totals?.uniqueImageCount) throw new Error('Glyph inventory mismatch.');
for (const asset of glyphInventory.assets ?? []) await access(new URL(asset.file, editionRoot));

const materialsRoot = new URL('../../data/materials/liu-rushi-edition/', import.meta.url);
const [manifest] = await readJson(new URL('reading-views.json', materialsRoot), 'Reading manifest');
const [readingView, readingText] = await readJson(new URL('reading-view.json', editionRoot), 'Reading view');
if (readingView.schemaVersion !== '3.0.0' || readingView.work !== manifest.work) {
  throw new Error('Reading-view schema/work mismatch.');
}
if (readingView.selections?.length !== manifest.selections?.length) throw new Error('Selection count mismatch.');

const selectionIds = new Set();
let selectedBlocks = 0;
for (const [selectionIndex, spec] of manifest.selections.entries()) {
  if (selectionIds.has(spec.id)) throw new Error(`Duplicate selection: ${spec.id}`);
  selectionIds.add(spec.id);
  const [material] = await readJson(new URL(spec.material, materialsRoot), spec.material);
  const view = readingView.selections[selectionIndex];
  if (view?.id !== spec.id || view.sectionId !== spec.sectionId) throw new Error(`Selection order mismatch: ${spec.id}`);
  if (material.schemaVersion !== '2.1.0' || material.workAuthor !== manifest.workAuthor) {
    throw new Error(`Material schema/work author mismatch: ${spec.id}`);
  }
  const attribution = material.textAttribution;
  const allowedOwners = new Map([
    ['author-text', 'chen-yinke'],
    ['publisher-preface', 'shanghai-ancient-books-press'],
  ]);
  if (allowedOwners.get(attribution?.representation) !== attribution?.assertionOwner) {
    throw new Error(`Unsafe text attribution: ${spec.id}`);
  }
  if (JSON.stringify(view.textAttribution) !== JSON.stringify(attribution)) {
    throw new Error(`Stale text attribution: ${spec.id}`);
  }
  const source = sourceByName.get(material.scope?.sourceFile);
  if (!source) throw new Error(`Missing source file: ${material.scope?.sourceFile}`);
  const sourceIds = source.blocks.map((block) => block.id);
  const from = sourceIds.indexOf(material.scope.contentFromBlock);
  const to = sourceIds.indexOf(material.scope.toBlock);
  if (from < 0 || to < from) throw new Error(`Invalid scope: ${spec.id}`);
  const expectedIds = sourceIds.slice(from, to + 1);
  const scopeIds = new Set(expectedIds);
  const unitIds = new Set();
  const actualIds = [];
  for (const [unitIndex, unit] of (material.readingUnits ?? []).entries()) {
    if (!unit.id || unitIds.has(unit.id) || Object.keys(unit).some((key) => !['id', 'blocks'].includes(key))) {
      throw new Error(`Invalid reading unit: ${unit.id}`);
    }
    unitIds.add(unit.id);
    actualIds.push(...unit.blocks);
    const viewUnit = view.units?.[unitIndex];
    if (viewUnit?.id !== unit.id) throw new Error(`View unit mismatch: ${unit.id}`);
    for (const key of Object.keys(viewUnit)) {
      if (!publicUnitAllowedKeys.has(key)) throw new Error(`Editorial field leaked into unit: ${key}`);
    }
    const expectedAnnotations = (material.publicAnnotations ?? [])
      .filter((annotation) => annotation.target.unitId === unit.id).map((annotation) => annotation.id);
    if ((viewUnit.annotationIds ?? []).join() !== expectedAnnotations.join()) {
      throw new Error(`Annotation grouping mismatch: ${unit.id}`);
    }
    for (const block of viewUnit.blocks ?? []) {
      const sourceBlock = source.blocks.find((row) => row.id === block.id);
      for (const key of Object.keys(block)) {
        if (!publicBlockAllowedKeys.has(key)) throw new Error(`Editorial field leaked into block: ${block.id}.${key}`);
      }
      const errors = validateLosslessTranscription(block, sourceBlock?.text, attribution);
      if (errors.length) throw new Error(`Non-lossless block ${block.id}: ${errors.join('; ')}`);
      const expectedSourceRef = material.publicQuoteAttributions?.[block.id];
      if (JSON.stringify(block.sourceRef) !== JSON.stringify(expectedSourceRef)) {
        throw new Error(`Stale or unreviewed quote attribution: ${block.id}`);
      }
      if (expectedSourceRef && !sourceBlock.type.startsWith('styled-source')) {
        throw new Error(`Quote attribution targets a non-source block: ${block.id}`);
      }
      const placeholders = [...sourceBlock.text].filter((char) => char === '\uFFFC').length;
      const glyphs = block.segments.filter((segment) => segment.kind === 'inline-glyph');
      if (glyphs.length !== placeholders) throw new Error(`Inline glyph mismatch: ${block.id}`);
      for (const glyph of glyphs) {
        if (!/^\/chen-yinke\/glyphs\/[A-Za-z0-9._-]+\.(gif|png|webp)$/.test(glyph.asset ?? '')) {
          throw new Error(`Unsafe glyph path: ${block.id}`);
        }
        await access(new URL(`assets/${glyph.asset.split('/').at(-1)}`, editionRoot));
      }
    }
  }
  if (actualIds.join() !== expectedIds.join()) throw new Error(`Non-contiguous selection: ${spec.id}`);
  if (view.scope.blockCount !== expectedIds.length) throw new Error(`Selection count mismatch: ${spec.id}`);
  selectedBlocks += expectedIds.length;

  const annotationIds = new Set();
  for (const annotation of material.publicAnnotations ?? []) {
    if (annotationIds.has(annotation.id)) throw new Error(`Duplicate annotation: ${annotation.id}`);
    annotationIds.add(annotation.id);
    const errors = validatePublicAnnotation(annotation, scopeIds);
    if (errors.length || !unitIds.has(annotation.target?.unitId)) {
      throw new Error(`Unsafe annotation ${annotation.id}: ${errors.join('; ')}`);
    }
  }
  if (JSON.stringify(view.publicAnnotations) !== JSON.stringify(material.publicAnnotations)) {
    throw new Error(`Stale annotations: ${spec.id}`);
  }
  for (const entity of view.entities ?? []) {
    if (entity.recordType !== 'literal-name-index' || entity.provenance?.biographicalAnnotation !== 'withheld') {
      throw new Error(`Unsafe entity: ${entity.id}`);
    }
    for (const mention of entity.mentions ?? []) {
      const text = source.blocks.find((row) => row.id === mention.blockId)?.text ?? '';
      if (!scopeIds.has(mention.blockId) || !text.includes(mention.matchedText)) {
        throw new Error(`Non-literal entity mention: ${entity.id}`);
      }
    }
  }
  for (const forbidden of ['chronology', 'sourceBridges', 'editorialDrafts', 'annotationAudits']) {
    if (forbidden in view) throw new Error(`Withheld field leaked: ${spec.id}.${forbidden}`);
  }
}

const progress = readingView.workProgress;
if (
  progress.totalBlocks !== editionBlockTotal
  || progress.selectedBlocks !== selectedBlocks
  || progress.sectionCount !== corpus.sections.length
) throw new Error('Whole-book progress mismatch.');
for (const [order, section] of progress.sections.entries()) {
  const sourceSection = corpus.sections[order];
  if (
    section.id !== sourceSection.id
    || section.order !== order
    || section.totalParagraphs !== sourceSection.paragraphCount
    || section.selectedBlockCount !== readingView.selections
      .filter((selection) => selection.sectionId === section.id)
      .reduce((sum, selection) => sum + selection.scope.blockCount, 0)
  ) throw new Error(`Section progress mismatch: ${section.id}`);
}

const front = readingView.selections[0];
if (
  front.id !== 'front-matter-2020-publisher-note'
  || front.scope.contentFromBlock !== 'lrs-f143-b0001'
  || front.scope.toBlock !== 'lrs-f143-b0007'
  || front.textAttribution.assertionOwner !== 'shanghai-ancient-books-press'
  || !front.units.at(-1).blocks.at(-1).sourceText.includes('上海古籍出版社')
) throw new Error('The first substantive front-matter unit or publisher attribution regressed.');
const chapterThree = readingView.selections.find((selection) => selection.id === 'chapter-3-opening-chronology');
if (
  chapterThree?.scope.contentFromBlock !== 'lrs-f156-b0002'
  || chapterThree?.scope.toBlock !== 'lrs-f156-b0244'
  || chapterThree?.textAttribution.assertionOwner !== 'chen-yinke'
) throw new Error('Third-chapter selection regressed.');
const openingSelections = readingView.selections.filter((selection) => (
  selection.workOrder.sectionOrder < 2
));
const expectedOpeningIds = [
  ...Array.from({ length: 7 }, (_, index) => `lrs-f143-b${String(index + 1).padStart(4, '0')}`),
  ...Array.from({ length: 5 }, (_, index) => `lrs-f144-b${String(index + 1).padStart(4, '0')}`),
  ...Array.from({ length: 3 }, (_, index) => `lrs-f145-b${String(index + 1).padStart(4, '0')}`),
  ...[146, 147, 148, 149, 150, 151, 152, 153].flatMap((file) => {
    const count = ({ 146: 4, 147: 5, 148: 3, 149: 2, 150: 2, 151: 2, 152: 2, 153: 2 })[file];
    return Array.from({ length: count }, (_, index) => (
      `lrs-f${file}-b${String(index + 1).padStart(4, '0')}`
    ));
  }),
  'lrs-f154-b0001',
  'lrs-f154-b0002',
  'lrs-f154-b0003',
  ...Array.from({ length: 26 }, (_, index) => `lrs-f154-b${String(index + 4).padStart(4, '0')}`),
];
const actualOpeningIds = openingSelections.flatMap((selection) => (
  selection.units.flatMap((unit) => unit.blocks.map((block) => block.id))
));
if (actualOpeningIds.join() !== expectedOpeningIds.join()) {
  throw new Error('The 66-block front-matter and chapter-one run is incomplete, reordered, or truncated.');
}
if (
  progress.sections.find((section) => section.id === 'front-matter')?.status !== 'complete'
  || progress.sections.find((section) => section.id === 'chapter-1')?.status !== 'complete'
) throw new Error('Opening progress must preserve complete front matter and chapter one.');
const chapterTwoView = readingView.selections.find((selection) => selection.id === 'chapter-2-complete');
const chapterTwoIds = chapterTwoView?.units.flatMap(
  (unit) => unit.blocks.map((block) => block.id),
) ?? [];
const expectedChapterTwoIds = Array.from(
  { length: 101 },
  (_, index) => `lrs-f155-b${String(index + 1).padStart(4, '0')}`,
);
if (
  chapterTwoIds.join() !== expectedChapterTwoIds.join()
  || chapterTwoView?.units.length !== 10
  || Object.keys(
    JSON.parse(await readFile(new URL('chapter-2-complete.json', materialsRoot), 'utf8'))
      .publicQuoteAttributions,
  ).length !== 44
  || progress.sections.find((section) => section.id === 'chapter-2')?.status !== 'complete'
  || progress.sections.find((section) => section.id === 'chapter-2')?.selectedBlockCount !== 101
) throw new Error('Complete second-chapter coverage, units, quote attribution, or progress regressed.');

assertPublic(readingText, 'Reading view');
console.log(
  `Validated ${app.volumes.length} volumes, ${paragraphTotal} corpus paragraphs, `
  + `${editionBlockTotal} edition blocks, and ${selectedBlocks} selected blocks in whole-book order.`,
);
