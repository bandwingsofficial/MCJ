import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { PermanentDeleteCategoryCommand } from './permanent-delete-category.command';
import { PermanentDeleteCategoryResult } from './permanent-delete-category.result';

export class PermanentDeleteCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteCategoryCommand,
  ): Promise<PermanentDeleteCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id, true),
    );

    const thumbnailFileId = category.thumbnailFileId;
    const displayOrder = category.displayOrder;

    await this.categoryRepo.deletePermanent(command.id);

    if (displayOrder != null) {
      await this.categoryRepo.closeDisplayOrderGap(
        displayOrder,
        category.branchId,
      );
    }

    if (thumbnailFileId) {
      await this.uploadDomainService.permanentDelete(
        thumbnailFileId,
      );
    }

    return new PermanentDeleteCategoryResult(
      category.id,
      true,
    );
  }
}
