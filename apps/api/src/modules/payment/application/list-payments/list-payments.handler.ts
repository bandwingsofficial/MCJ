import type {
  PaymentListFilters,
  PaymentRepository,
} from '../../domain/repositories/payment.repository';

import { ListPaymentsQuery } from './list-payments.query';
import { ListPaymentsResult } from './list-payments.result';

export class ListPaymentsHandler {
  constructor(
    private readonly paymentRepo: PaymentRepository,
  ) {}

  async execute(
    query: ListPaymentsQuery,
  ): Promise<ListPaymentsResult> {
    const filters: PaymentListFilters = {
      search: query.search,
      enrollmentId: query.enrollmentId,
      studentId: query.studentId,
      paymentStatus: query.paymentStatus,
      paymentMethod: query.paymentMethod,
      gateway: query.gateway,
      includeDeleted: query.includeDeleted,
      createdAtFrom: query.createdAtFrom,
      createdAtTo: query.createdAtTo,
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
