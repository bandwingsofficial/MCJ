export const BATCH_CODE_ROOT = 'MCJ';

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

export type BatchTimeCode = 'M1' | 'A1' | 'E1' | 'D1';

const BATCH_CODE_PATTERN = /^MCJ([A-Z]{3})(M1|A1|E1|D1)(\d{3})$/;

/** @deprecated Legacy BCH#### codes — kept for parsing old records. */
const LEGACY_BATCH_CODE_PATTERN = /^BCH(\d{4})$/;

export function getMonthAbbreviation(date: Date = new Date()): string {
  return MONTH_ABBREVIATIONS[date.getMonth()];
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

export function getTimeCodeFromTimes(
  startTime: string,
  _endTime: string,
): BatchTimeCode {
  const start = parseTimeToMinutes(startTime);

  // Morning: 10:00 AM to 12:00 PM
  if (start >= 600 && start < 720) {
    return 'M1';
  }

  // Afternoon: 12:00 PM to before evening (5 PM)
  if (start >= 720 && start < 1020) {
    return 'A1';
  }

  // Evening: 5 PM to 10 PM
  if (start >= 1020 && start < 1320) {
    return 'E1';
  }

  return 'D1';
}

export function buildBatchCodePrefix(
  month: string,
  timeCode: BatchTimeCode,
): string {
  return `${BATCH_CODE_ROOT}${month}${timeCode}`;
}

export function formatBatchCode(
  month: string,
  timeCode: BatchTimeCode,
  sequence: number,
): string {
  return `${buildBatchCodePrefix(month, timeCode)}${String(sequence).padStart(3, '0')}`;
}

export function parseBatchCodeSequence(
  code: string,
  prefix: string,
): number | null {
  const normalized = code.trim().toUpperCase();

  if (!normalized.startsWith(prefix)) {
    return null;
  }

  const suffix = normalized.slice(prefix.length);

  if (!/^\d{3}$/.test(suffix)) {
    return null;
  }

  const value = Number(suffix);

  return Number.isNaN(value) ? null : value;
}

export function parseBatchCode(code: string): {
  month: string;
  timeCode: BatchTimeCode;
  sequence: number;
} | null {
  const match = code.trim().toUpperCase().match(BATCH_CODE_PATTERN);

  if (!match) {
    return null;
  }

  return {
    month: match[1],
    timeCode: match[2] as BatchTimeCode,
    sequence: Number(match[3]),
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
