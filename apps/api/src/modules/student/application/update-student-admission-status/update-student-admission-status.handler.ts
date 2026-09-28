import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetStudentResult } from '../get-student/get-student.result';
import { StudentAdmissionStatusSyncService } from '../shared/student-admission-status-sync.service';

import { UpdateStudentAdmissionStatusCommand } from './update-student-admission-status.command';

export class UpdateStudentAdmissionStatusHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
    private readonly admissionStatusSync: StudentAdmissionStatusSyncService,
  ) {}

  async execute(
    command: UpdateStudentAdmissionStatusCommand,
  ): Promise<GetStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id),
    );

    this.domainService.ensureBranchAccess(
      student,
      command.actorBranchId,
    );

    const updated = await this.admissionStatusSync.applyStudentAdmissionStatus({
      student,
      targetStatus: command.status,
      updatedBy: command.updatedBy,
      actorBranchId: command.actorBranchId,
    });

    return GetStudentResult.fromEntity(updated);
  }
}
