import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';
import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/student/domain/errors/branch-not-found.exception';

import { UpdateCategoryCommand } from './update-category.command';
import { UpdateCategoryResult } from './update-category.result';

const CATEGORY_UPLOAD_FOLDER = 'categories';
const CATEGORY_THUMBNAIL_FILE_NAME = 'thumbnail';

export class UpdateCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly uploadDomainService: UploadDomainService,
    private readonly branchRepo?: BranchRepository,
  ) {}

  async execute(
    command: UpdateCategoryCommand,
  ): Promise<UpdateCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id),
    );

    const previousBranchId = category.branchId;
    const nextBranchId =
      command.branchId !== undefined
        ? command.branchId
        : category.branchId;

    if (
      command.branchId !== undefined &&
      command.branchId !== null &&
      this.branchRepo
    ) {
      const branch = await this.branchRepo.findById(
        command.branchId,
      );
      if (!branch) {
        throw new BranchNotFoundException(command.branchId);
      }
    }

    const nextSlug =
      command.slug !== undefined
        ? Slug.create(command.slug).getValue()
        : command.name !== undefined
          ? Slug.fromName(command.name).getValue()
          : category.slug.getValue();

    const previousThumbnailFileId = category.thumbnailFileId;
    let nextThumbnailFileId = category.thumbnailFileId;
    let nextThumbnailUrl = category.thumbnailUrl;

    await this.domainService.ensureNameIsAvailable(
      this.categoryRepo,
      command.name ?? category.name.getValue(),
      nextBranchId,
      category.id,
    );

    await this.domainService.ensureSlugIsAvailable(
      this.categoryRepo,
      nextSlug,
      nextBranchId,
      category.id,
    );

    if (
      command.displayOrder !== undefined &&
      command.displayOrder !== category.displayOrder &&
      command.branchId === undefined
    ) {
      await this.categoryRepo.shiftDisplayOrders(
        category.displayOrder!,
        command.displayOrder,
        category.branchId,
      );
    }

    if (
      command.thumbnailFileId !== undefined &&
      command.thumbnailFileId !== previousThumbnailFileId
    ) {
      if (command.thumbnailFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: previousThumbnailFileId,
            nextUploadId: command.thumbnailFileId,
            folder: CATEGORY_UPLOAD_FOLDER,
            entityId: category.id,
            fileName: CATEGORY_THUMBNAIL_FILE_NAME,
            updatedBy: command.updatedBy,
          });

        nextThumbnailFileId = upload.id;
        nextThumbnailUrl = upload.url;
      } else {
        if (previousThumbnailFileId) {
          await this.uploadDomainService.softDelete(
            previousThumbnailFileId,
            command.updatedBy,
          );
        }

        nextThumbnailFileId = null;
        nextThumbnailUrl = null;
      }
    }

    let nextDisplayOrder =
      command.displayOrder !== undefined
        ? command.displayOrder
        : category.displayOrder;

    if (
      command.branchId !== undefined &&
      command.branchId !== previousBranchId
    ) {
      if (category.displayOrder != null) {
        await this.categoryRepo.closeDisplayOrderGap(
          category.displayOrder,
          previousBranchId,
        );
      }

      nextDisplayOrder =
        (await this.categoryRepo.getMaxDisplayOrder(
          nextBranchId,
        )) + 1;
    }

    category.update({
      name: command.name,
      slug: nextSlug,
      description: command.description,
      thumbnailFileId: nextThumbnailFileId,
      thumbnailUrl: nextThumbnailUrl,
      displayOrder: nextDisplayOrder,
      branchId: command.branchId,
      updatedBy: command.updatedBy,
    });

    await this.categoryRepo.save(category);

    return UpdateCategoryResult.fromEntity(category);
  }
}
