import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';
import { Slug } from '../../domain/value-objects/slug.vo';
import { CategoryDomainService } from '../../domain/services/category-domain.service';
import { UploadDomainService } from '@/modules/uploads/domain/services/upload-domain.service';

import { CreateCategoryCommand } from './create-category.command';
import { CreateCategoryResult } from './create-category.result';
import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/student/domain/errors/branch-not-found.exception';

const CATEGORY_UPLOAD_FOLDER = 'categories';
const CATEGORY_THUMBNAIL_FILE_NAME = 'thumbnail';

export class CreateCategoryHandler {
  private readonly logger = new Logger(CreateCategoryHandler.name);

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly branchRepo: BranchRepository,
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
      command.branchId ?? null,
    );

    await this.domainService.ensureSlugIsAvailable(
      this.categoryRepo,
      slug,
      command.branchId ?? null,
    );

    if (command.branchId) {
      const branch = await this.branchRepo.findById(
        command.branchId,
      );

      if (!branch) {
        throw new BranchNotFoundException(
          command.branchId,
        );
      }
    }

    let displayOrder: number;

    if (command.displayOrder == null) {
      const maxDisplayOrder =
        await this.categoryRepo.getMaxDisplayOrder(
          command.branchId ?? null,
        );

      displayOrder = maxDisplayOrder + 1;
    } else {
      displayOrder = command.displayOrder;

      await this.categoryRepo.incrementDisplayOrdersFrom(
        displayOrder,
        command.branchId ?? null,
      );
    }

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
      branchId: command.branchId,
      createdBy: command.createdBy,
    });

    await this.categoryRepo.save(category);

    this.logger.log(
      `✅ Category created: ${category.id}`,
    );

    return CreateCategoryResult.fromEntity(category);
  }
}
