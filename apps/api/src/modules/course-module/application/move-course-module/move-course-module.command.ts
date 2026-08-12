export class MoveCourseModuleCommand {
  constructor(
    public readonly id: string,
    public readonly newPosition: number,
    public readonly updatedBy?: string,
  ) {}
}
