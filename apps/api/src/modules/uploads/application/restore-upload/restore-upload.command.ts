export class RestoreUploadCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string | null,
  ) {}
}
