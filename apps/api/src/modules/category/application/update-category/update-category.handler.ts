import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';

import { UpdateCategoryCommand } from './update-category.command';
import { UpdateCategoryResult } from './update-category.result';

const CATEGORY_UPLOAD_FOLDER = 'categories';
const CATEGORY_THUMBNAIL_FILE_NAME = 'thumbnail';

export class UpdateCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: UpdateCategoryCommand,
  ): Promise<UpdateCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id),
    );

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
      category.id,
    );

    await this.domainService.ensureSlugIsAvailable(
      this.categoryRepo,
      nextSlug,
      category.id,
    );

    if (
      command.displayOrder !== undefined &&
      command.displayOrder !== category.displayOrder
    ) {
      await this.categoryRepo.shiftDisplayOrders(
        category.displayOrder!,
        command.displayOrder,
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

    category.update({
      name: command.name,
      slug: nextSlug,
      description: command.description,
      thumbnailFileId: nextThumbnailFileId,
      thumbnailUrl: nextThumbnailUrl,
      displayOrder:
        command.displayOrder !== undefined
          ? command.displayOrder
          : category.displayOrder,
      updatedBy: command.updatedBy,
    });

    await this.categoryRepo.save(category);

    return UpdateCategoryResult.fromEntity(category);
  }
}
