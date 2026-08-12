import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CommentNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.COMMENT_NOT_FOUND, 'Comment not found.', 404);
  }
}

export class CommentAccessDeniedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COMMENT_ACCESS_DENIED,
      'You do not have access to this comment.',
      403,
    );
  }
}

export class CommentBlockedException extends BaseException {
  constructor() {
    super(ERROR_CODES.COMMENT_BLOCKED, 'Comment is blocked.', 400);
  }
}

export class CommentDeletedException extends BaseException {
  constructor() {
    super(ERROR_CODES.COMMENT_DELETED, 'Comment has been deleted.', 400);
  }
}

export class CommentNotDeletedException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COMMENT_NOT_DELETED,
      'Comment is not deleted.',
      400,
    );
  }
}

export class InvalidReplyTargetException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.INVALID_REPLY_TARGET,
      'Invalid reply target.',
      400,
    );
  }
}
