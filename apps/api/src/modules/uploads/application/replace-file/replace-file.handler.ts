import { createHash } from 'crypto';
import { Logger } from '@nestjs/common';

import type { UploadRepository } from '../../domain/repositories/upload.repository';
import { UploadDomainService } from '../../domain/services/upload-domain.service';
import { UploadValidationService } from '../../domain/services/upload-validation.service';
import type { ImageProcessor } from '../ports/image-processor.port';
import { AwsS3Service } from '../../infrastructure/aws/aws-s3.service';

import { ReplaceFileCommand } from './replace-file.command';
import { ReplaceFileResult } from './replace-file.result';
import { UploadFileResult } from '../upload-file/upload-file.result';

export class ReplaceFileHandler {
  private readonly logger = new Logger(ReplaceFileHandler.name);

  constructor(
    private readonly uploadRepo: UploadRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly awsS3: AwsS3Service,
    private readonly imageProcessor: ImageProcessor,
    private readonly validationService: UploadValidationService,
  ) {}

  async execute(
    command: ReplaceFileCommand,
  ): Promise<ReplaceFileResult> {
    const startedAt = Date.now();
    const upload = await this.uploadDomainService.ensureActive(command.id);

    this.validationService.validate(command.file);
    this.validationService.validateContent(
      command.file.buffer,
      command.file.mimetype.toLowerCase(),
    );

    const isPdf =
      command.file.mimetype.toLowerCase() === 'application/pdf';

    const sanitizedStoredName = isPdf
      ? this.validationService.sanitizeDocumentName(
          upload.storedName.getValue(),
        )
      : this.validationService.sanitizeFileName(
          upload.storedName.getValue(),
        );

    this.logger.log(`Replace started: ${upload.objectKey.getValue()}`);

    const processed = isPdf
      ? {
          buffer: command.file.buffer,
          mimeType: 'application/pdf',
          extension: 'pdf',
          storedName: sanitizedStoredName,
          size: command.file.size,
          width: null as number | null,
          height: null as number | null,
        }
      : await this.imageProcessor.optimize(command.file.buffer);

    const checksum = createHash('sha256')
      .update(processed.buffer)
      .digest('hex');

    const stored = await this.awsS3.replace({
      body: processed.buffer,
      objectKey: upload.objectKey.getValue(),
      mimeType: processed.mimeType,
      size: processed.size,
      visibility: upload.visibility,
    });

    upload.replace({
      url: stored.url,
      mimeType: processed.mimeType,
      extension: processed.extension,
      storedName: processed.storedName ?? sanitizedStoredName,
      size: processed.size,
      etag: stored.etag,
      checksum,
      width: processed.width ?? null,
      height: processed.height ?? null,
      updatedBy: command.updatedBy,
    });

    await this.uploadRepo.save(upload);

    this.logger.log(
      `Replace finished: ${upload.objectKey.getValue()} in ${Date.now() - startedAt}ms`,
    );

    return UploadFileResult.fromUpload(upload) as ReplaceFileResult;
  }
}
