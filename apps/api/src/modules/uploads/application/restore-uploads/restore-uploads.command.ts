export class RestoreUploadsCommand {
  constructor(
    public readonly ids: string[],
    public readonly updatedBy?: string | null,
  ) {}
}
