export class RemoveCourseTrainerCommand {
  constructor(
    public readonly courseId: string,
    public readonly trainerId: string,
  ) {}
}
