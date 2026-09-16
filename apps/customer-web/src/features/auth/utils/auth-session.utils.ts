import { tokenStorage } from "@/src/core/storage/token-storage";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

export function clearAuthSession(): void {
  tokenStorage.clear();
  useAuthStore.getState().clearUser();
}

export function hasClientSession(): boolean {
  return (
    Boolean(tokenStorage.getAccessToken()) &&
    useAuthStore.getState().isAuthenticated
  );
}

export function redirectToLoginIfNeeded(): void {
  clearAuthSession();

  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === "/login") {
    return;
  }

  window.location.href = "/login";
}
