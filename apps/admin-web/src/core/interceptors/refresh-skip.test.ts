import { describe, expect, it } from "vitest";

const AUTH_SKIP_REFRESH_PATHS = [
  "/admin/auth/login",
  "/admin/auth/verify-totp",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
];

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) {
    return false;
  }
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
};

describe("refresh skip paths", () => {
  it("skips login and refresh endpoints", () => {
    expect(shouldSkipRefresh("/admin/auth/login")).toBe(true);
    expect(shouldSkipRefresh("/admin/auth/verify-totp")).toBe(true);
    expect(shouldSkipRefresh("/auth/refresh")).toBe(true);
  });

  it("does not skip protected APIs", () => {
    expect(shouldSkipRefresh("/auth/me")).toBe(false);
    expect(shouldSkipRefresh("/auth/sessions")).toBe(false);
  });
});
