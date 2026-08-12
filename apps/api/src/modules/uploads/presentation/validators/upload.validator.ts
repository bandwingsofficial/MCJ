import { UploadValidationService } from '../../domain/services/upload-validation.service';

export class UploadValidator {
  constructor(
    private readonly validationService: UploadValidationService,
  ) {}

  validate(
    file: Express.Multer.File | undefined,
  ): Express.Multer.File {
    if (!file) {
      throw new Error('File is required');
    }

    this.validationService.validate(file);

    return file;
  }
}
