export function parseDateOnly(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    throw new Error('Invalid date');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('Invalid date');
  }

  return date;
}

export function toDateOnlyString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
    ),
  );
}

export function addUtcDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getPeriodRange(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  reference: Date,
): { from: Date; to: Date } {
  const day = startOfUtcDay(reference);

  if (period === 'daily') {
    return { from: day, to: addUtcDays(day, 1) };
  }

  if (period === 'weekly') {
    const weekday = day.getUTCDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const from = addUtcDays(day, mondayOffset);
    return { from, to: addUtcDays(from, 7) };
  }

  if (period === 'monthly') {
    const from = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1),
    );
    const to = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 1),
    );
    return { from, to };
  }

  const from = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const to = new Date(Date.UTC(day.getUTCFullYear() + 1, 0, 1));
  return { from, to };
}

export function durationMinutes(
  punchIn: Date,
  punchOut: Date,
): number {
  return Math.max(
    0,
    Math.round((punchOut.getTime() - punchIn.getTime()) / 60000),
  );
}
