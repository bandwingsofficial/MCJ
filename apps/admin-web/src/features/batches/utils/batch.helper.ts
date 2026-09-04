import {
  BatchMode,
  BatchStatus,
} from "@/src/features/batches/types/batch.types";

export function formatBatchOperationalStatus(
  batch: Pick<
    import("@/src/features/batches/types/batch.types").Batch,
    "isActive" | "isDeleted" | "deletedAt"
  >,
): string {
  if (batch.isDeleted || batch.deletedAt) {
    return "Archived";
  }

  if (batch.isActive === false) {
    return "Inactive";
  }

  return "Active";
}

export const formatBatchMode = (
  mode: BatchMode,
): string => {
  switch (mode) {
    case "ONLINE":
      return "Online";

    case "OFFLINE":
      return "Offline";

    case "RECORDED":
      return "Recorded";

    default:
      return mode;
  }
};

export const formatBatchStatus = (
  status: BatchStatus,
): string => {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";

    case "ONGOING":
      return "Ongoing";

    case "EXPIRED":
      return "Expired";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
};

export const formatTrainerName = (
  firstName: string,
  lastName: string,
): string =>
  `${firstName} ${lastName}`;

export const formatDays = (
  days: string[],
): string =>
  days.join(", ");

export const isOnlineBatch = (
  mode: BatchMode,
): boolean =>
  mode === "ONLINE";

export const isOfflineBatch = (
  mode: BatchMode,
): boolean =>
  mode === "OFFLINE";

export const isRecordedBatch = (
  mode: BatchMode,
): boolean =>
  mode === "RECORDED";

export function formatBatchTime(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatBatchTiming(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  if (!startTime || !endTime) {
    return "—";
  }

  return `${formatBatchTime(startTime)} → ${formatBatchTime(endTime)}`;
}

export function formatBatchDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatBatchDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const start = formatBatchDate(startDate);

  if (!endDate || endDate === startDate) {
    return start;
  }

  const end = formatBatchDate(endDate);

  if (end === start) {
    return start;
  }

  return `${start} – ${end}`;
}

export function formatBatchSchedule(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  const dateRange = formatBatchDateRange(startDate, endDate);
  const timing = formatBatchTiming(startTime, endTime);

  if (dateRange === "—" && timing === "—") {
    return "—";
  }

  if (timing === "—") {
    return dateRange;
  }

  if (dateRange === "—") {
    return timing;
  }

  return `${dateRange} · ${timing}`;
}