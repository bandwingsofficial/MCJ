export class GetBatchSummaryResult {
  constructor(
    public readonly batchId: string,
    public readonly studentsCount: number,
    public readonly trainerCount: number,
    public readonly enrolledCount: number,
    public readonly capacity: number,
    public readonly attendancePresent: number,
    public readonly attendanceAbsent: number,
  ) {}
}
