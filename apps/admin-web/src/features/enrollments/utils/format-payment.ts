// src/features/enrollments/utils/format-payment.ts

export function formatCurrency(
  amount: number,
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    },
  ).format(amount);
}

export function formatPercentage(
  value: number,
): string {
  return `${value}%`;
}