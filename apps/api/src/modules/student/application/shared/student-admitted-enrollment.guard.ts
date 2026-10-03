import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type {
  StudentAdmittedEnrollmentBlock,
  StudentRepository,
} from '../../domain/repositories/student.repository';

export function formatStudentAdmittedEnrollmentBlockMessage(
  blocks: StudentAdmittedEnrollmentBlock[],
): string {
  if (blocks.length === 0) {
    return '';
  }

  const byStudent = new Map<
    string,
    {
      studentName: string;
      enrollments: string[];
    }
  >();

  for (const block of blocks) {
    const line = `${block.branchName} — ${block.courseTitle} (${block.status})`;
    const existing = byStudent.get(block.studentId);

    if (existing) {
      if (!existing.enrollments.includes(line)) {
        existing.enrollments.push(line);
      }
      continue;
    }

    byStudent.set(block.studentId, {
      studentName: block.studentName,
      enrollments: [line],
    });
  }

  const lines: string[] = [
    'These students cannot be deleted while they have enrollments with ADMITTED status:',
    '',
  ];

  for (const entry of byStudent.values()) {
    lines.push(`• ${entry.studentName}: ${entry.enrollments.join('; ')}`);
  }

  return lines.join('\n');
}

export async function assertStudentsHaveNoAdmittedEnrollments(
  studentRepo: StudentRepository,
  studentIds: string[],
): Promise<void> {
  const uniqueIds = [
    ...new Set(
      studentIds.map((id) => id?.trim()).filter(Boolean) as string[],
    ),
  ];

  if (uniqueIds.length === 0) {
    return;
  }

  const blocks =
    await studentRepo.findAdmittedEnrollmentBlocksByStudentIds(
      uniqueIds,
    );

  if (blocks.length === 0) {
    return;
  }

  throw new BaseException(
    ERROR_CODES.STUDENT_ADMITTED_ENROLLMENT_BLOCK,
    formatStudentAdmittedEnrollmentBlockMessage(blocks),
    409,
    { blocks },
  );
}
