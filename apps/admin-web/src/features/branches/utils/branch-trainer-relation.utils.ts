import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

/**
 * Collect trainer IDs assigned to any course linked to the branch
 * via the existing Course → Trainer (TrainerCourse) relationship.
 */
export async function getCourseAssignedTrainerIdsForBranch(
  branchId: string,
  courses?: CourseListItem[],
): Promise<Set<string>> {
  if (!branchId) {
    return new Set();
  }

  const branchCourses =
    courses ?? (await getBranchCoursesForAssignment(branchId));
  const trainerIds = new Set<string>();

  await Promise.all(
    branchCourses.map(async (course) => {
      try {
        const trainers = await trainerService.getTrainersForCourse(course.id);
        trainers.forEach((trainer) => {
          trainerIds.add(trainer.id);
        });
      } catch {
        // Ignore per-course lookup failures; other courses still resolve.
      }
    }),
  );

  return trainerIds;
}

export async function getBranchCoursesForAssignment(
  branchId: string,
): Promise<CourseListItem[]> {
  if (!branchId) {
    return [];
  }

  const courseResponse = await courseService.getCourses({
    branchId,
    page: 1,
    pageSize: 100,
  });

  return (courseResponse.data.items ?? []).filter(
    (course) => !course.isDeleted && course.status === "ACTIVE",
  );
}

export function formatTrainerDisplayName(
  trainer: Pick<
    { firstName?: string | null; lastName?: string | null },
    "firstName" | "lastName"
  >,
): string {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim();
}

export function isTrainerAssignedViaBranchCourses(
  trainerId: string,
  courseAssignedTrainerIds: Set<string>,
): boolean {
  return courseAssignedTrainerIds.has(trainerId);
}
