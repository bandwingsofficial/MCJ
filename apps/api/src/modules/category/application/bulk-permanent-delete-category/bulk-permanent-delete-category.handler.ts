import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { BulkPermanentDeleteCategoryCommand } from './bulk-permanent-delete-category.command';
import { BulkPermanentDeleteCategoryResult } from './bulk-permanent-delete-category.result';

const BATCH_SIZE = 10;

export class BulkPermanentDeleteCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: BulkPermanentDeleteCategoryCommand,
  ): Promise<BulkPermanentDeleteCategoryResult> {
    const categories = await Promise.all(
      command.ids.map(async (id) =>
        this.domainService.ensureExists(
          await this.categoryRepo.findById(id, true),
        ),
      ),
    );

    const thumbnailFileIds = categories
      .map((category) => category.thumbnailFileId)
      .filter((id): id is string => Boolean(id));

    for (
      let index = 0;
      index < categories.length;
      index += BATCH_SIZE
    ) {
      const batch = categories.slice(
        index,
        index + BATCH_SIZE,
      );

      await Promise.all(
        batch.map(async (category) => {
          const displayOrder = category.displayOrder;

          await this.categoryRepo.deletePermanent(
            category.id,
          );

          if (displayOrder != null) {
            await this.categoryRepo.closeDisplayOrderGap(
              displayOrder,
              category.branchId,
            );
          }
        }),
      );
    }

    await this.uploadDomainService.permanentDeleteMany(
      thumbnailFileIds,
      BATCH_SIZE,
    );

    return new BulkPermanentDeleteCategoryResult(
      categories.map((category) => ({
        id: category.id,
        deleted: true,
      })),
    );
  }
}
