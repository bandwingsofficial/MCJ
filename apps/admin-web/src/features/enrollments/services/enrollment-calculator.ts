// src/features/enrollments/services/enrollment-calculator.ts

export interface FeeCalculation {
  finalAmount: number;
  dueAmount: number;
}

export const calculateEnrollmentFee = (
  feeAmount: number,
  discountAmount: number,
  paidAmount: number,
): FeeCalculation => {
  const finalAmount =
    feeAmount - discountAmount;

  const dueAmount =
    finalAmount - paidAmount;

  return {
    finalAmount,
    dueAmount,
  };
};