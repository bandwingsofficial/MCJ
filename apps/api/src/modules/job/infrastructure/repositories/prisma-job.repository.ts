import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { startOfLocalDay } from '../../domain/utils/job-expiry.util';

import { buildNextSerialNumber } from '@common/utils/serial-number';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Job } from '../../domain/entities/job.entity';
import { JobStatus } from '../../domain/enums/job-status.enum';
import type {
  JobListFilters,
  JobRepository,
} from '../../domain/repositories/job.repository';
import { JobMapper } from '../mappers/job.mapper';

@Injectable()
export class PrismaJobRepository implements JobRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(job: Job): Promise<void> {
    const data = JobMapper.toPersistence(job);

    await this.prisma.job.upsert({
      where: { id: job.id },
      create: data,
      update: data,
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Job | null> {
    const record = await this.prisma.job.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? JobMapper.toDomain(record) : null;
  }

  async findBySlug(
    slug: string,
    includeDeleted = false,
  ): Promise<Job | null> {
    const record = await this.prisma.job.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? JobMapper.toDomain(record) : null;
  }

  async findAll(filters: JobListFilters = {}): Promise<Job[]> {
    const records = await this.prisma.job.findMany({
      where: await this.buildWhere(filters),
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => JobMapper.toDomain(record));
  }

  async count(filters: JobListFilters = {}): Promise<number> {
    return this.prisma.job.count({
      where: await this.buildWhere(filters),
    });
  }

  async nextJobNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `JOB-${year}-`;
    const latest = await this.prisma.job.findFirst({
      where: {
        jobNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        jobNumber: 'desc',
      },
      select: {
        jobNumber: true,
      },
    });

    return buildNextSerialNumber(latest?.jobNumber, 'JOB', 5);
  }

  async existsBySlug(
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    const record = await this.prisma.job.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    return Boolean(record);
  }

  async hasApplications(jobId: string): Promise<boolean> {
    const count = await this.prisma.jobApplication.count({
      where: { jobId },
    });

    return count > 0;
  }

  async deletePermanent(id: string): Promise<string[]> {
    return this.prisma.$transaction(async (tx) => {
      const applications = await tx.jobApplication.findMany({
        where: { jobId: id },
        select: { resumeFileId: true },
      });

      const resumeFileIds = applications
        .map((item) => item.resumeFileId)
        .filter((fileId): fileId is string => Boolean(fileId));

      await tx.interview.deleteMany({ where: { jobId: id } });
      await tx.placement.deleteMany({ where: { jobId: id } });
      await tx.jobApplication.deleteMany({ where: { jobId: id } });
      await tx.job.delete({ where: { id } });

      return resumeFileIds;
    });
  }

  private async buildWhere(filters: JobListFilters): Promise<Prisma.JobWhereInput> {
    const where: Prisma.JobWhereInput = {};

    if (filters.onlyDeleted) {
      where.isDeleted = true;
    } else if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.isActive = true;
    } else if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    const and: Prisma.JobWhereInput[] = [];

    if (filters.onlyPublic) {
      where.isActive = true;
      where.status = JobStatus.ACTIVE;
      where.isDeleted = false;
      and.push({
        OR: [
          { applicationDeadline: null },
          { applicationDeadline: { gte: startOfLocalDay(new Date()) } },
        ],
      });
    }

    if (filters.status) {
      where.status = filters.status;
    } else if (filters.includeStatuses?.length) {
      where.status = { in: filters.includeStatuses };
    } else if (filters.excludeStatuses?.length) {
      where.status = { notIn: filters.excludeStatuses };
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.employmentType) {
      where.employmentType =
        filters.employmentType as Prisma.EnumEmploymentTypeFilter['equals'];
    }

    if (filters.search?.trim()) {
      and.push(await this.buildGlobalSearchCondition(filters.search.trim()));
    }

    if (
      filters.filterMinExperience != null ||
      filters.filterMaxExperience != null
    ) {
      const rangeMin = filters.filterMinExperience ?? 0;
      const rangeMax = filters.filterMaxExperience ?? 999;
      and.push({
        AND: [
          {
            OR: [
              { minExperience: null },
              { minExperience: { lte: rangeMax } },
            ],
          },
          {
            OR: [
              { maxExperience: null },
              { maxExperience: { gte: rangeMin } },
            ],
          },
        ],
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }

    return where;
  }

  private async buildGlobalSearchCondition(
    search: string,
  ): Promise<Prisma.JobWhereInput> {
    const ilike = `%${search.replace(/[%_\\]/g, '\\$&')}%`;

    const arrayMatchRows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT j.id
      FROM "Job" j
      WHERE (
        EXISTS (SELECT 1 FROM unnest(j.skills) elem WHERE elem ILIKE ${ilike})
        OR EXISTS (SELECT 1 FROM unnest(j."preferredSkills") elem WHERE elem ILIKE ${ilike})
        OR EXISTS (SELECT 1 FROM unnest(j.qualifications) elem WHERE elem ILIKE ${ilike})
        OR EXISTS (SELECT 1 FROM unnest(j.responsibilities) elem WHERE elem ILIKE ${ilike})
      )
    `;

    const textConditions: Prisma.JobWhereInput[] = [
      { title: { contains: search, mode: 'insensitive' } },
      { jobNumber: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { companyDescription: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
      { state: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
      { benefits: { contains: search, mode: 'insensitive' } },
      { eligibilityTitle: { contains: search, mode: 'insensitive' } },
      { skills: { has: search } },
      { preferredSkills: { has: search } },
      { qualifications: { has: search } },
      { responsibilities: { has: search } },
    ];

    const numericSearch = Number(search);
    if (!Number.isNaN(numericSearch) && /^\d+(\.\d+)?$/.test(search.trim())) {
      textConditions.push({ minSalary: { equals: numericSearch } });
      textConditions.push({ maxSalary: { equals: numericSearch } });
      textConditions.push({ minExperience: { equals: numericSearch } });
      textConditions.push({ maxExperience: { equals: numericSearch } });
    }

    const or: Prisma.JobWhereInput[] = [...textConditions];
    if (arrayMatchRows.length > 0) {
      or.push({ id: { in: arrayMatchRows.map((row) => row.id) } });
    }

    return { OR: or };
  }
}
