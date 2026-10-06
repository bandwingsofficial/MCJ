export const ENROLLMENT_MODES = [
  "OFFLINE",
  "ONLINE",
  "SELF_PACED_RECORDED",
] as const;

export type EnrollmentModeValue = (typeof ENROLLMENT_MODES)[number];

export const ENROLLMENT_MODE_LABELS: Record<EnrollmentModeValue, string> = {
  OFFLINE: "Offline",
  ONLINE: "Online",
  SELF_PACED_RECORDED: "Self-Paced / Recorded",
};

export function normalizeEnrollmentModeValue(
  mode: string | null | undefined,
): EnrollmentModeValue | null {
  if (mode == null) {
    return null;
  }

  const normalized = String(mode).trim().toUpperCase();
  if (normalized === "SELF_PACED" || normalized === "RECORDED") {
    return "SELF_PACED_RECORDED";
  }

  if ((ENROLLMENT_MODES as readonly string[]).includes(normalized)) {
    return normalized as EnrollmentModeValue;
  }

  return null;
}

export function formatEnrollmentModeLabel(
  mode: string | null | undefined,
): string {
  const normalized = normalizeEnrollmentModeValue(mode);
  if (!normalized) {
    return mode ? String(mode) : "—";
  }

  return ENROLLMENT_MODE_LABELS[normalized];
}
