const STORAGE_PREFIX = "mcj-admin-online-enrollment-notification-since";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function readEnrollmentNotificationWatermark(
  userId: string,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

export function writeEnrollmentNotificationWatermark(
  userId: string,
  isoTimestamp: string,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), isoTimestamp);
  } catch {
    // ignore quota / privacy mode
  }
}

/** First visit: only notify for enrollments created after this moment. */
export function bootstrapEnrollmentNotificationWatermark(userId: string): string {
  const existing = readEnrollmentNotificationWatermark(userId);
  if (existing) return existing;
  const now = new Date().toISOString();
  writeEnrollmentNotificationWatermark(userId, now);
  return now;
}
