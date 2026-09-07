import type {
  BatchListItem,
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";

export type BatchMode = "OFFLINE" | "ONLINE" | "RECORDED";

export const BATCH_MODE_ORDER: BatchMode[] = ["OFFLINE", "ONLINE", "RECORDED"];

export const BATCH_MODE_SECTION_LABELS: Record<BatchMode, string> = {
  OFFLINE: "Offline / Classroom",
  ONLINE: "Online",
  RECORDED: "Self-Paced / Recorded",
};

export function getBatchModeSectionLabel(mode: string): string {
  if (mode === "OFFLINE" || mode === "ONLINE" || mode === "RECORDED") {
    return BATCH_MODE_SECTION_LABELS[mode];
  }

  return mode;
}

export function getTimingsForMode(
  batch: Pick<BatchListItem, "timings">,
  mode: BatchMode,
): BatchTimingListItem[] {
  return (batch.timings ?? []).filter((timing) => timing.mode === mode);
}

export function getConfiguredBatchModes(
  batch: Pick<BatchListItem, "timings" | "learningModes" | "mode">,
): BatchMode[] {
  const modes = new Set<BatchMode>();

  for (const timing of batch.timings ?? []) {
    if (
      timing.mode === "OFFLINE" ||
      timing.mode === "ONLINE" ||
      timing.mode === "RECORDED"
    ) {
      modes.add(timing.mode);
    }
  }

  if (modes.size === 0) {
    for (const mode of batch.learningModes ?? []) {
      if (
        mode === "OFFLINE" ||
        mode === "ONLINE" ||
        mode === "RECORDED"
      ) {
        modes.add(mode);
      }
    }
  }

  if (modes.size === 0 && batch.mode) {
    if (
      batch.mode === "OFFLINE" ||
      batch.mode === "ONLINE" ||
      batch.mode === "RECORDED"
    ) {
      modes.add(batch.mode);
    }
  }

  return BATCH_MODE_ORDER.filter((mode) => modes.has(mode));
}
