import { describe, expect, it } from "vitest";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { AxiosError } from "axios";

function axiosError(
  status: number,
  data: Record<string, unknown>
): AxiosError {
  return new AxiosError(
    "Request failed",
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: "Error",
      headers: {},
      config: {} as never,
      data,
    }
  );
}

describe("getErrorMessage", () => {
  it("maps invalid credentials", () => {
    expect(
      getErrorMessage(
        axiosError(401, {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        })
      )
    ).toBe("Invalid email or password.");
  });

  it("maps rate limiting", () => {
    expect(
      getErrorMessage(
        axiosError(429, { code: "TOO_MANY_REQUESTS" })
      )
    ).toBe("Too many attempts. Please try again later.");
  });

  it("maps network failures", () => {
    const error = new AxiosError("Network Error");
    expect(getErrorMessage(error)).toBe(
      "We couldn't connect to the server. Check your connection and try again."
    );
  });
});
