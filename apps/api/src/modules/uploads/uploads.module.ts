import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';

import { UPLOADS_TOKENS } from './uploads.tokens';
import {
  createUploadConfigFromEnv,
  type UploadConfig,
} from './uploads.config';

import type { UploadRepository } from './domain/repositories/upload.repository';
import { UploadValidationService } from './domain/services/upload-validation.service';
import { ObjectKeyService } from './domain/services/object-key.service';
import { UploadDomainService } from './domain/services/upload-domain.service';

import { AwsS3Service } from './infrastructure/aws/aws-s3.service';
import { PrismaUploadRepository } from './infrastructure/repositories/prisma-upload.repository';
import { SharpImageProcessor } from './infrastructure/services/sharp-image-processor.service';
import type { ImageProcessor } from './application/ports/image-processor.port';

import { UploadFileHandler } from './application/upload-file/upload-file.handler';
import { ReplaceFileHandler } from './application/replace-file/replace-file.handler';
import { DeleteFileHandler } from './application/delete-file/delete-file.handler';
import { DeleteFilesHandler } from './application/delete-files/delete-files.handler';
import { GetFileHandler } from './application/get-file/get-file.handler';
import { GetSignedUrlHandler } from './application/get-signed-url/get-signed-url.handler';
import { CopyFileHandler } from './application/copy-file/copy-file.handler';
import { MoveFileHandler } from './application/move-file/move-file.handler';
import { GetFileByUrlHandler } from './application/get-file-by-url/get-file-by-url.handler';
import { GetFileByObjectKeyHandler } from './application/get-file-by-object-key/get-file-by-object-key.handler';
import { PermanentDeleteUploadHandler } from './application/permanent-delete-upload/permanent-delete-upload.handler';
import { RestoreUploadHandler } from './application/restore-upload/restore-upload.handler';
import { RestoreUploadsHandler } from './application/restore-uploads/restore-uploads.handler';

import { UploadController } from './presentation/controllers/upload.controller';

