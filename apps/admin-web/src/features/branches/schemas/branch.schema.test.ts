import { describe, expect, it } from "vitest";

import { createBranchSchema } from "@/src/features/branches/schemas/branch.schema";

describe("createBranchSchema", () => {
  const validBase = {
    branchName: "Malleshwaram",
    branchCode: "MAL001",
    email: "branch@example.com",
    phone: "9876543210",
    addressLine1: "Main Street",
    city: "Bengaluru",
    state: "KA",
    country: "IN",
    postalCode: "560003",
    latitude: 12.99,
    longitude: 77.57,
  };

  it("accepts a valid branch payload", () => {
    const result = createBranchSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects invalid branch code format", () => {
    const result = createBranchSchema.safeParse({
      ...validBase,
      branchCode: "BAD CODE!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email with a clear message", () => {
    const result = createBranchSchema.safeParse({
      ...validBase,
      email: "12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Invalid email address."
      );
    }
  });

  it("rejects invalid phone with a clear message", () => {
    const result = createBranchSchema.safeParse({
      ...validBase,
      phone: "SasA",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Invalid phone number."
      );
    }
  });

  it("rejects empty required email", () => {
    const result = createBranchSchema.safeParse({
      ...validBase,
      email: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Email is required."
      );
    }
  });
});
