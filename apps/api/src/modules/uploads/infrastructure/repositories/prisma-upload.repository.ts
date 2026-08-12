import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Upload } from '../../domain/entities/upload.entity';
import { UploadRepository } from '../../domain/repositories/upload.repository';
import { UploadMapper } from '../mappers/upload.mapper';
import { UploadStatus as PrismaUploadStatus } from '@prisma/client';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

export class PrismaUploadRepository implements UploadRepository {
  constructor(private readonly prisma: PrismaClientLike) {}

  async save(upload: Upload): Promise<void> {
    const data = UploadMapper.toPersistence(upload);

    await this.prisma.upload.upsert({
      where: { id: upload.id },
      update: data,
      create: data,
    });
  }

  async saveMany(uploads: Upload[]): Promise<void> {
    for (const upload of uploads) {
      await this.save(upload);
    }
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Upload | null> {
    const record = await this.prisma.upload.findFirst({
      where: {
        id,
        ...(includeDeleted
          ? {}
          : { status: PrismaUploadStatus.ACTIVE }),
      },
    });

    return record ? UploadMapper.toDomain(record) : null;
  }

  async findByObjectKey(
    objectKey: string,
    includeDeleted = false,
  ): Promise<Upload | null> {
    const record = await this.prisma.upload.findFirst({
      where: {
        objectKey,
        ...(includeDeleted
          ? {}
          : { status: PrismaUploadStatus.ACTIVE }),
      },
    });

    return record ? UploadMapper.toDomain(record) : null;
  }

  async findByUrl(
    url: string,
    includeDeleted = false,
  ): Promise<Upload | null> {
    const record = await this.prisma.upload.findFirst({
      where: {
        url,
        ...(includeDeleted
          ? {}
          : { status: PrismaUploadStatus.ACTIVE }),
      },
    });

    return record ? UploadMapper.toDomain(record) : null;
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.upload.delete({
      where: { id },
    });
  }

  async runInTransaction<T>(
    fn: (repo: UploadRepository) => Promise<T>,
  ): Promise<T> {
    if (!this.isRootClient()) {
      return fn(this);
    }

    const prisma = this.prisma as PrismaService;

    return prisma.$transaction(async (tx) =>
      fn(new PrismaUploadRepository(tx)),
    );
  }

  private isRootClient(): boolean {
    return '$transaction' in this.prisma;
  }
}
