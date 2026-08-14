export class BulkRestoreBranchesCommand {
  constructor(
    public readonly ids: string[],
  ) {}
}