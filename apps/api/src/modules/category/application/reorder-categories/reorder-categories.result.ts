export class ReorderCategoriesResult {
  constructor(
    public readonly categoryId: string,
    public readonly displayOrder: number,
  ) {}
}
