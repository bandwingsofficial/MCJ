import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, Prisma } from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import { facultyBranchEnrollmentWhere } from './faculty-batch-query';
import {
  buildBranchApplicationInterviewIncludeScope,
  buildBranchJobApplicationListInterviewScope,
} from './utils/branch-job-application-assignment.util';

const PAGE_SIZE = 5;

const VISIBLE_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

export type BranchGlobalSearchItemDto = {
  id: string;
  type: 'student' | 'trainer' | 'batch' | 'job_application' | 'interview';
  title: string;
  subtitle: string;
};

export type BranchGlobalSearchGroupDto = {
  type: BranchGlobalSearchItemDto['type'];
  typeLabel: string;
  items: BranchGlobalSearchItemDto[];
};

const TYPE_LABELS: Record<BranchGlobalSearchItemDto['type'], string> = {
  student: 'Student',
  trainer: 'Trainer',
  batch: 'Batch',
  job_application: 'Job Application',
  interview: 'Interview',
};

const ENTITY_ORDER: BranchGlobalSearchItemDto['type'][] = [
  'student',
  'trainer',
  'batch',
  'job_application',
  'interview',
];

@Injectable()
export class BranchGlobalSearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async search(
    user: BranchAuthUser,
    rawQuery: string,
  ): Promise<BranchGlobalSearchGroupDto[]> {
    const search = rawQuery.trim();
    if (!search) {
      return [];
    }

    const isInterviewer = this.access.isInterviewer(user);
    const isManager = this.access.isManager(user);
    const canSearchRecruiting = this.canSearchRecruiting(user);

    const [students, trainers, batches, jobApplications, interviews] =
      await Promise.all([
        isInterviewer ? [] : this.searchStudents(user, search),
        isInterviewer || !isManager ? [] : this.searchTrainers(user, search),
        isInterviewer ? [] : this.searchBatches(user, search),
        canSearchRecruiting
          ? this.searchJobApplications(user, search)
          : [],
        canSearchRecruiting ? this.searchInterviews(user, search) : [],
      ]);

    return this.groupResults([
      ...students,
      ...trainers,
      ...batches,
      ...jobApplications,
      ...interviews,
    ]);
  }

  private canSearchRecruiting(user: BranchAuthUser): boolean {
    return (
      user.role === BranchUserRole.BRANCH_MANAGER ||
      user.role === BranchUserRole.INTERVIEWER
    );
  }

  private branchScopeInput(user: BranchAuthUser): {
    branchId: string;
    interviewerId?: string;
  } {
    return {
      branchId: user.branchId,
      ...(this.access.isInterviewer(user) ? { interviewerId: user.sub } : {}),
    };
  }

  private personName(firstName: string, lastName?: string | null): string {
    return [firstName, lastName].filter(Boolean).join(' ').trim() || '—';
  }

  private groupResults(
    items: BranchGlobalSearchItemDto[],
  ): BranchGlobalSearchGroupDto[] {
    const byType = new Map<
      BranchGlobalSearchItemDto['type'],
      BranchGlobalSearchItemDto[]
    >();
    for (const item of items) {
      const list = byType.get(item.type) ?? [];
      list.push(item);
      byType.set(item.type, list);
    }
    return ENTITY_ORDER.map((type) => ({
      type,
      typeLabel: TYPE_LABELS[type],
      items: byType.get(type) ?? [],
    }));
  }

  private async searchStudents(
    user: BranchAuthUser,
    search: string,
  ): Promise<BranchGlobalSearchItemDto[]> {
    const assignedIds = await this.access.visibleBatchIds(user);
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        ...facultyBranchEnrollmentWhere(user.branchId, {
          batchIds: assignedIds,
        }),
        status: { in: VISIBLE_ENROLLMENT_STATUSES },
        OR: [
          {
            student: {
              firstName: { contains: search, mode: 'insensitive' },
            },
          },
          {
            student: { lastName: { contains: search, mode: 'insensitive' } },
          },
          {
            student: {
              studentCode: { contains: search, mode: 'insensitive' },
            },
          },
          {
            student: { email: { contains: search, mode: 'insensitive' } },
          },
          {
            student: { phone: { contains: search, mode: 'insensitive' } },
          },
        ],
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: PAGE_SIZE * 6,
    });

    const seen = new Set<string>();
    const items: BranchGlobalSearchItemDto[] = [];
    for (const row of enrollments) {
      if (seen.has(row.student.id)) {
        continue;
      }
      seen.add(row.student.id);
      items.push({
        id: row.student.id,
        type: 'student',
        title: this.personName(row.student.firstName, row.student.lastName),
        subtitle: row.student.studentCode,
      });
      if (items.length >= PAGE_SIZE) {
        break;
      }
    }
    return items;
  }

  private async searchTrainers(
    user: BranchAuthUser,
    search: string,
  ): Promise<BranchGlobalSearchItemDto[]> {
    const rows = await this.prisma.branchTrainer.findMany({
      where: {
        branchId: user.branchId,
        trainer: {
          isDeleted: false,
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { employeeCode: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
      select: {
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
      distinct: ['trainerId'],
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
    });

    return rows.map((row) => ({
      id: row.trainer.id,
      type: 'trainer' as const,
      title: this.personName(row.trainer.firstName, row.trainer.lastName),
      subtitle: row.trainer.employeeCode ?? row.trainer.email ?? '',
    }));
  }

  private async searchBatches(
    user: BranchAuthUser,
    search: string,
  ): Promise<BranchGlobalSearchItemDto[]> {
    const batchWhere = await this.access.branchBatchWhere(user);
    const rows = await this.prisma.batch.findMany({
      where: {
        ...batchWhere,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, code: true },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
    });

    return rows.map((batch) => ({
      id: batch.id,
      type: 'batch' as const,
      title: batch.name,
      subtitle: batch.code,
    }));
  }

  private buildJobApplicationSearchWhere(
    interviewScope: Prisma.InterviewWhereInput,
    search: string,
  ): Prisma.JobApplicationWhereInput {
    return {
      isDeleted: false,
      interviews: { some: interviewScope },
      OR: [
        {
          applicationNumber: { contains: search, mode: 'insensitive' },
        },
        {
          applicantName: { contains: search, mode: 'insensitive' },
        },
        {
          applicantEmail: { contains: search, mode: 'insensitive' },
        },
        {
          job: {
            title: { contains: search, mode: 'insensitive' },
          },
        },
      ],
    };
  }

  private async searchJobApplications(
    user: BranchAuthUser,
    search: string,
  ): Promise<BranchGlobalSearchItemDto[]> {
    const listInterviewScope = buildBranchJobApplicationListInterviewScope(
      this.branchScopeInput(user),
    );

    const rows = await this.prisma.jobApplication.findMany({
      where: this.buildJobApplicationSearchWhere(listInterviewScope, search),
      select: {
        id: true,
        applicationNumber: true,
        applicantName: true,
        job: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE,
    });

    return rows.map((row) => ({
      id: row.id,
      type: 'job_application' as const,
      title: row.applicantName?.trim() || row.applicationNumber,
      subtitle: row.job?.title ?? row.applicationNumber,
    }));
  }

  private async searchInterviews(
    user: BranchAuthUser,
    search: string,
  ): Promise<BranchGlobalSearchItemDto[]> {
    const scope = buildBranchApplicationInterviewIncludeScope(
      this.branchScopeInput(user),
    );

    const rows = await this.prisma.interview.findMany({
      where: {
        ...scope,
        application: { isDeleted: false },
        OR: [
          {
            application: {
              applicantName: { contains: search, mode: 'insensitive' },
            },
          },
          {
            application: {
              applicationNumber: { contains: search, mode: 'insensitive' },
            },
          },
          {
            job: {
              title: { contains: search, mode: 'insensitive' },
            },
          },
        ],
      },
      select: {
        id: true,
        status: true,
        application: {
          select: { applicationNumber: true, applicantName: true },
        },
        round: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: PAGE_SIZE,
    });

    return rows.map((row) => ({
      id: row.id,
      type: 'interview' as const,
      title:
        row.application?.applicantName?.trim() ||
        row.application?.applicationNumber ||
        'Interview',
      subtitle: row.round?.name ?? row.status,
    }));
  }
}
