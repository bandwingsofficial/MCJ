import type { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';

import type { Student } from '../../domain/entities/student.entity';
import { StudentStatus } from '../../domain/enums/student-status.enum';

/** Student list/detail status matches persisted student record (kept in sync with primary enrollment). */
export class StudentEnrollmentDisplayStatusService {
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
    _enrollmentStatuses: EnrollmentStatus[] | undefined,
  ): StudentStatus {
    return student.status;
  }
}
