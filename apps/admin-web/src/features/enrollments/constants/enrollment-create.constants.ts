export const ENROLLMENT_PAYMENT_METHODS = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "CARD" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "Other", value: "CHEQUE" },
] as const;

export type EnrollmentPaymentMethod =
  (typeof ENROLLMENT_PAYMENT_METHODS)[number]["value"];

export const ENROLLMENT_INSTALLMENT_STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "SUCCESS" },
] as const;

export function requiresPaymentReference(method: string): boolean {
  return method === "UPI" || method === "CARD" || method === "BANK_TRANSFER";
}

export function paymentReferenceLabel(method: string): string {
  if (method === "UPI") {
    return "UPI Transaction ID / Reference";
  }

  if (method === "BANK_TRANSFER" || method === "CARD") {
    return "Transaction / Reference Number";
  }

  return "Reference";
}

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
