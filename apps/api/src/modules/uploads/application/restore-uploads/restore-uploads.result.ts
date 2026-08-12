export class RestoreUploadsResult {
  constructor(
    public readonly restoredIds: string[],
    public readonly restoredCount: number,
  ) {}
}
