import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Payment } from '../../domain/entities/payment.entity';
import {
  PaymentDetailView,
  PaymentListFilters,
  PaymentRepository,
  PaymentSummaryView,
} from '../../domain/repositories/payment.repository';
import { PaymentMapper } from '../mappers/payment.mapper';
import {
  paymentDetailInclude,
  PaymentResponseMapper,
} from '../mappers/payment-response.mapper';

export class PrismaPaymentRepository implements PaymentRepository {
  private readonly logger = new Logger(
    PrismaPaymentRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(payment: Payment): Promise<void> {
    this.logger.log(`💾 Saving payment: ${payment.id}`);

    const data = PaymentMapper.toPersistence(payment);

    await this.prisma.payment.upsert({
      where: { id: payment.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? PaymentMapper.toDomain(record) : null;
  }

  async findByPaymentNumber(
    paymentNumber: string,
    includeDeleted = false,
  ): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        paymentNumber,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? PaymentMapper.toDomain(record) : null;
  }

  async findByGatewayOrderId(
    gatewayOrderId: string,
    includeDeleted = false,
  ): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        gatewayOrderId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return record ? PaymentMapper.toDomain(record) : null;
  }

  async findByGatewayPaymentId(
    gatewayPaymentId: string,
    includeDeleted = false,
  ): Promise<Payment | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        gatewayPaymentId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? PaymentMapper.toDomain(record) : null;
  }

  async findDetailById(
    id: string,
    includeDeleted = false,
  ): Promise<PaymentDetailView | null> {
    const record = await this.prisma.payment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: paymentDetailInclude,
    });

    return record
      ? PaymentResponseMapper.toDetail(record)
      : null;
  }

  async findSummaries(
    filters: PaymentListFilters = {},
  ): Promise<PaymentSummaryView[]> {
    const records = await this.prisma.payment.findMany({
      where: this.buildWhere(filters),
      orderBy: this.buildOrderBy(filters),
      include: paymentDetailInclude,
      skip: filters.skip,
      take: filters.take,
    });

    return records.map((record) =>
      PaymentResponseMapper.toSummary(record),
    );
  }

  async count(
    filters: PaymentListFilters = {},
  ): Promise<number> {
    return this.prisma.payment.count({
      where: this.buildWhere(filters),
    });
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }

  private buildOrderBy(
    filters: PaymentListFilters,
  ): Prisma.PaymentOrderByWithRelationInput {
    const sortOrder = filters.sortOrder ?? 'desc';

    const allowedSortFields = new Set([
      'createdAt',
      'paidAt',
      'amount',
      'paymentStatus',
      'paymentMethod',
    ]);

    const sortBy =
      filters.sortBy && allowedSortFields.has(filters.sortBy)
        ? filters.sortBy
        : 'createdAt';

    return { [sortBy]: sortOrder };
  }

  private buildWhere(
    filters: PaymentListFilters,
  ): Prisma.PaymentWhereInput {
    const where: Prisma.PaymentWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.enrollmentId !== undefined) {
      where.enrollmentId = filters.enrollmentId;
    }

    if (filters.studentId !== undefined) {
      where.studentId = filters.studentId;
    }

    if (filters.paymentStatus !== undefined) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.paymentMethod !== undefined) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.gateway !== undefined) {
      where.gateway = filters.gateway;
    }

    if (
      filters.createdAtFrom !== undefined ||
      filters.createdAtTo !== undefined
    ) {
      where.createdAt = {
        ...(filters.createdAtFrom !== undefined
          ? { gte: filters.createdAtFrom }
          : {}),
        ...(filters.createdAtTo !== undefined
          ? { lte: filters.createdAtTo }
          : {}),
      };
    }

    if (filters.search) {
      const contains: Prisma.StringFilter = {
        contains: filters.search,
        mode: 'insensitive',
      };

      where.OR = [
        { paymentNumber: contains },
        { transactionId: contains },
        { gatewayOrderId: contains },
        { gatewayPaymentId: contains },
        { remarks: contains },
        { enrollment: { enrollmentNumber: contains } },
        { student: { studentCode: contains } },
        { student: { firstName: contains } },
        { student: { lastName: contains } },
        { student: { email: contains } },
        { student: { phone: contains } },
      ];
    }

    return where;
  }
}
