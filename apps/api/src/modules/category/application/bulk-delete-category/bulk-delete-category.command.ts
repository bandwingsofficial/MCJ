export class BulkDeleteCategoryCommand {
  constructor(
    public readonly ids: string[],
    public readonly deletedBy?: string,
  ) {}
}