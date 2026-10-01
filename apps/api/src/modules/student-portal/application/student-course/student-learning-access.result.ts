import type { StudentLearningAccess } from '../../domain/student-learning-access';

export class StudentLearningAccessResult {
  constructor(
    public readonly enrollmentId: string,
    public readonly enrollmentMode: string,
    public readonly branchId: string,
    public readonly batchId: string,
    public readonly canAccessLiveRecorded: boolean,
    public readonly canAccessSelfPaced: boolean,
    public readonly canAccessResources: boolean,
    public readonly canAccessQuizzes: boolean,
    public readonly canAccessProgress: boolean,
  ) {}

  static fromAccess(access: StudentLearningAccess): StudentLearningAccessResult {
    return new StudentLearningAccessResult(
      access.enrollmentId,
      access.enrollmentMode,
      access.branchId,
      access.batchId,
      access.canAccessLiveRecorded,
      access.canAccessSelfPaced,
      access.canAccessResources,
      access.canAccessQuizzes,
      access.canAccessProgress,
    );
  }
}
