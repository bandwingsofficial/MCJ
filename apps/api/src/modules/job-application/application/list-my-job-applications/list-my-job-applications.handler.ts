import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';
import { StudentPortalStudentNotFoundException } from '@modules/student-portal/domain/errors/student-portal-business.exception';

import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { ListMyJobApplicationsQuery } from './list-my-job-applications.query';

export class ListMyJobApplicationsHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
  ) {}

  async execute(
    query: ListMyJobApplicationsQuery,
  ): Promise<GetJobApplicationResult[]> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        query.userId,
      );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    return this.applicationRepo.findDetailsByStudentId(student.id);
  }
}
