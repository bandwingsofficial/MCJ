import { InvalidFileException } from '../errors/invalid-file.exception';

export class FileName {
  private constructor(private readonly value: string) {}

  static create(value: string): FileName {
    const normalized = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!normalized) {
      throw new InvalidFileException('Invalid file name');
    }

    return new FileName(normalized);
  }

  getValue(): string {
    return this.value;
  }
}
