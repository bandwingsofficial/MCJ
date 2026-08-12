export class DeleteFilesResult {
  constructor(
    public readonly results: {
      id: string;
      deleted: boolean;
      deletedAt: Date | null;
    }[],
  ) {}
}
