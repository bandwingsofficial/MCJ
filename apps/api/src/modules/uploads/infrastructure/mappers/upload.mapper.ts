import {
  Upload as PrismaUpload,
  Prisma,
  UploadStatus as PrismaUploadStatus,
  UploadProvider as PrismaUploadProvider,
  UploadVisibility as PrismaUploadVisibility,
} from '@prisma/client';

import { Upload } from '../../domain/entities/upload.entity';
import { UploadStatus } from '../../domain/enums/upload-status.enum';
import { UploadProvider } from '../../domain/enums/upload-provider.enum';
import { UploadVisibility } from '../../domain/enums/upload-visibility.enum';

export class UploadMapper {
  static toDomain(record: PrismaUpload): Upload {
    return Upload.reconstitute({
      id: record.id,
      bucket: record.bucket,
      objectKey: record.objectKey,
      url: record.url,
      mimeType: record.mimeType,
      extension: record.extension,
      originalName: record.originalName,
      storedName: record.storedName,
      size: record.size,
      etag: record.etag,
      checksum: record.checksum,
      folder: record.folder,
      provider: record.provider as UploadProvider,
      visibility: record.visibility as UploadVisibility,
      metadata:
        (record.metadata as Record<string, unknown> | null) ?? null,
      width: record.width,
      height: record.height,
      status: record.status as UploadStatus,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    upload: Upload,
  ): Prisma.UploadUncheckedCreateInput {
    return {
      id: upload.id,
      bucket: upload.bucket,
      objectKey: upload.objectKey.getValue(),
      url: upload.url,
      mimeType: upload.mimeType.getValue(),
      extension: upload.extension,
      originalName: upload.originalName,
      storedName: upload.storedName.getValue(),
      size: upload.size,
      etag: upload.etag,
      checksum: upload.checksum,
      folder: upload.folder,
      provider: upload.provider as PrismaUploadProvider,
      visibility: upload.visibility as PrismaUploadVisibility,
      metadata:
        (upload.metadata as Prisma.InputJsonValue) ?? undefined,
      width: upload.width,
      height: upload.height,
      status: upload.status as PrismaUploadStatus,
      createdBy: upload.createdBy,
      updatedBy: upload.updatedBy,
      deletedAt: upload.deletedAt,
      createdAt: upload.createdAt,
      updatedAt: upload.updatedAt,
    };
  }
}
