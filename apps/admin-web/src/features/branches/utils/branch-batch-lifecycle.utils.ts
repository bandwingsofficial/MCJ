import type {
  Batch,
  BatchLifecycleStatus,
} from "@/src/features/batches/types/batch.types";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Matches API batch-lifecycle-status.util (UTC date + time). */
function combineUtcDateAndTime(dateInput: string | Date, time: string): Date {
  const date =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const match = TIME_PATTERN.exec((time ?? "").trim());
  const hours = match ? Number(match[1]) : 0;
  const minutes = match ? Number(match[2]) : 0;

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
}

export function calculateBranchBatchLifecycleStatus(
  batch: Pick<Batch, "startDate" | "startTime" | "endDate" | "endTime" | "status">,
  now: Date = new Date(),
): BatchLifecycleStatus | null {
  if (batch.status === "CANCELLED") {
    return null;
  }

  const startAt = combineUtcDateAndTime(batch.startDate, batch.startTime);
  const endAt = combineUtcDateAndTime(
    batch.endDate ?? batch.startDate,
    batch.endTime,
  );

  if (now.getTime() < startAt.getTime()) {
    return "UPCOMING";
  }

  if (now.getTime() > endAt.getTime()) {
    return "EXPIRED";
  }

  return "ONGOING";
}

export function filterBranchBatchesByLifecycle(
  batches: Batch[],
  lifecycle: BatchLifecycleStatus,
  now?: Date,
): Batch[] {
  return batches.filter((batch) => {
    const calculated = calculateBranchBatchLifecycleStatus(batch, now);
    return calculated === lifecycle;
  });
}

export function countBranchBatchesByLifecycle(
  batches: Batch[],
  now?: Date,
): Record<BatchLifecycleStatus, number> {
  const counts: Record<BatchLifecycleStatus, number> = {
    UPCOMING: 0,
    ONGOING: 0,
    EXPIRED: 0,
  };

  for (const batch of batches) {
    const calculated = calculateBranchBatchLifecycleStatus(batch, now);
    if (calculated) {
      counts[calculated] += 1;
    }
  }

  return counts;
}

export function filterBranchBatchesBySearch(
  batches: Batch[],
  search: string,
): Batch[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return batches;
  }

  return batches.filter((batch) => {
    const haystack = [
      batch.name,
      batch.code ?? "",
      batch.course?.title ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
