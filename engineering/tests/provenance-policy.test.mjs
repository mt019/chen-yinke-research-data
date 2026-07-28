import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  validateLosslessTranscription,
  validatePublicAnnotation,
} from '../lib/provenance-policy.mjs';

const scope = new Set(['lrs-f156-b0002', 'lrs-f156-b0003']);
const validParaphrase = {
  id: 'lrs-ann-material-stance',
  annotationType: 'author-paraphrase',
  text: '陳寅恪把材料立場納入史料批判。',
  attribution: {
    assertionOwner: 'chen-yinke',
    wordingBy: 'project-editor',
    representation: 'editorial-paraphrase',
  },
  sourceStance: 'explicit',
  basis: ['lrs-f156-b0002', 'lrs-f156-b0003'],
  review: {
    status: 'approved',
    reviewedBy: 'human-editor',
    reviewedAt: '2026-07-29',
  },
  publicStatus: 'public',
};

assert.deepEqual(validatePublicAnnotation(validParaphrase, scope), []);

const disclosedInterpretation = {
  ...structuredClone(validParaphrase),
  id: 'lrs-ann-editor-reading',
  annotationType: 'editorial-inference',
  displayLabel: '編者解讀',
  attribution: {
    assertionOwner: 'project-editor',
    wordingBy: 'project-editor',
    representation: 'editorial-inference',
  },
  review: {
    status: 'draft-disclosed',
    authorizedBy: 'user',
    authorizedAt: '2026-07-29',
  },
};
assert.deepEqual(validatePublicAnnotation(disclosedInterpretation, scope), []);

const undisclosedDraft = structuredClone(disclosedInterpretation);
delete undisclosedDraft.displayLabel;
assert(validatePublicAnnotation(undisclosedDraft, scope).some((error) => error.includes('displayLabel')));

const invalidAttribution = structuredClone(validParaphrase);
invalidAttribution.attribution.assertionOwner = 'project-editor';
assert(validatePublicAnnotation(invalidAttribution, scope).some((error) => error.includes('assertionOwner')));

const machineReviewed = structuredClone(validParaphrase);
machineReviewed.review.reviewedBy = 'codex-ai';
assert(validatePublicAnnotation(machineReviewed, scope).some((error) => error.includes('人工審核者')));

const missingBasis = structuredClone(validParaphrase);
missingBasis.basis = [];
assert(validatePublicAnnotation(missingBasis, scope).some((error) => error.includes('basis')));

const outsideScope = structuredClone(validParaphrase);
outsideScope.basis = ['lrs-f156-b9999'];
assert(validatePublicAnnotation(outsideScope, scope).some((error) => error.includes('超出')));

const externalWithoutSource = {
  ...structuredClone(validParaphrase),
  id: 'lrs-ann-song-name',
  annotationType: 'external-authority',
  attribution: {
    assertionOwner: 'external-authority',
    wordingBy: 'project-editor',
    representation: 'source-synthesis',
  },
};
assert(validatePublicAnnotation(externalWithoutSource, scope).some((error) => error.includes('sources')));

const sourceText = '寅恪案，原文（附注）';
const authorAttribution = {
  assertionOwner: 'chen-yinke',
  displayLabel: '陳寅恪',
  representation: 'author-text',
};
const sourceBlock = {
  recordType: 'source-transcription',
  author: '陳寅恪',
  textAttribution: authorAttribution,
  sourceText,
  sourceTextSha256: createHash('sha256').update(sourceText).digest('hex'),
  segments: [
    { kind: 'author-marker', text: '寅恪案，' },
    { kind: 'text', text: '原文' },
    { kind: 'note', text: '（附注）' },
  ],
};
assert.deepEqual(validateLosslessTranscription(sourceBlock, sourceText, authorAttribution), []);

const altered = structuredClone(sourceBlock);
altered.segments[1].text = '改寫';
assert(validateLosslessTranscription(altered, sourceText, authorAttribution).some((error) => error.includes('逐字重組')));

const publisherAttribution = {
  assertionOwner: 'shanghai-ancient-books-press',
  displayLabel: '上海古籍出版社',
  representation: 'publisher-preface',
};
const publisherBlock = {
  ...structuredClone(sourceBlock),
  author: '上海古籍出版社',
  textAttribution: publisherAttribution,
};
assert.deepEqual(validateLosslessTranscription(publisherBlock, sourceText, publisherAttribution), []);
assert(validateLosslessTranscription(publisherBlock, sourceText, authorAttribution).some((error) => error.includes('author')));

console.log('provenance policy tests passed: valid cases accepted, unsafe cases rejected.');
