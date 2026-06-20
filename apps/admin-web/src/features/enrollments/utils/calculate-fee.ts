// src/features/enrollments/utils/calculate-fee.ts

export interface FeeCalculation {
  finalAmount: number;
  dueAmount: number;
}

export function calculateFee(
  feeAmount: number,
  discountAmount: number,
  paidAmount: number,
): FeeCalculation {
  const finalAmount =
    Math.max(
      feeAmount - discountAmount,
      0,
    );

  const dueAmount =
    Math.max(
      finalAmount - paidAmount,
      0,
    );

  return {
    finalAmount,
    dueAmount,
  };
}