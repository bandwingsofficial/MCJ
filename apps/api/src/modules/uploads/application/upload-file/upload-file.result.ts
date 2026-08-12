import { UploadStatus } from '../../domain/enums/upload-status.enum';
import { UploadProvider } from '../../domain/enums/upload-provider.enum';
import { UploadVisibility } from '../../domain/enums/upload-visibility.enum';

export class UploadFileResult {
  constructor(
    public readonly fileId: string,
    public readonly url: string,
    public readonly objectKey: string,
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
    public readonly width: number | null,
    public readonly height: number | null,
    public readonly createdAt: Date,
  ) {}

  static fromUpload(upload: {
    id: string;
    url: string;
    objectKey: { getValue(): string };
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
    width: number | null;
    height: number | null;
    createdAt: Date;
  }): UploadFileResult {
    return new UploadFileResult(
      upload.id,
      upload.url,
      upload.objectKey.getValue(),
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
      upload.width,
      upload.height,
      upload.createdAt,
    );
  }
}
