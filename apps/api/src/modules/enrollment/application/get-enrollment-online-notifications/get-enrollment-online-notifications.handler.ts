import { adminEnrollmentTabStatusIn } from '@mcj/shared-constants';

import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type {
  EnrollmentListFilters,
  EnrollmentRepository,
} from '../../domain/repositories/enrollment.repository';

export class GetEnrollmentOnlineNotificationsHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async execute(input: {
    since?: Date;
    branchId?: string;
  }): Promise<{
    count: number;
    latestCreatedAt: string | null;
    enrollmentIds: string[];
  }> {
    const statusIn = adminEnrollmentTabStatusIn(
      'active',
    ) as EnrollmentStatus[];

    const filters: EnrollmentListFilters = {
      branchId: input.branchId,
      applicationType: ApplicationType.ONLINE,
      statusIn,
      includeDeleted: false,
      excludeUnpaidPublicCheckout: true,
      createdAfter: input.since,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const [count, items] = await Promise.all([
      this.enrollmentRepo.count(filters),
      this.enrollmentRepo.findSummaries({
        ...filters,
        skip: 0,
        take: 50,
      }),
    ]);

    const latest = items[0]?.createdAt ?? null;

    return {
      count,
      latestCreatedAt: latest ? latest.toISOString() : null,
      enrollmentIds: items.map((row) => row.id),
    };
  }
}
