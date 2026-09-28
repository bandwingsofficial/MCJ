import { resolvePersistedImageUrl } from "@/src/shared/utils/image-url.util";

type FinanceNewsImageFields = {
  thumbnailUrl?: string | null;
  bannerUrl?: string | null;
  updatedAt?: string | null;
};

export function syncFinanceNewsImageFields<T extends FinanceNewsImageFields>(
  entity: T,
): T {
  return {
    ...entity,
    thumbnailUrl: resolvePersistedImageUrl(
      entity.thumbnailUrl,
      entity.updatedAt,
    ),
    bannerUrl: resolvePersistedImageUrl(entity.bannerUrl, entity.updatedAt),
  };
}
