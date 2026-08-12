import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class PostNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_NOT_FOUND, 'Post not found.', 404);
  }
}

export class PostInactiveException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_INACTIVE, 'Post is inactive.', 400);
  }
}

export class PostArchivedException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_ARCHIVED, 'Post is archived.', 400);
  }
}

export class PostDeletedException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_DELETED, 'Post has been deleted.', 400);
  }
}

export class PostNotDeletedException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_NOT_DELETED, 'Post is not deleted.', 400);
  }
}
