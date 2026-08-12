import type { StudentRepository } from '../../domain/repositories/student.repository';
import { GetStudentResult } from '../get-student/get-student.result';

import { ListStudentsQuery } from './list-students.query';

export class ListStudentsHandler {
  constructor(private readonly studentRepo: StudentRepository) {}

  async execute(
    query: ListStudentsQuery,
  ): Promise<GetStudentResult[]> {
    const students = await this.studentRepo.findAll({
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    });

    return students.map(GetStudentResult.fromEntity);
  }
}
