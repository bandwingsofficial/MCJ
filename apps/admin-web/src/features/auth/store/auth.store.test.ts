import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

describe("auth.store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      status: "UNKNOWN",
      isAuthenticated: false,
    });
  });

  it("sets authenticated user", () => {
    useAuthStore.getState().setUser({
      id: "1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      sessionId: "sess-1",
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.status).toBe("AUTHENTICATED");
    expect(state.user?.sessionId).toBe("sess-1");
  });

  it("clears auth state", () => {
    useAuthStore.getState().setUser({
      id: "1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });

    useAuthStore.getState().clearUser();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.status).toBe("UNAUTHENTICATED");
    expect(state.user).toBeNull();
  });
});
