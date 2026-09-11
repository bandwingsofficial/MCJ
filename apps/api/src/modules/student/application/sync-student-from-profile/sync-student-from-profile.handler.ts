import type { Profile } from '@modules/profile/domain/entities/profile.entity';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { ResolveAuthenticatedStudentService } from '../../domain/services/resolve-authenticated-student.service';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { mapProfileToStudentSyncUpdate } from '../shared/student-personal-fields.mapper';

export class SyncStudentFromProfileHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
  ) {}

  async execute(profile: Profile): Promise<void> {
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        profile.userId,
        profile.email,
      );

    if (!student) {
      return;
    }

    const updateParams = mapProfileToStudentSyncUpdate(
      profile,
      profile.userId,
    );

    await this.domainService.ensureEmailIsAvailable(
      this.studentRepo,
      updateParams.email,
      student.id,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.studentRepo,
      updateParams.phone,
      student.id,
    );

    student.update(updateParams);

    await this.studentRepo.save(student);
  }
}
