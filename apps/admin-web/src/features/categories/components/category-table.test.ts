import { describe, expect, it } from "vitest";

function canReorder(category: {
  isDeleted: boolean;
  status: string;
  displayOrder: number | null;
}): boolean {
  return (
    !category.isDeleted &&
    category.status !== "ARCHIVED" &&
    category.displayOrder != null
  );
}

describe("category table reorder eligibility", () => {
  it("allows active ordered categories", () => {
    expect(
      canReorder({
        isDeleted: false,
        status: "ACTIVE",
        displayOrder: 1,
      })
    ).toBe(true);
  });

  it("blocks archived and unordered inactive categories", () => {
    expect(
      canReorder({
        isDeleted: true,
        status: "ARCHIVED",
        displayOrder: null,
      })
    ).toBe(false);

    expect(
      canReorder({
        isDeleted: false,
        status: "INACTIVE",
        displayOrder: null,
      })
    ).toBe(false);
  });
});
