// src/features/enrollments/constants/payment-status.ts

import { PaymentStatus } from "../types";

export const PAYMENT_STATUS_OPTIONS = [
  {
    label: "Unpaid",
    value: PaymentStatus.UNPAID,
  },
  {
    label: "Partial",
    value: PaymentStatus.PARTIAL,
  },
  {
    label: "Paid",
    value: PaymentStatus.PAID,
  },
];

export const PAYMENT_STATUS_BADGE_VARIANTS = {
  [PaymentStatus.UNPAID]: "warning",
  [PaymentStatus.PARTIAL]: "info",
  [PaymentStatus.PAID]: "success",
} as const;