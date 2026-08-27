import { randomUUID } from 'crypto';
import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';

import type { UploadRepository } from '../../domain/repositories/upload.repository';
import { Upload } from '../../domain/entities/upload.entity';
import { UploadVisibility } from '../../domain/enums/upload-visibility.enum';
import { UploadValidationService } from '../../domain/services/upload-validation.service';
import { ObjectKeyService } from '../../domain/services/object-key.service';
import type { ImageProcessor } from '../ports/image-processor.port';
import { AwsS3Service } from '../../infrastructure/aws/aws-s3.service';

import { UploadFileCommand } from './upload-file.command';
import { UploadFileResult } from './upload-file.result';

export class UploadFileHandler {
  private readonly logger = new Logger(UploadFileHandler.name);

  constructor(
    private readonly uploadRepo: UploadRepository,
    private readonly awsS3: AwsS3Service,
    private readonly imageProcessor: ImageProcessor,
    private readonly validationService: UploadValidationService,
    private readonly objectKeyService: ObjectKeyService,
  ) {}

  async execute(
    command: UploadFileCommand,
  ): Promise<UploadFileResult> {
    const startedAt = Date.now();
    const uploadId = randomUUID();

    this.validationService.validate(command.file);

    const mimeType = command.file.mimetype.trim().toLowerCase();
    const isPdf = mimeType === 'application/pdf';
    const isDocument =
      isPdf ||
      mimeType === 'application/msword' ||
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isPdf) {
      this.validationService.validateContent(
        command.file.buffer,
        mimeType,
      );
    }

    const sanitizedStoredName = isDocument
      ? this.validationService.sanitizeDocumentName(
          command.fileName,
          mimeType,
        )
      : this.validationService.sanitizeFileName(command.fileName);

    const objectKey = this.objectKeyService
      .generateObjectKey({
        folder: command.folder,
        entityId: command.entityId,
        fileName: sanitizedStoredName,
        uploadId,
      })
      .getValue();

    this.logger.log(
      `Upload started: ${objectKey} by ${command.createdBy ?? 'system'}`,
    );

    const processed = isDocument
      ? {
          buffer: command.file.buffer,
          mimeType,
          extension: this.extensionFromMime(mimeType),
          storedName: sanitizedStoredName,
          size: command.file.size,
          width: null as number | null,
          height: null as number | null,
        }
      : await this.imageProcessor.optimize(command.file.buffer);

    const checksum = createHash('sha256')
      .update(processed.buffer)
      .digest('hex');

    const stored = await this.awsS3.upload({
      body: processed.buffer,
      objectKey,
      mimeType: processed.mimeType,
      size: processed.size,
      visibility: command.visibility ?? UploadVisibility.PUBLIC,
    });

    const upload = Upload.create({
      id: uploadId,
      bucket: this.awsS3.getBucket(),
      objectKey: stored.objectKey,
      url: stored.url,
      mimeType: processed.mimeType,
      extension: processed.extension,
      originalName: command.file.originalname,
      storedName: processed.storedName ?? sanitizedStoredName,
      size: processed.size,
      etag: stored.etag,
      checksum,
      folder: command.folder,
      visibility: command.visibility ?? UploadVisibility.PUBLIC,
      metadata: command.metadata ?? null,
      width: processed.width ?? null,
      height: processed.height ?? null,
      createdBy: command.createdBy,
    });

    try {
      await this.uploadRepo.save(upload);
    } catch (error) {
      try {
        await this.awsS3.delete(stored.objectKey);
      } catch (cleanupError) {
        this.logger.error(
          `Failed to rollback S3 upload ${stored.objectKey}`,
          cleanupError instanceof Error
            ? cleanupError.stack
            : undefined,
        );
      }

      throw error;
    }

    this.logger.log(
      `Upload finished: ${objectKey} in ${Date.now() - startedAt}ms`,
    );

    return UploadFileResult.fromUpload(upload);
  }

  private extensionFromMime(mimeType: string): string {
    if (mimeType === 'application/msword') {
      return 'doc';
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return 'docx';
    }

    if (mimeType === 'application/pdf') {
      return 'pdf';
    }

    return 'bin';
  }
}
