// src/features/enrollments/utils/payment-status-color.ts

import { PaymentStatus } from "../types";

export function getPaymentStatusVariant(
  status: PaymentStatus,
):
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info" {
  switch (status) {
    case PaymentStatus.UNPAID:
      return "warning";

    case PaymentStatus.PARTIAL:
      return "info";

    case PaymentStatus.PAID:
      return "success";

    default:
      return "default";
  }
}