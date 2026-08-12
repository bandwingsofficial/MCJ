import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class PostAlreadyLikedException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_ALREADY_LIKED, 'Post already liked.', 409);
  }
}

export class PostNotLikedException extends BaseException {
  constructor() {
    super(ERROR_CODES.POST_NOT_LIKED, 'Post not liked.', 400);
  }
}
