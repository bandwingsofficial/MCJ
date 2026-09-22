import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";

const BRANCH_COURSE_LOOKUP_PAGE_SIZE = 100;

async function listAllCoursesForBranch(
  branchId: string,
): Promise<CourseListItem[]> {
  if (!branchId) {
    return [];
  }

  const collected: CourseListItem[] = [];
  let page = 1;

  while (true) {
    const response = await courseService.getCourses({
      branchId,
      page,
      pageSize: BRANCH_COURSE_LOOKUP_PAGE_SIZE,
    });

    const items = (response.data.items ?? []).filter((item) => !item.isDeleted);
    collected.push(...items);

    if (items.length < BRANCH_COURSE_LOOKUP_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return collected;
}

export async function getActiveCoursesForBranchAssignment(): Promise<
  CourseListItem[]
> {
  const collected: CourseListItem[] = [];
  let page = 1;

  while (true) {
    const response = await courseService.getCourses({
      status: "ACTIVE",
      page,
      pageSize: BRANCH_COURSE_LOOKUP_PAGE_SIZE,
    });

    const items = (response.data.items ?? []).filter(
      (course) =>
        !course.isDeleted && String(course.status).toUpperCase() === "ACTIVE",
    );
    collected.push(...items);

    if (items.length < BRANCH_COURSE_LOOKUP_PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return collected;
}

export function deriveBranchCourseLinkSets(courses: CourseListItem[]): {
  batchAssignedCourseIds: Set<string>;
  manualBranchCourseIds: Set<string>;
  assignedCourseIds: Set<string>;
} {
  const batchAssignedCourseIds = new Set<string>();
  const manualBranchCourseIds = new Set<string>();
  const assignedCourseIds = new Set<string>();

  for (const course of courses) {
    assignedCourseIds.add(course.id);
    const link = course.branchCourseLink;

    if (link?.linkedViaManual) {
      manualBranchCourseIds.add(course.id);
    }

    if (link?.linkedViaBatch && !link.linkedViaManual) {
      batchAssignedCourseIds.add(course.id);
    }
  }

  return {
    batchAssignedCourseIds,
    manualBranchCourseIds,
    assignedCourseIds,
  };
}

export async function loadBranchAssignedCourses(branchId: string): Promise<{
  courses: CourseListItem[];
  batchAssignedCourseIds: Set<string>;
  manualBranchCourseIds: Set<string>;
  assignedCourseIds: Set<string>;
}> {
  const courses = await listAllCoursesForBranch(branchId);
  const linkSets = deriveBranchCourseLinkSets(courses);

  return {
    courses,
    ...linkSets,
  };
}

export function isCourseAssignedViaBranchBatch(
  courseId: string,
  batchAssignedCourseIds: Set<string>,
): boolean {
  return batchAssignedCourseIds.has(courseId);
}

export function filterAssignedBranchCourses(
  courses: CourseListItem[],
  search: string,
): CourseListItem[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return courses;
  }

  return courses.filter((course) => {
    const haystack = [
      course.title,
      course.code ?? "",
      course.slug ?? "",
      course.categoryName ?? "",
      course.category?.name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
