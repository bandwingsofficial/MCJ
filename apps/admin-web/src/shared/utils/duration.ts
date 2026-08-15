const DURATION_PATTERN = /^(\d{2}):([0-5]\d):([0-5]\d)$/;

export function isValidDurationHms(value: string): boolean {
  const trimmed = value.trim();
  if (!DURATION_PATTERN.test(trimmed)) {
    return false;
  }

  const [, hours] = trimmed.match(DURATION_PATTERN) ?? [];
  return Number(hours) >= 0;
}

export function parseDurationHmsToSeconds(value: string): number | null {
  if (!isValidDurationHms(value)) {
    return null;
  }

  const [, hours, minutes, seconds] = value.trim().match(DURATION_PATTERN) ?? [];
  return (
    Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
  );
}

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

export function normalizeDurationHmsInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 6);
  const padded = digits.padEnd(6, "0");
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
}
