// src/features/enrollments/utils/payment-status-color.ts

import {
  PaymentStatus,
} from "../types";

export function getPaymentStatusVariant(
  status: PaymentStatus,
):
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info" {
  switch (status) {
    case PaymentStatus.PAID:
      return "success";

    case PaymentStatus.PARTIAL:
      return "info";

    case PaymentStatus.PENDING:
      return "warning";

    case PaymentStatus.REFUNDED:
      return "default";

    default:
      return "default";
  }
}