import { randomUUID } from 'crypto';

import { FileName } from '../value-objects/file-name.vo';
import { ObjectKey } from '../value-objects/object-key.vo';

export interface GenerateObjectKeyParams {
  folder: string;
  entityId?: string;
  fileName: string;
  uploadId?: string;
}

export class ObjectKeyService {
  generateObjectKey(
    params: GenerateObjectKeyParams,
  ): ObjectKey {
    const folder = this.normalizeSegment(params.folder);
    const fileName = this.resolveStoredName(params.fileName);

    if (params.entityId) {
      const entityId = this.normalizeSegment(
        params.entityId,
      );

      return ObjectKey.create(
        `${folder}/${entityId}/${fileName}`,
      );
    }

    const stagingId =
      params.uploadId ?? randomUUID();

    return ObjectKey.create(
      `${folder}/staging/${stagingId}/${fileName}`,
    );
  }

  buildFinalObjectKey(params: {
    folder: string;
    entityId: string;
    fileName: string;
    subFolder?: string;
  }): ObjectKey {
    const folder = this.normalizeSegment(params.folder);
    const entityId = this.normalizeSegment(params.entityId);
    const fileName = this.resolveStoredName(params.fileName);

    if (params.subFolder) {
      const subFolder = this.normalizeSegment(params.subFolder);
      return ObjectKey.create(
        `${folder}/${entityId}/${subFolder}/${fileName}`,
      );
    }

    return ObjectKey.create(`${folder}/${entityId}/${fileName}`);
  }

  buildArchivedObjectKey(
    uploadId: string,
    storedName: string,
  ): ObjectKey {
    const normalizedId = this.normalizeSegment(uploadId);
    const fileName = this.resolveStoredName(storedName);

    return ObjectKey.create(`archived/${normalizedId}/${fileName}`);
  }

  isArchivedKey(objectKey: string): boolean {
    return objectKey.startsWith('archived/');
  }

  buildEntityKeyPrefix(params: {
    folder: string;
    entityId: string;
    subFolder?: string;
  }): string {
    const folder = this.normalizeSegment(params.folder);
    const entityId = this.normalizeSegment(params.entityId);

    if (params.subFolder) {
      const subFolder = this.normalizeSegment(params.subFolder);
      return `${folder}/${entityId}/${subFolder}/`;
    }

    return `${folder}/${entityId}/`;
  }

  isEntityAttachedKey(
    objectKey: string,
    prefix: string,
  ): boolean {
    return (
      objectKey.startsWith(prefix) &&
      !this.isStagingKey(objectKey) &&
      !this.isArchivedKey(objectKey)
    );
  }

  private resolveStoredName(fileName: string): string {
    if (/\.(webp|pdf|png|jpe?g)$/i.test(fileName)) {
      return FileName.create(fileName).getValue();
    }

    return FileName.create(`${fileName}.webp`).getValue();
  }

  isStagingKey(objectKey: string): boolean {
    return objectKey.includes('/staging/');
  }

  extractFileName(objectKey: string): string {
    const segments = objectKey.split('/');
    return segments[segments.length - 1] ?? 'file.webp';
  }

  private normalizeSegment(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
