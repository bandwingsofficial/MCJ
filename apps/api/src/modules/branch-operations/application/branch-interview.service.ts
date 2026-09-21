import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InterviewMode,
  InterviewStatus,
  JobApplicationStatus,
  Prisma,
} from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { UpdateJobApplicationStatusCommand } from '@modules/job-application/application/update-job-application-status/update-job-application-status.command';
import { UpdateJobApplicationStatusHandler } from '@modules/job-application/application/update-job-application-status/update-job-application-status.handler';
import { GetJobApplicationHandler } from '@modules/job-application/application/get-job-application/get-job-application.handler';
import { GetJobApplicationQuery } from '@modules/job-application/application/get-job-application/get-job-application.query';
import { JobApplicationInterviewStatus } from '@modules/job-application/domain/enums/job-application-interview-status.enum';
import { JobApplicationStatus as DomainJobApplicationStatus } from '@modules/job-application/domain/enums/job-application-status.enum';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';

@Injectable()
export class BranchInterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
    private readonly getApplicationHandler: GetJobApplicationHandler,
    private readonly updateApplicationStatusHandler: UpdateJobApplicationStatusHandler,
  ) {}

  async listApplications(
    user: BranchAuthUser,
    query: {
      status?: JobApplicationStatus;
      search?: string;
      jobId?: string;
      appliedFrom?: string;
      appliedTo?: string;
      interviewPhase?: 'ASSIGNED' | 'SCHEDULED';
      skip?: number;
      take?: number;
    },
  ) {
    this.assertInterviewRole(user);

    const skip = query.skip ?? 0;
    const take = query.take ?? 20;

    const interviewScope: Prisma.InterviewWhereInput =
      this.access.isInterviewer(user)
        ? { interviewerId: user.sub, branchId: user.branchId }
        : { branchId: user.branchId };

    const interviewMatch: Prisma.InterviewWhereInput = {
      ...interviewScope,
      ...(query.interviewPhase === 'ASSIGNED'
        ? {
            status: InterviewStatus.ASSIGNED,
          }
        : {}),
      ...(query.interviewPhase === 'SCHEDULED'
        ? {
            status: InterviewStatus.SCHEDULED,
            scheduledAt: { not: null },
          }
        : {}),
    };

    const where: Prisma.JobApplicationWhereInput = {
      isDeleted: false,
      ...(query.status ? { status: query.status } : {}),
      ...(query.jobId ? { jobId: query.jobId } : {}),
      ...(query.appliedFrom || query.appliedTo
        ? {
            createdAt: {
              ...(query.appliedFrom
                ? { gte: new Date(`${query.appliedFrom}T00:00:00.000Z`) }
                : {}),
              ...(query.appliedTo
                ? { lte: new Date(`${query.appliedTo}T23:59:59.999Z`) }
                : {}),
            },
          }
        : {}),
      interviews: { some: interviewMatch },
      ...(query.search?.trim()
        ? {
            OR: [
              {
                applicationNumber: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                applicantName: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                applicantEmail: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                job: {
                  title: {
                    contains: query.search.trim(),
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [records, total, jobOptions] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        include: {
          job: true,
          Student: true,
          interviews: {
            where: interviewScope,
            orderBy: [{ createdAt: 'desc' }],
            take: 1,
            include: {
              interviewer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              branch: {
                select: { id: true, branchName: true, branchCode: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.jobApplication.count({ where }),
      this.prisma.job.findMany({
        where: {
          applications: {
            some: {
              isDeleted: false,
              interviews: { some: interviewScope },
            },
          },
        },
        select: {
          id: true,
          title: true,
          companyName: true,
          jobNumber: true,
        },
        orderBy: { title: 'asc' },
        take: 200,
      }),
    ]);

    const items = records.map((record) => {
      const latest = record.interviews[0] ?? null;
      const detail = {
        id: record.id,
        jobId: record.jobId,
        studentId: record.studentId,
        applicationNumber: record.applicationNumber,
        applicantName: record.applicantName,
        applicantEmail: record.applicantEmail,
        applicantPhone: record.applicantPhone,
        highestQualification: record.highestQualification,
        yearsOfExperience: record.yearsOfExperience,
        resumeFileId: record.resumeFileId,
        coverLetter: record.coverLetter,
        currentLocation: record.currentLocation,
        expectedSalary: record.expectedSalary
          ? Number(record.expectedSalary)
          : null,
        remarks: record.remarks,
        rejectionReason: record.rejectionReason,
        status: record.status,
        interviewStatus: record.interviewStatus,
        isDeleted: record.isDeleted,
        deletedAt: record.deletedAt,
        job: {
          id: record.job.id,
          title: record.job.title,
          slug: record.job.slug,
          jobNumber: record.job.jobNumber,
          companyName: record.job.companyName,
          status: record.job.status,
          employmentType: record.job.employmentType,
        },
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        latestInterview: latest
          ? {
              id: latest.id,
              scheduledAt: latest.scheduledAt,
              mode: latest.mode,
              locationOrLink: latest.locationOrLink,
              roundNumber: latest.roundNumber,
              status: latest.status,
              notes: latest.notes,
              interviewer: latest.interviewer,
              branch: latest.branch,
            }
          : null,
        interviewScheduleStatus: latest?.status ?? null,
        interviewScheduledAt: latest?.scheduledAt ?? null,
      };

      return detail;
    });

    return { items, total, jobOptions };
  }

  async getApplication(user: BranchAuthUser, id: string) {
    this.assertInterviewRole(user);

    const interviewScope: Prisma.InterviewWhereInput =
      this.access.isInterviewer(user)
        ? { interviewerId: user.sub, branchId: user.branchId }
        : { branchId: user.branchId };

    const owned = await this.prisma.interview.findFirst({
      where: {
        applicationId: id,
        ...interviewScope,
      },
    });

    if (!owned) {
      throw new ForbiddenException(
        'Application is not assigned to your branch',
      );
    }

    const application = await this.getApplicationHandler.execute(
      new GetJobApplicationQuery(id, false),
    );

    const interviews = await this.prisma.interview.findMany({
      where: {
        applicationId: id,
        ...interviewScope,
      },
      include: {
        interviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        branch: {
          select: { id: true, branchName: true, branchCode: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const resume = application.resumeFileId
      ? await this.prisma.upload.findFirst({
          where: { id: application.resumeFileId },
          select: {
            id: true,
            url: true,
            originalName: true,
            mimeType: true,
            size: true,
          },
        })
      : null;

    return {
      ...application,
      resume,
      interviews: interviews.map((item) => ({
        ...this.toInterviewDto(item),
        roundNumber: item.roundNumber,
        branch: item.branch,
        branchId: item.branchId,
        interviewerId: item.interviewerId,
      })),
    };
  }

  async updateApplicationStatus(
    user: BranchAuthUser,
    id: string,
    status: JobApplicationStatus,
  ) {
    this.assertInterviewRole(user);

    if (
      this.access.isInterviewer(user) &&
      status === JobApplicationStatus.PLACED
    ) {
      throw new ForbiddenException(
        'Interviewer cannot mark a candidate as placed',
      );
    }

    const result = await this.updateApplicationStatusHandler.execute(
      new UpdateJobApplicationStatusCommand(
        id,
        status as DomainJobApplicationStatus,
        user.sub,
      ),
    );

    await this.access.log({
      user,
      action: 'APPLICATION_STATUS_UPDATED',
      resourceType: 'JobApplication',
      resourceId: id,
      metadata: { status },
    });

    return result;
  }

  async listInterviews(
    user: BranchAuthUser,
    query: { status?: InterviewStatus; from?: string; to?: string },
  ) {
    this.assertInterviewRole(user);

    const where: Prisma.InterviewWhereInput = {};

    if (this.access.isInterviewer(user)) {
      where.interviewerId = user.sub;
    } else {
      where.branchId = user.branchId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.from || query.to) {
      where.scheduledAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }

    const interviews = await this.prisma.interview.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            applicantName: true,
            applicantEmail: true,
            status: true,
          },
        },
        job: { select: { id: true, title: true, companyName: true } },
        interviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return interviews.map((item) => this.toInterviewDto(item));
  }

  async schedule(
    user: BranchAuthUser,
    input: {
      applicationId: string;
      scheduledAt: string;
      durationMinutes?: number;
      mode: InterviewMode;
      locationOrLink?: string;
      notes?: string;
      interviewerId?: string;
      roundNumber?: number;
    },
  ) {
    this.assertInterviewRole(user);

    const application = await this.prisma.jobApplication.findFirst({
      where: { id: input.applicationId, isDeleted: false },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const assignmentScope: Prisma.InterviewWhereInput =
      this.access.isInterviewer(user)
        ? {
            applicationId: application.id,
            interviewerId: user.sub,
            branchId: user.branchId,
            status: {
              in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
            },
          }
        : {
            applicationId: application.id,
            branchId: user.branchId,
            status: {
              in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
            },
          };

    const existingAssignment = await this.prisma.interview.findFirst({
      where: assignmentScope,
      orderBy: { createdAt: 'desc' },
    });

    if (!existingAssignment) {
      throw new ForbiddenException(
        'Application is not assigned to your branch',
      );
    }

    const interviewerId =
      existingAssignment.interviewerId ??
      (this.access.isInterviewer(user)
        ? user.sub
        : input.interviewerId ?? user.sub);

    if (!interviewerId) {
      throw new BadRequestException('Interviewer is required');
    }

    await this.assertInterviewerInBranch(interviewerId, user.branchId);

    const scheduledAt = new Date(input.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid interview date');
    }

    const locationOrLink = input.locationOrLink?.trim() ?? '';
    if (
      (input.mode === InterviewMode.ONLINE ||
        input.mode === InterviewMode.OFFLINE) &&
      !locationOrLink
    ) {
      throw new BadRequestException(
        input.mode === InterviewMode.ONLINE
          ? 'Meeting link is required for online interviews'
          : 'Venue is required for offline interviews',
      );
    }

    const durationMinutes =
      input.durationMinutes ?? existingAssignment.durationMinutes ?? 60;
    const roundNumber =
      input.roundNumber ?? existingAssignment.roundNumber ?? 1;

    await this.assertNoConflict(
      interviewerId,
      scheduledAt,
      durationMinutes,
      existingAssignment.id,
    );

    const interview = await this.prisma.interview.update({
      where: { id: existingAssignment.id },
      data: {
        interviewerId,
        scheduledAt,
        durationMinutes,
        mode: input.mode,
        locationOrLink: locationOrLink || null,
        notes: input.notes?.trim() || existingAssignment.notes,
        roundNumber,
        status: InterviewStatus.SCHEDULED,
        updatedBy: user.sub,
      },
      include: this.include(),
    });

    if (
      application.status === JobApplicationStatus.APPLIED ||
      application.status === JobApplicationStatus.UNDER_REVIEW ||
      application.status === JobApplicationStatus.SHORTLISTED ||
      application.status === JobApplicationStatus.ASSESSMENT
    ) {
      await this.updateApplicationStatusHandler.execute(
        new UpdateJobApplicationStatusCommand(
          application.id,
          DomainJobApplicationStatus.INTERVIEW,
          user.sub,
        ),
      );
    }

    await this.prisma.jobApplication.update({
      where: { id: application.id },
      data: {
        interviewStatus: JobApplicationInterviewStatus.INTERVIEW_SCHEDULED,
      },
    });

    await this.access.log({
      user,
      action: 'INTERVIEW_SCHEDULED',
      resourceType: 'Interview',
      resourceId: interview.id,
      metadata: { applicationId: application.id, scheduledAt },
    });

    return this.toInterviewDto(interview);
  }

  async updateInterview(
    user: BranchAuthUser,
    id: string,
    input: {
      scheduledAt?: string;
      durationMinutes?: number;
      mode?: InterviewMode;
      locationOrLink?: string;
      notes?: string;
      evaluation?: string;
      status?: InterviewStatus;
      decision?: JobApplicationStatus;
      roundNumber?: number;
    },
  ) {
    this.assertInterviewRole(user);

    const existing = await this.prisma.interview.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Interview not found');
    }

    if (this.access.isInterviewer(user) && existing.interviewerId !== user.sub) {
      throw new ForbiddenException('Interview is not assigned to you');
    }

    if (
      this.access.isManager(user) &&
      existing.branchId !== user.branchId
    ) {
      throw new ForbiddenException('Branch access denied');
    }

    const scheduledAt = input.scheduledAt
      ? new Date(input.scheduledAt)
      : existing.scheduledAt;
    const durationMinutes =
      input.durationMinutes ?? existing.durationMinutes;

    if (
      (input.scheduledAt || input.durationMinutes) &&
      existing.interviewerId &&
      scheduledAt
    ) {
      await this.assertNoConflict(
        existing.interviewerId,
        scheduledAt,
        durationMinutes,
        existing.id,
      );
    }

    const shouldMarkScheduled =
      Boolean(input.scheduledAt || input.mode) &&
      existing.status === InterviewStatus.ASSIGNED;

    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        scheduledAt: scheduledAt ?? undefined,
        durationMinutes,
        mode: input.mode ?? existing.mode,
        locationOrLink: input.locationOrLink ?? existing.locationOrLink,
        notes: input.notes ?? existing.notes,
        evaluation: input.evaluation ?? existing.evaluation,
        roundNumber: input.roundNumber ?? existing.roundNumber,
        status:
          input.status ??
          (shouldMarkScheduled
            ? InterviewStatus.SCHEDULED
            : existing.status),
        updatedBy: user.sub,
      },
      include: this.include(),
    });

    if (shouldMarkScheduled || input.scheduledAt) {
      await this.prisma.jobApplication.update({
        where: { id: existing.applicationId },
        data: {
          interviewStatus: JobApplicationInterviewStatus.INTERVIEW_SCHEDULED,
          ...(shouldMarkScheduled
            ? { status: JobApplicationStatus.INTERVIEW }
            : {}),
        },
      });
    }

    if (
      input.decision === JobApplicationStatus.SELECTED ||
      input.decision === JobApplicationStatus.REJECTED
    ) {
      await this.updateApplicationStatusHandler.execute(
        new UpdateJobApplicationStatusCommand(
          existing.applicationId,
          input.decision as DomainJobApplicationStatus,
          user.sub,
        ),
      );

      if (!input.status) {
        await this.prisma.interview.update({
          where: { id },
          data: { status: InterviewStatus.COMPLETED },
        });
      }
    }

    await this.access.log({
      user,
      action: 'INTERVIEW_UPDATED',
      resourceType: 'Interview',
      resourceId: id,
      metadata: {
        status: input.status,
        decision: input.decision,
      },
    });

    return this.toInterviewDto(updated);
  }

  async listPlacements(user: BranchAuthUser) {
    this.assertInterviewRole(user);

    const where: Prisma.PlacementWhereInput = this.access.isInterviewer(user)
      ? {
          application: {
            interviews: { some: { interviewerId: user.sub } },
          },
        }
      : {
          Student: { branchId: user.branchId },
        };

    const placements = await this.prisma.placement.findMany({
      where,
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
            branchId: true,
          },
        },
        job: { select: { id: true, title: true, companyName: true } },
        application: {
          select: {
            id: true,
            applicationNumber: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return placements.map((item) => ({
      id: item.id,
      status: item.status,
      companyName: item.companyName,
      designation: item.designation,
      salary: item.salary ? Number(item.salary) : null,
      joiningDate: item.joiningDate,
      applicationStatus: item.application.status,
      applicationNumber: item.application.applicationNumber,
      job: item.job,
      student: {
        id: item.Student.id,
        name: [item.Student.firstName, item.Student.lastName]
          .filter(Boolean)
          .join(' '),
        studentCode: item.Student.studentCode,
      },
      createdAt: item.createdAt,
    }));
  }

  async listPlacementActivity(user: BranchAuthUser) {
    this.assertInterviewRole(user);

    const applications = await this.prisma.jobApplication.findMany({
      where: this.access.isInterviewer(user)
        ? {
            isDeleted: false,
            OR: [
              { interviews: { some: { interviewerId: user.sub } } },
              {
                status: {
                  in: [
                    JobApplicationStatus.INTERVIEW,
                    JobApplicationStatus.SELECTED,
                    JobApplicationStatus.REJECTED,
                    JobApplicationStatus.PLACED,
                  ],
                },
              },
            ],
          }
        : {
            isDeleted: false,
            OR: [
              { Student: { branchId: user.branchId } },
              { interviews: { some: { branchId: user.branchId } } },
            ],
          },
      include: {
        job: { select: { title: true, companyName: true } },
        placement: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return applications.map((item) => ({
      id: item.id,
      applicationNumber: item.applicationNumber,
      candidateName: item.applicantName,
      jobTitle: item.job.title,
      companyName: item.job.companyName,
      status: item.status,
      interviewStatus: item.interviews[0]?.status ?? null,
      placementStatus: item.placement?.status ?? null,
      updatedAt: item.updatedAt,
    }));
  }

  private assertInterviewRole(user: BranchAuthUser) {
    if (
      !this.access.isManager(user) &&
      !this.access.isInterviewer(user)
    ) {
      throw new ForbiddenException('Role access denied');
    }
  }

  private async assertInterviewerInBranch(
    interviewerId: string,
    branchId: string,
  ) {
    const interviewer = await this.prisma.branchUser.findFirst({
      where: {
        id: interviewerId,
        branchId,
        isDeleted: false,
        isActive: true,
        role: {
          in: [BranchUserRole.INTERVIEWER, BranchUserRole.BRANCH_MANAGER],
        },
      },
    });

    if (!interviewer) {
      throw new BadRequestException(
        'Interviewer must belong to this branch',
      );
    }
  }

  private async assertNoConflict(
    interviewerId: string,
    scheduledAt: Date,
    durationMinutes: number,
    excludeId?: string,
  ) {
    const start = scheduledAt;
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const overlapping = await this.prisma.interview.findFirst({
      where: {
        interviewerId,
        status: InterviewStatus.SCHEDULED,
        id: excludeId ? { not: excludeId } : undefined,
        scheduledAt: {
          not: null,
          lt: end,
        },
      },
    });

    if (overlapping?.scheduledAt) {
      const overlappingEnd = new Date(
        overlapping.scheduledAt.getTime() +
          overlapping.durationMinutes * 60000,
      );

      if (overlappingEnd > start) {
        throw new BaseException(
          ERROR_CODES.INTERVIEW_CONFLICT,
          'This interviewer already has an overlapping interview',
          409,
        );
      }
    }
  }

  private include() {
    return {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          applicantName: true,
          applicantEmail: true,
          status: true,
        },
      },
      job: { select: { id: true, title: true, companyName: true } },
      interviewer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      branch: {
        select: { id: true, branchName: true, branchCode: true },
      },
    } as const;
  }

  private toInterviewDto(item: {
    id: string;
    applicationId: string;
    jobId: string;
    scheduledAt: Date | null;
    durationMinutes: number;
    mode: InterviewMode | null;
    locationOrLink: string | null;
    notes: string | null;
    evaluation: string | null;
    status: InterviewStatus;
    roundNumber?: number;
    branchId?: string;
    interviewerId?: string | null;
    application?: {
      id: string;
      applicationNumber: string;
      applicantName: string | null;
      applicantEmail?: string | null;
      status: JobApplicationStatus;
    };
    job?: { id: string; title: string; companyName: string };
    interviewer?: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
    } | null;
    branch?: {
      id: string;
      branchName: string;
      branchCode: string;
    } | null;
  }) {
    return {
      id: item.id,
      applicationId: item.applicationId,
      jobId: item.jobId,
      branchId: item.branchId,
      interviewerId: item.interviewerId,
      scheduledAt: item.scheduledAt,
      durationMinutes: item.durationMinutes,
      mode: item.mode,
      locationOrLink: item.locationOrLink,
      notes: item.notes,
      evaluation: item.evaluation,
      roundNumber: item.roundNumber ?? 1,
      status: item.status,
      application: item.application
        ? {
            id: item.application.id,
            applicationNumber: item.application.applicationNumber,
            candidateName: item.application.applicantName,
            status: item.application.status,
          }
        : undefined,
      job: item.job,
      interviewer: item.interviewer
        ? {
            id: item.interviewer.id,
            name: [item.interviewer.firstName, item.interviewer.lastName]
              .filter(Boolean)
              .join(' '),
            email: item.interviewer.email,
          }
        : null,
      branch: item.branch ?? null,
    };
  }
}
