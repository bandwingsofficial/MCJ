import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InterviewStatus } from '@prisma/client';

import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { JobApplicationStatus as DomainJobApplicationStatus } from '../../domain/enums/job-application-status.enum';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { AssignInterviewCommand } from './assign-interview.command';

const interviewInclude = {
  branch: {
    select: { id: true, branchName: true, branchCode: true },
  },
  interviewer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
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

    if (
      application.status !== DomainJobApplicationStatus.SHORTLISTED &&
      !(
        application.status === DomainJobApplicationStatus.SELECTED &&
        application.interviewStatus === 'NOT_YET'
      )
    ) {
      throw new BadRequestException(
        'Only shortlisted applications can be assigned an interviewer',
      );
    }

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

    const interviewer = await this.prisma.branchUser.findFirst({
      where: {
        id: command.interviewerId,
        branchId: command.branchId,
        isDeleted: false,
        isActive: true,
        role: BranchUserRole.INTERVIEWER,
      },
    });

    if (!interviewer) {
      throw new BadRequestException(
        'Selected interviewer must be an active interviewer on the selected branch',
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
      interviewer: interview.interviewer,
      job: interview.job,
      application: interview.application,
    };
  }
}
