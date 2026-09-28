"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ImageOff,
  Tag,
  UserRound,
} from "lucide-react";

import { FinanceNewsCard } from "@/src/features/finance-news/components/finance-news-card";
import { useFinanceNewsArticle } from "@/src/features/finance-news/hooks/use-finance-news-article";
import { formatFinanceNewsDate } from "@/src/features/finance-news/utils/finance-news-display.util";
import type { FinancialArticleListItem } from "@/src/features/finance-news/types/finance-news.types";
import { Badge } from "@/src/shared/components/ui/badge";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

function isNotFoundError(error: unknown): boolean {
  return (
    (error as { response?: { status?: number } })?.response?.status === 404
  );
}

export function FinanceNewsDetailPage({ slug }: { slug: string }) {
  const { data: article, isLoading, isError, error } = useFinanceNewsArticle(slug);

  if (isLoading) {
    return (
      <main className="w-full bg-white pb-10">
        <Skeleton className="h-48 w-full rounded-none md:h-72" />
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <Skeleton className="mb-3 h-8 w-32" />
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    );
  }

  if (isError && isNotFoundError(error)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Article not found"
          description="This financial news article may have been removed or is not published yet."
          action={
            <Link
              href="/finance-news"
              className="inline-flex rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
            >
              Back to Financial News
            </Link>
          }
        />
      </main>
    );
  }

  if (isError || !article) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Unable to load article"
          description="Please try again in a moment."
          action={
            <Link
              href="/finance-news"
              className="inline-flex rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-4 py-2.5 text-sm font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
            >
              Back to Financial News
            </Link>
          }
        />
      </main>
    );
  }

  const bannerUrl = article.bannerUrl ?? article.thumbnailUrl;
  const related = (article.relatedArticles ?? []).map(
    (item): FinancialArticleListItem => ({
      ...item,
      content: null,
      bannerUrl: null,
      category: article.category,
      displayOrder: 0,
      status: "PUBLISHED",
      isActive: true,
      updatedAt: item.createdAt,
    }),
  );

  return (
    <main className="w-full bg-white pb-10">
      <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
        <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-[#BFDBFE]/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#DDD6FE]/30 blur-3xl" />

        <div className="relative h-44 w-full overflow-hidden md:h-72">
          {bannerUrl ? (
            <>
              <img
                src={bannerUrl}
                alt=""
                className="h-full w-full object-cover object-center"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 via-[#0B1F3A]/15 to-[#F8FBFF]/30" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EEF4FF] via-[#F8FBFF] to-[#F5F3FF] text-slate-400">
              <ImageOff className="h-9 w-9" aria-hidden />
            </div>
          )}
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 -mt-20 mb-5 md:-mt-24">
          {article.thumbnailUrl ? (
            <img
              src={article.thumbnailUrl}
              alt=""
              className="h-36 w-36 rounded-2xl border-[3px] border-white object-cover shadow-lg ring-1 ring-[#BFDBFE]/60 sm:h-40 sm:w-40 md:h-44 md:w-44"
            />
          ) : null}
        </div>

        <Link
          href="/finance-news"
          className="mb-4 inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back to Financial News
        </Link>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.category?.name ? (
            <Badge variant="info">{article.category.name}</Badge>
          ) : null}
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-[#E0E7FF] bg-[#F5F3FF]/70 px-2 py-1 text-[11px] font-medium text-[#4338CA]"
            >
              <Tag className="mr-1 h-3 w-3" aria-hidden />
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#0B1F3A] md:text-3xl">
          {article.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-4 w-4 text-[#2563EB]" aria-hidden />
            {article.authorName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-[#2563EB]" aria-hidden />
            {formatFinanceNewsDate(article.publishedAt ?? article.createdAt)}
          </span>
        </div>

        {article.shortDescription ? (
          <p className="mt-4 text-base leading-relaxed text-slate-700 md:text-lg">
            {article.shortDescription}
          </p>
        ) : null}

        <div className="prose prose-slate mt-6 max-w-none">
          {article.content ? (
            <div className="whitespace-pre-wrap leading-7 text-slate-700 md:leading-8">
              {article.content}
            </div>
          ) : (
            <p className="text-slate-500">Full article content is not available.</p>
          )}
        </div>

        {related.length > 0 ? (
          <section className="mt-10 border-t border-slate-100 pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
              Related
            </p>
            <h2 className="mt-1.5 mb-5 text-2xl font-bold tracking-tight text-[#0B1F3A]">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((item) => (
                <FinanceNewsCard key={item.id} article={item} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
