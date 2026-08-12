import { InvalidFileException } from '../errors/invalid-file.exception';

export class ObjectKey {
  private constructor(private readonly value: string) {}

  static create(value: string): ObjectKey {
    const normalized = value
      .trim()
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');

    if (!normalized || normalized.includes('..')) {
      throw new InvalidFileException('Invalid object key');
    }

    return new ObjectKey(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
