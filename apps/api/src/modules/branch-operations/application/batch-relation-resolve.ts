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
 * Same merge as Admin `getUniqueBatchTrainers`:
 * BatchTrainer + BatchCourse.trainer + TrainerCourse on assigned courses.
 */
export function resolveAssignedTrainers<T extends { id: string }>(
  batchTrainers: Array<T | null | undefined>,
  assignmentTrainers: Array<T | null | undefined>,
  courseTrainers: Array<T | null | undefined>,
): T[] {
  return uniqueById([
    ...batchTrainers,
    ...assignmentTrainers,
    ...courseTrainers,
  ]);
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
  courseTrainers: Array<T | null | undefined>;
}): { course: C | null; trainers: T[] } {
  return {
    course:
      resolveAssignedCourses(params.directCourse, params.assignmentCourses)[0] ??
      null,
    trainers: resolveAssignedTrainers(
      params.batchTrainers,
      params.assignmentTrainers,
      params.courseTrainers,
    ),
  };
}

