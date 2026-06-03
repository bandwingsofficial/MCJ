// src/features/auth/utils/auth-storage.ts

const MFA_TOKEN_KEY =
  "mcj_admin_mfa_token";

export class AuthStorage {
  static setMfaToken(
    token: string
  ): void {
    sessionStorage.setItem(
      MFA_TOKEN_KEY,
      token
    );
  }

  static getMfaToken():
    | string
    | null {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    return sessionStorage.getItem(
      MFA_TOKEN_KEY
    );
  }

  static clearMfaToken(): void {
    sessionStorage.removeItem(
      MFA_TOKEN_KEY
    );
  }
}