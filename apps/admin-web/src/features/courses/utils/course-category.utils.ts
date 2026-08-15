interface CourseCategoryLike {
  category?: { name?: string | null } | null;
  categoryName?: string | null;
}

export function getCourseCategoryDisplayName(
  course: CourseCategoryLike | null | undefined,
): string {
  const name =
    course?.category?.name?.trim() || course?.categoryName?.trim() || "";

  return name || "—";
}