@Module({
  imports: [PrismaModule, AuthModule],

  controllers: [UploadController],

  providers: [
    SuperAdminGuard,
    ObjectKeyService,

    {
      provide: UPLOADS_TOKENS.UPLOAD_CONFIG,
      useFactory: (config: ConfigService): UploadConfig =>
        createUploadConfigFromEnv({
          AWS_REGION: config.get<string>('AWS_REGION'),
          AWS_S3_BUCKET: config.get<string>('AWS_S3_BUCKET'),
          AWS_ACCESS_KEY_ID:
            config.get<string>('AWS_ACCESS_KEY_ID'),
          AWS_SECRET_ACCESS_KEY: config.get<string>(
            'AWS_SECRET_ACCESS_KEY',
          ),
          UPLOAD_MAX_SIZE_MB: config.get<string>(
            'UPLOAD_MAX_SIZE_MB',
          ),
          UPLOAD_ALLOWED_MIME_TYPES: config.get<string>(
            'UPLOAD_ALLOWED_MIME_TYPES',
          ),
          UPLOAD_BLOCKED_EXTENSIONS: config.get<string>(
            'UPLOAD_BLOCKED_EXTENSIONS',
          ),
          UPLOAD_WEBP_QUALITY: config.get<string>(
            'UPLOAD_WEBP_QUALITY',
          ),
          UPLOAD_MAX_IMAGE_WIDTH: config.get<string>(
            'UPLOAD_MAX_IMAGE_WIDTH',
          ),
          UPLOAD_MULTIPART_THRESHOLD_MB: config.get<string>(
            'UPLOAD_MULTIPART_THRESHOLD_MB',
          ),
          UPLOAD_SIGNED_URL_EXPIRY_SECONDS: config.get<string>(
            'UPLOAD_SIGNED_URL_EXPIRY_SECONDS',
          ),
          UPLOAD_PUBLIC_URL_BASE: config.get<string>(
            'UPLOAD_PUBLIC_URL_BASE',
          ),
        }),
      inject: [ConfigService],
    },

    {
      provide: UPLOADS_TOKENS.UPLOAD_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaUploadRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: UPLOADS_TOKENS.AWS_S3_SERVICE,
      useFactory: (config: UploadConfig) =>
        new AwsS3Service(config),
      inject: [UPLOADS_TOKENS.UPLOAD_CONFIG],
    },

    {
      provide: UPLOADS_TOKENS.IMAGE_PROCESSOR,
      useFactory: (config: UploadConfig): ImageProcessor =>
        new SharpImageProcessor(config),
      inject: [UPLOADS_TOKENS.UPLOAD_CONFIG],
    },

    {
      provide: UploadValidationService,
      useFactory: (config: UploadConfig) =>
        new UploadValidationService(config),
      inject: [UPLOADS_TOKENS.UPLOAD_CONFIG],
    },

    {
      provide: UploadDomainService,
      useFactory: (
        uploadRepo: UploadRepository,
        awsS3: AwsS3Service,
        objectKeyService: ObjectKeyService,
      ) =>
        new UploadDomainService(uploadRepo, awsS3, objectKeyService),
      inject: [
        UPLOADS_TOKENS.UPLOAD_REPOSITORY,
        UPLOADS_TOKENS.AWS_S3_SERVICE,
        ObjectKeyService,
      ],
    },

    {
      provide: UploadFileHandler,
      useFactory: (
        uploadRepo: UploadRepository,
        awsS3: AwsS3Service,
        imageProcessor: ImageProcessor,
        validationService: UploadValidationService,
        objectKeyService: ObjectKeyService,
      ) =>
        new UploadFileHandler(
          uploadRepo,
          awsS3,
          imageProcessor,
          validationService,
          objectKeyService,
        ),
      inject: [
        UPLOADS_TOKENS.UPLOAD_REPOSITORY,
        UPLOADS_TOKENS.AWS_S3_SERVICE,
        UPLOADS_TOKENS.IMAGE_PROCESSOR,
        UploadValidationService,
        ObjectKeyService,
      ],
    },

    {
      provide: ReplaceFileHandler,
      useFactory: (
        uploadRepo: UploadRepository,
        uploadDomainService: UploadDomainService,
        awsS3: AwsS3Service,
        imageProcessor: ImageProcessor,
        validationService: UploadValidationService,
      ) =>
        new ReplaceFileHandler(
          uploadRepo,
          uploadDomainService,
          awsS3,
          imageProcessor,
          validationService,
        ),
      inject: [
        UPLOADS_TOKENS.UPLOAD_REPOSITORY,
        UploadDomainService,
        UPLOADS_TOKENS.AWS_S3_SERVICE,
        UPLOADS_TOKENS.IMAGE_PROCESSOR,
        UploadValidationService,
      ],
    },

    {
      provide: DeleteFileHandler,
      useFactory: (uploadDomainService: UploadDomainService) =>
        new DeleteFileHandler(uploadDomainService),
      inject: [UploadDomainService],
    },

    {
      provide: DeleteFilesHandler,
      useFactory: (uploadDomainService: UploadDomainService) =>
        new DeleteFilesHandler(uploadDomainService),
      inject: [UploadDomainService],
    },

    {
      provide: GetFileHandler,
      useFactory: (uploadRepo: UploadRepository) =>
        new GetFileHandler(uploadRepo),
      inject: [UPLOADS_TOKENS.UPLOAD_REPOSITORY],
    },

    {
      provide: GetSignedUrlHandler,
      useFactory: (
        uploadDomainService: UploadDomainService,
        awsS3: AwsS3Service,
        config: UploadConfig,
      ) =>
        new GetSignedUrlHandler(
          uploadDomainService,
          awsS3,
          config,
        ),
      inject: [
        UploadDomainService,
        UPLOADS_TOKENS.AWS_S3_SERVICE,
        UPLOADS_TOKENS.UPLOAD_CONFIG,
      ],
    },

    {
      provide: CopyFileHandler,
      useFactory: (
        uploadRepo: UploadRepository,
        uploadDomainService: UploadDomainService,
        awsS3: AwsS3Service,
        validationService: UploadValidationService,
        objectKeyService: ObjectKeyService,
      ) =>
        new CopyFileHandler(
          uploadRepo,
          uploadDomainService,
          awsS3,
          objectKeyService,
          validationService,
        ),
      inject: [
        UPLOADS_TOKENS.UPLOAD_REPOSITORY,
        UploadDomainService,
        UPLOADS_TOKENS.AWS_S3_SERVICE,
        UploadValidationService,
        ObjectKeyService,
      ],
    },

    {
      provide: MoveFileHandler,
      useFactory: (uploadDomainService: UploadDomainService) =>
        new MoveFileHandler(uploadDomainService),
      inject: [UploadDomainService],
    },

    {
      provide: GetFileByUrlHandler,
      useFactory: (uploadRepo: UploadRepository) =>
        new GetFileByUrlHandler(uploadRepo),
      inject: [UPLOADS_TOKENS.UPLOAD_REPOSITORY],
    },

    {
      provide: GetFileByObjectKeyHandler,
      useFactory: (uploadRepo: UploadRepository) =>
        new GetFileByObjectKeyHandler(uploadRepo),
      inject: [UPLOADS_TOKENS.UPLOAD_REPOSITORY],
    },

    {
      provide: PermanentDeleteUploadHandler,
      useFactory: (uploadDomainService: UploadDomainService) =>
        new PermanentDeleteUploadHandler(uploadDomainService),
      inject: [UploadDomainService],
    },

    {
      provide: RestoreUploadHandler,
      useFactory: (uploadDomainService: UploadDomainService) =>
        new RestoreUploadHandler(uploadDomainService),
      inject: [UploadDomainService],
    },

    {
      provide: RestoreUploadsHandler,
      useFactory: (uploadDomainService: UploadDomainService) =>
        new RestoreUploadsHandler(uploadDomainService),
      inject: [UploadDomainService],
    },
  ],

  exports: [
    UPLOADS_TOKENS.UPLOAD_REPOSITORY,
    UploadDomainService,
    UploadFileHandler,
    ReplaceFileHandler,
    DeleteFileHandler,
    DeleteFilesHandler,
    GetFileHandler,
    UPLOADS_TOKENS.AWS_S3_SERVICE,
  ],
})
export class UploadsModule {}
