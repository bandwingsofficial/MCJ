import { adminEnrollmentTabStatusIn } from '@mcj/shared-constants';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type {
  EnrollmentListFilters,
  EnrollmentRepository,
} from '../../domain/repositories/enrollment.repository';

export class GetEnrollmentAdminTabCountsHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(filters: {
    branchId?: string;
    studentId?: string;
    search?: string;
    applicationType?: EnrollmentListFilters['applicationType'];
  }): Promise<{
    active: number;
    completed: number;
    cancelled: number;
    all?: number;
  }> {
    const base: EnrollmentListFilters = {
      branchId: filters.branchId,
      studentId: filters.studentId,
      search: filters.search,
      applicationType: filters.applicationType,
      includeDeleted: false,
    };

    const [active, completed, cancelled, all] = await Promise.all([
      this.enrollmentRepo.count({
        ...base,
        statusIn: adminEnrollmentTabStatusIn(
          'active',
        ) as EnrollmentStatus[],
      }),
      this.enrollmentRepo.count({
        ...base,
        statusIn: adminEnrollmentTabStatusIn(
          'completed',
        ) as EnrollmentStatus[],
      }),
      this.enrollmentRepo.count({
        ...base,
        statusIn: adminEnrollmentTabStatusIn(
          'cancelled',
        ) as EnrollmentStatus[],
      }),
      filters.studentId
        ? this.enrollmentRepo.count(base)
        : Promise.resolve(0),
    ]);

    if (filters.studentId) {
      return { active, completed, cancelled, all };
    }

    return { active, completed, cancelled };
  }
}
