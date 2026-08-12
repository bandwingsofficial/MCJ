export class ReorderCategoriesCommand {
  constructor(
    public readonly categoryId: string,
    public readonly newDisplayOrder: number,
    public readonly updatedBy?: string | null,
  ) {}
}
