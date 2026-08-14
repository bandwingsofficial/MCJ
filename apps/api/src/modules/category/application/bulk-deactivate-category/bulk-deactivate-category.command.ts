export class BulkDeactivateCategoryCommand {
  constructor(
    public readonly categoryIds: string[],
    public readonly updatedBy?: string,
  ) {}
}
