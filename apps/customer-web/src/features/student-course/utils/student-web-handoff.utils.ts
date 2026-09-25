import { env } from "@/src/core/config/env";
import { tokenStorage } from "@/src/core/storage/token-storage";

export function buildStudentWebHandoffUrl(
  targetPath = "/student/learning",
): string {
  const handoffUrl = new URL("/auth/handoff", env.STUDENT_WEB_URL);
  handoffUrl.searchParams.set("next", targetPath);

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
