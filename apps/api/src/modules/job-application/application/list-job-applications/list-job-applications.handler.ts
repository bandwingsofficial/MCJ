import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { resolveJobApplicationStudentLinks } from '../shared/resolve-job-application-student-link';
import { enrichJobApplicationStudentsFromEmail } from '../shared/enrich-job-application-student-from-email';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { ListJobApplicationsQuery } from './list-job-applications.query';

export class ListJobApplicationsResult {
  constructor(
    public readonly items: GetJobApplicationResult[],
    public readonly total: number,
  ) {}
}

export class ListJobApplicationsHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly studentRepo: StudentRepository,
  ) {}

  async execute(
    query: ListJobApplicationsQuery,
  ): Promise<ListJobApplicationsResult> {
    const filters = {
      jobId: query.jobId,
      studentId: query.studentId,
      status: query.status,
      interviewStatus: query.interviewStatus,
      search: query.search,
      appliedFrom: query.appliedFrom,
      appliedTo: query.appliedTo,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    };

    let items = await this.applicationRepo.findDetails(filters);

    await resolveJobApplicationStudentLinks(
      this.applicationRepo,
      this.studentRepo,
      items,
    );

    items = await this.applicationRepo.findDetails(filters);

    items = await enrichJobApplicationStudentsFromEmail(
      this.studentRepo,
      items,
    );

    const total = await this.applicationRepo.count({
      ...filters,
      skip: undefined,
      take: undefined,
    });

    return new ListJobApplicationsResult(items, total);
  }
}
