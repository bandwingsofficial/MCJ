import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class FinancialArticleNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.FINANCIAL_ARTICLE_NOT_FOUND,
      'Financial article not found.',
      404,
    );
  }
}

export class FinancialArticleAlreadyExistsException extends BaseException {
  constructor(message = 'Financial article already exists.') {
    super(ERROR_CODES.FINANCIAL_ARTICLE_ALREADY_EXISTS, message, 409);
  }
}

export class FinancialArticleInactiveException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.FINANCIAL_ARTICLE_INACTIVE,
      'Financial article is inactive.',
      400,
    );
  }
}

export class FinancialArticleDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.FINANCIAL_ARTICLE_DELETED,
      'Financial article has been deleted.',
      400,
    );
  }
}

export class FinancialArticleNotDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.VALIDATION_ERROR,
      'Financial article is not deleted.',
      400,
    );
  }
}
