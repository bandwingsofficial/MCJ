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
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
