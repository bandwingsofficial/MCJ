export class AssignTrainerCoursesCommand {
  constructor(
    public readonly id: string,
    public readonly courseIds: string[],
    public readonly updatedBy?: string,
  ) {}
}
