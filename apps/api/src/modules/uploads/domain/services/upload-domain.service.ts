import { Logger } from '@nestjs/common';

import type { UploadRepository } from '../repositories/upload.repository';
import type { Upload } from '../entities/upload.entity';
import { UploadNotFoundException } from '../errors/upload-not-found.exception';
import { FileAlreadyDeletedException } from '../errors/file-already-deleted.exception';
import { ObjectKeyService } from './object-key.service';

export interface AwsS3Port {
  move(params: {
    sourceKey: string;
    destinationKey: string;
  }): Promise<{ etag?: string }>;
  copy(params: {
    sourceKey: string;
    destinationKey: string;
  }): Promise<{ etag?: string }>;
  delete(objectKey: string): Promise<void>;
  deleteMany(objectKeys: string[]): Promise<void>;
  generatePublicUrl(objectKey: string): string;
}

interface ClaimObjectKeyParams {
  uploadId: string;
  folder: string;
  entityId: string;
  fileName: string;
  subFolder?: string;
  releaseUploadIds?: string[];
  updatedBy?: string | null;
}

export class UploadDomainService {
  private readonly logger = new Logger(UploadDomainService.name);

  constructor(
    private readonly uploadRepo: UploadRepository,
    private readonly awsS3: AwsS3Port,
    private readonly objectKeyService: ObjectKeyService,
  ) {}

  async ensureExists(
    id: string,
    includeDeleted = false,
  ): Promise<Upload> {
    const upload = await this.uploadRepo.findById(id, includeDeleted);

    if (!upload) {
      throw new UploadNotFoundException(id);
    }

    return upload;
  }

  async ensureActive(id: string): Promise<Upload> {
    const upload = await this.ensureExists(id);

    if (upload.isDeleted()) {
      throw new FileAlreadyDeletedException(id);
    }

    return upload;
  }

  async resolveUploadUrl(
    uploadId?: string | null,
  ): Promise<string | null> {
    if (!uploadId) {
      return null;
    }

    const upload = await this.ensureActive(uploadId);
    return upload.url;
  }

  async attachToEntity(params: {
    uploadId: string;
    folder: string;
    entityId: string;
    fileName: string;
    subFolder?: string;
  }): Promise<Upload> {
    return this.claimObjectKeyForUpload({
      uploadId: params.uploadId,
      folder: params.folder,
      entityId: params.entityId,
      fileName: params.fileName,
      subFolder: params.subFolder,
    });
  }

  async attachMany(params: {
    items: Array<{
      uploadId: string;
      fileName: string;
      subFolder?: string;
    }>;
    folder: string;
    entityId: string;
    subFolder?: string;
  }): Promise<Upload[]> {
    const uploads: Upload[] = [];

    for (const item of params.items) {
      uploads.push(
        await this.claimObjectKeyForUpload({
          uploadId: item.uploadId,
          folder: params.folder,
          entityId: params.entityId,
          fileName: item.fileName,
          subFolder: item.subFolder ?? params.subFolder,
        }),
      );
    }

    return uploads;
  }

  async attachOrReplaceSlot(params: {
    uploadId: string;
    folder: string;
    entityId: string;
    subFolder: string;
    slotFileName: string;
    previousUploadId?: string | null;
    updatedBy?: string | null;
  }): Promise<Upload> {
    if (
      params.previousUploadId &&
      params.previousUploadId === params.uploadId
    ) {
      return this.ensureActive(params.uploadId);
    }

    const nextUpload = await this.ensureActive(params.uploadId);
    const finalKey = this.objectKeyService
      .buildFinalObjectKey({
        folder: params.folder,
        entityId: params.entityId,
        fileName: params.slotFileName,
        subFolder: params.subFolder,
      })
      .getValue();

    if (nextUpload.objectKey.getValue() === finalKey) {
      return nextUpload;
    }

    if (params.previousUploadId) {
      return this.replaceLinkedUpload({
        previousUploadId: params.previousUploadId,
        nextUploadId: params.uploadId,
        folder: params.folder,
        entityId: params.entityId,
        subFolder: params.subFolder,
        fileName: params.slotFileName,
        updatedBy: params.updatedBy,
      });
    }

    return this.attachToEntity({
      uploadId: params.uploadId,
      folder: params.folder,
      entityId: params.entityId,
      subFolder: params.subFolder,
      fileName: params.slotFileName,
    });
  }

