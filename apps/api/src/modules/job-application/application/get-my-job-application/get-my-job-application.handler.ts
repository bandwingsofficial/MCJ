import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';
import { StudentPortalStudentNotFoundException } from '@modules/student-portal/domain/errors/student-portal-business.exception';

import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { GetMyJobApplicationQuery } from './get-my-job-application.query';

export class GetMyJobApplicationHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(
    query: GetMyJobApplicationQuery,
  ): Promise<GetJobApplicationResult> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
      );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    const application = this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(query.id),
    );

    if (application.studentId !== student.id) {
      throw new BaseException(
        ERROR_CODES.JOB_APPLICATION_NOT_FOUND,
        'Job application not found.',
        404,
      );
    }

    return application;
  }
}
