import { UploadVisibility } from '../../domain/enums/upload-visibility.enum';

export class UploadFileCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly folder: string,
    public readonly fileName: string,
    public readonly entityId?: string,
    public readonly visibility?: UploadVisibility,
    public readonly metadata?: Record<string, unknown>,
    public readonly createdBy?: string,
  ) {}
}
