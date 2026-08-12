export class BulkPermanentDeleteCategoryResult {
  constructor(
    public readonly categories: {
      id: string;
      deleted: boolean;
    }[],
  ) {}
}