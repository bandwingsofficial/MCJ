export class PermanentDeleteBatchResult {
  constructor(
    public readonly id: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}
