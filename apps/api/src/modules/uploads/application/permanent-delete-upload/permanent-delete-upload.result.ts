export class PermanentDeleteUploadResult {
  constructor(
    public readonly id: string,
    public readonly permanentlyDeleted: boolean,
  ) {}
}
