import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../data/processed/chen-yinke-app.json', import.meta.url));
const text = await readFile(source, 'utf8');
const data = JSON.parse(text);

for (const key of ['schemaVersion', 'generatedAt', 'source', 'project', 'materialCoverage', 'volumes']) {
  if (!(key in data)) throw new Error(`Missing required key: ${key}`);
}

if (!Array.isArray(data.volumes) || data.volumes.length !== 7) {
  throw new Error('Expected exactly seven volumes.');
}

if (/\/Users\/|Documents\/NTU|z-library|1lib\.sk|z-lib\.sk/i.test(text)) {
  throw new Error('Processed JSON contains a private path or acquisition-site reference.');
}

const corpusIndexPath = fileURLToPath(new URL('../../data/processed/liu-rushi/index.json', import.meta.url));
const corpusIndexText = await readFile(corpusIndexPath, 'utf8');
const corpusIndex = JSON.parse(corpusIndexText);
const seenIds = new Set();
let paragraphTotal = 0;

for (const section of corpusIndex.sections ?? []) {
  const sectionPath = fileURLToPath(new URL(`../../data/processed/liu-rushi/${section.file}`, import.meta.url));
  const sectionText = await readFile(sectionPath, 'utf8');
  if (/\/Users\/|Documents\/NTU|z-library|1lib\.sk|z-lib\.sk/i.test(sectionText)) {
    throw new Error(`Corpus contains a private path or acquisition-site reference: ${section.file}`);
  }
  const payload = JSON.parse(sectionText);
  if (payload.section?.id !== section.id) throw new Error(`Section mismatch: ${section.file}`);
  if (payload.paragraphs?.length !== section.paragraphCount) {
    throw new Error(`Paragraph count mismatch: ${section.file}`);
  }
  for (const [index, paragraph] of payload.paragraphs.entries()) {
    if (!paragraph.id || seenIds.has(paragraph.id)) throw new Error(`Duplicate or missing paragraph id: ${paragraph.id}`);
    if (paragraph.sequence !== index + 1) throw new Error(`Broken sequence in ${section.file}: ${paragraph.id}`);
    if (!paragraph.text?.trim()) throw new Error(`Empty paragraph: ${paragraph.id}`);
    seenIds.add(paragraph.id);
    paragraphTotal += 1;
  }
}

if (paragraphTotal !== corpusIndex.totals?.paragraphCount) {
  throw new Error(`Corpus total mismatch: ${paragraphTotal}`);
}

const editionRoot = new URL('../../data/processed/liu-rushi-edition/', import.meta.url);
const editionIndex = JSON.parse(await readFile(new URL('index.json', editionRoot), 'utf8'));
const editionIds = new Set();
let editionBlockTotal = 0;
let editionCharacterTotal = 0;
let editionImageTotal = 0;

for (const file of editionIndex.files ?? []) {
  const payload = JSON.parse(await readFile(new URL(file.file, editionRoot), 'utf8'));
  if (payload.blocks?.length !== file.blockCount) throw new Error(`Edition block count mismatch: ${file.file}`);
  for (const [index, block] of payload.blocks.entries()) {
    if (!block.id || editionIds.has(block.id)) throw new Error(`Duplicate edition block id: ${block.id}`);
    if (block.sequence !== index + 1) throw new Error(`Broken edition sequence: ${block.id}`);
    editionIds.add(block.id);
    editionBlockTotal += 1;
    editionCharacterTotal += block.text.length;
    editionImageTotal += block.nodes.filter((node) => node.type === 'image').length;
  }
}

const glyphInventory = JSON.parse(await readFile(new URL('glyph-inventory.json', editionRoot), 'utf8'));
for (const asset of glyphInventory.assets ?? []) {
  await access(new URL(asset.file, editionRoot));
}

if (editionBlockTotal !== editionIndex.totals?.blockCount) throw new Error('Edition total block mismatch.');
if (editionCharacterTotal !== editionIndex.totals?.characterCount) throw new Error('Edition total character mismatch.');
if (editionImageTotal !== editionIndex.totals?.imageOccurrenceCount) throw new Error('Edition image occurrence mismatch.');
if (glyphInventory.assets?.length !== editionIndex.totals?.uniqueImageCount) throw new Error('Edition image inventory mismatch.');

console.log(
  `Validated ${data.volumes.length} volumes, ${paragraphTotal} plain paragraphs, `
  + `${editionBlockTotal} edition blocks, and ${editionImageTotal} image occurrences.`,
);
