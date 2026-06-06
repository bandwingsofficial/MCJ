const ACCESS_TOKEN_KEY =
  "branch_access_token";

const REFRESH_TOKEN_KEY =
  "branch_refresh_token";

export class TokenStorage {
  static getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return sessionStorage.getItem(
      ACCESS_TOKEN_KEY
    );
  }

  static setAccessToken(
    token: string
  ): void {
    sessionStorage.setItem(
      ACCESS_TOKEN_KEY,
      token
    );
  }

  static removeAccessToken(): void {
    sessionStorage.removeItem(
      ACCESS_TOKEN_KEY
    );
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return sessionStorage.getItem(
      REFRESH_TOKEN_KEY
    );
  }

  static setRefreshToken(
    token: string
  ): void {
    sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      token
    );
  }

  static removeRefreshToken(): void {
    sessionStorage.removeItem(
      REFRESH_TOKEN_KEY
    );
  }

  static clear(): void {
    this.removeAccessToken();

    this.removeRefreshToken();
  }
}