import { copyFile, cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const source = resolve(repoRoot, 'data/processed/chen-yinke-app.json');
const defaultTarget = resolve(repoRoot, '../my-canvas-lab/src/data/chenYinke.json');
const target = resolve(process.argv[2] ?? defaultTarget);
const corpusSource = resolve(repoRoot, 'data/processed/liu-rushi');
const corpusTarget = resolve(dirname(target), 'chenYinke/liu-rushi');
const editionSource = resolve(repoRoot, 'data/processed/liu-rushi-edition/reading-view.json');
const editionTarget = resolve(dirname(target), 'chenYinke/liu-rushi-edition/reading-view.json');
const canvasRoot = resolve(dirname(target), '../..');
const manifestTarget = resolve(dirname(target), 'chenYinke.sync.json');
const glyphSourceRoot = resolve(repoRoot, 'data/processed/liu-rushi-edition/assets');
const glyphTargetRoot = resolve(canvasRoot, 'public/chen-yinke/glyphs');

async function jsonFiles(root) {
  const out = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name);
    if (entry.isDirectory()) out.push(...await jsonFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(path);
  }
  return out;
}

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

await import('./validate-processed.mjs');
await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
await cp(corpusSource, corpusTarget, { recursive: true, force: true });
await mkdir(dirname(editionTarget), { recursive: true });
await copyFile(editionSource, editionTarget);
const edition = JSON.parse(await readFile(editionSource, 'utf8'));
const glyphNames = [...new Set(
  edition.selections
    .flatMap((selection) => selection.units)
    .flatMap((unit) => unit.blocks)
    .flatMap((block) => block.segments)
    .filter((segment) => segment.kind === 'inline-glyph')
    .map((segment) => basename(segment.asset)),
)];
await mkdir(glyphTargetRoot, { recursive: true });
const glyphTargets = [];
for (const name of glyphNames) {
  const glyphTarget = resolve(glyphTargetRoot, name);
  await copyFile(resolve(glyphSourceRoot, name), glyphTarget);
  glyphTargets.push(glyphTarget);
}
const syncedFiles = [target, ...await jsonFiles(corpusTarget), editionTarget, ...glyphTargets];
const manifest = {
  source: 'chen-yinke-research-data',
  syncedAt: new Date().toISOString().slice(0, 10),
  files: {},
};
for (const path of syncedFiles) {
  const key = relative(canvasRoot, path).split('\\').join('/');
  manifest.files[key] = sha(await readFile(path));
}
await writeFile(manifestTarget, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Synced ${source} -> ${target}`);
console.log(`Synced ${corpusSource} -> ${corpusTarget}`);
console.log(`Synced ${editionSource} -> ${editionTarget}`);
console.log(`Synced ${glyphTargets.length} inline glyph asset(s) -> ${glyphTargetRoot}`);
console.log(`Wrote ${manifestTarget} (${syncedFiles.length} files)`);
