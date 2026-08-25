import type { BatchCourseAssignmentRecord } from './batch-course.types';
import type { PrismaBatchCourseRepository } from '../../infrastructure/repositories/prisma-batch-course.repository';

export class ListBatchCoursesHandler {
  constructor(
    private readonly batchCourseRepo: PrismaBatchCourseRepository,
  ) {}

  async execute(batchId: string): Promise<BatchCourseAssignmentRecord[]> {
    return this.batchCourseRepo.findByBatchId(batchId);
  }
}
