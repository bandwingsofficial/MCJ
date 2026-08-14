export class BulkActivateCategoryCommand {
  constructor(
    public readonly categoryIds: string[],
    public readonly updatedBy?: string,
  ) {}
}
