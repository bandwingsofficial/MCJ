export function uniqueById<T extends { id: string }>(
  items: Array<T | null | undefined>,
): T[] {
  const unique = new Map<string, T>();
  for (const item of items) {
    if (item && !unique.has(item.id)) {
      unique.set(item.id, item);
    }
  }
  return [...unique.values()];
}

/**
 * Admin assigns courses on Batch.courseId and/or BatchCourse.
 * Prefer join-table courses (same order Admin uses), then the direct FK.
 */
export function resolveAssignedCourses<T extends { id: string }>(
  directCourse: T | null | undefined,
  batchCourses: T[],
): T[] {
  return uniqueById([...batchCourses, directCourse]);
}

/**
 * Trainers scoped to a parent batch (Admin batch trainers panel / BatchTrainer):
 * BatchTrainer rows plus trainers on this batch's BatchCourse assignments only.
 * Does not include course-wide TrainerCourse links.
 */
export function resolveAssignedTrainers<T extends { id: string }>(
  batchTrainers: Array<T | null | undefined>,
  assignmentTrainers: Array<T | null | undefined>,
): T[] {
  return uniqueById([...batchTrainers, ...assignmentTrainers]);
}

/** BatchCourse.trainerId only — not course-wide TrainerCourse links. */
export function batchCourseRowTrainers<T extends { id: string }>(
  batchCourses: Array<{ trainer?: T | null }>,
): T[] {
  return uniqueById(batchCourses.map((row) => row.trainer));
}

/** Parent batch trainers: BatchTrainer + batch-course rows + branch batch/timing assignments. */
export function resolveParentBatchAssignedTrainers<T extends { id: string }>(
  batchTrainers: Array<T | null | undefined>,
  batchCourses: Array<{ trainer?: T | null }>,
  branchBatchTrainers: Array<T | null | undefined>,
): T[] {
  return uniqueById([
    ...batchTrainers,
    ...batchCourseRowTrainers(batchCourses),
    ...branchBatchTrainers,
  ]);
}

/**
 * Branch-ops UI: trainers come only from Admin Branch Management assignments
 * (BranchTrainer rows scoped to this branch + batch/timing).
 */
export function resolveBranchBatchDisplayTrainers<T extends { id: string }>(
  branchBatchTrainers: Array<T | null | undefined>,
): T[] {
  return uniqueById(branchBatchTrainers);
}

/**
 * Faculty list/detail hydration — same BatchCourse + trainer merge Admin uses.
 */
export function hydrateFacultyBatchRelations<
  C extends { id: string },
  T extends { id: string },
>(params: {
  directCourse: C | null | undefined;
  assignmentCourses: C[];
  batchTrainers: Array<T | null | undefined>;
  assignmentTrainers: Array<T | null | undefined>;
}): { course: C | null; trainers: T[] } {
  return {
    course:
      resolveAssignedCourses(params.directCourse, params.assignmentCourses)[0] ??
      null,
    trainers: resolveAssignedTrainers(
      params.batchTrainers,
      params.assignmentTrainers,
    ),
  };
}

