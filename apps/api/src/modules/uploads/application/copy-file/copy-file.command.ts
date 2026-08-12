export class CopyFileCommand {
  constructor(
    public readonly id: string,
    public readonly folder: string,
    public readonly entityId: string,
    public readonly fileName: string,
  ) {}
}
