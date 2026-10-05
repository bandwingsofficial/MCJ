import type {
  BatchTemplate,
  BatchTemplateLifecycleBlock,
} from "@/src/features/batch-templates/types/batch-template.types";

export const BATCH_TIMING_IN_USE_BY_BATCH_MESSAGE =
  "Already being used by this batch.";

export function getBatchTemplateLifecycleBlocks(
  template: Pick<BatchTemplate, "lifecycleBlocks">,
): BatchTemplateLifecycleBlock[] {
  return template.lifecycleBlocks ?? [];
}

export function isBatchTemplateLifecycleBlocked(
  template: Pick<BatchTemplate, "lifecycleBlocks">,
): boolean {
  return getBatchTemplateLifecycleBlocks(template).length > 0;
}

export function buildBatchTemplateLifecycleBlockedDescription(
  _templateName: string,
  blocks: BatchTemplateLifecycleBlock[],
  _action: "deactivate" | "archive",
): string {
  if (blocks.length === 0) {
    return BATCH_TIMING_IN_USE_BY_BATCH_MESSAGE;
  }

  return BATCH_TIMING_IN_USE_BY_BATCH_MESSAGE;
}

export function mergeBatchTemplateUsageBlocks(
  blocks: BatchTemplateLifecycleBlock[],
): BatchTemplateLifecycleBlock[] {
  const seen = new Set<string>();
  const merged: BatchTemplateLifecycleBlock[] = [];

  for (const block of blocks) {
    if (seen.has(block.batchId)) {
      continue;
    }

    seen.add(block.batchId);
    merged.push(block);
  }

  return merged.sort((left, right) =>
    left.batchName.localeCompare(right.batchName),
  );
}

export function collectSelectedBatchTemplateLifecycleBlocks(
  templates: BatchTemplate[],
  selectedIds: string[],
): BatchTemplateLifecycleBlock[] {
  const selected = new Set(selectedIds);
  const seen = new Set<string>();
  const blocks: BatchTemplateLifecycleBlock[] = [];

  for (const template of templates) {
    if (!selected.has(template.id)) {
      continue;
    }

    for (const block of getBatchTemplateLifecycleBlocks(template)) {
      if (seen.has(block.batchId)) {
        continue;
      }

      seen.add(block.batchId);
      blocks.push(block);
    }
  }

  return blocks.sort((left, right) =>
    left.batchName.localeCompare(right.batchName),
  );
}

export function selectedBatchTemplateIdsIncludeLifecycleBlock(
  templates: BatchTemplate[],
  selectedIds: string[],
): boolean {
  const selected = new Set(selectedIds);

  return templates.some(
    (template) =>
      selected.has(template.id) && isBatchTemplateLifecycleBlocked(template),
  );
}
