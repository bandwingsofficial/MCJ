"use client";

import { Newspaper } from "lucide-react";

import { FinanceNewsCard } from "@/src/features/finance-news/components/finance-news-card";
import { useFinanceNewsList } from "@/src/features/finance-news/hooks/use-finance-news-list";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function FinanceNewsListPage() {
  const { data, isLoading, isError, refetch } = useFinanceNewsList();

  return (
    <main className="w-full bg-white">
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#BFDBFE]/40 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-[#DDD6FE]/35 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-[#93C5FD]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              <Newspaper className="h-4 w-4" aria-hidden />
              Financial News
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0B1F3A] sm:text-5xl">
              Financial News & Articles
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Stay updated with practical finance insights, market updates, and
              learning resources from MCJ.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FBFF]/70">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Articles
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-3xl">
                Latest financial insights
              </h2>
            </div>
            {!isLoading && !isError && (data?.items.length ?? 0) > 0 ? (
              <p className="text-sm text-slate-500">
                {data?.items.length}{" "}
                {(data?.items.length ?? 0) === 1 ? "article" : "articles"}{" "}
                published
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-8 w-28 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {isError ? (
            <EmptyState
              title="Unable to load financial news"
              description="Please check your connection and try again."
              action={
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
                >
                  Retry
                </button>
              }
            />
          ) : null}

          {!isLoading && !isError && (data?.items.length ?? 0) === 0 ? (
            <EmptyState
              title="No articles published yet"
              description="New financial news articles will appear here once they are published."
            />
          ) : null}

          {!isLoading && !isError && (data?.items.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data?.items.map((article) => (
                <FinanceNewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
