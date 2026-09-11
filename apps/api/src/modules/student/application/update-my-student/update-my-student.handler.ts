import type { StudentRepository } from '../../domain/repositories/student.repository';
import { ResolveAuthenticatedStudentService } from '../../domain/services/resolve-authenticated-student.service';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetMyStudentResult } from '../get-my-student/get-my-student.result';

import { UpdateMyStudentCommand } from './update-my-student.command';

export class UpdateMyStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
  ) {}

  async execute(
    command: UpdateMyStudentCommand,
  ): Promise<GetMyStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        command.userId,
      ),
    );

    student.update({
      qualification: command.qualification,
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      parentName: command.parentName,
      parentPhone: command.parentPhone,
      emergencyContactName: command.emergencyContactName,
      emergencyContactPhone: command.emergencyContactPhone,
      notes: command.notes,
      updatedBy: command.userId,
    });

    await this.studentRepo.save(student);

    return GetMyStudentResult.fromStudent(student);
  }
}
