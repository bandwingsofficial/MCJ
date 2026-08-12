import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';

import { PermanentDeleteStudentCommand } from './permanent-delete-student.command';
import { PermanentDeleteStudentResult } from './permanent-delete-student.result';

export class PermanentDeleteStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(
    command: PermanentDeleteStudentCommand,
  ): Promise<PermanentDeleteStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id, true),
    );
    const profileImageFileId = student.profileImageFileId;

    await this.studentRepo.deletePermanent(student.id);

    if (profileImageFileId) {
      await this.uploadDomainService.permanentDelete(
        profileImageFileId,
      );
    }

    return new PermanentDeleteStudentResult(student.id, true);
  }
}
