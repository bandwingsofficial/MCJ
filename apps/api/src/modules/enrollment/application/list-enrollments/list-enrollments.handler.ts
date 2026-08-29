import type {
  EnrollmentListFilters,
  EnrollmentRepository,
} from '../../domain/repositories/enrollment.repository';

import { ListEnrollmentsQuery } from './list-enrollments.query';
import { ListEnrollmentsResult } from './list-enrollments.result';

export class ListEnrollmentsHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(
    query: ListEnrollmentsQuery,
  ): Promise<ListEnrollmentsResult> {
    const filters: EnrollmentListFilters = {
      search: query.search,
      studentId: query.studentId,
      branchId: query.branchId,
      categoryId: query.categoryId,
      courseId: query.courseId,
      batchId: query.batchId,
      status: query.status,
      paymentStatus: query.paymentStatus,
      source: query.source,
      isActive: query.isActive,
      includeDeleted: query.includeDeleted,
      admissionDateFrom: query.admissionDateFrom,
      admissionDateTo: query.admissionDateTo,
      createdAtFrom: query.createdAtFrom,
      createdAtTo: query.createdAtTo,
      skip: query.skip,
      take: query.take,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      currentOnly: query.currentOnly,
    };

    const [items, total] = await Promise.all([
      this.enrollmentRepo.findSummaries(filters),
      this.enrollmentRepo.count(filters),
    ]);

    return new ListEnrollmentsResult(
      items,
      total,
      query.skip ?? 0,
      query.take ?? items.length,
    );
  }
}
