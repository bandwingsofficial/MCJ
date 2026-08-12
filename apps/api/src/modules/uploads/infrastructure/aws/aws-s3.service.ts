import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { Readable } from 'stream';

import { SanitizeUtil } from '@common/utils/sanitize.util';

import { UploadVisibility } from '../../domain/enums/upload-visibility.enum';
import type { UploadConfig } from '../../uploads.config';
import { S3DeleteFailedException } from '../../domain/errors/s3-delete-failed.exception';
import { S3UploadFailedException } from '../../domain/errors/s3-upload-failed.exception';
import { InvalidFileException } from '../../domain/errors/invalid-file.exception';
import { ObjectKeyService } from '../../domain/services/object-key.service';

export interface S3UploadParams {
  body: Buffer | Readable;
  objectKey: string;
  mimeType: string;
  size: number;
  visibility?: UploadVisibility;
}

export interface S3UploadResult {
  objectKey: string;
  url: string;
  etag?: string;
}

export interface S3ObjectMetadata {
  contentType?: string;
  contentLength?: number;
  etag?: string;
  lastModified?: Date;
}

export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly client: S3Client;
  private readonly objectKeyService = new ObjectKeyService();

  constructor(private readonly config: UploadConfig) {
    this.client = new S3Client({
      region: this.config.region,
      credentials:
        this.config.accessKeyId &&
        this.config.secretAccessKey
          ? {
              accessKeyId: this.config.accessKeyId,
              secretAccessKey:
                this.config.secretAccessKey,
            }
          : undefined,
    });
  }

  async upload(
    params: S3UploadParams,
  ): Promise<S3UploadResult> {
    this.ensureBucketConfigured();

    const objectKey = this.sanitizeKey(params.objectKey);
    const startedAt = Date.now();

    this.logger.log(`Upload started: ${objectKey}`);

    try {
      if (
        params.size >=
        this.config.multipartThresholdBytes
      ) {
        const upload = new Upload({
          client: this.client,
          params: this.buildObjectParams(objectKey, params),
        });

        const result = await upload.done();

        this.logger.log(
          `Upload finished: ${objectKey} in ${Date.now() - startedAt}ms`,
        );

        return {
          objectKey,
          url: this.generatePublicUrl(objectKey),
          etag: result.ETag?.replace(/"/g, ''),
        };
      }

      const result = await this.client.send(
        new PutObjectCommand(this.buildObjectParams(objectKey, params)),
      );

      this.logger.log(
        `Upload finished: ${objectKey} in ${Date.now() - startedAt}ms`,
      );

      return {
        objectKey,
        url: this.generatePublicUrl(objectKey),
        etag: result.ETag?.replace(/"/g, ''),
      };
    } catch (error) {
      this.logger.error(
        `Upload failed: ${objectKey}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new S3UploadFailedException(objectKey);
    }
  }

  async replace(
    params: S3UploadParams,
  ): Promise<S3UploadResult> {
    this.logger.log(
      `Replace started: ${params.objectKey}`,
    );

    const result = await this.upload(params);

    this.logger.log(
      `Replace finished: ${params.objectKey}`,
    );

    return result;
  }

  async delete(objectKey: string): Promise<void> {
    this.ensureBucketConfigured();

    const key = this.sanitizeKey(objectKey);
    const startedAt = Date.now();

    this.logger.log(`Delete started: ${key}`);

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      this.logger.log(
        `Delete finished: ${key} in ${Date.now() - startedAt}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Delete failed: ${key}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new S3DeleteFailedException(key);
    }
  }

  async deleteMany(objectKeys: string[]): Promise<void> {
    if (!objectKeys.length) {
      return;
    }

    this.ensureBucketConfigured();

    const keys = objectKeys.map((key) =>
      this.sanitizeKey(key),
    );

    this.logger.log(
      `Delete many started: ${keys.length} objects`,
    );

    try {
      const result = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.config.bucket,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
            Quiet: true,
          },
        }),
      );

      if (result.Errors?.length) {
        const failedKeys = result.Errors.map(
          (entry) => entry.Key ?? 'unknown',
        ).join(', ');

        throw new S3DeleteFailedException(failedKeys);
      }

      this.logger.log(
        `Delete many finished: ${keys.length} objects`,
      );
    } catch (error) {
      this.logger.error(
        'Delete many failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw new S3DeleteFailedException();
    }
  }

  async exists(objectKey: string): Promise<boolean> {
    const metadata = await this.headObject(objectKey);
    return metadata !== null;
  }

  async copy(params: {
    sourceKey: string;
    destinationKey: string;
  }): Promise<S3UploadResult> {
    this.ensureBucketConfigured();

    const sourceKey = this.sanitizeKey(params.sourceKey);
    const destinationKey = this.sanitizeKey(
      params.destinationKey,
    );

    this.logger.log(
      `Copy started: ${sourceKey} -> ${destinationKey}`,
    );

    try {
      const result = await this.client.send(
        new CopyObjectCommand({
          Bucket: this.config.bucket,
          CopySource: `${this.config.bucket}/${sourceKey}`,
          Key: destinationKey,
          MetadataDirective: 'COPY',
        }),
      );

      this.logger.log(
        `Copy finished: ${sourceKey} -> ${destinationKey}`,
      );

      return {
        objectKey: destinationKey,
        url: this.generatePublicUrl(destinationKey),
        etag: result.CopyObjectResult?.ETag?.replace(
          /"/g,
          '',
        ),
      };
    } catch (error) {
      this.logger.error(
        `Copy failed: ${sourceKey} -> ${destinationKey}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new S3UploadFailedException(destinationKey);
    }
  }

  async move(params: {
    sourceKey: string;
    destinationKey: string;
  }): Promise<S3UploadResult> {
    const copied = await this.copy(params);

    if (
      this.sanitizeKey(params.sourceKey) !==
      this.sanitizeKey(params.destinationKey)
    ) {
      await this.delete(params.sourceKey);
    }

    return copied;
  }

  generateObjectKey(params: {
    folder: string;
    entityId?: string;
    fileName: string;
    uploadId?: string;
  }): string {
    return this.objectKeyService
      .generateObjectKey(params)
      .getValue();
  }

  generatePublicUrl(objectKey: string): string {
    const key = this.sanitizeKey(objectKey);
    const base = this.config.publicUrlBase.replace(
      /\/$/,
      '',
    );

    return `${base}/${key}`;
  }

  extractObjectKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const base = new URL(this.config.publicUrlBase);

      if (parsed.hostname !== base.hostname) {
        return null;
      }

      return decodeURIComponent(
        parsed.pathname.replace(/^\//, ''),
      );
    } catch {
      return null;
    }
  }

  async headObject(
    objectKey: string,
  ): Promise<S3ObjectMetadata | null> {
    this.ensureBucketConfigured();

    const key = this.sanitizeKey(objectKey);

    try {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );

      return {
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        etag: result.ETag?.replace(/"/g, ''),
        lastModified: result.LastModified,
      };
    } catch {
      return null;
    }
  }

  async getMetadata(
    objectKey: string,
  ): Promise<S3ObjectMetadata | null> {
    return this.headObject(objectKey);
  }

  async getSignedUrl(
    objectKey: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    this.ensureBucketConfigured();

    const key = this.sanitizeKey(objectKey);
    const expiresIn =
      expiresInSeconds ?? this.config.signedUrlExpirySeconds;

    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      }),
      {
        expiresIn,
      },
    );
  }

  getBucket(): string {
    return this.config.bucket;
  }

  private buildObjectParams(
    objectKey: string,
    params: S3UploadParams,
  ) {
    return {
      Bucket: this.config.bucket,
      Key: objectKey,
      Body: params.body,
      ContentType: params.mimeType,
      CacheControl:
        params.visibility === UploadVisibility.PUBLIC
          ? 'public,max-age=31536000,immutable'
          : undefined,
    };
  }

  private sanitizeKey(objectKey: string): string {
    return SanitizeUtil.fileSegment(objectKey);
  }

  private ensureBucketConfigured(): void {
    if (!this.config.bucket) {
      throw new InvalidFileException(
        'AWS_S3_BUCKET is not configured',
      );
    }
  }
}
