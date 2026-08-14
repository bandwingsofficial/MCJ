export class BulkDeleteCategoryCommand {
  constructor(
    public readonly categoryIds: string[],
    public readonly deletedBy?: string,
  ) {}
}
