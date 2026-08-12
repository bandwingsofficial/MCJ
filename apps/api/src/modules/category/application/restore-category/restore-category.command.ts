export class RestoreCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
