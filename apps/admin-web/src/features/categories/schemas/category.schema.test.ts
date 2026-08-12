import { describe, expect, it } from "vitest";

import { createCategorySchema } from "@/src/features/categories/schemas/category.schema";

describe("createCategorySchema", () => {
  it("requires a name and omits display order", () => {
    const parsed = createCategorySchema.parse({
      name: "  Marketing  ",
      description: "LMS",
      status: "ACTIVE",
    });

    expect(parsed.name).toBe("Marketing");
    expect(
      "displayOrder" in parsed
    ).toBe(false);
  });

  it("rejects empty names", () => {
    const result = createCategorySchema.safeParse({
      name: "   ",
    });

    expect(result.success).toBe(false);
  });
});
