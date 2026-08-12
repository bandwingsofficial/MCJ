import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import type { UploadRepository } from '../../domain/repositories/upload.repository';
import { Upload } from '../../domain/entities/upload.entity';
import { UploadDomainService } from '../../domain/services/upload-domain.service';
import { ObjectKeyService } from '../../domain/services/object-key.service';
import { UploadValidationService } from '../../domain/services/upload-validation.service';
import { AwsS3Service } from '../../infrastructure/aws/aws-s3.service';

import { CopyFileCommand } from './copy-file.command';
import { CopyFileResult } from './copy-file.result';
import { UploadFileResult } from '../upload-file/upload-file.result';

export class CopyFileHandler {
  private readonly logger = new Logger(CopyFileHandler.name);

  constructor(
    private readonly uploadRepo: UploadRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly awsS3: AwsS3Service,
    private readonly objectKeyService: ObjectKeyService,
    private readonly validationService: UploadValidationService,
  ) {}

  async execute(
    command: CopyFileCommand,
  ): Promise<CopyFileResult> {
    const source = await this.uploadDomainService.ensureActive(
      command.id,
    );

    const sanitizedFileName =
      this.validationService.sanitizeStoredName(
        command.fileName,
        source.mimeType.getValue(),
      );

    const destinationKey = this.objectKeyService
      .buildFinalObjectKey({
        folder: command.folder,
        entityId: command.entityId,
        fileName: sanitizedFileName,
      })
      .getValue();

    this.logger.log(
      `Copy started: ${source.objectKey.getValue()} -> ${destinationKey}`,
    );

    const copied = await this.awsS3.copy({
      sourceKey: source.objectKey.getValue(),
      destinationKey,
    });

    const upload = Upload.create({
      id: randomUUID(),
      bucket: this.awsS3.getBucket(),
      objectKey: copied.objectKey,
      url: copied.url,
      mimeType: source.mimeType.getValue(),
      extension: source.extension,
      originalName: source.originalName,
      storedName: sanitizedFileName,
      size: source.size,
      etag: copied.etag,
      folder: command.folder,
      createdBy: source.createdBy,
    });

    try {
      await this.uploadRepo.save(upload);
    } catch (error) {
      try {
        await this.awsS3.delete(copied.objectKey);
      } catch (cleanupError) {
        this.logger.error(
          `Failed to rollback copied object ${copied.objectKey}`,
          cleanupError instanceof Error
            ? cleanupError.stack
            : undefined,
        );
      }

      throw error;
    }

    this.logger.log(`Copy finished: ${destinationKey}`);

    return UploadFileResult.fromUpload(
      upload,
    ) as CopyFileResult;
  }
}
