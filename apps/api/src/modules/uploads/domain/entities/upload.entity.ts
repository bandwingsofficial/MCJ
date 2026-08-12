import { UploadStatus } from '../enums/upload-status.enum';
import { UploadProvider } from '../enums/upload-provider.enum';
import { UploadVisibility } from '../enums/upload-visibility.enum';
import { FileName } from '../value-objects/file-name.vo';
import { MimeType } from '../value-objects/mime-type.vo';
import { ObjectKey } from '../value-objects/object-key.vo';

export class Upload {
  private constructor(
    public readonly id: string,
    public bucket: string,
    public objectKey: ObjectKey,
    public url: string,
    public mimeType: MimeType,
    public extension: string,
    public originalName: string,
    public storedName: FileName,
    public size: number,
    public etag: string | null,
    public checksum: string | null,
    public folder: string,
    public provider: UploadProvider,
    public visibility: UploadVisibility,
    public metadata: Record<string, unknown> | null,
    public width: number | null,
    public height: number | null,
    public status: UploadStatus,
    public createdBy: string | null,
    public updatedBy: string | null,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    bucket: string;
    objectKey: string;
    url: string;
    mimeType: string;
    extension: string;
    originalName: string;
    storedName: string;
    size: number;
    etag?: string | null;
    checksum?: string | null;
    folder: string;
    provider?: UploadProvider;
    visibility?: UploadVisibility;
    metadata?: Record<string, unknown> | null;
    width?: number | null;
    height?: number | null;
    createdBy?: string | null;
  }): Upload {
    return new Upload(
      params.id,
      params.bucket,
      ObjectKey.create(params.objectKey),
      params.url,
      MimeType.create(params.mimeType),
      params.extension,
      params.originalName,
      FileName.create(params.storedName),
      params.size,
      params.etag ?? null,
      params.checksum ?? null,
      params.folder,
      params.provider ?? UploadProvider.AWS_S3,
      params.visibility ?? UploadVisibility.PUBLIC,
      params.metadata ?? null,
      params.width ?? null,
      params.height ?? null,
      UploadStatus.ACTIVE,
      params.createdBy ?? null,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    bucket: string;
    objectKey: string;
    url: string;
    mimeType: string;
    extension: string;
    originalName: string;
    storedName: string;
    size: number;
    etag: string | null;
    checksum: string | null;
    folder: string;
    provider: UploadProvider;
    visibility: UploadVisibility;
    metadata: Record<string, unknown> | null;
    width: number | null;
    height: number | null;
    status: UploadStatus;
    createdBy: string | null;
    updatedBy: string | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Upload {
    return new Upload(
      params.id,
      params.bucket,
      ObjectKey.create(params.objectKey),
      params.url,
      MimeType.create(params.mimeType),
      params.extension,
      params.originalName,
      FileName.create(params.storedName),
      params.size,
      params.etag,
      params.checksum,
      params.folder,
      params.provider,
      params.visibility,
      params.metadata,
      params.width,
      params.height,
      params.status,
      params.createdBy,
      params.updatedBy,
      params.deletedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  replace(params: {
    url: string;
    mimeType: string;
    extension: string;
    storedName: string;
    size: number;
    etag?: string | null;
    checksum?: string | null;
    width?: number | null;
    height?: number | null;
    updatedBy?: string | null;
  }) {
    this.url = params.url;
    this.mimeType = MimeType.create(params.mimeType);
    this.extension = params.extension;
    this.storedName = FileName.create(params.storedName);
    this.size = params.size;
    this.etag = params.etag ?? null;
    this.checksum = params.checksum ?? null;
    this.width = params.width ?? null;
    this.height = params.height ?? null;
    this.status = UploadStatus.ACTIVE;
    this.deletedAt = null;
    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  relocate(params: { objectKey: string; url: string }) {
    this.objectKey = ObjectKey.create(params.objectKey);
    this.url = params.url;
    this.touch();
  }

  archiveOwnership(params: {
    objectKey: string;
    url: string;
    updatedBy?: string | null;
  }) {
    this.relocate({
      objectKey: params.objectKey,
      url: params.url,
    });
    this.softDelete(params.updatedBy);
  }

  softDelete(updatedBy?: string | null) {
    this.status = UploadStatus.DELETED;
    this.deletedAt = new Date();
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.status = UploadStatus.ACTIVE;
    this.deletedAt = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  isActive(): boolean {
    return this.status === UploadStatus.ACTIVE;
  }

  isDeleted(): boolean {
    return this.status === UploadStatus.DELETED;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
