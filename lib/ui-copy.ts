const UI_ACRONYMS: Readonly<Record<string, string>> = {
  '3d': '3D',
  avs: 'AVS',
  cgy: 'cGy',
  cpt: 'CPT',
  crms: 'CRMS',
  curerays: 'CureRays',
  dot: 'DOT',
  ecw: 'eCW',
  eclinicalworks: 'eClinicalWorks',
  hipaa: 'HIPAA',
  igsrt: 'IGSRT',
  md: 'MD',
  mfa: 'MFA',
  mrn: 'MRN',
  'n/a': 'N/A',
  na: 'N/A',
  np: 'NP',
  otv: 'OTV',
  pa: 'PA',
  pdf: 'PDF',
  phi: 'PHI',
  rad: 'RAD',
  rtt: 'RTT',
  ssd: 'SSD',
  tx: 'Tx',
  us: 'US',
};

const UI_MINOR_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'vs',
  'with',
]);

function formatUiWord(word: string, index: number, lastIndex: number): string {
  const normalized = word.toLowerCase();
  const acronym = UI_ACRONYMS[normalized];

  if (acronym) return acronym;
  if (index > 0 && index < lastIndex && UI_MINOR_WORDS.has(normalized)) return normalized;

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatUiLabel(value: string | null | undefined, fallback = 'Not Set'): string {
  const normalized = String(value ?? '').trim().replaceAll('_', ' ').replace(/\s+/g, ' ');
  if (!normalized) return fallback;

  const words = normalized.split(' ');
  return words
    .map((word, index) =>
      word
        .split('-')
        .map((part) => formatUiWord(part, index, words.length - 1))
        .join('-'),
    )
    .join(' ');
}
