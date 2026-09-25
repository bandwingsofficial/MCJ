/**
 * Mirrors Branch-Web `getBatchDateLifecycleTab` in
 * apps/branch-web/src/features/branch-ops/utils/batch-selection.utils.ts
 * (UTC calendar start/end dates — same as My Batches lifecycle tabs).
 */
export type BatchDateLifecycleTab = 'UPCOMING' | 'ONGOING' | 'EXPIRED';

function utcDateOnlyKey(value: Date): number | null {
  if (Number.isNaN(value.getTime())) {
    return null;
  }
  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

function todayUtcDateOnlyKey(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function getBatchDateLifecycleTab(batch: {
  startDate: Date | null;
  endDate: Date | null;
}): BatchDateLifecycleTab {
  const today = todayUtcDateOnlyKey();
  const startKey = batch.startDate ? utcDateOnlyKey(batch.startDate) : today;
  const endKey = batch.endDate ? utcDateOnlyKey(batch.endDate) : startKey;

  const start = startKey ?? today;
  const end = endKey ?? start;

  if (today < start) {
    return 'UPCOMING';
  }
  if (today > end) {
    return 'EXPIRED';
  }
  return 'ONGOING';
}

export function countBatchDateLifecycleTabs(
  batches: Array<{ startDate: Date | null; endDate: Date | null }>,
): { upcoming: number; ongoing: number; expired: number } {
  return batches.reduce(
    (counts, batch) => {
      const tab = getBatchDateLifecycleTab(batch);
      if (tab === 'UPCOMING') {
        counts.upcoming += 1;
      } else if (tab === 'ONGOING') {
        counts.ongoing += 1;
      } else {
        counts.expired += 1;
      }
      return counts;
    },
    { upcoming: 0, ongoing: 0, expired: 0 },
  );
}