  async resolveSlotDocumentFileName(
    uploadId: string,
    slotId: string,
  ): Promise<string> {
    const upload = await this.ensureActive(uploadId);
    const extension = upload.extension || 'pdf';

    return `${slotId}.${extension}`;
  }

  async softDelete(
    id: string,
    updatedBy?: string | null,
  ): Promise<Upload> {
    const upload = await this.ensureExists(id);

    if (this.shouldArchiveOnRelease(upload.objectKey.getValue())) {
      return this.archiveUploadOwnership(
        upload,
        this.uploadRepo,
        updatedBy,
      );
    }

    if (
      this.objectKeyService.isStagingKey(
        upload.objectKey.getValue(),
      )
    ) {
      await this.deleteStagingObject(upload.objectKey.getValue());
    }

    upload.softDelete(updatedBy);
    await this.uploadRepo.save(upload);
    this.logger.log(`Soft deleted upload: ${id}`);
    return upload;
  }

  async softDeleteMany(
    ids: Array<string | null | undefined>,
    updatedBy?: string | null,
  ): Promise<void> {
    for (const id of this.uniqueIds(ids)) {
      const upload = await this.uploadRepo.findById(id);

      if (!upload || upload.isDeleted()) {
        continue;
      }

      if (this.shouldArchiveOnRelease(upload.objectKey.getValue())) {
        await this.archiveUploadOwnership(
          upload,
          this.uploadRepo,
          updatedBy,
        );
        continue;
      }

      if (
        this.objectKeyService.isStagingKey(
          upload.objectKey.getValue(),
        )
      ) {
        await this.deleteStagingObject(upload.objectKey.getValue());
      }

      upload.softDelete(updatedBy);
      await this.uploadRepo.save(upload);
      this.logger.log(`Soft deleted upload: ${id}`);
    }
  }

  async softDeleteReplacedUploads(
    oldIds: Array<string | null | undefined>,
    nextIds: Array<string | null | undefined>,
    updatedBy?: string | null,
  ): Promise<void> {
    const next = new Set(this.uniqueIds(nextIds));
    const orphanIds = this.uniqueIds(oldIds).filter((id) => !next.has(id));
    await this.softDeleteMany(orphanIds, updatedBy);
  }

  async restore(id: string, updatedBy?: string | null): Promise<Upload> {
    const upload = await this.ensureExists(id, true);
    upload.restore(updatedBy);
    await this.uploadRepo.save(upload);
    this.logger.log(`Restored upload: ${id}`);
    return upload;
  }

  async restoreMany(
    ids: Array<string | null | undefined>,
    updatedBy?: string | null,
  ): Promise<void> {
    for (const id of this.uniqueIds(ids)) {
      const upload = await this.uploadRepo.findById(id, true);

      if (!upload) {
        continue;
      }

      upload.restore(updatedBy);
      await this.uploadRepo.save(upload);
      this.logger.log(`Restored upload: ${id}`);
    }
  }

