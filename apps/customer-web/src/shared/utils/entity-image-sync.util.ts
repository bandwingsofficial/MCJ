import { resolvePersistedImageUrl } from "@/src/shared/utils/image-url.util";

type WithUpdatedAt = {
  updatedAt?: string | null;
};

type CategoryLike = WithUpdatedAt & {
  thumbnailUrl?: string | null;
};

type CourseLike = WithUpdatedAt & {
  thumbnailUrl?: string | null;
};

type TrainerLike = WithUpdatedAt & {
  profileImageUrl?: string | null;
};

type BranchLike = WithUpdatedAt & {
  thumbnailUrl?: string | null;
};

type StudentLike = WithUpdatedAt & {
  profileImageUrl?: string | null;
};

export function syncCategoryImageFields<T extends CategoryLike>(
  entity: T,
): T {
  if (!entity.thumbnailUrl) {
    return entity;
  }

  return {
    ...entity,
    thumbnailUrl: resolvePersistedImageUrl(
      entity.thumbnailUrl,
      entity.updatedAt,
    ),
  };
}

export function syncCourseImageFields<T extends CourseLike>(entity: T): T {
  if (!entity.thumbnailUrl) {
    return entity;
  }

  return {
    ...entity,
    thumbnailUrl: resolvePersistedImageUrl(
      entity.thumbnailUrl,
      entity.updatedAt,
    ),
  };
}

export function syncTrainerImageFields<T extends TrainerLike>(entity: T): T {
  if (!entity.profileImageUrl) {
    return entity;
  }

  return {
    ...entity,
    profileImageUrl: resolvePersistedImageUrl(
      entity.profileImageUrl,
      entity.updatedAt,
    ),
  };
}

export function syncBranchImageFields<T extends BranchLike>(entity: T): T {
  if (!entity.thumbnailUrl) {
    return entity;
  }

  return {
    ...entity,
    thumbnailUrl: resolvePersistedImageUrl(
      entity.thumbnailUrl,
      entity.updatedAt,
    ),
  };
}

export function syncStudentImageFields<T extends StudentLike>(entity: T): T {
  if (!entity.profileImageUrl) {
    return entity;
  }

  return {
    ...entity,
    profileImageUrl: resolvePersistedImageUrl(
      entity.profileImageUrl,
      entity.updatedAt,
    ),
  };
}

export function syncCategoryImageList<T extends CategoryLike>(
  items: T[],
): T[] {
  return items.map(syncCategoryImageFields);
}

export function syncCourseImageList<T extends CourseLike>(items: T[]): T[] {
  return items.map(syncCourseImageFields);
}

export function syncTrainerImageList<T extends TrainerLike>(items: T[]): T[] {
  return items.map(syncTrainerImageFields);
}

export function syncBranchImageList<T extends BranchLike>(items: T[]): T[] {
  return items.map(syncBranchImageFields);
}

export function syncStudentImageList<T extends StudentLike>(items: T[]): T[] {
  return items.map(syncStudentImageFields);
}

type EnrollmentLike = WithUpdatedAt & {
  student?: StudentLike;
  course?: CourseLike;
};

export function syncEnrollmentImageFields<T extends EnrollmentLike>(
  enrollment: T,
): T {
  const syncedStudent = enrollment.student
    ? syncStudentImageFields(enrollment.student)
    : enrollment.student;

  const syncedCourse = enrollment.course
    ? syncCourseImageFields(enrollment.course)
    : enrollment.course;

  if (
    syncedStudent === enrollment.student &&
    syncedCourse === enrollment.course
  ) {
    return enrollment;
  }

  return {
    ...enrollment,
    student: syncedStudent,
    course: syncedCourse,
  };
}

export function syncEnrollmentImageList<T extends EnrollmentLike>(
  items: T[],
): T[] {
  return items.map(syncEnrollmentImageFields);
}
