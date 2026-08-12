import { InvalidPaymentAmountException } from '../errors/payment-business.exception';

export class Amount {
  private constructor(private readonly value: number) {}

  static create(value?: number | null): Amount {
    const amount = value ?? 0;

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new InvalidPaymentAmountException(
        'Payment amount must be a positive number.',
      );
    }

    return new Amount(Math.round(amount * 100) / 100);
  }

  getValue(): number {
    return this.value;
  }
}
