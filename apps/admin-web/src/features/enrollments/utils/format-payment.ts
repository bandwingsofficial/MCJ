// src/features/enrollments/utils/format-payment.ts

export function normalizeMoney(value: unknown): number {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
}

export function formatCurrency(amount: unknown): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(normalizeMoney(amount));
}

export function formatPercentage(value: number): string {
  return `${value}%`;
}
