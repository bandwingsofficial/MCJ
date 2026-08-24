export class PaymentCancelledError extends Error {
  constructor() {
    super("Payment cancelled by user.");
    this.name = "PaymentCancelledError";
  }
}

export function isPaymentCancelledError(
  error: unknown,
): error is PaymentCancelledError {
  return error instanceof PaymentCancelledError;
}
