import type { Batch, BatchStatus } from "@/src/features/batches/types/batch.types";

const INACTIVE_BATCH_STATUSES: BatchStatus[] = [
  "COMPLETED",
  "CANCELLED",
];

export function getBatchAvailableSeats(batch: Batch): number {
  const capacity = Number.isFinite(batch.capacity) ? batch.capacity : 0;
  const enrolled = Number.isFinite(batch.enrolledCount)
    ? batch.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

export function isBatchFull(batch: Batch): boolean {
  return getBatchAvailableSeats(batch) <= 0;
}

export function isBatchSelectable(batch: Batch): boolean {
  if (batch.isDeleted) {
    return false;
  }

  if (INACTIVE_BATCH_STATUSES.includes(batch.status)) {
    return false;
  }

  return !isBatchFull(batch);
}

export function formatEnrollmentDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEnrollmentTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const [hours, minutes] = value.split(":");

  if (!hours || !minutes) {
    return value;
  }

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatBatchDays(days: string[]): string {
  if (!days.length) {
    return "—";
  }

  const shortLabels: Record<string, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  return days.map((day) => shortLabels[day] ?? day).join(" · ");
}

export function getBatchStatusLabel(status: Batch["status"]): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBatchSummaryLabel(batch: Batch | null | undefined): string {
  if (!batch) {
    return "Not selected";
  }

  const name = batch.name?.trim();
  const code = batch.code?.trim();

  if (!name) {
    return code || "Not selected";
  }

  return code ? `${name} · ${code}` : name;
}

export function formatBatchBranchName(batch: Batch | null | undefined): string {
  const branchName = batch?.branch?.branchName?.trim();

  return branchName || "Not assigned";
}
