import type { Profile } from '@modules/profile/domain/entities/profile.entity';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { mapProfileToStudentSyncUpdate } from '../shared/student-personal-fields.mapper';

export class SyncStudentFromProfileHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
  ) {}

  async execute(profile: Profile): Promise<void> {
    const student = await this.studentRepo.findByCreatedBy(
      profile.userId,
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
