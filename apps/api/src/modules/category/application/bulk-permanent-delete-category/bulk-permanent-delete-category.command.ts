export class BulkPermanentDeleteCategoryCommand {
  constructor(
    public readonly ids: string[],
  ) {}
}