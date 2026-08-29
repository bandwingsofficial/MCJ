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
  return mode.charAt(0) + mode.slice(1).toLowerCase();
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
