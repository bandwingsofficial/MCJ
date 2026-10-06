import { Enrollment } from '../entities/enrollment.entity';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import type { EnrollmentSummaryView } from '../repositories/enrollment.repository';

function primaryEnrollmentScore(
  enrollment: EnrollmentSummaryView,
): number {
  let score = 0;

  if (enrollment.isActive) {
    score += 1_000_000;
  }

  if (Enrollment.isCurrentStatus(enrollment.status)) {
    score += 100_000;
  }

  if (enrollment.status === EnrollmentStatus.JOINED) {
    score += 10_000;
  }

  if (enrollment.status === EnrollmentStatus.ENROLLED) {
    score += 5_000;
  }

  score += new Date(enrollment.createdAt).getTime();

  return score;
}

function pickPrimary(
  current: EnrollmentSummaryView,
  candidate: EnrollmentSummaryView,
): EnrollmentSummaryView {
  return primaryEnrollmentScore(candidate) > primaryEnrollmentScore(current)
    ? candidate
    : current;
}

/** Admin list: at most one row per student (newest / most active enrollment wins). */
export function dedupeEnrollmentsToOnePerStudent(
  items: EnrollmentSummaryView[],
): EnrollmentSummaryView[] {
  const byStudentId = new Map<string, EnrollmentSummaryView>();

  for (const item of items) {
    const existing = byStudentId.get(item.studentId);
    byStudentId.set(
      item.studentId,
      existing ? pickPrimary(existing, item) : item,
    );
  }

  return [...byStudentId.values()];
}
