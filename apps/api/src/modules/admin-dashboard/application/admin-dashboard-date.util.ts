import {
  addUtcDays,
  parseDateOnly,
  startOfUtcDay,
  toDateOnlyString,
} from '../../branch-operations/application/date.util';

export type AdminDashboardPreset =
  | 'TODAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'THIS_YEAR'
  | 'ALL_TIME'
  | 'CUSTOM';

export interface ResolvedDashboardPeriod {
  preset: AdminDashboardPreset;
  from: Date;
  toExclusive: Date;
  fromLabel: string;
  toLabel: string;
}

export function resolveAdminDashboardPeriod(input: {
  preset?: string;
  from?: string;
  to?: string;
}): ResolvedDashboardPeriod {
  const preset = normalizePreset(input.preset);
  const today = startOfUtcDay(new Date());
  const tomorrow = addUtcDays(today, 1);

  if (preset === 'TODAY') {
    return buildPeriod('TODAY', today, tomorrow);
  }

  if (preset === 'THIS_WEEK') {
    const weekday = today.getUTCDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const from = addUtcDays(today, mondayOffset);
    return buildPeriod('THIS_WEEK', from, tomorrow);
  }

  if (preset === 'THIS_MONTH') {
    const from = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
    );
    return buildPeriod('THIS_MONTH', from, tomorrow);
  }

  if (preset === 'THIS_YEAR') {
    const from = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
    return buildPeriod('THIS_YEAR', from, tomorrow);
  }

  if (preset === 'ALL_TIME') {
    const from = new Date(Date.UTC(2020, 0, 1));
    return buildPeriod('ALL_TIME', from, tomorrow);
  }

  const from = input.from
    ? startOfUtcDay(parseDateOnly(input.from))
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const toDay = input.to
    ? startOfUtcDay(parseDateOnly(input.to))
    : today;
  const toExclusive = addUtcDays(toDay, 1);

  if (toExclusive.getTime() <= from.getTime()) {
    throw new Error('Invalid custom date range');
  }

  return buildPeriod('CUSTOM', from, toExclusive);
}

export function previousPeriod(
  from: Date,
  toExclusive: Date,
): { from: Date; toExclusive: Date } {
  const lengthMs = toExclusive.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - lengthMs),
    toExclusive: from,
  };
}

export function listDateKeys(from: Date, toExclusive: Date): string[] {
  const keys: string[] = [];
  let cursor = startOfUtcDay(from);
  const end = startOfUtcDay(toExclusive);

  while (cursor.getTime() < end.getTime()) {
    keys.push(toDateOnlyString(cursor));
    cursor = addUtcDays(cursor, 1);
  }

  return keys;
}

function normalizePreset(value?: string): AdminDashboardPreset {
  const upper = (value ?? 'THIS_MONTH').toUpperCase();
  if (
    upper === 'TODAY' ||
    upper === 'THIS_WEEK' ||
    upper === 'THIS_MONTH' ||
    upper === 'THIS_YEAR' ||
    upper === 'ALL_TIME' ||
    upper === 'CUSTOM'
  ) {
    return upper;
  }
  return 'THIS_MONTH';
}

function buildPeriod(
  preset: AdminDashboardPreset,
  from: Date,
  toExclusive: Date,
): ResolvedDashboardPeriod {
  const toLabelDate = addUtcDays(toExclusive, -1);
  return {
    preset,
    from,
    toExclusive,
    fromLabel: toDateOnlyString(from),
    toLabel: toDateOnlyString(toLabelDate),
  };
}
