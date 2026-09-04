// src/features/batches/constants/batch.constants.ts

import type {
  BatchDurationType,
  BatchMode,
  BatchStatus,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";

export const BATCH_MODES: {
  label: string;
  value: BatchMode;
}[] = [
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
  { label: "Recorded", value: "RECORDED" },
];

/** Filter dropdown labels — clearer than form labels; do not use in BatchForm. */
export const FILTER_BATCH_MODES: {
  label: string;
  value: BatchMode;
}[] = [
  { label: "Offline / Classroom", value: "OFFLINE" },
  { label: "Online", value: "ONLINE" },
  { label: "Self-Paced / Recorded", value: "RECORDED" },
];

export const BATCH_DURATION_TYPES: {
  label: string;
  value: BatchDurationType;
}[] = [
  { label: "Hours", value: "HOURS" },
  { label: "Days", value: "DAYS" },
  { label: "Weeks", value: "WEEKS" },
  { label: "Months", value: "MONTHS" },
  { label: "Years", value: "YEARS" },
];

/** Lifecycle statuses supported by the batch API. */
export const BATCH_STATUSES: {
  label: string;
  value: BatchStatus;
}[] = [
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const DAYS_OF_WEEK: {
  label: string;
  value: DayOfWeek;
}[] = [
  { label: "Monday", value: "MONDAY" },
  { label: "Tuesday", value: "TUESDAY" },
  { label: "Wednesday", value: "WEDNESDAY" },
  { label: "Thursday", value: "THURSDAY" },
  { label: "Friday", value: "FRIDAY" },
  { label: "Saturday", value: "SATURDAY" },
  { label: "Sunday", value: "SUNDAY" },
];
