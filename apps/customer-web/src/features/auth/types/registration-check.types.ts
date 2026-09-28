export type RegistrationFieldAvailability = {
  available: boolean;
  message?: string;
};

export type ReferralCodePreviewResult =
  | {
      valid: true;
      normalizedCode: string;
      referrer: { name: string; email: string };
    }
  | { valid: false; message: string };
