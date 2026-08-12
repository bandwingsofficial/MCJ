export class BulkDeleteCategoryResult {
  constructor(
    public readonly categories: {
      id: string;
      isDeleted: boolean;
      deletedAt: Date | null;
    }[],
  ) {}
}