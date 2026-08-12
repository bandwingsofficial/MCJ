import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Placement } from '../../domain/entities/placement.entity';
import type {
  PlacementDetailView,
  PlacementListFilters,
  PlacementRepository,
} from '../../domain/repositories/placement.repository';
import { PlacementMapper } from '../mappers/placement.mapper';
import {
  placementDetailInclude,
  PlacementResponseMapper,
} from '../mappers/placement-response.mapper';

@Injectable()
export class PrismaPlacementRepository implements PlacementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(placement: Placement): Promise<void> {
    const data = PlacementMapper.toPersistence(placement);

    await this.prisma.placement.upsert({
      where: { id: placement.id },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Placement | null> {
    const record = await this.prisma.placement.findUnique({
      where: { id },
    });

    return record ? PlacementMapper.toDomain(record) : null;
  }

  async findDetailById(
    id: string,
  ): Promise<PlacementDetailView | null> {
    const record = await this.prisma.placement.findUnique({
      where: { id },
      include: placementDetailInclude,
    });

    return record
      ? PlacementResponseMapper.toDetail(record)
      : null;
  }

  async findDetailByApplicationId(
    applicationId: string,
  ): Promise<PlacementDetailView | null> {
    const record = await this.prisma.placement.findUnique({
      where: { applicationId },
      include: placementDetailInclude,
    });

    return record
      ? PlacementResponseMapper.toDetail(record)
      : null;
  }

  async findDetailByUserId(
    userId: string,
  ): Promise<PlacementDetailView | null> {
    const record = await this.prisma.placement.findFirst({
      where: { studentId: userId },
      include: placementDetailInclude,
      orderBy: { createdAt: 'desc' },
    });

    return record
      ? PlacementResponseMapper.toDetail(record)
      : null;
  }

  async findDetails(
    filters: PlacementListFilters = {},
  ): Promise<PlacementDetailView[]> {
    const records = await this.prisma.placement.findMany({
      where: this.buildWhere(filters),
      include: placementDetailInclude,
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) =>
      PlacementResponseMapper.toDetail(record),
    );
  }

  async existsByApplicationId(
    applicationId: string,
  ): Promise<boolean> {
    const record = await this.prisma.placement.findUnique({
      where: { applicationId },
      select: { id: true },
    });

    return Boolean(record);
  }

  private buildWhere(
    filters: PlacementListFilters,
  ): Prisma.PlacementWhereInput {
    const where: Prisma.PlacementWhereInput = {};

    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.userId) where.studentId = filters.userId;
    if (filters.status) where.status = filters.status;

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.OR = [
        {
          companyName: { contains: search, mode: 'insensitive' },
        },
        {
          Student: {
            firstName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          Student: {
            lastName: { contains: search, mode: 'insensitive' },
          },
        },
        {
          Student: {
            email: { contains: search, mode: 'insensitive' },
          },
        },
        {
          job: {
            title: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    return where;
  }
}
