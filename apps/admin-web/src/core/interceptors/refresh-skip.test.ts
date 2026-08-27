import { describe, expect, it } from "vitest";

const AUTH_SKIP_REFRESH_PATHS = [
  "/admin/auth/login",
  "/admin/auth/verify-totp",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/jobs/company-submit",
  "/public-apply",
];

const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  if (AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path))) {
    return true;
  }

  if (url.includes("/admin/")) {
    return false;
  }

  return /\/jobs(\/|\?|$)/.test(url);
};

describe("refresh skip paths", () => {
  it("skips login and refresh endpoints", () => {
    expect(shouldSkipRefresh("/admin/auth/login")).toBe(true);
    expect(shouldSkipRefresh("/admin/auth/verify-totp")).toBe(true);
    expect(shouldSkipRefresh("/auth/refresh")).toBe(true);
  });

  it("skips public company job onboarding submit", () => {
    expect(shouldSkipRefresh("/jobs/company-submit")).toBe(true);
  });

  it("skips public student job apply", () => {
    expect(shouldSkipRefresh("/jobs/accountant/public-apply")).toBe(true);
    expect(shouldSkipRefresh("/jobs/accountant")).toBe(true);
  });

  it("does not skip protected APIs", () => {
    expect(shouldSkipRefresh("/auth/me")).toBe(false);
    expect(shouldSkipRefresh("/auth/sessions")).toBe(false);
    expect(shouldSkipRefresh("/admin/jobs")).toBe(false);
  });
});
