import { extname } from 'path';

import type { UploadConfig } from '../../uploads.config';
import { InvalidFileException } from '../errors/invalid-file.exception';
import { FileTooLargeException } from '../errors/file-too-large.exception';
import { UnsupportedMimeTypeException } from '../errors/unsupported-mime-type.exception';

export interface FileValidationInput {
  mimetype: string;
  size: number;
  originalname: string;
}

export class UploadValidationService {
  constructor(private readonly config: UploadConfig) {}

  validate(file: FileValidationInput): void {
    if (!file || !file.originalname) {
      throw new InvalidFileException('File is required');
    }

    const extension = this.extractExtension(
      file.originalname,
    );

    if (
      this.config.blockedExtensions.includes(extension)
    ) {
      throw new InvalidFileException(
        'File extension is not allowed',
      );
    }

    const mimeType = file.mimetype.trim().toLowerCase();

    if (
      !this.config.allowedMimeTypes.includes(mimeType)
    ) {
      throw new UnsupportedMimeTypeException(mimeType);
    }

    if (file.size > this.config.maxSizeBytes) {
      throw new FileTooLargeException(
        this.config.maxSizeBytes / (1024 * 1024),
      );
    }
  }

  validateContent(
    buffer: Buffer,
    declaredMimeType: string,
  ): void {
    const mimeType = declaredMimeType.trim().toLowerCase();
    const detectedMimeType = this.detectMimeType(buffer);

    if (!detectedMimeType) {
      throw new InvalidFileException(
        'Unable to detect file content type',
      );
    }

    if (detectedMimeType !== mimeType) {
      throw new UnsupportedMimeTypeException(
        `${declaredMimeType} (detected ${detectedMimeType})`,
      );
    }

    if (
      !this.config.allowedMimeTypes.includes(detectedMimeType)
    ) {
      throw new UnsupportedMimeTypeException(detectedMimeType);
    }
  }

  sanitizeStoredName(
    fileName: string,
    mimeType: string,
  ): string {
    if (mimeType === 'application/pdf') {
      return this.sanitizeDocumentName(fileName);
    }

    return this.sanitizeFileName(fileName);
  }

  sanitizeFileName(fileName: string): string {
    const baseName = fileName
      .replace(/\.[^/.]+$/, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseName) {
      throw new InvalidFileException('Invalid file name');
    }

    return `${baseName}.webp`;
  }

  sanitizeDocumentName(fileName: string): string {
    const baseName = fileName
      .replace(/\.[^/.]+$/, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseName) {
      throw new InvalidFileException('Invalid file name');
    }

    return `${baseName}.pdf`;
  }

  getMaxSizeMb(): number {
    return this.config.maxSizeBytes / (1024 * 1024);
  }

  private extractExtension(fileName: string): string {
    return extname(fileName)
      .replace('.', '')
      .toLowerCase();
  }

  private detectMimeType(buffer: Buffer): string | null {
    if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
      return 'image/jpeg';
    }

    if (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      )
    ) {
      return 'image/png';
    }

    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return 'image/webp';
    }

    if (
      buffer.length >= 12 &&
      buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
      (buffer.subarray(8, 12).toString('ascii').includes('avif') ||
        buffer.subarray(8, 16).toString('ascii').includes('avif'))
    ) {
      return 'image/avif';
    }

    if (
      buffer.length >= 4 &&
      buffer.subarray(0, 4).toString('ascii') === '%PDF'
    ) {
      return 'application/pdf';
    }

    return null;
  }
}
