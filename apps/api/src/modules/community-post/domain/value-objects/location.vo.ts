export class Location {
  private constructor(private readonly value: string | null) {}

  static create(value?: string | null): Location {
    if (value === null || value === undefined || value === '') {
      return new Location(null);
    }

    return new Location(value.trim());
  }

  getValue(): string | null {
    return this.value;
  }
}
