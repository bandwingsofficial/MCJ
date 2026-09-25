import { randomBytes } from 'crypto';

const REFERRAL_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const REFERRAL_CODE_LENGTH = 8;

export function normalizeReferralCodeInput(value?: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase();
}

export function generateReferralCodeCandidate(): string {
  const bytes = randomBytes(REFERRAL_CODE_LENGTH);
  let result = '';
  for (let index = 0; index < REFERRAL_CODE_LENGTH; index += 1) {
    result += REFERRAL_CODE_ALPHABET[bytes[index]! % REFERRAL_CODE_ALPHABET.length];
  }
  return result;
}
