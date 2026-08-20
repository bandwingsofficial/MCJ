import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { EnrollmentListResponse } from "@/src/features/enrollments/types/enrollment.dto";
import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

export interface ParsedEnrollmentList {
  items: Enrollment[];
  total: number;
}

function normalizeEnrollmentFinancials(enrollment: Enrollment): Enrollment {
  return {
    ...enrollment,
    feeAmount: normalizeMoney(enrollment.feeAmount),
    discountAmount: normalizeMoney(enrollment.discountAmount),
    finalAmount: normalizeMoney(enrollment.finalAmount),
    paidAmount: normalizeMoney(enrollment.paidAmount),
    dueAmount: normalizeMoney(enrollment.dueAmount),
  };
}

export function parseEnrollmentListResponse(
  payload: EnrollmentListResponse | { data?: EnrollmentListResponse["data"] } | unknown,
): ParsedEnrollmentList {
  if (!payload || typeof payload !== "object") {
    return { items: [], total: 0 };
  }

  const root = payload as EnrollmentListResponse;
  const data = root.data;

  if (!data || typeof data !== "object") {
    return { items: [], total: 0 };
  }

  const items = Array.isArray(data.items)
    ? data.items.map((item) => normalizeEnrollmentFinancials(item))
    : [];
  const total = typeof data.total === "number" ? data.total : items.length;

  return { items, total };
}
