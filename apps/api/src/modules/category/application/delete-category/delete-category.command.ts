export class DeleteCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
