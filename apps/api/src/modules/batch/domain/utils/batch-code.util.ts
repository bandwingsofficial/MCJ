export const BATCH_CODE_ROOT = 'MCJ';

/** Prefix used to find all new-format codes: MCJ-MMM-XXX */
export const BATCH_CODE_SCAN_PREFIX = 'MCJ-';

const MONTH_ABBREVIATIONS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

/** New format: MCJ-AUG-001 (sequence may grow beyond 3 digits). */
const BATCH_CODE_PATTERN = /^MCJ-([A-Z]{3})-(\d{3,})$/;

/** @deprecated Legacy MCJ{MMM}{M1|A1|E1|D1}{XXX} codes — kept for parsing old records. */
const LEGACY_TIME_BATCH_CODE_PATTERN = /^MCJ([A-Z]{3})(M1|A1|E1|D1)(\d{3})$/;

/** @deprecated Legacy BCH#### codes — kept for parsing old records. */
const LEGACY_BATCH_CODE_PATTERN = /^BCH(\d{4})$/;

/**
 * Month abbreviation from the batch start date (UTC).
 * Matches the project's existing UTC date conventions.
 */
export function getMonthAbbreviation(date: Date = new Date()): string {
  return MONTH_ABBREVIATIONS[date.getUTCMonth()];
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time value: ${time}`);
  }

  return hours * 60 + minutes;
}

export function buildBatchCodePrefix(month: string): string {
  return `${BATCH_CODE_ROOT}-${month.toUpperCase()}-`;
}

export function formatBatchCode(month: string, sequence: number): string {
  return `${buildBatchCodePrefix(month)}${String(sequence).padStart(3, '0')}`;
}

/**
 * Extract the sequence from a new-format code (MCJ-MMM-XXX).
 * Returns null for legacy / non-matching codes.
 */
export function parseBatchCodeSequence(code: string): number | null {
  const match = code.trim().toUpperCase().match(BATCH_CODE_PATTERN);

  if (!match) {
    return null;
  }

  const value = Number(match[2]);

  return Number.isNaN(value) ? null : value;
}

export function parseBatchCode(code: string): {
  month: string;
  sequence: number;
} | null {
  const match = code.trim().toUpperCase().match(BATCH_CODE_PATTERN);

  if (!match) {
    return null;
  }

  return {
    month: match[1],
    sequence: Number(match[2]),
  };
}

/** @deprecated Legacy numeric parser for BCH#### codes. */
export function parseLegacyBatchCodeNumber(code: string): number | null {
  const match = code.trim().toUpperCase().match(LEGACY_BATCH_CODE_PATTERN);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  return Number.isNaN(value) ? null : value;
}

/** @deprecated Detect old time-slot batch codes. */
export function isLegacyTimeBatchCode(code: string): boolean {
  return LEGACY_TIME_BATCH_CODE_PATTERN.test(code.trim().toUpperCase());
}
