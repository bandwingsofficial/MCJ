// shared/utils/phone.util.ts

import { ValidationError } from '../errors/validation.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

export const normalizePhone = (input: string): string => {
  const phone = input.replace(/\D/g, '');

  // 🇮🇳 local 10-digit
  if (phone.length === 10) {
    return phone;
  }

  // 🇮🇳 +91XXXXXXXXXX
  if (phone.startsWith('91') && phone.length === 12) {
    return phone.slice(2);
  }

  throw new ValidationError(
    'Invalid phone number format',
    ERROR_CODES.USER_INVALID_PHONE,
  );
};

export const isEmail = (input: string): boolean => {
  return input.includes('@');
};
