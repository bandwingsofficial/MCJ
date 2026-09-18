import type { BatchMode, DayOfWeek } from "@/src/features/batches/types/batch.types";

export const ENROLLMENT_SELECTION_STORAGE_KEY = "mcj.enrollment.selection";

export interface EnrollmentTimingSnapshot {
  id: string;
  name: string;
  mode: BatchMode;
  startDate: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
}

export interface EnrollmentSelectionSnapshot {
  courseId: string;
  branchId: string;
  batchId: string;
  batchTimingId: string;
  mode: BatchMode | string;
  timing: EnrollmentTimingSnapshot;
  savedAt: number;
}

export function saveEnrollmentSelection(
  selection: Omit<EnrollmentSelectionSnapshot, "savedAt">,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: EnrollmentSelectionSnapshot = {
      ...selection,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(
      ENROLLMENT_SELECTION_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage failures; URL IDs remain the primary handoff.
  }
}

export function readEnrollmentSelection(): EnrollmentSelectionSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(ENROLLMENT_SELECTION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as EnrollmentSelectionSnapshot;
    if (
      !parsed?.courseId ||
      !parsed?.branchId ||
      !parsed?.batchId ||
      !parsed?.batchTimingId ||
      !parsed?.timing?.id
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearEnrollmentSelection(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(ENROLLMENT_SELECTION_STORAGE_KEY);
  } catch {
    // no-op
  }
}

export function selectionMatchesIds(
  selection: EnrollmentSelectionSnapshot | null,
  ids: {
    courseId?: string | null;
    branchId?: string | null;
    batchId?: string | null;
    batchTimingId?: string | null;
  },
): boolean {
  if (!selection) {
    return false;
  }

  if (ids.courseId && selection.courseId !== ids.courseId) {
    return false;
  }
  if (ids.branchId && selection.branchId !== ids.branchId) {
    return false;
  }
  if (ids.batchId && selection.batchId !== ids.batchId) {
    return false;
  }
  if (ids.batchTimingId && selection.batchTimingId !== ids.batchTimingId) {
    return false;
  }

  return true;
}
