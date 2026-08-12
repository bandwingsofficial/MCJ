export class BulkActivateCategoryCommand {
  constructor(
    public readonly ids: string[],
    public readonly updatedBy?: string,
  ) {}
}