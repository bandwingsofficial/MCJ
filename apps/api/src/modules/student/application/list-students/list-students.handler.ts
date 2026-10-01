import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentEnrollmentDisplayStatusService } from '../shared/student-enrollment-display-status.service';
import { GetStudentResult } from '../get-student/get-student.result';

import { ListStudentsQuery } from './list-students.query';
import { ListStudentsResult } from './list-students.result';

export class ListStudentsHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly displayStatusService: StudentEnrollmentDisplayStatusService,
  ) {}

  async execute(
    query: ListStudentsQuery,
  ): Promise<ListStudentsResult> {
    const filters = {
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      includeAll: query.includeAll,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    };

    const [students, count] = await Promise.all([
      this.studentRepo.findAll(filters),
      this.studentRepo.count(filters),
    ]);

    const enrollmentStatusRows =
      await this.enrollmentRepo.findEnrollmentStatusesByStudentIds(
        students.map((student) => student.id),
      );
    const statusesByStudentId =
      this.displayStatusService.groupEnrollmentStatusesByStudentId(
        enrollmentStatusRows,
      );

    return new ListStudentsResult(
      students.map((student) =>
        GetStudentResult.fromEntity(
          student,
          this.displayStatusService.resolveDisplayStatus(
            student,
            statusesByStudentId.get(student.id),
          ),
        ),
      ),
      count,
    );
  }
}
