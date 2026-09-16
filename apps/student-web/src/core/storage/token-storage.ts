// src/core/storage/token-storage.ts

const ACCESS_TOKEN_KEY = "mcj_access_token";
const REFRESH_TOKEN_KEY = "mcj_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      token
    );
  },

  removeAccessToken(): void {
    localStorage.removeItem(
      ACCESS_TOKEN_KEY
    );
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(
      REFRESH_TOKEN_KEY
    );
  },

  setRefreshToken(token: string): void {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      token
    );
  },

  removeRefreshToken(): void {
    localStorage.removeItem(
      REFRESH_TOKEN_KEY
    );
  },

  clear(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  },
};