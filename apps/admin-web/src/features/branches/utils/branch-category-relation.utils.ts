import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import type { CourseListItem } from "@/src/features/courses/types/course.types";

import { getBranchCoursesForAssignment } from "@/src/features/branches/utils/branch-trainer-relation.utils";

/**
 * Collect category IDs used by any course linked to the branch
 * via the existing Course → Category (Course.categoryId) relationship.
 */
export async function getCourseAssignedCategoryIdsForBranch(
  branchId: string,
  courses?: CourseListItem[],
): Promise<Set<string>> {
  if (!branchId) {
    return new Set();
  }

  const branchCourses =
    courses ?? (await getBranchCoursesForAssignment(branchId));
  const categoryIds = new Set<string>();

  branchCourses.forEach((course) => {
    if (course.categoryId) {
      categoryIds.add(course.categoryId);
    }
  });

  return categoryIds;
}

async function resolveActiveCategoryListItem(
  categoryId: string,
): Promise<CategoryListItem | null> {
  try {
    const response = await categoryService.getCategory(categoryId);
    const category = response.data;

    if (category.isDeleted || category.status !== "ACTIVE") {
      return null;
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status,
      displayOrder: category.displayOrder,
      isDeleted: category.isDeleted,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      thumbnailUrl: category.thumbnailUrl,
    };
  } catch {
    return null;
  }
}

export async function loadBranchAssignedCategories(branchId: string): Promise<{
  categories: CategoryListItem[];
  courseAssignedCategoryIds: Set<string>;
  manualBranchCategoryIds: Set<string>;
}> {
  if (!branchId) {
    return {
      categories: [],
      courseAssignedCategoryIds: new Set(),
      manualBranchCategoryIds: new Set(),
    };
  }

  const courses = await getBranchCoursesForAssignment(branchId);
  const courseAssignedCategoryIds =
    await getCourseAssignedCategoryIdsForBranch(branchId, courses);
  const categoryMap = new Map<string, CategoryListItem>();
  const manualBranchCategoryIds = new Set<string>();

  await Promise.all(
    Array.from(courseAssignedCategoryIds).map(async (categoryId) => {
      const category = await resolveActiveCategoryListItem(categoryId);
      if (category) {
        categoryMap.set(category.id, category);
      }
    }),
  );

  let page = 1;

  while (true) {
    const response = await categoryService.getCategories({
      search: "",
      branchId,
      status: "ACTIVE",
      page,
      pageSize: 100,
    });

    const items = (response.data ?? []).filter(
      (category) => !category.isDeleted && category.status === "ACTIVE",
    );

    items.forEach((category) => {
      categoryMap.set(category.id, category);
      manualBranchCategoryIds.add(category.id);
    });

    if (items.length < 100) {
      break;
    }

    page += 1;
  }

  return {
    categories: Array.from(categoryMap.values()),
    courseAssignedCategoryIds,
    manualBranchCategoryIds,
  };
}

export function isCategoryAssignedViaBranchCourses(
  categoryId: string,
  courseAssignedCategoryIds: Set<string>,
): boolean {
  return courseAssignedCategoryIds.has(categoryId);
}

export function getBranchAssignedCategoryIds(
  courseAssignedCategoryIds: Set<string>,
  manualBranchCategoryIds: Set<string>,
): Set<string> {
  return new Set([...courseAssignedCategoryIds, ...manualBranchCategoryIds]);
}

export function filterAssignedBranchCategories(
  categories: CategoryListItem[],
  search: string,
): CategoryListItem[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return categories;
  }

  return categories.filter((category) => {
    const haystack = [
      category.name,
      category.slug,
      category.description ?? "",
      category.status,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
