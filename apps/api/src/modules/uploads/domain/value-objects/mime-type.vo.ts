import { UnsupportedMimeTypeException } from '../errors/unsupported-mime-type.exception';

export class MimeType {
  private constructor(private readonly value: string) {}

  static create(value: string): MimeType {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      throw new UnsupportedMimeTypeException(value);
    }

    return new MimeType(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
