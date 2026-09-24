import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InterviewStatus } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { AssignInterviewCommand } from './assign-interview.command';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import {
  countEligibleInterviewersForBranch,
  findBranchUserForInterviewerValidation,
  findEligibleInterviewerForBranch,
  INTERVIEWER_ROLE_REQUIRED_MESSAGE,
} from './assign-interview-interviewer.util';
import { assertCanManageBranchInterviewerAssignment } from './job-application-branch-assignment.util';
import {
  jobApplicationInterviewerSelect,
  mapInterviewerDisplayName,
} from '../../infrastructure/mappers/map-interviewer-display.util';

const interviewInclude = {
  branch: {
    select: { id: true, branchName: true, branchCode: true },
  },
  interviewer: {
    select: jobApplicationInterviewerSelect,
  },
  job: {
    select: {
      id: true,
      title: true,
      companyName: true,
      jobNumber: true,
    },
  },
  application: {
    select: {
      id: true,
      applicationNumber: true,
      applicantName: true,
      status: true,
    },
  },
} as const;

@Injectable()
export class AssignInterviewHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applicationRepo: JobApplicationRepository,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(command: AssignInterviewCommand) {
    const application = this.domainService.ensureExists(
      await this.applicationRepo.findById(command.applicationId),
    );
    this.domainService.ensureNotDeleted(application);

    assertCanManageBranchInterviewerAssignment({
      status: application.status,
      interviewStatus: application.interviewStatus,
    });

    const branch = await this.prisma.branch.findFirst({
      where: {
        id: command.branchId,
        deletedAt: null,
        status: 'ACTIVE',
      },
    });

    if (!branch) {
      throw new BadRequestException('Selected branch is not available');
    }

    const eligibleCount = await countEligibleInterviewersForBranch(
      this.prisma,
      command.branchId,
    );

    if (eligibleCount === 0) {
      throw new BadRequestException(
        'No interviewer with the INTERVIEWER role is available for this branch.',
      );
    }

    const interviewer = await findEligibleInterviewerForBranch(
      this.prisma,
      command.branchId,
      command.interviewerId,
    );

    if (!interviewer) {
      const selected = await findBranchUserForInterviewerValidation(
        this.prisma,
        command.branchId,
        command.interviewerId,
      );

      if (selected && selected.role !== BranchUserRole.INTERVIEWER) {
        throw new BadRequestException(INTERVIEWER_ROLE_REQUIRED_MESSAGE);
      }

      throw new BadRequestException(
        'Selected interviewer must be an active branch user with the INTERVIEWER role.',
      );
    }

    const existingActive = await this.prisma.interview.findFirst({
      where: {
        applicationId: application.id,
        status: {
          in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const interview = existingActive
      ? await this.prisma.interview.update({
          where: { id: existingActive.id },
          data: {
            interviewerId: command.interviewerId,
            branchId: command.branchId,
            // Reassignment is Branch + Interviewer only; branch re-schedules.
            scheduledAt: null,
            mode: null,
            locationOrLink: null,
            notes: null,
            roundNumber: 1,
            status: InterviewStatus.ASSIGNED,
            updatedBy: command.assignedBy ?? null,
          },
          include: interviewInclude,
        })
      : await this.prisma.interview.create({
          data: {
            applicationId: application.id,
            jobId: application.jobId,
            interviewerId: command.interviewerId,
            branchId: command.branchId,
            scheduledAt: null,
            mode: null,
            locationOrLink: null,
            notes: null,
            roundNumber: 1,
            status: InterviewStatus.ASSIGNED,
            createdBy: command.assignedBy ?? null,
            updatedBy: command.assignedBy ?? null,
          },
          include: interviewInclude,
        });

    return {
      id: interview.id,
      applicationId: interview.applicationId,
      jobId: interview.jobId,
      branchId: interview.branchId,
      interviewerId: interview.interviewerId,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      mode: interview.mode,
      locationOrLink: interview.locationOrLink,
      notes: interview.notes,
      roundNumber: interview.roundNumber,
      status: interview.status,
      branch: interview.branch,
      interviewer: mapInterviewerDisplayName(interview.interviewer),
      job: interview.job,
      application: interview.application,
    };
  }
}
