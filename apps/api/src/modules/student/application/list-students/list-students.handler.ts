import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { GetStudentResult } from '../get-student/get-student.result';

import { ListStudentsQuery } from './list-students.query';
import { ListStudentsResult } from './list-students.result';

export class ListStudentsHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
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

    const studentIds = students.map((student) => student.id);
    const [enrollmentCounts, openSlotStudentIds] = await Promise.all([
      this.enrollmentRepo.countByStudentIds(studentIds),
      this.enrollmentRepo.findStudentIdsWithOpenEnrollmentSlots(studentIds),
    ]);

    return new ListStudentsResult(
      students.map((student) =>
        GetStudentResult.fromEntity(
          student,
          student.status,
          enrollmentCounts.get(student.id) ?? 0,
          openSlotStudentIds.has(student.id),
        ),
      ),
      count,
    );
  }
}