  async permanentDelete(id: string): Promise<Upload> {
    const upload = await this.ensureExists(id, true);
    const objectKey = upload.objectKey.getValue();
    const startedAt = Date.now();

    await this.uploadRepo.deletePermanent(id);

    try {
      await this.awsS3.delete(objectKey);
    } catch (error) {
      this.logger.error(
        `S3 delete failed after DB permanent delete for upload ${id}: ${objectKey}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    this.logger.log(
      `Permanently deleted upload ${id} (${objectKey}) in ${Date.now() - startedAt}ms`,
    );

    return upload;
  }

  async permanentDeleteMany(
    ids: Array<string | null | undefined>,
    batchSize = 10,
  ): Promise<void> {
    const uniqueIds = this.uniqueIds(ids);

    if (!uniqueIds.length) {
      return;
    }

    for (let index = 0; index < uniqueIds.length; index += batchSize) {
      const batchIds = uniqueIds.slice(index, index + batchSize);
      const uploads = await Promise.all(
        batchIds.map((id) => this.ensureExists(id, true)),
      );

      const objectKeys = uploads.map((upload) =>
        upload.objectKey.getValue(),
      );

      const startedAt = Date.now();

      await Promise.all(
        batchIds.map((id) => this.uploadRepo.deletePermanent(id)),
      );

      try {
        await this.awsS3.deleteMany(objectKeys);
      } catch (error) {
        this.logger.error(
          `S3 bulk delete failed after DB permanent delete for uploads: ${batchIds.join(', ')}`,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }

      this.logger.log(
        `Permanently deleted ${batchIds.length} uploads in ${Date.now() - startedAt}ms`,
      );
    }
  }

  async replaceLinkedUpload(params: {
    previousUploadId?: string | null;
    nextUploadId: string;
    folder: string;
    entityId: string;
    fileName: string;
    subFolder?: string;
    updatedBy?: string | null;
  }): Promise<Upload> {
    if (
      params.previousUploadId &&
      params.previousUploadId === params.nextUploadId
    ) {
      return this.ensureActive(params.nextUploadId);
    }

    return this.claimObjectKeyForUpload({
      uploadId: params.nextUploadId,
      folder: params.folder,
      entityId: params.entityId,
      fileName: params.fileName,
      subFolder: params.subFolder,
      releaseUploadIds: params.previousUploadId
        ? [params.previousUploadId]
        : [],
      updatedBy: params.updatedBy,
    });
  }

  private async claimObjectKeyForUpload(
    params: ClaimObjectKeyParams,
  ): Promise<Upload> {
    const startedAt = Date.now();
    const nextUpload = await this.ensureActive(params.uploadId);
    const finalKey = this.objectKeyService.buildFinalObjectKey({
      folder: params.folder,
      entityId: params.entityId,
      fileName: params.fileName,
      subFolder: params.subFolder,
    });
    const finalKeyValue = finalKey.getValue();

    if (nextUpload.objectKey.getValue() === finalKeyValue) {
      await this.releaseObjectKeyOwnership({
        finalKeyValue,
        excludeUploadId: nextUpload.id,
        releaseUploadIds: params.releaseUploadIds ?? [],
        updatedBy: params.updatedBy,
      });

      this.logger.log(
        `Upload ${nextUpload.id} already owns ${finalKeyValue}`,
      );

      return nextUpload;
    }

    const sourceKey = nextUpload.objectKey.getValue();

    await this.releaseObjectKeyOwnership({
      finalKeyValue,
      excludeUploadId: nextUpload.id,
      releaseUploadIds: params.releaseUploadIds ?? [],
      updatedBy: params.updatedBy,
    });

    let moved: { etag?: string } | undefined;

    try {
      moved = await this.awsS3.move({
        sourceKey,
        destinationKey: finalKeyValue,
      });
    } catch (error) {
      this.logger.error(
        `S3 move failed for upload ${nextUpload.id}: ${sourceKey} -> ${finalKeyValue}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    try {
      const claimedUpload = await this.uploadRepo.runInTransaction(
        async (repo) => {
          const freshNext = await repo.findById(params.uploadId);

          if (!freshNext) {
            throw new UploadNotFoundException(params.uploadId);
          }

          const conflictingOwner = await repo.findByObjectKey(
            finalKeyValue,
            true,
          );

          if (
            conflictingOwner &&
            conflictingOwner.id !== freshNext.id
          ) {
            await this.archiveUploadOwnership(
              conflictingOwner,
              repo,
              params.updatedBy,
            );
          }

          freshNext.relocate({
            objectKey: finalKeyValue,
            url: this.awsS3.generatePublicUrl(finalKeyValue),
          });

          if (moved?.etag) {
            freshNext.replace({
              url: freshNext.url,
              mimeType: freshNext.mimeType.getValue(),
              extension: freshNext.extension,
              storedName: freshNext.storedName.getValue(),
              size: freshNext.size,
              etag: moved.etag,
              updatedBy: params.updatedBy,
            });
          }

          await repo.save(freshNext);

          return freshNext;
        },
      );

      this.logger.log(
        `Claimed ${finalKeyValue} for upload ${claimedUpload.id} in ${Date.now() - startedAt}ms`,
      );

      return claimedUpload;
    } catch (error) {
      await this.rollbackS3Move({
        sourceKey,
        finalKeyValue,
        uploadId: nextUpload.id,
      });
      throw error;
    }
  }

  private async releaseObjectKeyOwnership(params: {
    finalKeyValue: string;
    excludeUploadId: string;
    releaseUploadIds: string[];
    updatedBy?: string | null;
  }): Promise<void> {
    await this.uploadRepo.runInTransaction(async (repo) => {
      const releaseIds = new Set(params.releaseUploadIds);

      const currentOwner = await repo.findByObjectKey(
        params.finalKeyValue,
        true,
      );

      if (
        currentOwner &&
        currentOwner.id !== params.excludeUploadId
      ) {
        await this.archiveUploadOwnership(
          currentOwner,
          repo,
          params.updatedBy,
        );
        releaseIds.delete(currentOwner.id);
      }

      for (const releaseId of releaseIds) {
        if (releaseId === params.excludeUploadId) {
          continue;
        }

        const upload = await repo.findById(releaseId, true);

        if (!upload || upload.isDeleted()) {
          continue;
        }

        if (upload.objectKey.getValue() === params.finalKeyValue) {
          await this.archiveUploadOwnership(
            upload,
            repo,
            params.updatedBy,
          );
          continue;
        }

        upload.softDelete(params.updatedBy);
        await repo.save(upload);
      }
    });
  }

  private async archiveUploadOwnership(
    upload: Upload,
    repo: UploadRepository,
    updatedBy?: string | null,
  ): Promise<Upload> {
    const currentKey = upload.objectKey.getValue();
    const archivedKey = this.objectKeyService
      .buildArchivedObjectKey(
        upload.id,
        upload.storedName.getValue(),
      )
      .getValue();

    if (
      upload.isDeleted() &&
      this.objectKeyService.isArchivedKey(currentKey)
    ) {
      return upload;
    }

    if (currentKey !== archivedKey) {
      if (this.shouldArchiveOnRelease(currentKey)) {
        await this.awsS3.copy({
          sourceKey: currentKey,
          destinationKey: archivedKey,
        });
      }

      upload.archiveOwnership({
        objectKey: archivedKey,
        url: this.awsS3.generatePublicUrl(archivedKey),
        updatedBy,
      });
    } else {
      upload.softDelete(updatedBy);
    }

    await repo.save(upload);

    this.logger.log(
      `Archived upload ${upload.id}: ${currentKey} -> ${archivedKey}`,
    );

    return upload;
  }

  private async rollbackS3Move(params: {
    sourceKey: string;
    finalKeyValue: string;
    uploadId: string;
  }): Promise<void> {
    try {
      await this.awsS3.move({
        sourceKey: params.finalKeyValue,
        destinationKey: params.sourceKey,
      });

      this.logger.warn(
        `Rolled back S3 move for upload ${params.uploadId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to rollback S3 move for upload ${params.uploadId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async deleteStagingObject(
    objectKey: string,
  ): Promise<void> {
    try {
      await this.awsS3.delete(objectKey);
      this.logger.log(`Deleted staging object: ${objectKey}`);
    } catch (error) {
      this.logger.warn(
        `Failed to delete staging object ${objectKey}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private shouldArchiveOnRelease(objectKey: string): boolean {
    return (
      !this.objectKeyService.isStagingKey(objectKey) &&
      !this.objectKeyService.isArchivedKey(objectKey)
    );
  }

  private uniqueIds(
    ids: Array<string | null | undefined>,
  ): string[] {
    return Array.from(
      new Set(ids.filter((id): id is string => Boolean(id))),
    );
  }
}
