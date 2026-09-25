import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  AttendanceStatus,
  EnrollmentStatus,
  InterviewStatus,
} from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import { BranchManagerDashboardService } from './branch-manager-dashboard.service';
import { computeBranchJobApplicationWorkflowMetrics } from './utils/branch-job-application-workflow-metrics.util';
import {
  buildBranchApplicationInterviewIncludeScope,
  buildBranchJobApplicationListInterviewScope,
} from './utils/branch-job-application-assignment.util';
import { mapBranchJobApplicationInterviews } from './utils/branch-job-application-interview-list.util';
import { jobApplicationInterviewerSelect } from '@modules/job-application/infrastructure/mappers/map-interviewer-display.util';
import {
  addUtcDays,
  parseDateOnly,
  startOfUtcDay,
} from './date.util';

@Injectable()
export class BranchDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
    private readonly managerDashboard: BranchManagerDashboardService,
  ) {}

  async getDashboard(
    user: BranchAuthUser,
    query?: { preset?: string; from?: string; to?: string },
  ) {
    if (this.access.isFaculty(user)) {
      return this.getFacultyDashboard(user);
    }

    if (this.access.isInterviewer(user)) {
      return this.getInterviewerDashboard(user);
    }

    return this.managerDashboard.getAnalytics(user, query ?? {});
  }

  private async getFacultyDashboard(user: BranchAuthUser) {
    const batchWhere = await this.access.branchBatchWhere(user);
    const today = startOfUtcDay(new Date());
    const tomorrow = addUtcDays(today, 1);
    const upcomingTo = addUtcDays(today, 14);

    const visibleBatches = await this.prisma.batch.findMany({
      where: batchWhere,
      select: { id: true },
    });
    const batchIds = visibleBatches.map((batch) => batch.id);
    const assignedBatches = batchIds.length;

    const enrollmentWhere = {
      isDeleted: false,
      branchId: user.branchId,
      status: {
        in: [EnrollmentStatus.ADMITTED, EnrollmentStatus.ACTIVE],
      },
      batch: batchWhere,
    };

    const students = batchIds.length
      ? await this.prisma.enrollment.findMany({
          where: enrollmentWhere,
          select: { studentId: true },
          distinct: ['studentId'],
        })
      : [];

    const expectedPairs = batchIds.length
      ? await this.prisma.enrollment.findMany({
          where: enrollmentWhere,
          select: { studentId: true, batchId: true },
        })
      : [];

    const todayAttendance = batchIds.length
      ? await this.prisma.attendance.findMany({
          where: {
            branchId: user.branchId,
            batchId: { in: batchIds },
            date: today,
          },
          select: { studentId: true, batchId: true, status: true },
        })
      : [];

    const recordedKeys = new Set(
      todayAttendance.map((row) => `${row.batchId}:${row.studentId}`),
    );
    const pendingAttendance = expectedPairs.filter(
      (row) => !recordedKeys.has(`${row.batchId}:${row.studentId}`),
    ).length;

    const upcomingTests = batchIds.length
      ? await this.prisma.academicAssessment.count({
          where: {
            branchId: user.branchId,
            batchId: { in: batchIds },
            type: 'TEST',
            date: { gte: today, lt: upcomingTo },
          },
        })
      : 0;

    const recentAssessments = batchIds.length
      ? await this.prisma.academicAssessment.findMany({
          where: { branchId: user.branchId, batchId: { in: batchIds } },
          orderBy: { createdAt: 'desc' },
          take: 8,
          include: {
            student: {
              select: { firstName: true, lastName: true, studentCode: true },
            },
            batch: { select: { name: true } },
          },
        })
      : [];

    return {
      role: user.role,
      assignedBatches,
      students: students.length,
      todaysAttendance: todayAttendance.filter(
        (row) => row.status === AttendanceStatus.PRESENT,
      ).length,
      pendingAttendance,
      upcomingTests,
      recentAssessments: recentAssessments.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        date: item.date,
        obtainedMarks: Number(item.obtainedMarks),
        maxMarks: Number(item.maxMarks),
        studentName: [item.student.firstName, item.student.lastName]
          .filter(Boolean)
          .join(' '),
        batchName: item.batch.name,
      })),
    };
  }

  private async getInterviewerDashboard(user: BranchAuthUser) {
    const today = startOfUtcDay(new Date());
    const branchId = user.branchId;
    const branchScopeInput = {
      branchId,
      interviewerId: user.sub,
    };
    const listInterviewScope = buildBranchJobApplicationListInterviewScope(
      branchScopeInput,
    );
    const interviewIncludeScope =
      buildBranchApplicationInterviewIncludeScope(branchScopeInput);

    const interviewerFilter = {
      branchId,
      interviewerId: user.sub,
    };

    const interviewInclude = {
      where: interviewIncludeScope,
      orderBy: [
        { roundNumber: 'desc' as const },
        { createdAt: 'desc' as const },
      ],
      include: {
        interviewer: {
          select: jobApplicationInterviewerSelect,
        },
        branch: {
          select: { id: true, branchName: true, branchCode: true },
        },
        round: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            status: true,
          },
        },
        nextRound: {
          select: {
            id: true,
            name: true,
            sortOrder: true,
            status: true,
          },
        },
      },
    };

    const [
      branch,
      candidates,
      completedInterviews,
      pendingOpenInterviews,
      upcomingInterviewRows,
    ] = await Promise.all([
      this.prisma.branch.findFirst({
        where: { id: branchId, deletedAt: null },
        select: { id: true, branchName: true, branchCode: true },
      }),
      this.prisma.jobApplication.findMany({
        where: {
          isDeleted: false,
          interviews: { some: listInterviewScope },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          applicationNumber: true,
          applicantName: true,
          interviews: interviewInclude,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.interview.count({
        where: {
          ...interviewerFilter,
          status: InterviewStatus.COMPLETED,
        },
      }),
      this.prisma.interview.count({
        where: {
          ...interviewerFilter,
          status: {
            in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
          },
        },
      }),
      this.prisma.interview.findMany({
        where: {
          ...interviewerFilter,
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: today },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 8,
        select: {
          id: true,
          applicationId: true,
          scheduledAt: true,
          application: {
            select: {
              applicantName: true,
              applicationNumber: true,
            },
          },
          job: { select: { title: true } },
          round: { select: { name: true, sortOrder: true } },
        },
      }),
    ]);

    const { metrics: workflow, alerts } =
      computeBranchJobApplicationWorkflowMetrics(
        candidates.map((candidate) => ({
          status: candidate.status,
          createdAt: candidate.createdAt,
          interviews: mapBranchJobApplicationInterviews(candidate.interviews),
        })),
      );

    return {
      role: user.role,
      branch: branch
        ? {
            id: branch.id,
            branchName: branch.branchName,
            branchCode: branch.branchCode,
          }
        : { id: branchId, branchName: '', branchCode: '' },
      metrics: {
        newApplications: workflow.notScheduled + workflow.waitingToSchedule,
        pendingInterviews: pendingOpenInterviews,
        scheduledInterviews:
          workflow.scheduledUpcoming + workflow.today + workflow.inProgress,
        todaysInterviews: workflow.today,
        upcomingInterviews: workflow.scheduledUpcoming,
        completedInterviews,
        selectedNextRound: workflow.nextRoundPending,
        rejectedCandidates: workflow.rejected,
        placedCandidates: workflow.placed,
        onHold: workflow.onHold,
        needFurtherReview: workflow.needFurtherReview,
      },
      workflow,
      alerts,
      upcomingSchedule: upcomingInterviewRows
        .filter((row) => row.scheduledAt)
        .map((row) => ({
          id: row.id,
          applicationId: row.applicationId,
          title:
            row.application.applicantName?.trim() ||
            row.application.applicationNumber,
          subtitle: row.job.title,
          roundLabel: row.round
            ? `${row.round.sortOrder}. ${row.round.name}`
            : null,
          scheduledAt: row.scheduledAt!.toISOString(),
          href: `/job-applications/${row.applicationId}`,
        })),
      // Legacy flat fields for older clients
      newApplications: workflow.notScheduled + workflow.waitingToSchedule,
      pendingInterviews: pendingOpenInterviews,
      todaysInterviews: workflow.today,
      upcomingInterviews: workflow.scheduledUpcoming,
      selectedCandidates: workflow.nextRoundPending,
      rejectedCandidates: workflow.rejected,
    };
  }

  parseOptionalDate(value?: string): Date | undefined {
    if (!value) {
      return undefined;
    }

    try {
      return parseDateOnly(value);
    } catch {
      throw new BadRequestException('Invalid date');
    }
  }
}
