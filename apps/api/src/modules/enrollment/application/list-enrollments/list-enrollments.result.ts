import type { EnrollmentSummaryView } from '../../domain/repositories/enrollment.repository';

export class ListEnrollmentsResult {
  constructor(
    public readonly items: EnrollmentSummaryView[],
    public readonly total: number,
    public readonly skip: number,
    public readonly take: number,
  ) {}
}
