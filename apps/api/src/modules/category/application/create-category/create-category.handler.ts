import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { Slug } from '../../domain/value-objects/slug.vo';
import { CategoryDomainService } from '../../domain/services/category-domain.service';
import { UploadDomainService } from '@/modules/uploads/domain/services/upload-domain.service';

import { CreateCategoryCommand } from './create-category.command';
import { CreateCategoryResult } from './create-category.result';

const CATEGORY_UPLOAD_FOLDER = 'categories';
const CATEGORY_THUMBNAIL_FILE_NAME = 'thumbnail';

export class CreateCategoryHandler {
  private readonly logger = new Logger(CreateCategoryHandler.name);

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateCategoryCommand,
  ): Promise<CreateCategoryResult> {
    const slug = command.slug
      ? Slug.create(command.slug).getValue()
      : Slug.fromName(command.name).getValue();

    await this.domainService.ensureNameIsAvailable(
      this.categoryRepo,
      command.name,
    );

    await this.domainService.ensureSlugIsAvailable(
      this.categoryRepo,
      slug,
    );

    // Always append to the global sequence — do not accept client displayOrder.
    const maxDisplayOrder =
      await this.categoryRepo.getMaxDisplayOrder();

    const displayOrder = maxDisplayOrder + 1;

    const categoryId = randomUUID();
    let thumbnailFileId: string | null = null;
    let thumbnailUrl: string | null = null;

    if (command.thumbnailFileId) {
      const upload =
        await this.uploadDomainService.attachToEntity({
          uploadId: command.thumbnailFileId,
          folder: CATEGORY_UPLOAD_FOLDER,
          entityId: categoryId,
          fileName: CATEGORY_THUMBNAIL_FILE_NAME,
        });

      thumbnailFileId = upload.id;
      thumbnailUrl = upload.url;
    }

    const category = Category.create({
      id: categoryId,
      name: command.name,
      slug,
      description: command.description,
      thumbnailFileId,
      thumbnailUrl,
      status: command.status,
      displayOrder,
      createdBy: command.createdBy,
    });

    await this.categoryRepo.save(category);

    await this.categoryRepo.normalizeOrderedDisplayOrders();

    this.logger.log(
      `✅ Category created: ${category.id}`,
    );

    return CreateCategoryResult.fromEntity(category);
  }
}
