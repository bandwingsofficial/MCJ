import { BATCH_TIMING_IN_USE_BY_BATCH_MESSAGE } from '../constants/batch-template-usage.constants';

export type BatchTemplateLifecycleBlock = {
  batchId: string;
  batchName: string;
};

export function formatBatchTemplateLifecycleBlockMessage(
  _action: 'deactivate' | 'archive',
  blocks: BatchTemplateLifecycleBlock[],
): string {
  if (blocks.length === 0) {
    return BATCH_TIMING_IN_USE_BY_BATCH_MESSAGE;
  }

  return BATCH_TIMING_IN_USE_BY_BATCH_MESSAGE;
}
