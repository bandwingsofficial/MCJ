export class UpdateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly slug?: string,
    public readonly description?: string | null,
    public readonly thumbnailFileId?: string | null,
    public readonly displayOrder?: number,
    public readonly branchId?: string | null,
    public readonly updatedBy?: string,
  ) {}
}
