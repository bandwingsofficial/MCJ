export class AssignTrainerCourseCommand {
  constructor(
    public readonly trainerId: string,
    public readonly courseId: string,
    public readonly updatedBy?: string,
  ) {}
}
