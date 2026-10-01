import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { StudentEnrollmentDisplayStatusService } from '../shared/student-enrollment-display-status.service';

import { GetStudentQuery } from './get-student.query';
import { GetStudentResult } from './get-student.result';

export class GetStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly domainService: StudentDomainService,
    private readonly displayStatusService: StudentEnrollmentDisplayStatusService,
  ) {}

  async execute(
    query: GetStudentQuery,
  ): Promise<GetStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    this.domainService.ensureBranchAccess(
      student,
      query.branchId,
    );

    const enrollmentStatusRows =
      await this.enrollmentRepo.findEnrollmentStatusesByStudentIds([
        student.id,
      ]);
    const statusesByStudentId =
      this.displayStatusService.groupEnrollmentStatusesByStudentId(
        enrollmentStatusRows,
      );

    return GetStudentResult.fromEntity(
      student,
      this.displayStatusService.resolveDisplayStatus(
        student,
        statusesByStudentId.get(student.id),
      ),
    );
  }
}
