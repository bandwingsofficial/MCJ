import { Upload } from '../entities/upload.entity';

export interface UploadRepository {
  save(upload: Upload): Promise<void>;
  saveMany(uploads: Upload[]): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Upload | null>;
  findByObjectKey(
    objectKey: string,
    includeDeleted?: boolean,
  ): Promise<Upload | null>;
  findByUrl(
    url: string,
    includeDeleted?: boolean,
  ): Promise<Upload | null>;
  deletePermanent(id: string): Promise<void>;
  runInTransaction<T>(
    fn: (repo: UploadRepository) => Promise<T>,
  ): Promise<T>;
}
