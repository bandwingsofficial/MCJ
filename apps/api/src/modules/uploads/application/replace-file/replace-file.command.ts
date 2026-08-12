export class ReplaceFileCommand {
  constructor(
    public readonly id: string,
    public readonly file: Express.Multer.File,
    public readonly updatedBy?: string,
  ) {}
}
