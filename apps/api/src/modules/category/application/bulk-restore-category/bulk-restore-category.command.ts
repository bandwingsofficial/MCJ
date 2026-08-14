export class BulkRestoreCategoryCommand {
  constructor(
    public readonly categoryIds: string[],
    public readonly updatedBy?: string,
  ) {}
}
