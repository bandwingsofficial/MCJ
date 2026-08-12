import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { DeleteStudentCommand } from './delete-student.command';
import { DeleteStudentResult } from './delete-student.result';

export class DeleteStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: DeleteStudentCommand,
  ): Promise<DeleteStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id),
    );

    this.domainService.ensureBranchAccess(
      student,
      command.actorBranchId,
    );

    student.softDelete(command.deletedBy);
    await this.studentRepo.save(student);

    return new DeleteStudentResult(
      student.id,
      true,
      student.deletedAt,
    );
  }
}
