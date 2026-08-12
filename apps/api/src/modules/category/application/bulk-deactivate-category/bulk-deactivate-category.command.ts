export class BulkDeactivateCategoryCommand {
  constructor(
    public readonly ids: string[],
    public readonly updatedBy?: string,
  ) {}
}