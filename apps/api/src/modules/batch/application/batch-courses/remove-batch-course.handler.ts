import { BatchDomainService } from '../../domain/services/batch-domain.service';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import type { PrismaBatchCourseRepository } from '../../infrastructure/repositories/prisma-batch-course.repository';

export class RemoveBatchCourseHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly batchCourseRepo: PrismaBatchCourseRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(params: {
    batchId: string;
    assignmentId: string;
  }): Promise<void> {
    await this.domainService.ensureExists(
      await this.batchRepo.findById(params.batchId),
    );

    await this.batchCourseRepo.remove(params.assignmentId, params.batchId);
  }
}
