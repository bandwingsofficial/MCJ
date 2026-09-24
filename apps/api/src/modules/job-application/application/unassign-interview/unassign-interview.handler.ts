import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InterviewStatus } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { assertCanManageBranchInterviewerAssignment } from '../assign-interview/job-application-branch-assignment.util';
import { UnassignInterviewCommand } from './unassign-interview.command';

@Injectable()
export class UnassignInterviewHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applicationRepo: JobApplicationRepository,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(command: UnassignInterviewCommand) {
    const application = this.domainService.ensureExists(
      await this.applicationRepo.findById(command.applicationId),
    );
    this.domainService.ensureNotDeleted(application);

    assertCanManageBranchInterviewerAssignment({
      status: application.status,
      interviewStatus: application.interviewStatus,
    });

    const activeAssignments = await this.prisma.interview.findMany({
      where: {
        applicationId: application.id,
        status: {
          in: [InterviewStatus.ASSIGNED, InterviewStatus.SCHEDULED],
        },
      },
      select: { id: true },
    });

    if (!activeAssignments.length) {
      throw new BadRequestException(
        'This application has no Branch/Interviewer assignment to remove',
      );
    }

    await this.prisma.interview.updateMany({
      where: {
        id: { in: activeAssignments.map((item) => item.id) },
      },
      data: {
        status: InterviewStatus.CANCELLED,
        updatedBy: command.unassignedBy ?? null,
      },
    });

    return {
      applicationId: application.id,
      unassignedCount: activeAssignments.length,
    };
  }
}
