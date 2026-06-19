// src/features/batches/constants/batch.constants.ts

import type {
  BatchMode,
  BatchStatus,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";

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