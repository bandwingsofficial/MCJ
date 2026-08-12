import { InvalidPaymentNumberException } from '../errors/payment-business.exception';

export class PaymentNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): PaymentNumber {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      throw new InvalidPaymentNumberException(
        'Payment number is required.',
      );
    }

    if (!/^[A-Z0-9-_]{2,60}$/.test(normalized)) {
      throw new InvalidPaymentNumberException();
    }

    return new PaymentNumber(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
