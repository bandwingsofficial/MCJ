import { BatchStatus } from '../enums/batch-status.enum';
import {
  calculateBatchLifecycleStatus,
  combineUtcDateAndTime,
  resolveBatchApiStatus,
} from './batch-lifecycle-status.util';

describe('combineUtcDateAndTime', () => {
  it('combines UTC date parts with HH:mm', () => {
    const date = new Date(Date.UTC(2026, 8, 4, 0, 0, 0)); // 4 Sep 2026
    const result = combineUtcDateAndTime(date, '10:00');

    expect(result.toISOString()).toBe('2026-09-04T10:00:00.000Z');
  });
});

describe('calculateBatchLifecycleStatus', () => {
  const startDate = new Date(Date.UTC(2026, 8, 4));
  const endDate = new Date(Date.UTC(2026, 9, 5));
  const startTime = '10:00';
  const endTime = '16:00';

  it('is UPCOMING before start datetime', () => {
    expect(
      calculateBatchLifecycleStatus({
        startDate,
        startTime,
        endDate,
        endTime,
        now: new Date(Date.UTC(2026, 8, 4, 9, 59, 0)),
      }),
    ).toBe(BatchStatus.UPCOMING);
  });

  it('is ONGOING exactly at start datetime', () => {
    expect(
      calculateBatchLifecycleStatus({
        startDate,
        startTime,
        endDate,
        endTime,
        now: new Date(Date.UTC(2026, 8, 4, 10, 0, 0)),
      }),
    ).toBe(BatchStatus.ONGOING);
  });

  it('is ONGOING during the batch', () => {
    expect(
      calculateBatchLifecycleStatus({
        startDate,
        startTime,
        endDate,
        endTime,
        now: new Date(Date.UTC(2026, 8, 20, 12, 0, 0)),
      }),
    ).toBe(BatchStatus.ONGOING);
  });

  it('is ONGOING exactly at end datetime', () => {
    expect(
      calculateBatchLifecycleStatus({
        startDate,
        startTime,
        endDate,
        endTime,
        now: new Date(Date.UTC(2026, 9, 5, 16, 0, 0)),
      }),
    ).toBe(BatchStatus.ONGOING);
  });

  it('is EXPIRED after end datetime', () => {
    expect(
      calculateBatchLifecycleStatus({
        startDate,
        startTime,
        endDate,
        endTime,
        now: new Date(Date.UTC(2026, 9, 5, 16, 1, 0)),
      }),
    ).toBe(BatchStatus.EXPIRED);
  });
});

describe('resolveBatchApiStatus', () => {
  it('keeps CANCELLED without date calculation', () => {
    expect(
      resolveBatchApiStatus({
        storedStatus: BatchStatus.CANCELLED,
        startDate: new Date(Date.UTC(2026, 8, 4)),
        startTime: '10:00',
        endDate: new Date(Date.UTC(2026, 9, 5)),
        endTime: '16:00',
        now: new Date(Date.UTC(2026, 8, 20)),
      }),
    ).toBe(BatchStatus.CANCELLED);
  });

  it('calculates lifecycle for normal batches', () => {
    expect(
      resolveBatchApiStatus({
        storedStatus: BatchStatus.UPCOMING,
        startDate: new Date(Date.UTC(2026, 8, 4)),
        startTime: '10:00',
        endDate: new Date(Date.UTC(2026, 9, 5)),
        endTime: '16:00',
        now: new Date(Date.UTC(2026, 8, 20)),
      }),
    ).toBe(BatchStatus.ONGOING);
  });
});
