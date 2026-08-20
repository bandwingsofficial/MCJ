import type { StudentRepository } from '../../domain/repositories/student.repository';
import { GetStudentResult } from '../get-student/get-student.result';

import { ListStudentsQuery } from './list-students.query';
import { ListStudentsResult } from './list-students.result';

export class ListStudentsHandler {
  constructor(private readonly studentRepo: StudentRepository) {}

  async execute(
    query: ListStudentsQuery,
  ): Promise<ListStudentsResult> {
    const filters = {
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    };

    const [students, count] = await Promise.all([
      this.studentRepo.findAll(filters),
      this.studentRepo.count(filters),
    ]);

    return new ListStudentsResult(
      students.map(GetStudentResult.fromEntity),
      count,
    );
  }
}
