import { env } from "@/src/core/config/env";
import { tokenStorage } from "@/src/core/storage/token-storage";

function getSafeReturnPath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

export function buildCustomerWebHandoffUrl(returnPath = "/"): string {
  const handoffUrl = new URL("/auth/handoff", env.CUSTOMER_WEB_URL);
  handoffUrl.searchParams.set("return", getSafeReturnPath(returnPath));

  const accessToken = tokenStorage.getAccessToken();
  const refreshToken = tokenStorage.getRefreshToken();

  if (accessToken) {
    const hash = new URLSearchParams({
      access: accessToken,
      ...(refreshToken ? { refresh: refreshToken } : {}),
    }).toString();
    handoffUrl.hash = hash;
  }

  return handoffUrl.toString();
}
