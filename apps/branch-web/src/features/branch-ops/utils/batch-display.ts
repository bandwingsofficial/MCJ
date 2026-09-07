const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function formatBatchDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatBatchTime(value?: string | null) {
  if (!value) return "";
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw ?? 0);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function formatBatchTiming(start?: string | null, end?: string | null) {
  const from = formatBatchTime(start);
  const to = formatBatchTime(end);
  if (!from && !to) return "—";
  if (from && to) return `${from} - ${to}`;
  return from || to;
}

export function formatWorkingDays(days?: string[] | null) {
  if (!days?.length) return "—";
  return days.map((day) => DAY_LABELS[day] ?? day).join(", ");
}

export function formatBatchMode(mode?: string | null) {
  if (!mode) return "—";
  if (mode === "RECORDED") return "Self-Paced";
  return mode.charAt(0) + mode.slice(1).toLowerCase();
}

export function formatLearningModes(
  modes?: string[] | null,
  fallbackMode?: string | null,
) {
  const values = modes?.length ? modes : fallbackMode ? [fallbackMode] : [];
  if (!values.length) return "—";
  return [...new Set(values)].map((mode) => formatBatchMode(mode)).join(" / ");
}

export function formatBatchDurationLabel(batch?: {
  durationLabel?: string | null;
  durationValue?: number | null;
  durationType?: string | null;
  durationDays?: number | null;
}) {
  if (batch?.durationLabel) {
    return batch.durationLabel;
  }

  if (batch?.durationValue) {
    const unit = (batch.durationType ?? "DAYS").toLowerCase();
    const singular = unit.replace(/s$/, "");
    return `${batch.durationValue} ${
      batch.durationValue === 1 ? singular : unit
    }`;
  }

  if (batch?.durationDays) {
    return `${batch.durationDays} day${batch.durationDays === 1 ? "" : "s"}`;
  }

  return "—";
}

export function formatAssignedTimingsSummary(
  timings?: Array<{
    name: string;
    mode: string;
    startTime?: string;
    endTime?: string;
  }> | null,
) {
  if (!timings?.length) {
    return "—";
  }

  return timings
    .map((timing) => {
      const schedule = formatBatchTiming(timing.startTime, timing.endTime);
      const mode = formatBatchMode(timing.mode);
      return schedule === "—"
        ? `${timing.name} (${mode})`
        : `${timing.name} · ${mode} · ${schedule}`;
    })
    .join(" | ");
}

export function formatTimingDays(days?: string[] | null) {
  if (!days?.length) return "—";
  return days.map((day) => DAY_LABELS[day] ?? day).join(", ");
}

export function formatTimingSchedule(timing: {
  daysOfWeek?: string[] | null;
  startTime?: string | null;
  endTime?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const days = formatTimingDays(timing.daysOfWeek);
  const time = formatBatchTiming(timing.startTime, timing.endTime);
  const dates =
    timing.startDate || timing.endDate
      ? `${formatBatchDate(timing.startDate)} – ${formatBatchDate(timing.endDate)}`
      : null;

  const schedule = [days !== "—" ? days : null, time !== "—" ? time : null]
    .filter(Boolean)
    .join(" · ");

  if (dates) {
    return schedule ? `${schedule}\n${dates}` : dates;
  }

  return schedule || "—";
}

export function formatBatchStatus(status?: string | null) {
  if (!status) return "—";
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

export {
  getBatchDisplayStatus,
  isBatchLifecycleGreyed,
  isBatchSelectableForAssignment,
} from "./batch-selection.utils";

export function statusBadgeVariant(status?: string | null) {
  if (status === "ONGOING" || status === "IN_PROGRESS") return "success" as const;
  if (status === "UPCOMING") return "info" as const;
  if (status === "COMPLETED" || status === "EXPIRED") return "default" as const;
  if (status === "CANCELLED" || status === "ARCHIVED" || status === "INACTIVE") {
    return "warning" as const;
  }
  return "default" as const;
}

export function assignedLabel(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not assigned";
}

export function courseTitle(
  course?: { title?: string | null; name?: string | null } | null,
) {
  return assignedLabel(course?.title ?? course?.name);
}

export function trainerNames(
  trainers?: Array<{
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  }>,
) {
  if (!trainers?.length) return "";
  return trainers
    .map(
      (item) =>
        item.name?.trim() ||
        [item.firstName, item.lastName].filter(Boolean).join(" ").trim(),
    )
    .filter(Boolean)
    .join(", ");
}

export function studentName(student: {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
}) {
  if (student.name?.trim()) return student.name;
  return [student.firstName, student.lastName].filter(Boolean).join(" ") || "—";
}

export function formatBatchLabel(
  name?: string | null,
  code?: string | null,
) {
  if (!name) return "—";
  return code ? `${name} (${code})` : name;
}

export function formatDurationMinutes(value?: number | null) {
  if (value == null) return "—";
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}
