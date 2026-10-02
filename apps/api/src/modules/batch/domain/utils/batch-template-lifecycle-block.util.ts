import { BatchStatus } from '../enums/batch-status.enum';
import {
  resolveBatchApiStatus,
  resolveBatchTimingApiStatus,
} from './batch-lifecycle-status.util';

export type BatchTemplateLifecycleBlock = {
  batchId: string;
  batchName: string;
  lifecycleStatus: 'UPCOMING' | 'ONGOING';
};

type BatchLifecycleSource = {
  id: string;
  name: string;
  status: BatchStatus;
  startDate: Date;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  isDeleted: boolean;
};

export function getBatchLifecycleBlockReason(
  batch: BatchLifecycleSource,
  now: Date = new Date(),
): 'UPCOMING' | 'ONGOING' | null {
  if (batch.isDeleted) {
    return null;
  }

  const resolved = resolveBatchApiStatus({
    storedStatus: batch.status,
    isDeleted: batch.isDeleted,
    startDate: batch.startDate,
    startTime: batch.startTime,
    endDate: batch.endDate,
    endTime: batch.endTime,
    now,
  });

  if (
    resolved === BatchStatus.UPCOMING ||
    resolved === BatchStatus.ONGOING
  ) {
    return resolved;
  }

  return null;
}

/** Template used on a child timing — expired timing usage does not block. */
export function getBatchTimingTemplateUsageBlockReason(
  parentBatch: BatchLifecycleSource,
  timing: BatchLifecycleSource,
  now: Date = new Date(),
): 'UPCOMING' | 'ONGOING' | null {
  if (parentBatch.isDeleted || timing.isDeleted) {
    return null;
  }

  const resolved = resolveBatchTimingApiStatus(
    {
      storedStatus: parentBatch.status,
      isDeleted: parentBatch.isDeleted,
      startDate: parentBatch.startDate,
      startTime: parentBatch.startTime,
      endDate: parentBatch.endDate,
      endTime: parentBatch.endTime,
      now,
    },
    {
      storedStatus: timing.status,
      isDeleted: timing.isDeleted,
      startDate: timing.startDate,
      startTime: timing.startTime,
      endDate: timing.endDate,
      endTime: timing.endTime,
      now,
    },
  );

  if (
    resolved === BatchStatus.UPCOMING ||
    resolved === BatchStatus.ONGOING
  ) {
    return resolved;
  }

  return null;
}

export function formatBatchTemplateLifecycleBlockMessage(
  action: 'deactivate' | 'archive',
  blocks: BatchTemplateLifecycleBlock[],
): string {
  const verb = action === 'deactivate' ? 'deactivated' : 'archived';
  const statusLabel = (status: BatchTemplateLifecycleBlock['lifecycleStatus']) =>
    status === 'UPCOMING' ? 'Upcoming' : 'Ongoing';

  if (blocks.length === 1) {
    const block = blocks[0]!;
    return `Batch timing cannot be ${verb} because it is linked to ${block.batchName}, which is currently ${statusLabel(block.lifecycleStatus)}.`;
  }

  const lines = blocks.map(
    (block) => `${block.batchName} — ${statusLabel(block.lifecycleStatus)}`,
  );

  return [
    `Batch timing cannot be ${verb} because it is linked to upcoming/ongoing batches:`,
    ...lines,
  ].join('\n');
}
