import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
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

export async function loadBranchAssignedTrainers(branchId: string): Promise<{
  trainers: TrainerListItem[];
  courseAssignedTrainerIds: Set<string>;
  manualBranchTrainerIds: Set<string>;
}> {
  if (!branchId) {
    return {
      trainers: [],
      courseAssignedTrainerIds: new Set(),
      manualBranchTrainerIds: new Set(),
    };
  }

  const courses = await getBranchCoursesForAssignment(branchId);
  const courseAssignedTrainerIds = await getCourseAssignedTrainerIdsForBranch(
    branchId,
    courses,
  );
  const trainerMap = new Map<string, TrainerListItem>();
  const manualBranchTrainerIds = new Set<string>();

  await Promise.all(
    courses.map(async (course) => {
      try {
        const courseTrainers = await trainerService.getTrainersForCourse(
          course.id,
        );
        courseTrainers.forEach((trainer) => {
          if (trainer.isDeleted || trainer.status !== "ACTIVE") {
            return;
          }

          trainerMap.set(trainer.id, trainer as TrainerListItem);
        });
      } catch {
        // Ignore per-course lookup failures; other courses still resolve.
      }
    }),
  );

  let page = 1;

  while (true) {
    const response = await trainerService.getTrainers({
      branchId,
      status: "ACTIVE",
      isDeleted: false,
      includeDeleted: false,
      page,
      pageSize: 100,
    });

    const items = response.data.items ?? [];
    items.forEach((trainer) => {
      trainerMap.set(trainer.id, trainer);
      manualBranchTrainerIds.add(trainer.id);
    });

    if (items.length < 100) {
      break;
    }

    page += 1;
  }

  return {
    trainers: Array.from(trainerMap.values()),
    courseAssignedTrainerIds,
    manualBranchTrainerIds,
  };
}

export function formatTrainerDisplayName(
  trainer: Pick<
    { firstName?: string | null; lastName?: string | null },
    "firstName" | "lastName"
  >,
): string {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim();
}

export function getTrainerBranchId(
  trainer: Pick<TrainerListItem, "branchId"> & {
    branch?: { id: string } | null;
  },
): string | null {
  return trainer.branchId ?? trainer.branch?.id ?? null;
}

export function isTrainerAssignedToBranch(
  trainer: Pick<TrainerListItem, "branchId"> & {
    branch?: { id: string } | null;
  },
  branchId: string,
): boolean {
  return Boolean(branchId && getTrainerBranchId(trainer) === branchId);
}

export function isTrainerAssignedViaBranchCourses(
  trainerId: string,
  courseAssignedTrainerIds: Set<string>,
): boolean {
  return courseAssignedTrainerIds.has(trainerId);
}

export function isTrainerAlreadyAssignedToBranchContext(
  trainer: Pick<TrainerListItem, "id" | "branchId">,
  branchId: string,
  courseAssignedTrainerIds: Set<string>,
): boolean {
  return (
    isTrainerAssignedViaBranchCourses(trainer.id, courseAssignedTrainerIds) ||
    isTrainerAssignedToBranch(trainer, branchId)
  );
}

export function isManualBranchTrainerAssignment(
  trainer: Pick<TrainerListItem, "id" | "branchId">,
  branchId: string,
  courseAssignedTrainerIds: Set<string>,
): boolean {
  return (
    isTrainerAssignedToBranch(trainer, branchId) &&
    !isTrainerAssignedViaBranchCourses(trainer.id, courseAssignedTrainerIds)
  );
}

export function collectAssignedTrainerIdsForBranch(
  trainers: Array<
    Pick<TrainerListItem, "id" | "branchId"> & {
      branch?: { id: string } | null;
    }
  >,
  branchId: string,
  courseAssignedTrainerIds: Set<string>,
): Set<string> {
  const assignedIds = new Set(courseAssignedTrainerIds);

  trainers.forEach((trainer) => {
    if (isTrainerAssignedToBranch(trainer, branchId)) {
      assignedIds.add(trainer.id);
    }
  });

  return assignedIds;
}

export function getBranchAssignedTrainerIds(
  courseAssignedTrainerIds: Set<string>,
  manualBranchTrainerIds: Set<string>,
): Set<string> {
  return new Set([...courseAssignedTrainerIds, ...manualBranchTrainerIds]);
}

export function filterAssignedBranchTrainers(
  trainers: TrainerListItem[],
  search: string,
): TrainerListItem[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return trainers;
  }

  return trainers.filter((trainer) => {
    const haystack = [
      formatTrainerDisplayName(trainer),
      trainer.qualification ?? "",
      trainer.specialization ?? "",
      trainer.employeeCode ?? "",
      trainer.email ?? "",
      trainer.status,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
