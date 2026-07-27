import { copyFile, cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const source = resolve(repoRoot, 'data/processed/chen-yinke-app.json');
const defaultTarget = resolve(repoRoot, '../my-canvas-lab/src/data/chenYinke.json');
const target = resolve(process.argv[2] ?? defaultTarget);
const corpusSource = resolve(repoRoot, 'data/processed/liu-rushi');
const corpusTarget = resolve(dirname(target), 'chenYinke/liu-rushi');
const editionSource = resolve(repoRoot, 'data/processed/liu-rushi-edition/pilot-view.json');
const editionTarget = resolve(dirname(target), 'chenYinke/liu-rushi-edition/pilot-view.json');

await import('./validate-processed.mjs');
await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
await cp(corpusSource, corpusTarget, { recursive: true, force: true });
await mkdir(dirname(editionTarget), { recursive: true });
await copyFile(editionSource, editionTarget);
console.log(`Synced ${source} -> ${target}`);
console.log(`Synced ${corpusSource} -> ${corpusTarget}`);
console.log(`Synced ${editionSource} -> ${editionTarget}`);
