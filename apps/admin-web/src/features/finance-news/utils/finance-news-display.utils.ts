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

export function formatFinanceNewsDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

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
