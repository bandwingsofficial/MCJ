import type {
  BatchTemplate,
  BatchTemplateLifecycleBlock,
} from "@/src/features/batch-templates/types/batch-template.types";

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

function lifecycleStatusLabel(
  status: BatchTemplateLifecycleBlock["lifecycleStatus"],
): string {
  return status === "UPCOMING" ? "Upcoming" : "Ongoing";
}

export function buildBatchTemplateLifecycleBlockedDescription(
  templateName: string,
  blocks: BatchTemplateLifecycleBlock[],
  action: "deactivate" | "archive",
): string {
  const verb = action === "deactivate" ? "deactivated" : "archived";

  if (blocks.length === 1) {
    const block = blocks[0]!;
    return `Batch timing cannot be ${verb} because it is linked to ${block.batchName}, which is currently ${lifecycleStatusLabel(block.lifecycleStatus)}.`;
  }

  const lines = blocks.map(
    (block) => `${block.batchName} — ${lifecycleStatusLabel(block.lifecycleStatus)}`,
  );

  const actionVerb = action === "deactivate" ? "deactivate" : "archive";

  return [
    `Cannot ${actionVerb} the selected batch timings because the following linked batches are Upcoming/Ongoing:`,
    "",
    ...lines,
  ].join("\n");
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
      const key = `${block.batchId}:${block.lifecycleStatus}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
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
