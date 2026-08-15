export const BATCH_CODE_PREFIX = 'BCH';

const BATCH_CODE_PATTERN = /^BCH(\d{4})$/;

export function formatBatchCode(sequence: number): string {
  return `${BATCH_CODE_PREFIX}${String(sequence).padStart(4, '0')}`;
}

export function parseBatchCodeNumber(code: string): number | null {
  const match = code.trim().toUpperCase().match(BATCH_CODE_PATTERN);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  return Number.isNaN(value) ? null : value;
}
