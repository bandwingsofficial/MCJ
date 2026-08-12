import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetStudentResult } from '../get-student/get-student.result';

import { UpdateStudentStatusCommand } from './update-student-status.command';

export class UpdateStudentStatusHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: UpdateStudentStatusCommand,
  ): Promise<GetStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id),
    );

    this.domainService.ensureBranchAccess(
      student,
      command.actorBranchId,
    );

    if (command.activate) {
      student.activate(command.updatedBy);
    } else {
      student.deactivate(command.updatedBy);
    }

    await this.studentRepo.save(student);

    return GetStudentResult.fromEntity(student);
  }
}
