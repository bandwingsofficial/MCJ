export class BulkRestoreCategoryCommand {
  constructor(
    public readonly ids: string[],
    public readonly updatedBy?: string,
  ) {}
}