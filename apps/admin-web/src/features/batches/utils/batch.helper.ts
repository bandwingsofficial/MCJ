import {
  BatchMode,
  BatchStatus,
} from "@/src/features/batches/types/batch.types";

export const formatBatchMode = (
  mode: BatchMode,
): string => {
  switch (mode) {
    case "ONLINE":
      return "Online";

    case "OFFLINE":
      return "Offline";

    case "HYBRID":
      return "Hybrid";

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

export const isHybridBatch = (
  mode: BatchMode,
): boolean =>
  mode === "HYBRID";

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