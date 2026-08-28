import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  AttendanceStatus,
  EnrollmentStatus,
  InterviewStatus,
  JobApplicationStatus,
} from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';
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
  ) {}

  async getDashboard(user: BranchAuthUser) {
    if (this.access.isFaculty(user)) {
      return this.getFacultyDashboard(user);
    }

    if (this.access.isInterviewer(user)) {
      return this.getInterviewerDashboard(user);
    }

    return this.getManagerDashboard(user);
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
      branchId: user.branchId,
      isDeleted: false,
      status: {
        in: [EnrollmentStatus.ADMITTED, EnrollmentStatus.ACTIVE],
      },
      ...(batchWhere.id ? { batchId: batchWhere.id } : {}),
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
    const tomorrow = addUtcDays(today, 1);

    const interviewerFilter = { interviewerId: user.sub };

    const [
      newApplications,
      pendingInterviews,
      todaysInterviews,
      upcomingInterviews,
      completedInterviews,
      selectedCandidates,
      rejectedCandidates,
    ] = await Promise.all([
      this.prisma.jobApplication.count({
        where: { isDeleted: false, status: JobApplicationStatus.APPLIED },
      }),
      this.prisma.interview.count({
        where: { ...interviewerFilter, status: InterviewStatus.SCHEDULED },
      }),
      this.prisma.interview.count({
        where: {
          ...interviewerFilter,
          scheduledAt: { gte: today, lt: tomorrow },
        },
      }),
      this.prisma.interview.count({
        where: {
          ...interviewerFilter,
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: tomorrow },
        },
      }),
      this.prisma.interview.count({
        where: { ...interviewerFilter, status: InterviewStatus.COMPLETED },
      }),
      this.prisma.jobApplication.count({
        where: { isDeleted: false, status: JobApplicationStatus.SELECTED },
      }),
      this.prisma.jobApplication.count({
        where: { isDeleted: false, status: JobApplicationStatus.REJECTED },
      }),
    ]);

    return {
      role: user.role,
      newApplications,
      pendingInterviews,
      todaysInterviews,
      upcomingInterviews,
      completedInterviews,
      selectedCandidates,
      rejectedCandidates,
    };
  }

  private async getManagerDashboard(user: BranchAuthUser) {
    const branchId = user.branchId;
    const today = startOfUtcDay(new Date());
    const tomorrow = addUtcDays(today, 1);

    const [
      students,
      batches,
      todaysAttendance,
      pendingInterviews,
      placements,
    ] = await Promise.all([
      this.prisma.student.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.batch.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.attendance.count({
        where: { branchId, date: today },
      }),
      this.prisma.interview.count({
        where: {
          branchId,
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: today },
        },
      }),
      this.prisma.placement.count({
        where: { Student: { branchId } },
      }),
    ]);

    void tomorrow;

    return {
      role: user.role,
      students,
      batches,
      todaysAttendance,
      pendingInterviews,
      placements,
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
