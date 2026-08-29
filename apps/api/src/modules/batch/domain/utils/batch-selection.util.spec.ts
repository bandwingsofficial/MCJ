import { BatchStatus } from '../enums/batch-status.enum';
import {
  ensureBatchSelectableForAssignment,
  isBatchCompletedOrExpired,
  isBatchDateExpired,
  isBatchSelectableForAssignment,
} from './batch-selection.util';
import { BatchNotSelectableException } from '../errors/batch-business.exception';

const ref = new Date('2026-08-29T12:00:00');

describe('batch-selection.util', () => {
  it('treats COMPLETED status as not selectable', () => {
    expect(
      isBatchSelectableForAssignment(
        {
          status: BatchStatus.COMPLETED,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          isActive: true,
          isDeleted: false,
        },
        ref,
      ),
    ).toBe(false);
  });

  it('treats date-expired ONGOING batch as not selectable', () => {
    expect(
      isBatchDateExpired(
        {
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-08-01'),
        },
        ref,
      ),
    ).toBe(true);

    expect(
      isBatchCompletedOrExpired(
        {
          status: BatchStatus.ONGOING,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-08-01'),
        },
        ref,
      ),
    ).toBe(true);
  });

  it('allows UPCOMING and ONGOING batches that are not expired', () => {
    const upcoming = {
      status: BatchStatus.UPCOMING,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
      isDeleted: false,
    };

    const ongoing = {
      status: BatchStatus.ONGOING,
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-09-30'),
      isActive: true,
      isDeleted: false,
    };

    expect(isBatchSelectableForAssignment(upcoming, ref)).toBe(true);
    expect(isBatchSelectableForAssignment(ongoing, ref)).toBe(true);
  });

  it('rejects completed batch via ensureBatchSelectableForAssignment', () => {
    expect(() =>
      ensureBatchSelectableForAssignment(
        {
          status: BatchStatus.COMPLETED,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-06-01'),
          isActive: true,
          isDeleted: false,
        },
        ref,
      ),
    ).toThrow(BatchNotSelectableException);
  });

  it('rejects expired batch via ensureBatchSelectableForAssignment', () => {
    expect(() =>
      ensureBatchSelectableForAssignment(
        {
          status: BatchStatus.ONGOING,
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-08-01'),
          isActive: true,
          isDeleted: false,
        },
        ref,
      ),
    ).toThrow(BatchNotSelectableException);
  });
});
