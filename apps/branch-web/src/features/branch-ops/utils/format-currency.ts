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

export function formatCurrency(amount: unknown, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(normalizeMoney(amount));
}
