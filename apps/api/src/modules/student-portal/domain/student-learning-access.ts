import { EnrollmentMode } from '@modules/enrollment/domain/enums/enrollment-mode.enum';
import type { EnrollmentDetailView } from '@modules/enrollment/domain/repositories/enrollment.repository';

import type { StudentHierarchyScope } from '@modules/course/infrastructure/services/course-hierarchy.service';

export interface StudentLearningAccess {
  enrollmentId: string;
  enrollmentMode: EnrollmentMode;
  branchId: string;
  batchId: string;
  canAccessLiveRecorded: boolean;
  canAccessSelfPaced: boolean;
  canAccessResources: boolean;
  canAccessQuizzes: boolean;
  canAccessProgress: boolean;
}

export function buildStudentLearningAccess(
  enrollment: EnrollmentDetailView,
): StudentLearningAccess {
  const canAccessLiveRecorded =
    enrollment.mode !== EnrollmentMode.SELF_PACED;

  return {
    enrollmentId: enrollment.id,
    enrollmentMode: enrollment.mode,
    branchId: enrollment.branchId,
    batchId: enrollment.batchId,
    canAccessLiveRecorded,
    canAccessSelfPaced: true,
    canAccessResources: true,
    canAccessQuizzes: true,
    canAccessProgress: true,
  };
}

export function buildStudentHierarchyScope(
  enrollment: EnrollmentDetailView,
): StudentHierarchyScope {
  return {
    branchId: enrollment.branchId,
    batchId: enrollment.batchId,
    includeLiveRecorded: enrollment.mode !== EnrollmentMode.SELF_PACED,
  };
}
