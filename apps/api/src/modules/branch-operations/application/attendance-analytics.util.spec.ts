import { AttendanceStatus } from '@prisma/client';

import {
  applyStatusCount,
  buildAttendanceAnalyticsStats,
  emptyStatusCounts,
} from './attendance-analytics.util';

describe('attendance analytics', () => {
  it('counts Late as attended (domain rule): 2 Present + 1 Late of 4 = 75%', () => {
    // Spec §23: if Late counts as attended, percentage follows Present+Late.
    const counts = emptyStatusCounts();
    applyStatusCount(counts, AttendanceStatus.PRESENT);
    applyStatusCount(counts, AttendanceStatus.PRESENT);
    applyStatusCount(counts, AttendanceStatus.ABSENT);
    applyStatusCount(counts, AttendanceStatus.LATE);

    const stats = buildAttendanceAnalyticsStats(counts, 4);
    expect(stats.present).toBe(2);
    expect(stats.absent).toBe(1);
    expect(stats.late).toBe(1);
    expect(stats.attended).toBe(3);
    expect(stats.ratioLabel).toBe('3 / 4');
    expect(stats.percentage).toBe(75);
  });

  it('uses Present+Late as attended for percentage', () => {
    const counts = {
      present: 2,
      absent: 1,
      late: 1,
      leave: 0,
      total: 4,
    };
    const stats = buildAttendanceAnalyticsStats(counts, 4);
    expect(stats.attended).toBe(3);
    expect(stats.percentage).toBe(75);
  });

  it('returns null percentage when no attendance yet', () => {
    const stats = buildAttendanceAnalyticsStats(emptyStatusCounts(), 18);
    expect(stats.hasAttendance).toBe(false);
    expect(stats.percentage).toBeNull();
    expect(stats.ratioLabel).toBeNull();
  });

  it('returns null percentage when no conducted sessions', () => {
    const counts = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      total: 0,
    };
    const stats = buildAttendanceAnalyticsStats(counts, 0);
    expect(stats.percentage).toBeNull();
    expect(stats.ratioLabel).toBeNull();
  });

  it('supports progressive ratios like 2/3 after an absence', () => {
    const counts = {
      present: 2,
      absent: 1,
      late: 0,
      leave: 0,
      total: 3,
    };
    const stats = buildAttendanceAnalyticsStats(counts, 3);
    expect(stats.ratioLabel).toBe('2 / 3');
    expect(stats.percentage).toBe(66.7);
  });

  it('14 present + 1 late of 18 conducted = 15 / 18 (Present+Late rule)', () => {
    const stats = buildAttendanceAnalyticsStats(
      {
        present: 14,
        absent: 3,
        late: 1,
        leave: 0,
        total: 18,
      },
      18,
    );
    expect(stats.attended).toBe(15);
    expect(stats.ratioLabel).toBe('15 / 18');
    expect(stats.percentage).toBe(83.3);
  });

  it('after ABSENT → PRESENT refreshes to 16 / 18 when Late still counts', () => {
    const after = buildAttendanceAnalyticsStats(
      {
        present: 15,
        absent: 2,
        late: 1,
        leave: 0,
        total: 18,
      },
      18,
    );
    expect(after.attended).toBe(16);
    expect(after.ratioLabel).toBe('16 / 18');
    expect(after.percentage).toBe(88.9);
  });
});
