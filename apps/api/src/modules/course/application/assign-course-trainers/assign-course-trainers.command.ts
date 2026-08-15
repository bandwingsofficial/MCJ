export class AssignCourseTrainersCommand {
  constructor(
    public readonly courseId: string,
    public readonly trainerIds: string[],
  ) {}
}
