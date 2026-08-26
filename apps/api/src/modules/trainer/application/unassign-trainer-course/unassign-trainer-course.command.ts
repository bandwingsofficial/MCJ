export class UnassignTrainerCourseCommand {
  constructor(
    public readonly trainerId: string,
    public readonly courseId: string,
  ) {}
}
