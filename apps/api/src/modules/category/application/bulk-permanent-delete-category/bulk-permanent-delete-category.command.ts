export class BulkPermanentDeleteCategoryCommand {
  constructor(
    public readonly categoryIds: string[],
  ) {}
}
