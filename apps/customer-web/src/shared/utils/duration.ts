export function formatSecondsToDurationHms(
  totalSeconds: number | null | undefined,
): string {
  if (totalSeconds == null || totalSeconds < 0) {
    return "00:00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

export function formatVideoDurationHms(
  durationSeconds: number | null | undefined,
): string | null {
  if (
    durationSeconds == null ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null;
  }

  const formatted = formatSecondsToDurationHms(durationSeconds);
  if (formatted === "00:00:00") {
    return null;
  }

  return formatted;
}
