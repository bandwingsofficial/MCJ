import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { StudentPortalStudentNotFoundException } from '@modules/student-portal/domain/errors/student-portal-business.exception';

import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { ListMyJobApplicationsQuery } from './list-my-job-applications.query';

export class ListMyJobApplicationsHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(
    query: ListMyJobApplicationsQuery,
  ): Promise<GetJobApplicationResult[]> {
    const student = await this.studentRepo.findByUserId(
      query.userId,
    );

    if (!student) {
      throw new StudentPortalStudentNotFoundException();
    }

    return this.applicationRepo.findDetailsByStudentId(student.id);
  }
}
