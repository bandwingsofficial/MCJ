// src/features/enrollments/constants/payment-status.ts

import { PaymentStatus } from "../types";

export const PAYMENT_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: PaymentStatus.PENDING,
  },
  {
    label: "Partial",
    value: PaymentStatus.PARTIAL,
  },
  {
    label: "Paid",
    value: PaymentStatus.PAID,
  },
  {
    label: "Refunded",
    value: PaymentStatus.REFUNDED,
  },
];

export const PAYMENT_STATUS_BADGE_VARIANTS = {
  [PaymentStatus.PENDING]: "warning",
  [PaymentStatus.PARTIAL]: "info",
  [PaymentStatus.PAID]: "success",
  [PaymentStatus.REFUNDED]: "default",
} as const;