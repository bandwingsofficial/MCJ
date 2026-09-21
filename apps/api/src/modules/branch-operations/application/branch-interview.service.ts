import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InterviewMode,
  InterviewResult,
  InterviewRoundStatus,
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
            orderBy: [
              { roundNumber: 'desc' },
              { createdAt: 'desc' },
            ],
            take: 20,
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
      const latest = this.pickLatestInterview(record.interviews);
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
              roundId: latest.roundId,
              nextRoundId: latest.nextRoundId,
              roundNumber: latest.roundNumber,
              result: latest.result,
              status: latest.status,
              notes: latest.notes,
              interviewer: latest.interviewer,
              branch: latest.branch,
              round: latest.round
                ? {
                    id: latest.round.id,
                    name: latest.round.name,
                    sortOrder: latest.round.sortOrder,
                  }
                : null,
              nextRound: latest.nextRound
                ? {
                    id: latest.nextRound.id,
                    name: latest.nextRound.name,
                    sortOrder: latest.nextRound.sortOrder,
                  }
                : null,
            }
          : null,
        interviewScheduleStatus: latest?.status ?? null,
        interviewScheduledAt: latest?.scheduledAt ?? null,
      };

      return detail;
    });

    return { items, total, jobOptions };
  }

  /**
   * Latest/current interview for list display:
   * open SCHEDULED → open ASSIGNED → latest COMPLETED → newest remaining.
   */
  private pickLatestInterview<
    T extends {
      status: InterviewStatus;
      scheduledAt: Date | null;
      createdAt: Date;
      roundNumber: number;
    },
  >(interviews: T[]): T | null {
    if (!interviews.length) {
      return null;
    }

    const scheduleGuard = Date.parse('1970-01-02T00:00:00.000Z');

    const scheduled = interviews
      .filter(
        (item) =>
          item.status === InterviewStatus.SCHEDULED &&
          item.scheduledAt &&
          item.scheduledAt.getTime() > scheduleGuard,
      )
      .sort(
        (a, b) =>
          b.roundNumber - a.roundNumber ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];
    if (scheduled) {
      return scheduled;
    }

    const assigned = interviews
      .filter((item) => item.status === InterviewStatus.ASSIGNED)
      .sort(
        (a, b) =>
          b.roundNumber - a.roundNumber ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];
    if (assigned) {
      return assigned;
    }

    const completed = interviews
      .filter((item) => item.status === InterviewStatus.COMPLETED)
      .sort(
        (a, b) =>
          b.roundNumber - a.roundNumber ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];
    if (completed) {
      return completed;
    }

    return (
      [...interviews].sort(
        (a, b) =>
          b.roundNumber - a.roundNumber ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      )[0] ?? null
    );
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
      orderBy: [
        { round: { sortOrder: 'asc' } },
        { roundNumber: 'asc' },
        { createdAt: 'asc' },
      ],
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

    const roundProgress = await this.getApplicationRoundProgress(id);

    return {
      ...application,
      resume,
      roundProgress,
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
    query: {
      tab?: 'UPCOMING' | 'TODAY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      status?: InterviewStatus;
      search?: string;
      interviewerId?: string;
      mode?: InterviewMode;
      roundId?: string;
      roundNumber?: number;
      from?: string;
      to?: string;
      skip?: number;
      take?: number;
    },
  ) {
    this.assertInterviewRole(user);

    const skip = query.skip ?? 0;
    const take = query.take ?? 20;

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const scope: Prisma.InterviewWhereInput = this.access.isInterviewer(user)
      ? { interviewerId: user.sub, branchId: user.branchId }
      : { branchId: user.branchId };

    // Only real schedules — never ASSIGNED / null / epoch placeholders.
    const scheduledBase: Prisma.InterviewWhereInput = {
      ...scope,
      scheduledAt: { not: null, gt: new Date('1970-01-02T00:00:00.000Z') },
      status: {
        in: [
          InterviewStatus.SCHEDULED,
          InterviewStatus.COMPLETED,
          InterviewStatus.CANCELLED,
          InterviewStatus.NO_SHOW,
        ],
      },
    };

    const latestIds = await this.latestInterviewIdsForScope(scope);
    const latestIdFilter: Prisma.InterviewWhereInput =
      latestIds.length > 0 ? { id: { in: latestIds } } : { id: { in: [] } };

    const inProgressResults: InterviewResult[] = [
      InterviewResult.SELECTED_FOR_NEXT_ROUND,
      InterviewResult.ON_HOLD,
      InterviewResult.NEED_FURTHER_REVIEW,
      InterviewResult.PENDING,
    ];
    const finalResults: InterviewResult[] = [
      InterviewResult.REJECTED,
      InterviewResult.PLACED,
    ];

    const tabWhere = (
      tab: typeof query.tab,
    ): Prisma.InterviewWhereInput => {
      if (tab === 'UPCOMING') {
        return {
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: startOfTomorrow },
        };
      }
      if (tab === 'TODAY') {
        return {
          status: InterviewStatus.SCHEDULED,
          scheduledAt: { gte: startOfToday, lt: startOfTomorrow },
        };
      }
      if (tab === 'IN_PROGRESS') {
        // Latest interview only — intermediate results still need action.
        return {
          AND: [
            latestIdFilter,
            {
              OR: [
                {
                  status: InterviewStatus.COMPLETED,
                  result: { in: inProgressResults },
                },
                {
                  status: InterviewStatus.SCHEDULED,
                  scheduledAt: { lt: startOfToday },
                },
              ],
            },
          ],
        };
      }
      if (tab === 'COMPLETED') {
        // Final outcomes only (Rejected / Placed / No Show) on the latest interview.
        return {
          AND: [
            latestIdFilter,
            {
              OR: [
                {
                  status: InterviewStatus.COMPLETED,
                  result: { in: finalResults },
                },
                { status: InterviewStatus.NO_SHOW },
              ],
            },
          ],
        };
      }
      if (tab === 'CANCELLED') {
        return { status: InterviewStatus.CANCELLED };
      }
      return {};
    };

    const andClauses: Prisma.InterviewWhereInput[] = [tabWhere(query.tab)];
    if (query.status) {
      andClauses.push({ status: query.status });
    }
    if (query.from || query.to) {
      andClauses.push({
        scheduledAt: {
          ...(query.from
            ? { gte: new Date(`${query.from}T00:00:00.000Z`) }
            : {}),
          ...(query.to
            ? { lte: new Date(`${query.to}T23:59:59.999Z`) }
            : {}),
        },
      });
    }

    const roundFilter: Prisma.InterviewWhereInput = query.roundId
      ? { roundId: query.roundId }
      : query.roundNumber
        ? { roundNumber: query.roundNumber }
        : {};

    const where: Prisma.InterviewWhereInput = {
      ...scheduledBase,
      ...roundFilter,
      ...(query.interviewerId ? { interviewerId: query.interviewerId } : {}),
      ...(query.mode ? { mode: query.mode } : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              {
                application: {
                  applicantName: {
                    contains: query.search.trim(),
                    mode: 'insensitive',
                  },
                },
              },
              {
                application: {
                  applicationNumber: {
                    contains: query.search.trim(),
                    mode: 'insensitive',
                  },
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
      AND: andClauses,
    };

    const countBase = scheduledBase;
    const orderDesc =
      query.tab === 'COMPLETED' || query.tab === 'IN_PROGRESS';

    const [
      records,
      total,
      upcoming,
      today,
      inProgress,
      completed,
      cancelled,
      interviewers,
      activeRounds,
      usedRoundIds,
    ] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: this.include(),
        orderBy: { scheduledAt: orderDesc ? 'desc' : 'asc' },
        skip,
        take,
      }),
      this.prisma.interview.count({ where }),
      this.prisma.interview.count({
        where: { AND: [countBase, tabWhere('UPCOMING')] },
      }),
      this.prisma.interview.count({
        where: { AND: [countBase, tabWhere('TODAY')] },
      }),
      this.prisma.interview.count({
        where: { AND: [countBase, tabWhere('IN_PROGRESS')] },
      }),
      this.prisma.interview.count({
        where: { AND: [countBase, tabWhere('COMPLETED')] },
      }),
      this.prisma.interview.count({
        where: { AND: [countBase, tabWhere('CANCELLED')] },
      }),
      this.prisma.branchUser.findMany({
        where: {
          branchId: user.branchId,
          isDeleted: false,
          isActive: true,
          role: BranchUserRole.INTERVIEWER,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
        orderBy: { firstName: 'asc' },
        take: 200,
      }),
      this.prisma.interviewRound.findMany({
        where: { status: InterviewRoundStatus.ACTIVE },
        select: { id: true, name: true, sortOrder: true, status: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.interview.findMany({
        where: {
          ...scope,
          roundId: { not: null },
        },
        select: { roundId: true },
        distinct: ['roundId'],
      }),
    ]);

    const usedIds = usedRoundIds
      .map((row) => row.roundId)
      .filter((id): id is string => Boolean(id));

    const inactiveUsed =
      usedIds.length > 0
        ? await this.prisma.interviewRound.findMany({
            where: {
              id: { in: usedIds },
              status: InterviewRoundStatus.INACTIVE,
            },
            select: { id: true, name: true, sortOrder: true, status: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          })
        : [];

    const roundOptionsMap = new Map<
      string,
      { id: string; name: string; sortOrder: number; status: InterviewRoundStatus }
    >();
    for (const round of [...activeRounds, ...inactiveUsed]) {
      roundOptionsMap.set(round.id, round);
    }
    const roundOptions = Array.from(roundOptionsMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );

    const allScheduledTotal = await this.prisma.interview.count({
      where: countBase,
    });

    return {
      items: records
        .filter((item) => item.scheduledAt != null)
        .map((item) => this.toInterviewDto(item)),
      total,
      counts: {
        total: allScheduledTotal,
        upcoming,
        today,
        inProgress,
        completed,
        cancelled,
      },
      interviewerOptions: interviewers.map((person) => ({
        id: person.id,
        name: [person.firstName, person.lastName].filter(Boolean).join(' '),
        email: person.email,
      })),
      roundOptions,
    };
  }

  /**
   * Latest interview id per application (by roundNumber, then createdAt).
   * Used so multi-round history does not put older SELECTED_FOR_NEXT_ROUND
   * rows into In Progress after a later Rejected/Placed/Scheduled round exists.
   */
  private async latestInterviewIdsForScope(
    scope: Prisma.InterviewWhereInput,
  ): Promise<string[]> {
    const rows = await this.prisma.interview.findMany({
      where: {
        ...scope,
        status: {
          in: [
            InterviewStatus.ASSIGNED,
            InterviewStatus.SCHEDULED,
            InterviewStatus.COMPLETED,
            InterviewStatus.NO_SHOW,
          ],
        },
      },
      select: {
        id: true,
        applicationId: true,
        roundNumber: true,
        createdAt: true,
      },
      orderBy: [
        { applicationId: 'asc' },
        { roundNumber: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const latestByApplication = new Map<string, string>();
    for (const row of rows) {
      if (!latestByApplication.has(row.applicationId)) {
        latestByApplication.set(row.applicationId, row.id);
      }
    }
    return Array.from(latestByApplication.values());
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
      roundId?: string;
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

    const baseScope: Prisma.InterviewWhereInput =
      this.access.isInterviewer(user)
        ? {
            applicationId: application.id,
            interviewerId: user.sub,
            branchId: user.branchId,
          }
        : {
            applicationId: application.id,
            branchId: user.branchId,
          };

    // Prefer ASSIGNED (incl. next-round row) over SCHEDULED; never overwrite COMPLETED.
    let existingAssignment = await this.prisma.interview.findFirst({
      where: {
        ...baseScope,
        status: InterviewStatus.ASSIGNED,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingAssignment) {
      existingAssignment = await this.prisma.interview.findFirst({
        where: {
          ...baseScope,
          status: InterviewStatus.SCHEDULED,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // After a completed round with a selected nextRoundId, create the next interview
    // record when scheduling (same JobApplication — do not overwrite history).
    if (!existingAssignment) {
      const completedWithNext = await this.prisma.interview.findFirst({
        where: {
          ...baseScope,
          status: InterviewStatus.COMPLETED,
          result: InterviewResult.SELECTED_FOR_NEXT_ROUND,
          nextRoundId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (completedWithNext?.nextRoundId) {
        const targetRoundId = input.roundId ?? completedWithNext.nextRoundId;
        const targetRound = await this.prisma.interviewRound.findUnique({
          where: { id: targetRoundId },
        });

        if (!targetRound) {
          throw new NotFoundException('Interview round not found');
        }

        if (
          targetRound.status !== InterviewRoundStatus.ACTIVE &&
          targetRoundId !== completedWithNext.nextRoundId
        ) {
          throw new BadRequestException('Interview round is not active');
        }

        const interviewerId =
          completedWithNext.interviewerId ??
          (this.access.isInterviewer(user)
            ? user.sub
            : input.interviewerId ?? user.sub);

        if (!interviewerId) {
          throw new BadRequestException('Interviewer is required');
        }

        await this.assertInterviewerInBranch(interviewerId, user.branchId);

        existingAssignment = await this.prisma.interview.create({
          data: {
            applicationId: application.id,
            jobId: application.jobId,
            branchId: user.branchId,
            interviewerId,
            roundId: targetRound.id,
            roundNumber: targetRound.sortOrder,
            status: InterviewStatus.ASSIGNED,
            result: InterviewResult.PENDING,
            createdBy: user.sub,
            updatedBy: user.sub,
          },
        });
      }
    }

    if (!existingAssignment) {
      throw new ForbiddenException(
        'Application is not assigned to your branch',
      );
    }

    const roundId =
      input.roundId ??
      existingAssignment.roundId ??
      undefined;
    if (!roundId) {
      throw new BadRequestException(
        'Interview round is required. Select a round or create one first.',
      );
    }

    const round = await this.prisma.interviewRound.findUnique({
      where: { id: roundId },
    });

    if (!round) {
      throw new NotFoundException('Interview round not found');
    }

    if (
      round.status !== InterviewRoundStatus.ACTIVE &&
      existingAssignment.roundId !== round.id
    ) {
      throw new BadRequestException('Interview round is not active');
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
    const roundNumber = round.sortOrder;

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
        roundId: round.id,
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
      metadata: {
        applicationId: application.id,
        scheduledAt,
        roundId: round.id,
      },
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
      roundId?: string;
      result?: InterviewResult;
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

    let roundId = existing.roundId;
    let roundNumber = input.roundNumber ?? existing.roundNumber;

    if (input.roundId) {
      const round = await this.prisma.interviewRound.findUnique({
        where: { id: input.roundId },
      });
      if (!round) {
        throw new NotFoundException('Interview round not found');
      }
      roundId = round.id;
      roundNumber = round.sortOrder;
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
        roundId,
        roundNumber,
        result: input.result ?? existing.result,
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
        result: input.result,
      },
    });

    return this.toInterviewDto(updated);
  }

  async completeInterview(
    user: BranchAuthUser,
    id: string,
    input: {
      result: InterviewResult;
      nextRoundId?: string;
      evaluation?: string;
      notes?: string;
      scheduleNext?: {
        scheduledAt: string;
        mode: InterviewMode;
        locationOrLink: string;
        interviewerId: string;
        durationMinutes?: number;
        notes?: string;
      };
      /** @deprecated flat fields — prefer scheduleNext */
      nextScheduledAt?: string;
      nextMode?: InterviewMode;
      nextLocationOrLink?: string;
      nextInterviewerId?: string;
      nextDurationMinutes?: number;
      nextNotes?: string;
    },
  ) {
    this.assertInterviewRole(user);

    if (input.result === InterviewResult.PENDING) {
      throw new BadRequestException(
        'Completion requires a decisive interview result',
      );
    }

    const existing = await this.prisma.interview.findFirst({
      where: { id },
      include: this.include(),
    });

    if (!existing) {
      throw new NotFoundException('Interview not found');
    }

    if (this.access.isInterviewer(user) && existing.interviewerId !== user.sub) {
      throw new ForbiddenException('Interview is not assigned to you');
    }

    if (this.access.isManager(user) && existing.branchId !== user.branchId) {
      throw new ForbiddenException('Branch access denied');
    }

    if (
      existing.status !== InterviewStatus.SCHEDULED &&
      existing.status !== InterviewStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Only scheduled interviews can be completed',
      );
    }

    const scheduleNext =
      input.result === InterviewResult.SELECTED_FOR_NEXT_ROUND;

    const nextSchedule = input.scheduleNext
      ? {
          scheduledAt: input.scheduleNext.scheduledAt,
          mode: input.scheduleNext.mode,
          locationOrLink: input.scheduleNext.locationOrLink,
          interviewerId: input.scheduleNext.interviewerId,
          durationMinutes: input.scheduleNext.durationMinutes,
          notes: input.scheduleNext.notes,
        }
      : input.nextScheduledAt
        ? {
            scheduledAt: input.nextScheduledAt,
            mode: input.nextMode!,
            locationOrLink: input.nextLocationOrLink ?? '',
            interviewerId: input.nextInterviewerId!,
            durationMinutes: input.nextDurationMinutes,
            notes: input.nextNotes,
          }
        : null;

    if (scheduleNext) {
      if (!input.nextRoundId) {
        throw new BadRequestException(
          'Next round is required when selecting for next round',
        );
      }
      if (!nextSchedule?.scheduledAt) {
        throw new BadRequestException(
          'Next interview date/time is required when selecting for next round',
        );
      }
      if (!nextSchedule.mode) {
        throw new BadRequestException(
          'Next interview mode is required when selecting for next round',
        );
      }
      if (!nextSchedule.interviewerId) {
        throw new BadRequestException(
          'Next interviewer is required when selecting for next round',
        );
      }
    }

    let nextRound: {
      id: string;
      name: string;
      sortOrder: number;
      status: InterviewRoundStatus;
    } | null = null;
    let nextScheduledAt: Date | null = null;
    let nextLocationOrLink: string | null = null;
    let nextInterviewerId: string | null = null;
    let nextDurationMinutes = 60;
    let nextMode: InterviewMode | null = null;
    let nextNotes: string | null = null;

    if (scheduleNext && nextSchedule) {
      if (input.nextRoundId === existing.roundId) {
        throw new BadRequestException(
          'Next round must be different from the current round',
        );
      }

      nextRound = await this.prisma.interviewRound.findUnique({
        where: { id: input.nextRoundId },
      });

      if (!nextRound) {
        throw new NotFoundException('Next interview round not found');
      }

      if (nextRound.status !== InterviewRoundStatus.ACTIVE) {
        throw new BadRequestException('Next interview round is not active');
      }

      nextScheduledAt = new Date(nextSchedule.scheduledAt);
      if (Number.isNaN(nextScheduledAt.getTime())) {
        throw new BadRequestException('Invalid next interview date');
      }

      nextMode = nextSchedule.mode;
      nextLocationOrLink = nextSchedule.locationOrLink?.trim() || null;
      if (
        (nextMode === InterviewMode.ONLINE ||
          nextMode === InterviewMode.OFFLINE) &&
        !nextLocationOrLink
      ) {
        throw new BadRequestException(
          nextMode === InterviewMode.ONLINE
            ? 'Meeting link is required for online interviews'
            : 'Venue is required for offline interviews',
        );
      }

      nextInterviewerId = nextSchedule.interviewerId;
      await this.assertInterviewerInBranch(nextInterviewerId, user.branchId);

      nextDurationMinutes =
        nextSchedule.durationMinutes ?? existing.durationMinutes ?? 60;
      nextNotes = nextSchedule.notes?.trim() || null;

      await this.assertNoConflict(
        nextInterviewerId,
        nextScheduledAt,
        nextDurationMinutes,
      );
    }

    const outcome = await this.prisma.$transaction(async (tx) => {
      if (
        existing.status === InterviewStatus.COMPLETED &&
        scheduleNext &&
        existing.result === InterviewResult.SELECTED_FOR_NEXT_ROUND &&
        existing.nextRoundId === nextRound!.id
      ) {
        const alreadyNext = await tx.interview.findFirst({
          where: {
            applicationId: existing.applicationId,
            branchId: user.branchId,
            roundId: nextRound!.id,
            status: {
              in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
            },
          },
          orderBy: { createdAt: 'desc' },
          include: this.include(),
        });

        if (alreadyNext) {
          const updatedNext = await tx.interview.update({
            where: { id: alreadyNext.id },
            data: {
              interviewerId: nextInterviewerId!,
              scheduledAt: nextScheduledAt!,
              durationMinutes: nextDurationMinutes,
              mode: nextMode!,
              locationOrLink: nextLocationOrLink,
              notes: nextNotes || alreadyNext.notes,
              status: InterviewStatus.SCHEDULED,
              result: InterviewResult.PENDING,
              updatedBy: user.sub,
            },
            include: this.include(),
          });

          await tx.jobApplication.update({
            where: { id: existing.applicationId },
            data: {
              interviewStatus:
                JobApplicationInterviewStatus.INTERVIEW_SCHEDULED,
              status: JobApplicationStatus.INTERVIEW,
            },
          });

          const completed = await tx.interview.findFirst({
            where: { id },
            include: this.include(),
          });

          return { completed: completed!, next: updatedNext };
        }
      }

      const completed = await tx.interview.update({
        where: { id },
        data: {
          status: InterviewStatus.COMPLETED,
          result: input.result,
          nextRoundId: scheduleNext ? nextRound!.id : null,
          evaluation: input.evaluation?.trim() || existing.evaluation,
          notes: input.notes?.trim() || existing.notes,
          updatedBy: user.sub,
        },
        include: this.include(),
      });

      if (input.result === InterviewResult.REJECTED) {
        await tx.jobApplication.update({
          where: { id: existing.applicationId },
          data: {
            interviewStatus: JobApplicationInterviewStatus.REJECTED,
          },
        });
        return { completed, next: null };
      }

      if (input.result === InterviewResult.PLACED) {
        await tx.jobApplication.update({
          where: { id: existing.applicationId },
          data: {
            interviewStatus: JobApplicationInterviewStatus.PLACED,
            status: JobApplicationStatus.PLACED,
          },
        });
        return { completed, next: null };
      }

      if (!scheduleNext) {
        await tx.jobApplication.update({
          where: { id: existing.applicationId },
          data: {
            interviewStatus: JobApplicationInterviewStatus.INTERVIEWED,
          },
        });
        return { completed, next: null };
      }

      const existingNext = await tx.interview.findFirst({
        where: {
          applicationId: existing.applicationId,
          branchId: user.branchId,
          roundId: nextRound!.id,
          status: {
            in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const next = existingNext
        ? await tx.interview.update({
            where: { id: existingNext.id },
            data: {
              interviewerId: nextInterviewerId!,
              scheduledAt: nextScheduledAt!,
              durationMinutes: nextDurationMinutes,
              mode: nextMode!,
              locationOrLink: nextLocationOrLink,
              notes: nextNotes || existingNext.notes,
              roundId: nextRound!.id,
              roundNumber: nextRound!.sortOrder,
              status: InterviewStatus.SCHEDULED,
              result: InterviewResult.PENDING,
              updatedBy: user.sub,
            },
            include: this.include(),
          })
        : await tx.interview.create({
            data: {
              applicationId: existing.applicationId,
              jobId: existing.jobId,
              branchId: user.branchId,
              interviewerId: nextInterviewerId!,
              roundId: nextRound!.id,
              roundNumber: nextRound!.sortOrder,
              scheduledAt: nextScheduledAt!,
              durationMinutes: nextDurationMinutes,
              mode: nextMode!,
              locationOrLink: nextLocationOrLink,
              notes: nextNotes,
              status: InterviewStatus.SCHEDULED,
              result: InterviewResult.PENDING,
              createdBy: user.sub,
              updatedBy: user.sub,
            },
            include: this.include(),
          });

      await tx.jobApplication.update({
        where: { id: existing.applicationId },
        data: {
          interviewStatus: JobApplicationInterviewStatus.INTERVIEW_SCHEDULED,
          status: JobApplicationStatus.INTERVIEW,
        },
      });

      return { completed, next };
    });

    await this.access.log({
      user,
      action: scheduleNext
        ? 'INTERVIEW_COMPLETED_AND_NEXT_SCHEDULED'
        : 'INTERVIEW_COMPLETED',
      resourceType: 'Interview',
      resourceId: id,
      metadata: {
        applicationId: existing.applicationId,
        result: input.result,
        nextRoundId: scheduleNext ? nextRound!.id : null,
        nextInterviewId: outcome.next?.id ?? null,
      },
    });

    return {
      ...this.toInterviewDto(outcome.completed),
      nextInterview: outcome.next
        ? this.toInterviewDto(outcome.next)
        : null,
    };
  }

  async createNextRound(
    user: BranchAuthUser,
    input: {
      applicationId: string;
      roundId: string;
      interviewerId?: string;
    },
  ) {
    this.assertInterviewRole(user);

    const application = await this.prisma.jobApplication.findFirst({
      where: { id: input.applicationId, isDeleted: false },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const branchScope: Prisma.InterviewWhereInput =
      this.access.isInterviewer(user)
        ? {
            applicationId: application.id,
            branchId: user.branchId,
            interviewerId: user.sub,
          }
        : {
            applicationId: application.id,
            branchId: user.branchId,
          };

    const previous = await this.prisma.interview.findFirst({
      where: {
        ...branchScope,
        status: InterviewStatus.COMPLETED,
        result: InterviewResult.SELECTED_FOR_NEXT_ROUND,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (!previous) {
      throw new BadRequestException(
        'Previous interview must be completed with SELECTED_FOR_NEXT_ROUND before assigning the next round',
      );
    }

    const round = await this.prisma.interviewRound.findUnique({
      where: { id: input.roundId },
    });

    if (!round) {
      throw new NotFoundException('Interview round not found');
    }

    if (round.status !== InterviewRoundStatus.ACTIVE) {
      throw new BadRequestException('Interview round is not active');
    }

    if (previous.roundId === round.id) {
      throw new BadRequestException(
        'Next round must be different from the completed round',
      );
    }

    const existingOpen = await this.prisma.interview.findFirst({
      where: {
        applicationId: application.id,
        branchId: user.branchId,
        roundId: round.id,
        status: {
          in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
        },
      },
    });

    if (existingOpen) {
      throw new BadRequestException(
        'An open interview already exists for this round',
      );
    }

    const interviewerId =
      input.interviewerId ??
      previous.interviewerId ??
      (this.access.isInterviewer(user) ? user.sub : undefined);

    if (!interviewerId) {
      throw new BadRequestException('Interviewer is required');
    }

    await this.assertInterviewerInBranch(interviewerId, user.branchId);

    const created = await this.prisma.interview.create({
      data: {
        applicationId: application.id,
        jobId: previous.jobId,
        branchId: user.branchId,
        interviewerId,
        roundId: round.id,
        roundNumber: round.sortOrder,
        status: InterviewStatus.ASSIGNED,
        result: InterviewResult.PENDING,
        durationMinutes: previous.durationMinutes || 60,
        createdBy: user.sub,
        updatedBy: user.sub,
      },
      include: this.include(),
    });

    await this.prisma.jobApplication.update({
      where: { id: application.id },
      data: {
        status: JobApplicationStatus.INTERVIEW,
      },
    });

    await this.access.log({
      user,
      action: 'INTERVIEW_NEXT_ROUND_ASSIGNED',
      resourceType: 'Interview',
      resourceId: created.id,
      metadata: {
        applicationId: application.id,
        roundId: round.id,
        previousInterviewId: previous.id,
      },
    });

    return this.toInterviewDto(created);
  }

  async getApplicationRoundProgress(applicationId: string) {
    const interviews = await this.prisma.interview.findMany({
      where: { applicationId },
      include: {
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
      orderBy: [
        { round: { sortOrder: 'asc' } },
        { roundNumber: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const history = interviews.map((item) => ({
      interviewId: item.id,
      roundId: item.roundId,
      nextRoundId: item.nextRoundId,
      roundNumber: item.roundNumber,
      status: item.status,
      result: item.result,
      evaluation: item.evaluation,
      scheduledAt: item.scheduledAt,
      round: item.round
        ? {
            id: item.round.id,
            name: item.round.name,
            sortOrder: item.round.sortOrder,
          }
        : null,
      nextRound: item.nextRound
        ? {
            id: item.nextRound.id,
            name: item.nextRound.name,
            sortOrder: item.nextRound.sortOrder,
          }
        : null,
    }));

    const openInterview =
      interviews
        .filter(
          (item) =>
            item.status === InterviewStatus.ASSIGNED ||
            item.status === InterviewStatus.SCHEDULED,
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
      null;

    const latestCompleted =
      interviews
        .filter((item) => item.status === InterviewStatus.COMPLETED)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
      null;

    const currentRound =
      openInterview?.round ??
      (openInterview ? null : latestCompleted?.round ?? null);

    // Prefer explicitly persisted nextRoundId over sortOrder inference.
    const nextRound =
      openInterview?.nextRound ??
      (latestCompleted?.result === InterviewResult.SELECTED_FOR_NEXT_ROUND
        ? latestCompleted.nextRound
        : null);

    return {
      currentRound: currentRound
        ? {
            id: currentRound.id,
            name: currentRound.name,
            sortOrder: currentRound.sortOrder,
          }
        : null,
      nextRound: nextRound
        ? {
            id: nextRound.id,
            name: nextRound.name,
            sortOrder: nextRound.sortOrder,
          }
        : null,
      history,
    };
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
    result?: InterviewResult;
    roundId?: string | null;
    nextRoundId?: string | null;
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
    round?: {
      id: string;
      name: string;
      sortOrder: number;
      status?: InterviewRoundStatus;
    } | null;
    nextRound?: {
      id: string;
      name: string;
      sortOrder: number;
      status?: InterviewRoundStatus;
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
      roundId: item.roundId ?? null,
      nextRoundId: item.nextRoundId ?? null,
      roundNumber: item.roundNumber ?? 1,
      result: item.result ?? InterviewResult.PENDING,
      status: item.status,
      round: item.round
        ? {
            id: item.round.id,
            name: item.round.name,
            sortOrder: item.round.sortOrder,
          }
        : null,
      nextRound: item.nextRound
        ? {
            id: item.nextRound.id,
            name: item.nextRound.name,
            sortOrder: item.nextRound.sortOrder,
          }
        : null,
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
