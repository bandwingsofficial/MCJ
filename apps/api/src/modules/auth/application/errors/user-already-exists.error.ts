// application/errors/user-already-exists.error.ts
import { AppError } from './app-error';

export class UserAlreadyExistsError extends AppError {
  constructor(field: 'email' | 'phone') {
    super(`User with this ${field} already exists`, 'USER_ALREADY_EXISTS', 400);
  }
}
