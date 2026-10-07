"use client";

import Link from "next/link";

import { FinanceNewsSidebarCard } from "@/src/features/finance-news/components/finance-news-sidebar-card";
import { useFinanceNewsList } from "@/src/features/finance-news/hooks/use-finance-news-list";
import type {
  FinancialArticleCategory,
  FinancialArticleRelatedItem,
} from "@/src/features/finance-news/types/finance-news.types";
import {
  formatFinanceNewsDate,
  getFinanceNewsDetailPath,
} from "@/src/features/finance-news/utils/finance-news-display.util";

interface FinanceNewsArticleSidebarProps {
  currentSlug: string;
  relatedArticles: FinancialArticleRelatedItem[];
  category: FinancialArticleCategory;
}

export function FinanceNewsArticleSidebar({
  currentSlug,
  relatedArticles,
  category,
}: FinanceNewsArticleSidebarProps) {
  const latestQuery = useFinanceNewsList({ skip: 0, take: 8 });

  const latestItems =
    latestQuery.data?.items.filter((item) => item.slug !== currentSlug) ?? [];

  const hasRelated = relatedArticles.length > 0;
  const hasLatest = latestItems.length > 0;

  if (!hasRelated && !hasLatest && latestQuery.isLoading) {
    return (
      <aside className="grid gap-8 border-t border-slate-100 pt-10 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-56 animate-pulse rounded-lg bg-slate-100" />
      </aside>
    );
  }

  if (!hasRelated && !hasLatest) {
    return null;
  }

  return (
    <aside className="grid gap-8 border-t border-slate-100 pt-10 md:grid-cols-2 md:items-start lg:gap-10">
      {hasRelated ? (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Related Articles
          </h2>
          <div className="mt-3 space-y-2.5">
            {relatedArticles.slice(0, 4).map((item) => (
              <FinanceNewsSidebarCard
                key={item.id}
                article={item}
                category={category}
              />
            ))}
          </div>
        </section>
      ) : null}

      {hasLatest ? (
        <section className="rounded-xl border border-slate-200/90 bg-[#F8FAFC] p-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">
            Latest News
          </h2>
          <ul className="mt-3 divide-y divide-slate-200/80">
            {latestItems.slice(0, 6).map((item) => (
              <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link
                  href={getFinanceNewsDetailPath(item.slug)}
                  className="group flex items-start justify-between gap-3"
                >
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-[#0B1F3A] group-hover:text-[#2563EB]">
                    {item.title}
                  </span>
                  <time
                    dateTime={item.publishedAt ?? item.createdAt}
                    className="shrink-0 pt-0.5 text-[11px] text-slate-500"
                  >
                    {formatFinanceNewsDate(item.publishedAt ?? item.createdAt)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
