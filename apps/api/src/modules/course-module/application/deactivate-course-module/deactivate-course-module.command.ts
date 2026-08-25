export class DeactivateCourseModuleCommand {
  constructor(
    public readonly id: string,
    public readonly deactivatedBy?: string,
  ) {}
}
