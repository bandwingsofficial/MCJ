import { UploadStatus } from '../../domain/enums/upload-status.enum';
import { UploadProvider } from '../../domain/enums/upload-provider.enum';
import { UploadVisibility } from '../../domain/enums/upload-visibility.enum';

export class GetFileResult {
  constructor(
    public readonly id: string,
    public readonly bucket: string,
    public readonly objectKey: string,
    public readonly url: string,
    public readonly mimeType: string,
    public readonly extension: string,
    public readonly originalName: string,
    public readonly storedName: string,
    public readonly size: number,
    public readonly etag: string | null,
    public readonly checksum: string | null,
    public readonly status: UploadStatus,
    public readonly folder: string,
    public readonly provider: UploadProvider,
    public readonly visibility: UploadVisibility,
    public readonly metadata: Record<string, unknown> | null,
    public readonly width: number | null,
    public readonly height: number | null,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromUpload(upload: {
    id: string;
    bucket: string;
    objectKey: { getValue(): string };
    url: string;
    mimeType: { getValue(): string };
    extension: string;
    originalName: string;
    storedName: { getValue(): string };
    size: number;
    etag: string | null;
    checksum: string | null;
    status: UploadStatus;
    folder: string;
    provider: UploadProvider;
    visibility: UploadVisibility;
    metadata: Record<string, unknown> | null;
    width: number | null;
    height: number | null;
    createdBy: string | null;
    updatedBy: string | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): GetFileResult {
    return new GetFileResult(
      upload.id,
      upload.bucket,
      upload.objectKey.getValue(),
      upload.url,
      upload.mimeType.getValue(),
      upload.extension,
      upload.originalName,
      upload.storedName.getValue(),
      upload.size,
      upload.etag,
      upload.checksum,
      upload.status,
      upload.folder,
      upload.provider,
      upload.visibility,
      upload.metadata,
      upload.width,
      upload.height,
      upload.createdBy,
      upload.updatedBy,
      upload.deletedAt,
      upload.createdAt,
      upload.updatedAt,
    );
  }
}
