import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";

import { loadBranchAssignedCategories } from "@/src/features/branches/utils/branch-category-relation.utils";
import { loadBranchAssignedCourses } from "@/src/features/branches/utils/branch-course-relation.utils";
import { loadBranchTrainerAssignments } from "@/src/features/branches/utils/branch-trainer-relation.utils";
import type { BranchTrainerAssignment } from "@/src/features/branches/types/branch.types";

const BRANCH_BATCH_PAGE_SIZE = 100;
const BRANCH_ENROLLMENT_PAGE_SIZE = 500;

export interface BranchManageAssignedData {
  categories: CategoryListItem[];
  courses: CourseListItem[];
  batches: Batch[];
  trainerAssignments: BranchTrainerAssignment[];
  branchEnrollments: Enrollment[];
  courseCountByCategory: Record<string, number>;
}

export async function loadBranchManageAssignedData(
  branchId: string,
): Promise<BranchManageAssignedData> {
  if (!branchId) {
    return {
      categories: [],
      courses: [],
      batches: [],
      trainerAssignments: [],
      branchEnrollments: [],
      courseCountByCategory: {},
    };
  }

  const [
    categoryPayload,
    coursePayload,
    batchResponse,
    trainerAssignments,
    branchEnrollmentResponse,
  ] = await Promise.all([
    loadBranchAssignedCategories(branchId),
    loadBranchAssignedCourses(branchId),
    batchService.getBatches({
      branchId,
      includeDeleted: false,
      isDeleted: false,
      page: 1,
      pageSize: BRANCH_BATCH_PAGE_SIZE,
    }),
    loadBranchTrainerAssignments(branchId),
    enrollmentService.getEnrollments({
      branchId,
      skip: 0,
      take: BRANCH_ENROLLMENT_PAGE_SIZE,
    }),
  ]);

  const courses = coursePayload.courses;
  const courseCountByCategory: Record<string, number> = {};

  for (const course of courses) {
    if (course.categoryId) {
      courseCountByCategory[course.categoryId] =
        (courseCountByCategory[course.categoryId] ?? 0) + 1;
    }
  }

  return {
    categories: categoryPayload.categories,
    courses,
    batches: batchResponse.data.items ?? [],
    trainerAssignments,
    branchEnrollments: parseEnrollmentListResponse(branchEnrollmentResponse)
      .items,
    courseCountByCategory,
  };
}
