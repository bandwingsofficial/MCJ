import Link from "next/link";
import { ImageOff } from "lucide-react";

import type {
  FinancialArticleCategory,
  FinancialArticleListItem,
  FinancialArticleRelatedItem,
} from "@/src/features/finance-news/types/finance-news.types";
import {
  formatFinanceNewsDate,
  getFinanceNewsDetailPath,
} from "@/src/features/finance-news/utils/finance-news-display.util";

type SidebarArticle = FinancialArticleRelatedItem | FinancialArticleListItem;

interface FinanceNewsSidebarCardProps {
  article: SidebarArticle;
  category?: FinancialArticleCategory | null;
}

export function FinanceNewsSidebarCard({
  article,
  category,
}: FinanceNewsSidebarCardProps) {
  const href = getFinanceNewsDetailPath(article.slug);
  const imageUrl = article.thumbnailUrl;
  const categoryName =
    "category" in article && article.category?.name
      ? article.category.name
      : category?.name;

  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-lg border border-slate-200/90 bg-white p-2.5 transition-colors hover:border-[#2563EB]/25 hover:bg-[#F8FBFF]"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <ImageOff className="h-4 w-4" aria-hidden />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {categoryName ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            {categoryName}
          </p>
        ) : null}
        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[#0B1F3A] group-hover:text-[#2563EB]">
          {article.title}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatFinanceNewsDate(article.publishedAt ?? article.createdAt)}
        </p>
      </div>
    </Link>
  );
}
