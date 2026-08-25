import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class StudentDocumentNotFoundException extends BaseException {
  constructor(documentId: string) {
    super(
      ERROR_CODES.STUDENT_DOCUMENT_NOT_FOUND,
      `Student document not found: ${documentId}`,
      404,
    );
  }
}
