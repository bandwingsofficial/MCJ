export class PermanentDeleteCategoryResult {
  constructor(
    public readonly id: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}
