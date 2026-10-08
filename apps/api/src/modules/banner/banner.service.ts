import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BANNER_MAX_GROUPS,
  BANNER_MAX_IMAGES_PER_GROUP,
  getBannerResolutionError,
  isAllowedBannerMimeType,
} from '@mcj/shared-constants';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';

export interface BannerImageInput {
  id?: string;
  uploadId: string;
  isPrimary?: boolean;
  displayOrder?: number;
  link?: string | null;
}

export interface BannerImageView {
  id: string;
  uploadId: string;
  imageUrl: string;
  objectKey: string;
  displayOrder: number;
  isPrimary: boolean;
  link: string | null;
}

export interface BannerView {
  id: string;
  name: string;
  type: string;
  status: string;
  displayOrder: number;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
  images?: BannerImageView[];
}

@Injectable()
export class BannerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async list(params: {
    search?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    type?: 'HOMEPAGE';
    skip?: number;
    take?: number;
  }) {
    const skip = params.skip ?? 0;
    const take = Math.min(params.take ?? 10, 100);
    const search = params.search?.trim();

    const where: Prisma.BannerWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.type ? { type: params.type } : {}),
      ...(search
        ? { name: { contains: search, mode: 'insensitive' } }
        : {}),
    };

    const [total, catalogTotal, rows] = await this.prisma.$transaction([
      this.prisma.banner.count({ where }),
      this.prisma.banner.count(),
      this.prisma.banner.findMany({
        where,
        skip,
        take,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: { _count: { select: { images: true } } },
      }),
    ]);

    return {
      items: rows.map((row) => this.toListItem(row)),
      total,
      catalogTotal,
      skip,
      take,
    };
  }

  async listActivePublic() {
    const row = await this.prisma.banner.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
      },
    });

    const rows = row ? [row] : [];

    return rows.map((banner) => ({
      id: banner.id,
      name: banner.name,
      type: banner.type,
      displayOrder: banner.displayOrder,
      images: banner.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        displayOrder: image.displayOrder,
        isPrimary: image.isPrimary,
        link: image.link,
      })),
    }));
  }

  async getById(id: string) {
    const row = await this.prisma.banner.findUnique({
      where: { id },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    });

    if (!row) {
      throw new BaseException(ERROR_CODES.BANNER_NOT_FOUND, 'Banner not found', 404);
    }

    return this.toDetail(row);
  }

  async create(input: {
    name: string;
    type: 'HOMEPAGE';
    status?: 'ACTIVE' | 'INACTIVE';
    images: BannerImageInput[];
  }) {
    const name = this.normalizeName(input.name);
    await this.assertNameAvailable(name);
    await this.assertGroupLimit();
    const images = await this.normalizeImages(input.images);
    const last = await this.prisma.banner.aggregate({
      _max: { displayOrder: true },
    });

    const status = input.status ?? 'ACTIVE';
    const created = await this.prisma.$transaction(async (tx) => {
      if (status === 'ACTIVE') {
        await this.claimActiveSlot(tx);
      }

      return tx.banner.create({
        data: {
          name,
          type: input.type,
          status,
          displayOrder: (last._max.displayOrder ?? 0) + 1,
          images: {
            create: images.map((image) => ({
              uploadId: image.uploadId,
              imageUrl: image.imageUrl,
              objectKey: image.objectKey,
              displayOrder: image.displayOrder,
              isPrimary: image.isPrimary,
              link: image.link,
            })),
          },
        },
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      });
    });

    return this.toDetail(created);
  }

  async update(
    id: string,
    input: {
      name: string;
      type: 'HOMEPAGE';
      status?: 'ACTIVE' | 'INACTIVE';
      images: BannerImageInput[];
    },
  ) {
    const existing = await this.prisma.banner.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      throw new BaseException(ERROR_CODES.BANNER_NOT_FOUND, 'Banner not found', 404);
    }

    const name = this.normalizeName(input.name);
    await this.assertNameAvailable(name, id);
    const images = await this.normalizeImages(input.images);
    const ownedIds = new Set(existing.images.map((image) => image.id));

    for (const image of images) {
      if (image.id && !ownedIds.has(image.id)) {
        throw new BaseException(
          ERROR_CODES.BANNER_NOT_FOUND,
          'One of the banner images could not be found.',
          404,
        );
      }
    }

    const nextStatus = input.status ?? existing.status;
    const keptIds = images.flatMap((image) => (image.id ? [image.id] : []));
    const removedUploadIds = existing.images
      .filter((image) => !keptIds.includes(image.id))
      .map((image) => image.uploadId);
    const replacedUploadIds = existing.images.flatMap((image) => {
      const next = images.find((item) => item.id === image.id);
      return next && next.uploadId !== image.uploadId ? [image.uploadId] : [];
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      if (nextStatus === 'ACTIVE') {
        await this.claimActiveSlot(tx, id);
      }

      await tx.bannerImage.deleteMany({
        where: {
          bannerId: id,
          ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}),
        },
      });

      for (const image of images) {
        if (image.id) {
          await tx.bannerImage.update({
            where: { id: image.id },
            data: {
              uploadId: image.uploadId,
              imageUrl: image.imageUrl,
              objectKey: image.objectKey,
              displayOrder: image.displayOrder,
              isPrimary: image.isPrimary,
              link: image.link,
            },
          });
          continue;
        }

        await tx.bannerImage.create({
          data: {
            bannerId: id,
            uploadId: image.uploadId,
            imageUrl: image.imageUrl,
            objectKey: image.objectKey,
            displayOrder: image.displayOrder,
            isPrimary: image.isPrimary,
            link: image.link,
          },
        });
      }

      return tx.banner.update({
        where: { id },
        data: {
          name,
          type: input.type,
          status: nextStatus,
        },
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      });
    });

    await this.deleteUnusedUploads([...removedUploadIds, ...replacedUploadIds]);

    return this.toDetail(updated);
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE') {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.banner.findUnique({ where: { id } });

      if (!existing) {
        throw new BaseException(ERROR_CODES.BANNER_NOT_FOUND, 'Banner not found', 404);
      }

      if (status === 'ACTIVE') {
        await this.claimActiveSlot(tx, id);
      }

      return tx.banner.update({
        where: { id },
        data: { status },
        include: { _count: { select: { images: true } } },
      });
    });

    return this.toListItem(updated);
  }

  async permanentDelete(id: string) {
    const existing = await this.prisma.banner.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existing) {
      throw new BaseException(ERROR_CODES.BANNER_NOT_FOUND, 'Banner not found', 404);
    }

    const uploadIds = existing.images.map((image) => image.uploadId);

    await this.prisma.banner.delete({ where: { id } });
    await this.deleteUnusedUploads(uploadIds);

    return { id, permanentlyDeleted: true };
  }

  async replaceImage(bannerId: string, imageId: string, uploadId: string) {
    const image = await this.prisma.bannerImage.findFirst({
      where: { id: imageId, bannerId },
    });

    if (!image) {
      throw new BaseException(
        ERROR_CODES.BANNER_NOT_FOUND,
        'Banner image not found',
        404,
      );
    }

    const [resolved] = await this.normalizeImages([
      {
        uploadId,
        isPrimary: image.isPrimary,
        displayOrder: image.displayOrder,
      },
    ]);

    if (!resolved) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'The replacement image could not be processed.',
        400,
      );
    }

    const previousUploadId = image.uploadId;

    const updated = await this.prisma.bannerImage.update({
      where: { id: image.id },
      data: {
        uploadId: resolved.uploadId,
        imageUrl: resolved.imageUrl,
        objectKey: resolved.objectKey,
      },
    });

    if (previousUploadId !== resolved.uploadId) {
      await this.deleteUnusedUploads([previousUploadId]);
    }

    return {
      id: updated.id,
      uploadId: updated.uploadId,
      imageUrl: updated.imageUrl,
      objectKey: updated.objectKey,
      displayOrder: updated.displayOrder,
      isPrimary: updated.isPrimary,
      link: updated.link,
    };
  }

  private async claimActiveSlot(
    tx: Prisma.TransactionClient,
    exceptId?: string,
  ) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(714203)`;
    await tx.banner.updateMany({
      where: {
        status: 'ACTIVE',
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { status: 'INACTIVE' },
    });
  }

  private async deleteUnusedUploads(uploadIds: string[]) {
    for (const uploadId of [...new Set(uploadIds)]) {
      const stillUsed = await this.prisma.bannerImage.count({
        where: { uploadId },
      });

      if (stillUsed > 0) {
        continue;
      }

      try {
        await this.uploadDomainService.permanentDelete(uploadId);
      } catch {
        // Upload is still referenced by another record or already removed.
      }
    }
  }

  private async normalizeImages(images: BannerImageInput[]) {
    if (!images.length) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Add at least one banner image.',
        400,
      );
    }

    if (images.length > BANNER_MAX_IMAGES_PER_GROUP) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `A banner can contain at most ${BANNER_MAX_IMAGES_PER_GROUP} images.`,
        400,
      );
    }

    const uploadIds = images.map((image) => image.uploadId);
    if (new Set(uploadIds).size !== uploadIds.length) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Each banner image can only be added once.',
        400,
      );
    }

    const ordered = [...images].sort(
      (left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
    );
    const primaryCount = ordered.filter((image) => image.isPrimary).length;

    if (primaryCount > 1) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only one image can be primary.',
        400,
      );
    }

    const resolved: Array<{
      id?: string;
      uploadId: string;
      imageUrl: string;
      objectKey: string;
      displayOrder: number;
      isPrimary: boolean;
      link: string | null;
    }> = [];

    for (const [index, image] of ordered.entries()) {
      const upload = await this.prisma.upload.findUnique({
        where: { id: image.uploadId },
      });

      if (!upload || upload.deletedAt) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'One of the banner images could not be found.',
          400,
        );
      }

      if (!isAllowedBannerMimeType(upload.mimeType)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Banner images must be PNG, JPG, JPEG, or WEBP.',
          400,
        );
      }

      const resolutionError = getBannerResolutionError(
        upload.width,
        upload.height,
      );

      if (resolutionError) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          resolutionError,
          400,
        );
      }

      resolved.push({
        id: image.id,
        uploadId: upload.id,
        imageUrl: upload.url,
        objectKey: upload.objectKey,
        displayOrder: index + 1,
        isPrimary: primaryCount === 0 ? index === 0 : Boolean(image.isPrimary),
        link: this.normalizeLink(image.link),
      });
    }

    return resolved;
  }

  private normalizeLink(link?: string | null) {
    if (link == null) {
      return null;
    }

    const trimmed = link.trim();
    if (!trimmed) {
      return null;
    }

    let parsed: URL;

    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Enter a valid link for each banner image.',
        400,
      );
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Banner links must start with http:// or https://.',
        400,
      );
    }

    if (trimmed.length > 2048) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Banner links must be 2048 characters or fewer.',
        400,
      );
    }

    return trimmed;
  }

  private normalizeName(name: string) {
    const trimmed = name.trim();

    if (trimmed.length < 2 || trimmed.length > 120) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Banner name must be between 2 and 120 characters.',
        400,
      );
    }

    return trimmed;
  }

  private async assertNameAvailable(name: string, excludeId?: string) {
    const existing = await this.prisma.banner.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existing) {
      throw new BaseException(
        ERROR_CODES.BANNER_NAME_CONFLICT,
        'A banner with this name already exists.',
        409,
      );
    }
  }

  private async assertGroupLimit() {
    const total = await this.prisma.banner.count();

    if (total >= BANNER_MAX_GROUPS) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `You can create at most ${BANNER_MAX_GROUPS} banners.`,
        400,
      );
    }
  }

  private toListItem(row: {
    id: string;
    name: string;
    type: string;
    status: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    _count: { images: number };
  }): BannerView {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      displayOrder: row.displayOrder,
      imageCount: row._count.images,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toDetail(row: {
    id: string;
    name: string;
    type: string;
    status: string;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    images: Array<{
      id: string;
      uploadId: string;
      imageUrl: string;
      objectKey: string;
      displayOrder: number;
      isPrimary: boolean;
      link: string | null;
    }>;
  }): BannerView {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      status: row.status,
      displayOrder: row.displayOrder,
      imageCount: row.images.length,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      images: row.images.map((image) => ({
        id: image.id,
        uploadId: image.uploadId,
        imageUrl: image.imageUrl,
        objectKey: image.objectKey,
        displayOrder: image.displayOrder,
        isPrimary: image.isPrimary,
        link: image.link,
      })),
    };
  }
}
