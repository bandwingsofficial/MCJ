import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import type {
  PaymentListFilters,
  PaymentRepository,
} from '../../domain/repositories/payment.repository';
import { ListPaymentsResult } from '../list-payments/list-payments.result';

import { GetMyPaymentsQuery } from './get-my-payments.query';

export class GetMyPaymentsHandler {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(
    query: GetMyPaymentsQuery,
  ): Promise<ListPaymentsResult> {
    const student = await this.studentRepo.findByCreatedBy(
      query.userId,
    );

    if (!student) {
      return new ListPaymentsResult([], 0, query.skip ?? 0, 0);
    }

    const filters: PaymentListFilters = {
      studentId: student.id,
      search: query.search,
      enrollmentId: query.enrollmentId,
      paymentStatus: query.paymentStatus,
      paymentMethod: query.paymentMethod,
      gateway: query.gateway,
      skip: query.skip,
      take: query.take,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    const [items, total] = await Promise.all([
      this.paymentRepo.findSummaries(filters),
      this.paymentRepo.count(filters),
    ]);

    return new ListPaymentsResult(
      items,
      total,
      query.skip ?? 0,
      query.take ?? items.length,
    );
  }
}
