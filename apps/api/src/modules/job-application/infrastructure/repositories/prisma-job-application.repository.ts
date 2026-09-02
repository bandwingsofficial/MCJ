import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { buildNextSerialNumber } from '@common/utils/serial-number';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { JobApplication } from '../../domain/entities/job-application.entity';
import type {
  JobApplicationDetailView,
  JobApplicationListFilters,
  JobApplicationRepository,
} from '../../domain/repositories/job-application.repository';
import { JobApplicationMapper } from '../mappers/job-application.mapper';
import {
  jobApplicationDetailInclude,
  JobApplicationResponseMapper,
} from '../mappers/job-application-response.mapper';

@Injectable()
export class PrismaJobApplicationRepository
  implements JobApplicationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(application: JobApplication): Promise<void> {
    const data = JobApplicationMapper.toPersistence(application);

    await this.prisma.jobApplication.upsert({
      where: { id: application.id },
      create: data,
      update: data,
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<JobApplication | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? JobApplicationMapper.toDomain(record) : null;
  }

  async findDetailById(
    id: string,
    includeDeleted = false,
  ): Promise<JobApplicationDetailView | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: jobApplicationDetailInclude,
    });

    return record
      ? JobApplicationResponseMapper.toDetail(record)
      : null;
  }

  async findByJobAndStudent(
    jobId: string,
    studentId: string,
    includeDeleted = false,
  ): Promise<JobApplication | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: {
        jobId,
        studentId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? JobApplicationMapper.toDomain(record) : null;
  }

  async findByJobAndEmail(
    jobId: string,
    email: string,
    includeDeleted = false,
  ): Promise<JobApplication | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: {
        jobId,
        applicantEmail: {
          equals: email,
          mode: 'insensitive',
        },
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? JobApplicationMapper.toDomain(record) : null;
  }

  async nextApplicationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `APP-${year}-`;
    const latest = await this.prisma.jobApplication.findFirst({
      where: {
        applicationNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        applicationNumber: 'desc',
      },
      select: {
        applicationNumber: true,
      },
    });

    return buildNextSerialNumber(latest?.applicationNumber, 'APP', 6);
  }

  async findDetails(
    filters: JobApplicationListFilters = {},
  ): Promise<JobApplicationDetailView[]> {
    const records = await this.prisma.jobApplication.findMany({
      where: this.buildWhere(filters),
      include: jobApplicationDetailInclude,
      skip: filters.skip,
      take: filters.take,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) =>
      JobApplicationResponseMapper.toDetail(record),
    );
  }

  async count(filters: JobApplicationListFilters = {}): Promise<number> {
    return this.prisma.jobApplication.count({
      where: this.buildWhere(filters),
    });
  }

  async findDetailsByStudentId(
    studentId: string,
    includeDeleted = false,
  ): Promise<JobApplicationDetailView[]> {
    const records = await this.prisma.jobApplication.findMany({
      where: {
        studentId,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: jobApplicationDetailInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) =>
      JobApplicationResponseMapper.toDetail(record),
    );
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.jobApplication.delete({
      where: { id },
    });
  }

  private buildWhere(
    filters: JobApplicationListFilters,
  ): Prisma.JobApplicationWhereInput {
    const where: Prisma.JobApplicationWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      where.OR = [
        {
          applicantName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          applicantEmail: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          applicantPhone: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          applicationNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          Student: {
            firstName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          Student: {
            lastName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          Student: {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          Student: {
            phone: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          job: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          job: {
            jobNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          job: {
            companyName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    return where;
  }
}