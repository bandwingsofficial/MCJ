import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetStudentResult } from '../get-student/get-student.result';

import { RestoreStudentCommand } from './restore-student.command';

export class RestoreStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: RestoreStudentCommand,
  ): Promise<GetStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id, true),
    );

    this.domainService.ensureBranchAccess(
      student,
      command.actorBranchId,
    );

    student.restore(command.updatedBy);
    await this.studentRepo.save(student);

    return GetStudentResult.fromEntity(student);
  }
}
