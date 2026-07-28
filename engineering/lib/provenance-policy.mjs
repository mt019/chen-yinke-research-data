import { createHash } from 'node:crypto';

const annotationRules = {
  'editorial-heading': {
    assertionOwner: 'project-editor',
    representation: 'editorial-heading',
  },
  'editorial-note': {
    assertionOwner: 'project-editor',
    representation: 'editorial-note',
  },
  'author-paraphrase': {
    assertionOwner: 'chen-yinke',
    representation: 'editorial-paraphrase',
  },
  'editorial-inference': {
    assertionOwner: 'project-editor',
    representation: 'editorial-inference',
  },
  'external-authority': {
    assertionOwner: 'external-authority',
    representation: 'source-synthesis',
  },
};

const sourceStances = new Set(['explicit', 'argued', 'inferred', 'open-question']);

export function validatePublicAnnotation(annotation, scopeIds) {
  const errors = [];
  const rule = annotationRules[annotation?.annotationType];

  if (!/^lrs-ann-[a-z0-9-]+$/.test(annotation?.id ?? '')) {
    errors.push('id 必須使用 lrs-ann- 開頭的穩定 slug');
  }
  if (!rule) errors.push('annotationType 不在准許清單');
  if (!annotation?.text?.trim()) errors.push('text 不得為空');
  if (annotation?.verbatim === true) {
    errors.push('publicAnnotations 不得冒充逐字引文；逐字內容只能留在 source-transcription');
  }

  const attribution = annotation?.attribution ?? {};
  if (rule && attribution.assertionOwner !== rule.assertionOwner) {
    errors.push(`${annotation.annotationType} 的 assertionOwner 必須是 ${rule.assertionOwner}`);
  }
  if (rule && attribution.representation !== rule.representation) {
    errors.push(`${annotation.annotationType} 的 representation 必須是 ${rule.representation}`);
  }
  if (attribution.wordingBy !== 'project-editor') {
    errors.push('公開注釋的現代文字必須明確標為 project-editor 撰寫');
  }
  if (annotation?.sourceStance && !sourceStances.has(annotation.sourceStance)) {
    errors.push('sourceStance 不在准許清單');
  }

  if (!annotation?.basis?.length) {
    errors.push('basis 不得為空');
  } else {
    for (const basis of annotation.basis) {
      if (!scopeIds.has(basis)) errors.push(`basis 超出樣章範圍：${basis}`);
    }
  }

  const review = annotation?.review ?? {};
  if (review.status === 'approved') {
    if (!review.reviewedBy || /machine|codex|ai/i.test(review.reviewedBy)) {
      errors.push('reviewedBy 必須記錄非機器的人工審核者角色');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt ?? '')) {
      errors.push('reviewedAt 必須是 YYYY-MM-DD');
    }
  } else if (review.status === 'draft-disclosed') {
    if (review.authorizedBy !== 'user') errors.push('公開未覆核解讀必須由 user 明確允許');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.authorizedAt ?? '')) {
      errors.push('authorizedAt 必須是 YYYY-MM-DD');
    }
    if (!annotation?.displayLabel?.trim()) errors.push('公開未覆核解讀必須有可見的 displayLabel');
  } else {
    errors.push('review.status 必須是 approved 或 draft-disclosed');
  }
  if (annotation?.publicStatus !== 'public') errors.push('publicStatus 必須是 public');

  if (annotation?.annotationType === 'external-authority') {
    if (!annotation.sources?.length) {
      errors.push('external-authority 必須至少有一筆 sources');
    }
    for (const source of annotation.sources ?? []) {
      if (!source.publisher?.trim()) errors.push('外部來源缺 publisher');
      if (!/^https:\/\//.test(source.url ?? '')) errors.push('外部來源 URL 必須使用 HTTPS');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(source.accessedAt ?? '')) {
        errors.push('外部來源缺有效 accessedAt');
      }
    }
  } else if (annotation?.sources?.length) {
    errors.push('只有 external-authority 注釋可以帶 sources；陳氏轉述與編者推論只回指原文 basis');
  }

  return errors;
}

export function validateLosslessTranscription(block, sourceText, expectedAttribution) {
  const errors = [];
  const reconstructed = (block?.segments ?? []).map((segment) => segment.text).join('');
  const digest = createHash('sha256').update(sourceText, 'utf8').digest('hex');

  if (block?.recordType !== 'source-transcription') errors.push('recordType 錯誤');
  if (block?.author !== expectedAttribution?.displayLabel) errors.push('author 錯誤');
  if (JSON.stringify(block?.textAttribution) !== JSON.stringify(expectedAttribution)) {
    errors.push('textAttribution 錯誤');
  }
  if (block?.sourceText !== sourceText) errors.push('sourceText 與底本不一致');
  if (reconstructed !== sourceText) errors.push('segments 無法逐字重組底本');
  if (block?.sourceTextSha256 !== digest) errors.push('sourceTextSha256 不一致');
  return errors;
}

export const publicViewAllowedKeys = new Set([
  'schemaVersion',
  'work',
  'author',
  'textAttribution',
  'chapter',
  'provenancePolicy',
  'scope',
  'units',
  'entities',
  'publicAnnotations',
]);

export const publicUnitAllowedKeys = new Set(['id', 'blocks', 'annotationIds']);

export const publicBlockAllowedKeys = new Set([
  'id',
  'recordType',
  'author',
  'textAttribution',
  'role',
  'sourceText',
  'sourceTextSha256',
  'openQuestion',
  'mixedOwnership',
  'segments',
  'sourceRef',
]);
