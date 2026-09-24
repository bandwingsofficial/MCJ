import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { EnrollmentListResponse } from "@/src/features/enrollments/types/enrollment.dto";
import { normalizeEnrollmentStatus } from "@/src/features/enrollments/utils/current-enrollment";
import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

export interface ParsedEnrollmentList {
  items: Enrollment[];
  total: number;
}

function unwrapEnrollmentListData(
  payload: unknown,
): { items: unknown[]; total: number } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;

  const nested = root.data;
  if (nested && typeof nested === "object") {
    const data = nested as Record<string, unknown>;
    if (Array.isArray(data.items)) {
      return {
        items: data.items,
        total: typeof data.total === "number" ? data.total : data.items.length,
      };
    }
    if (Array.isArray(data.enrollments)) {
      return {
        items: data.enrollments,
        total:
          typeof data.total === "number" ? data.total : data.enrollments.length,
      };
    }
  }

  if (Array.isArray(root.items)) {
    return {
      items: root.items,
      total: typeof root.total === "number" ? root.total : root.items.length,
    };
  }

  return null;
}

function normalizeEnrollmentListItem(raw: unknown): Enrollment {
  const record =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);

  const statusRaw =
    record.status ??
    record.enrollmentStatus ??
    record.enrollment_status;

  const normalizedStatus = normalizeEnrollmentStatus(
    typeof statusRaw === "string" ? statusRaw : null,
  );

  const enrollment = {
    ...(record as Enrollment),
    status: (normalizedStatus ??
      (typeof statusRaw === "string" ? statusRaw : undefined)) as Enrollment["status"],
    isDeleted: Boolean(record.isDeleted ?? record.is_deleted),
  };

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
  const unwrapped = unwrapEnrollmentListData(payload);
  if (!unwrapped) {
    return { items: [], total: 0 };
  }

  const items = unwrapped.items.map((item) => normalizeEnrollmentListItem(item));

  return {
    items,
    total: unwrapped.total,
  };
}
