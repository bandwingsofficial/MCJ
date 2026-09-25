import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { buildNextSerialNumber } from '@common/utils/serial-number';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { JobApplication } from '../../domain/entities/job-application.entity';
import { JOB_APPLICATION_BLOCKING_STATUSES } from '../../domain/enums/job-application-status.enum';
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return record ? JobApplicationMapper.toDomain(record) : null;
  }

  async findBlockingByJobAndStudent(
    jobId: string,
    studentId: string,
  ): Promise<JobApplication | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: {
        jobId,
        studentId,
        isDeleted: false,
        status: {
          in: [...JOB_APPLICATION_BLOCKING_STATUSES],
        },
      },
      orderBy: {
        createdAt: 'desc',
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return record ? JobApplicationMapper.toDomain(record) : null;
  }

  async findBlockingByJobAndEmail(
    jobId: string,
    email: string,
  ): Promise<JobApplication | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: {
        jobId,
        applicantEmail: {
          equals: email,
          mode: 'insensitive',
        },
        isDeleted: false,
        status: {
          in: [...JOB_APPLICATION_BLOCKING_STATUSES],
        },
      },
      orderBy: {
        createdAt: 'desc',
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
    await this.prisma.$transaction(async (tx) => {
      await tx.interview.deleteMany({
        where: { applicationId: id },
      });
      await tx.placement.deleteMany({
        where: { applicationId: id },
      });
      await tx.jobApplication.delete({
        where: { id },
      });
    });
  }

  async updateStudentId(
    applicationId: string,
    studentId: string,
  ): Promise<void> {
    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { studentId },
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

    if (filters.statusGroup === 'PENDING') {
      where.status = {
        in: ['APPLIED', 'UNDER_REVIEW'],
      };
    } else if (filters.statusGroup === 'SHORTLISTED') {
      // Shortlist / interview pipeline — include post-interview outcomes (Placed, etc.).
      where.OR = [
        { status: 'SHORTLISTED' },
        { status: 'INTERVIEW' },
        { status: 'ASSESSMENT' },
        { status: 'PLACED' },
        {
          status: 'SELECTED',
          interviewStatus: 'NOT_YET',
        },
      ];
    } else if (filters.statusGroup === 'REJECTED') {
      where.OR = [
        { status: 'REJECTED' },
        {
          status: { in: ['SHORTLISTED', 'INTERVIEW', 'ASSESSMENT'] },
          interviewStatus: 'REJECTED',
        },
      ];
    } else if (filters.status) {
      where.status = filters.status;
    }

    if (filters.interviewStatus) {
      where.interviewStatus = filters.interviewStatus;
    }

    if (filters.appliedFrom || filters.appliedTo) {
      where.createdAt = {
        ...(filters.appliedFrom ? { gte: filters.appliedFrom } : {}),
        ...(filters.appliedTo ? { lte: filters.appliedTo } : {}),
      };
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      const searchOr: Prisma.JobApplicationWhereInput[] = [
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
          Student: {
            studentCode: {
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

      // statusGroup SHORTLISTED already uses OR — nest search under AND.
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOr }];
        delete where.OR;
      } else {
        where.OR = searchOr;
      }
    }

    return where;
  }
}