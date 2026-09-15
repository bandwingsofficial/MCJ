import type {
  FinanceNewsListItem,
  FinanceNewsManagementStatus,
} from "@/src/features/finance-news/types/finance-news.types";

import { isArchivedFinanceNews } from "@/src/features/finance-news/utils/finance-news-bulk.utils";

type FinanceNewsStatusSource = Pick<
  FinanceNewsListItem,
  "isActive" | "isDeleted"
> & {
  deletedAt?: string | null;
};

export function getFinanceNewsManagementStatus(
  item: FinanceNewsStatusSource,
): FinanceNewsManagementStatus {
  if (isArchivedFinanceNews(item)) {
    return "ARCHIVED";
  }

  if (item.isActive) {
    return "ACTIVE";
  }

  return "INACTIVE";
}
