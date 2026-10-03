import type {
  EnrollmentListFilters,
  EnrollmentRepository,
} from '../../domain/repositories/enrollment.repository';
import { dedupeEnrollmentsToOnePerStudent } from '../../domain/utils/primary-enrollment-per-student.util';

import { ListEnrollmentsQuery } from './list-enrollments.query';
import { ListEnrollmentsResult } from './list-enrollments.result';

export class ListEnrollmentsHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(
    query: ListEnrollmentsQuery,
  ): Promise<ListEnrollmentsResult> {
    const skip = query.skip ?? 0;
    const take = query.take ?? 10;

    const filters: EnrollmentListFilters = {
      search: query.search,
      studentId: query.studentId,
      branchId: query.branchId,
      categoryId: query.categoryId,
      courseId: query.courseId,
      batchId: query.batchId,
      batchTimingId: query.batchTimingId,
      status: query.status,
      statusIn: query.statusIn,
      paymentStatus: query.paymentStatus,
      source: query.source,
      applicationType: query.applicationType,
      mode: query.mode,
      isActive: query.isActive,
      includeDeleted: query.includeDeleted,
      admissionDateFrom: query.admissionDateFrom,
      admissionDateTo: query.admissionDateTo,
      createdAtFrom: query.createdAtFrom,
      createdAtTo: query.createdAtTo,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      currentOnly: query.currentOnly,
    };

    if (query.studentId) {
      const [items, total] = await Promise.all([
        this.enrollmentRepo.findSummaries({
          ...filters,
          skip,
          take,
        }),
        this.enrollmentRepo.count(filters),
      ]);

      return new ListEnrollmentsResult(items, total, skip, take);
    }

    const allMatching = await this.enrollmentRepo.findSummaries(filters);
    const deduped = dedupeEnrollmentsToOnePerStudent(allMatching);
    const total = deduped.length;
    const items = deduped.slice(skip, skip + take);

    return new ListEnrollmentsResult(items, total, skip, take);
  }
}
