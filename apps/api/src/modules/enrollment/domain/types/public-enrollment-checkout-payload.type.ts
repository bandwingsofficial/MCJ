export const PUBLIC_ENROLLMENT_CHECKOUT_PAYLOAD_VERSION = 1;

export interface PublicEnrollmentCheckoutPayload {
  version: typeof PUBLIC_ENROLLMENT_CHECKOUT_PAYLOAD_VERSION;
  batchId: string;
  batchTimingId: string;
  branchId: string;
  courseId: string;
  coinsToRedeem: number;
}

export function parsePublicEnrollmentCheckoutPayload(
  value: unknown,
): PublicEnrollmentCheckoutPayload | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (record.version !== PUBLIC_ENROLLMENT_CHECKOUT_PAYLOAD_VERSION) {
    return null;
  }

  const batchId = String(record.batchId ?? '');
  const batchTimingId = String(record.batchTimingId ?? '');
  const branchId = String(record.branchId ?? '');
  const courseId = String(record.courseId ?? '');
  const coinsToRedeem = Number(record.coinsToRedeem ?? 0);

  if (
    !batchId ||
    !batchTimingId ||
    !branchId ||
    !courseId ||
    !Number.isFinite(coinsToRedeem) ||
    coinsToRedeem < 0
  ) {
    return null;
  }

  return {
    version: PUBLIC_ENROLLMENT_CHECKOUT_PAYLOAD_VERSION,
    batchId,
    batchTimingId,
    branchId,
    courseId,
    coinsToRedeem: Math.floor(coinsToRedeem),
  };
}
