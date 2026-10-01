import { Enrollment } from '@modules/enrollment/domain/entities/enrollment.entity';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import { EnrollmentDomainService } from '@modules/enrollment/domain/services/enrollment-domain.service';

import type { Student } from '../../domain/entities/student.entity';
import { StudentStatus } from '../../domain/enums/student-status.enum';

/** Derives student list/detail status from enrollment records when applicable. */
export class StudentEnrollmentDisplayStatusService {
  constructor(
    private readonly enrollmentDomainService: EnrollmentDomainService,
  ) {}

  groupEnrollmentStatusesByStudentId(
    rows: Array<{ studentId: string; status: EnrollmentStatus }>,
  ): Map<string, EnrollmentStatus[]> {
    const map = new Map<string, EnrollmentStatus[]>();

    for (const row of rows) {
      const existing = map.get(row.studentId) ?? [];
      existing.push(row.status);
      map.set(row.studentId, existing);
    }

    return map;
  }

  resolveDisplayStatus(
    student: Student,
    enrollmentStatuses: EnrollmentStatus[] | undefined,
  ): StudentStatus {
    if (!enrollmentStatuses?.length) {
      return student.status;
    }

    const currentStatuses = enrollmentStatuses.filter((status) =>
      Enrollment.isCurrentStatus(status),
    );

    if (currentStatuses.length === 0) {
      return student.status;
    }

    return this.enrollmentDomainService.resolveStudentStatusFromEnrollmentStatuses(
      currentStatuses,
    );
  }
}
