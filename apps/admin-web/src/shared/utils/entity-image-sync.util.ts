import { resolvePersistedImageUrl } from "@/src/shared/utils/upload-image.util";

type WithUpdatedAt = {
  updatedAt?: string | null;
};

type CategoryLike = WithUpdatedAt & {
  thumbnailUrl?: string | null;
};

type CourseLike = WithUpdatedAt & {
  thumbnailUrl?: string | null;
  trainers?: Array<
    WithUpdatedAt & {
      profileImageUrl?: string | null;
    }
  >;
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

type FinanceNewsLike = WithUpdatedAt & {
  thumbnailUrl?: string | null;
  bannerUrl?: string | null;
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
  const synced: T = entity.thumbnailUrl
    ? {
        ...entity,
        thumbnailUrl: resolvePersistedImageUrl(
          entity.thumbnailUrl,
          entity.updatedAt,
        ),
      }
    : entity;

  if (!synced.trainers?.length) {
    return synced;
  }

  return {
    ...synced,
    trainers: synced.trainers.map((trainer) =>
      trainer.profileImageUrl
        ? {
            ...trainer,
            profileImageUrl: resolvePersistedImageUrl(
              trainer.profileImageUrl,
              trainer.updatedAt ?? synced.updatedAt,
            ),
          }
        : trainer,
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

export function syncFinanceNewsImageFields<T extends FinanceNewsLike>(
  entity: T,
): T {
  return {
    ...entity,
    thumbnailUrl: entity.thumbnailUrl
      ? resolvePersistedImageUrl(entity.thumbnailUrl, entity.updatedAt)
      : entity.thumbnailUrl,
    bannerUrl: entity.bannerUrl
      ? resolvePersistedImageUrl(entity.bannerUrl, entity.updatedAt)
      : entity.bannerUrl,
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

export function syncFinanceNewsImageList<T extends FinanceNewsLike>(
  items: T[],
): T[] {
  return items.map(syncFinanceNewsImageFields);
}
