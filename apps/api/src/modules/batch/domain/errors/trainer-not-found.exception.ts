import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class TrainerNotFoundException extends BaseException {
  constructor(trainerId: string) {
    super(
      ERROR_CODES.TRAINER_NOT_FOUND,
      `Trainer not found: ${trainerId}`,
      404,
    );
  }
}
