// src/features/enrollments/utils/calculate-fee.ts

import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

export interface FeeCalculation {
  finalAmount: number;
  dueAmount: number;
}

export function calculateFee(
  feeAmount: number,
  discountAmount: number,
  paidAmount: number,
): FeeCalculation {
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
