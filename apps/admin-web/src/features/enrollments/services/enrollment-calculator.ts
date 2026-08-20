// src/features/enrollments/services/enrollment-calculator.ts

import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

export interface EnrollmentCalculation {
  finalAmount: number;
  dueAmount: number;
}

export function calculateEnrollmentAmounts(
  feeAmount: number,
  discountAmount: number,
  paidAmount: number,
): EnrollmentCalculation {
  const fee = normalizeMoney(feeAmount);
  const discount = normalizeMoney(discountAmount);
  const paid = normalizeMoney(paidAmount);
  const finalAmount = Math.max(fee - discount, 0);
  const dueAmount = Math.max(finalAmount - paid, 0);

  return {
    finalAmount,
    dueAmount,
  };
}
