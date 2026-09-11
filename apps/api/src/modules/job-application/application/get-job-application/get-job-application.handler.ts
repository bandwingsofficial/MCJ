import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { resolveJobApplicationStudentLink } from '../shared/resolve-job-application-student-link';
import { enrichJobApplicationStudentFromEmail } from '../shared/enrich-job-application-student-from-email';
import { GetJobApplicationResult } from './get-job-application.result';
import { GetJobApplicationQuery } from './get-job-application.query';

export class GetJobApplicationHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly studentRepo: StudentRepository,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(
    query: GetJobApplicationQuery,
  ): Promise<GetJobApplicationResult> {
    let detail = this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(
        query.id,
        query.includeDeleted,
      ),
    );

    const linked = await resolveJobApplicationStudentLink(
      this.applicationRepo,
      this.studentRepo,
      detail,
    );

    if (linked) {
      detail = this.domainService.ensureDetailExists(
        await this.applicationRepo.findDetailById(
          query.id,
          query.includeDeleted,
        ),
      );
    }

    return enrichJobApplicationStudentFromEmail(this.studentRepo, detail);
  }
}
