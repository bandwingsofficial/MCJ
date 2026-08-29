import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";

import {
  getErrorFieldErrors,
  getErrorMessage,
  toApiClientError,
} from "@/src/core/utils/get-error-message";

function axiosError(
  status: number,
  data: Record<string, unknown>,
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
    },
  );
}

describe("getErrorMessage", () => {
  it("maps invalid credentials", () => {
    expect(
      getErrorMessage(
        axiosError(401, {
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        }),
      ),
    ).toBe("Invalid credentials");
  });

  it("maps rate limiting", () => {
    expect(
      getErrorMessage(axiosError(429, { code: "TOO_MANY_REQUESTS" })),
    ).toBe("Too many attempts. Please try again later.");
  });

  it("maps network failures", () => {
    const error = new AxiosError("Network Error");
    expect(getErrorMessage(error)).toBe(
      "We couldn't connect to the server. Check your connection and try again.",
    );
  });

  it("surfaces backend validation/conflict messages", () => {
    expect(
      getErrorMessage(
        axiosError(409, {
          code: "VALIDATION_ERROR",
          message:
            "Cannot permanently delete this category because it is still linked to 1 course.",
        }),
      ),
    ).toBe(
      "Cannot permanently delete this category because it is still linked to 1 course.",
    );
  });

  it("surfaces already-enrolled conflicts with current enrollment details", () => {
    expect(
      getErrorMessage(
        axiosError(409, {
          code: "STUDENT_ALREADY_ENROLLED",
          message: "Student is already enrolled in another active batch.",
          meta: {
            existingEnrollment: {
              branch: { branchName: "Malleswaram" },
              batch: { name: "morning", code: "BCH0001" },
              course: { title: "CA Foundation" },
            },
          },
        }),
      ),
    ).toBe(
      "Student is already actively enrolled in Malleswaram - morning batch. A student can have only one active enrollment at a time.",
    );
  });

  it("surfaces field validation errors when the API omits message", () => {
    expect(
      getErrorMessage(
        axiosError(400, {
          code: "VALIDATION_ERROR",
          errors: {
            studentId: ["studentId must be a UUID"],
            feeAmount: ["feeAmount must be a number"],
          },
        }),
      ),
    ).toBe("studentId must be a UUID");
  });

  it("maps duplicate student email with field-aware message", () => {
    expect(
      getErrorMessage(
        axiosError(409, {
          code: "STUDENT_EMAIL_EXISTS",
          message:
            "A student with this email already exists. Use a different email address.",
          meta: { field: "email" },
        }),
      ),
    ).toBe(
      "A student with this email already exists. Use a different email address.",
    );
  });

  it("maps duplicate student phone", () => {
    expect(
      getErrorMessage(
        axiosError(409, {
          code: "STUDENT_PHONE_EXISTS",
          message:
            "A student with this phone number already exists. Use a different phone number.",
          meta: { field: "phone" },
        }),
      ),
    ).toBe(
      "A student with this phone number already exists. Use a different phone number.",
    );
  });

  it("does not expose opaque internal server messages", () => {
    expect(
      getErrorMessage(
        axiosError(500, {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        }),
      ),
    ).toBe("Unable to complete this action right now. Please try again.");
  });

  it("preserves field errors after ApiClientError wrapping", () => {
    const wrapped = toApiClientError(
      axiosError(409, {
        code: "STUDENT_EMAIL_EXISTS",
        message:
          "A student with this email already exists. Use a different email address.",
        meta: { field: "email" },
      }),
    );

    expect(getErrorMessage(wrapped)).toContain("email already exists");
    expect(getErrorFieldErrors(wrapped)).toEqual({
      email:
        "A student with this email already exists. Use a different email address.",
    });
  });

  it("collects multiple validation field errors", () => {
    const wrapped = toApiClientError(
      axiosError(400, {
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        errors: {
          email: ["Please enter a valid email address."],
          phone: ["Please enter a valid phone number."],
        },
      }),
    );

    expect(getErrorFieldErrors(wrapped)).toEqual({
      email: "Please enter a valid email address.",
      phone: "Please enter a valid phone number.",
    });
  });
});
