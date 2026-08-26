import { describe, expect, it } from "vitest";

import {
  categoryFormSchema,
  CATEGORY_DESCRIPTION_MAX_WORDS,
  normalizeCategorySlug,
} from "@/src/features/categories/schemas/category.schema";

describe("categoryFormSchema", () => {
  it("requires a name and accepts slug input", () => {
    const parsed = categoryFormSchema.parse({
      name: "  Marketing  ",
      slug: " Digital Marketing ",
      description: "Short",
    });

    expect(parsed.name).toBe("Marketing");
    expect(parsed.slug).toBe("Digital Marketing");
  });

  it("rejects empty names", () => {
    const result = categoryFormSchema.safeParse({
      name: "   ",
      description: "Short",
    });

    expect(result.success).toBe(false);
  });

  it("allows an empty description", () => {
    const result = categoryFormSchema.safeParse({
      name: "Marketing",
      description: "",
    });

    expect(result.success).toBe(true);
  });

  it("allows a one-word description", () => {
    const result = categoryFormSchema.safeParse({
      name: "Marketing",
      description: "Overview",
    });

    expect(result.success).toBe(true);
  });

  it("allows a two-word description", () => {
    const result = categoryFormSchema.safeParse({
      name: "Marketing",
      description: "Course overview",
    });

    expect(result.success).toBe(true);
  });

  it("rejects descriptions above the maximum word count", () => {
    const tooLong = Array.from(
      { length: CATEGORY_DESCRIPTION_MAX_WORDS + 1 },
      (_, index) => `word${index + 1}`,
    ).join(" ");

    const result = categoryFormSchema.safeParse({
      name: "Marketing",
      description: tooLong,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid slug formats", () => {
    const result = categoryFormSchema.safeParse({
      name: "Marketing",
      slug: "---",
      description: "Short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative display order", () => {
    const result = categoryFormSchema.safeParse({
      name: "Marketing",
      description: "Short",
      displayOrder: -1,
    });

    expect(result.success).toBe(false);
  });
});

describe("normalizeCategorySlug", () => {
  it("normalizes names into URL-safe slugs", () => {
    expect(normalizeCategorySlug("CA Foundation")).toBe(
      "ca-foundation",
    );
  });
});
