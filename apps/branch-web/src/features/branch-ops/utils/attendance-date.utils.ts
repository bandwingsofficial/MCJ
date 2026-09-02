/** Local calendar helpers for attendance date-range presets. */

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toLocalDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayLocalInput(): string {
  return toLocalDateInput(new Date());
}

export type AttendanceDatePreset =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "CUSTOM"
  | "ALL_TIME";

export function resolveAttendanceDateRange(
  preset: AttendanceDatePreset,
  customFrom?: string,
  customTo?: string,
): { from?: string; to?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === "ALL_TIME") {
    return {};
  }

  if (preset === "TODAY") {
    const value = toLocalDateInput(today);
    return { from: value, to: value };
  }

  if (preset === "YESTERDAY") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const value = toLocalDateInput(yesterday);
    return { from: value, to: value };
  }

  if (preset === "THIS_WEEK") {
    const weekday = today.getDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const from = new Date(today);
    from.setDate(from.getDate() + mondayOffset);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  if (preset === "THIS_MONTH") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  return {
    from: customFrom || undefined,
    to: customTo || undefined,
  };
}

export function formatAttendanceDisplayDate(value: string): string {
  const raw = value?.toString().slice(0, 10);
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatAttendanceMarkedAt(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function attendanceStatusVariant(status: string) {
  if (status === "PRESENT") return "success" as const;
  if (status === "ABSENT") return "danger" as const;
  if (status === "LATE") return "warning" as const;
  return "default" as const;
}
