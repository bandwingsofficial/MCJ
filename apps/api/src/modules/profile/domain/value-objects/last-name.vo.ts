// src/modules/profile/domain/value-objects/last-name.vo.ts

export class LastName {
  private constructor(private readonly value: string) {}

  static create(value: string): LastName {
    return new LastName(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LastName): boolean {
    return this.value === other.value;
  }
}