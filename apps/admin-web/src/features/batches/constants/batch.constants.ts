// src/features/batches/constants/batch.constants.ts

import type {
  BatchMode,
  BatchStatus,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";
import {
  DELETED_BATCHES_FILTER,
  type BatchStatusFilterValue,
} from "@/src/features/batches/utils/batch-list.utils";

export const BATCH_MODES: {
  label: string;
  value: BatchMode;
}[] = [
  {
    label: "Online",
    value: "ONLINE",
  },
  {
    label: "Offline",
    value: "OFFLINE",
  },
  {
    label: "Hybrid",
    value: "HYBRID",
  },
];

/** Lifecycle statuses supported by the batch API. */
export const BATCH_STATUSES: {
  label: string;
  value: BatchStatus;
}[] = [
  {
    label: "Upcoming",
    value: "UPCOMING",
  },
  {
    label: "Ongoing",
    value: "ONGOING",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
  {
    label: "Archived",
    value: "ARCHIVED",
  },
];

/** Unique values for the batch list status filter dropdown. */
export const BATCH_STATUS_FILTER_OPTIONS: {
  label: string;
  value: BatchStatusFilterValue;
}[] = [
  ...BATCH_STATUSES,
  {
    label: "Deleted",
    value: DELETED_BATCHES_FILTER,
  },
];

export const DAYS_OF_WEEK: {
  label: string;
  value: DayOfWeek;
}[] = [
  {
    label: "Monday",
    value: "MONDAY",
  },
  {
    label: "Tuesday",
    value: "TUESDAY",
  },
  {
    label: "Wednesday",
    value: "WEDNESDAY",
  },
  {
    label: "Thursday",
    value: "THURSDAY",
  },
  {
    label: "Friday",
    value: "FRIDAY",
  },
  {
    label: "Saturday",
    value: "SATURDAY",
  },
  {
    label: "Sunday",
    value: "SUNDAY",
  },
];
