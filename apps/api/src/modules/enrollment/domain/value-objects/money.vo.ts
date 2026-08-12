import { InvalidPaymentAmountException } from '../errors/enrollment-business.exception';

export class Money {
  private constructor(private readonly value: number) {}

  static create(value?: number | null): Money {
    const amount = value ?? 0;

    if (!Number.isFinite(amount) || amount < 0) {
      throw new InvalidPaymentAmountException(
        'Amount must be a non-negative number.',
      );
    }

    return new Money(Math.round(amount * 100) / 100);
  }

  getValue(): number {
    return this.value;
  }
}
