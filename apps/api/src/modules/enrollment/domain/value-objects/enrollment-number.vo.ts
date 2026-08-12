import { InvalidEnrollmentNumberException } from '../errors/enrollment-business.exception';

export class EnrollmentNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): EnrollmentNumber {
    const normalized = value?.trim().toUpperCase();

    if (!normalized) {
      throw new InvalidEnrollmentNumberException(
        'Enrollment number is required.',
      );
    }

    if (!/^[A-Z0-9-_]{2,60}$/.test(normalized)) {
      throw new InvalidEnrollmentNumberException();
    }

    return new EnrollmentNumber(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
